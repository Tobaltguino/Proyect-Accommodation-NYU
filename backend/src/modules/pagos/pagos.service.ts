import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { AsignacionEntity } from '../asignaciones/entities/asignacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrearOrdenPayload, OrdenPagoResponse } from './dto/pagos.dto';

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);

  private readonly baseUrl = process.env.PAGOS_API_URL;
  private readonly privateKey = process.env.PAGOS_PRIVATE_KEY;
  private readonly miBackendUrl = process.env.MI_BACKEND_PUBLIC_URL || 'http://localhost:3001';

  // --- MEMORIA CACHÉ ---
  private tokenEnCache: string | null = null;
  private expiracionDelToken: number = 0;

  constructor(
    @InjectRepository(AsignacionEntity)
    private readonly asignacionRepo: Repository<AsignacionEntity>,
  ) { }

  // --- PASO 1: OBTENER TOKEN (CON CACHÉ REPARADO) ---
  async obtenerToken(): Promise<string> {
    const tiempoActual = Date.now();
    const margenSeguridad = 2000;

    // Si tenemos un token vivo, lo reciclamos
    if (this.tokenEnCache && this.expiracionDelToken > (tiempoActual + margenSeguridad)) {
      return this.tokenEnCache!;
    }

    const response = await fetch(`${this.baseUrl}/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ privateKey: this.privateKey, "service": "RESIDENCIA" }),
    });

    if (!response.ok) {
      const errTxt = await response.text();
      this.logger.error(`Error al pedir token: ${errTxt}`);
      throw new InternalServerErrorException('Error al autenticar con finanzas');
    }

    const data = await response.json();
    console.log('RADIOGRAFÍA DEL EQUIPO DE PAGOS:', data);
    this.tokenEnCache = data.access_token;
    this.expiracionDelToken = tiempoActual + 60000; // Le damos 60 segundos de vida
    return this.tokenEnCache!;
  }

  // --- PASO 2: CREAR ORDEN ---
  async crearOrdenDePago(idAsignacion: number, amount: number, descripcion: string) {
    const asignacion = await this.asignacionRepo.findOne({ where: { idAsignacion } });
    if (!asignacion) throw new NotFoundException('Asignación no encontrada');

    const token = await this.obtenerToken();
    const referenceId = `RES-${asignacion.idAsignacion}-${Date.now()}`;

    // Construcción de Payload estrictamente tipada
    const payload: CrearOrdenPayload = {
      referenceId: referenceId,
      originService: 'RESIDENCIA',
      amount: Number(amount), // Forzamos que sea un número entero
      paymentMethod: 'TARJETA',
      callbackUrl: `${this.miBackendUrl}/api/payments/callback`, // Ajustado al JSON que te piden
      description: descripcion,
    };

    const response = await fetch(`${this.baseUrl}/v1/payments/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      this.logger.error(`Fallo en /orders: ${errorDetail}`);
      throw new InternalServerErrorException(`El equipo de pagos rechazó la orden: ${errorDetail}`);
    }

    const data: OrdenPagoResponse = await response.json();

    asignacion.referenceId = data.referenceId;
    await this.asignacionRepo.save(asignacion);

    return data;
  }

  // --- PASO 3: SINCRONIZAR ESTADO DEL PAGO ---
  async sincronizarPago(idAsignacion: number) {
    const asignacion = await this.asignacionRepo.findOne({ where: { idAsignacion } });
    if (!asignacion || !asignacion.referenceId) {
      throw new NotFoundException('No hay una orden de pago pendiente para esta asignación');
    }

    const token = await this.obtenerToken();


    // VAMOS A PREGUNTARLE AL OTRO SERVIDOR QUÉ PASÓ
    // Nota: Reemplaza el método y la URL exacta según lo que ellos te indiquen para "consultar"
    const response = await fetch(`${this.baseUrl}/v1/payments/${asignacion.referenceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      this.logger.error(`Fallo al consultar el pago: ${errorDetail}`);
      throw new InternalServerErrorException(`No se pudo verificar el estado del pago: ${errorDetail}`);
    }

    // EXTRAEMOS LA VERDAD ABSOLUTA DE SU RESPUESTA
    const data: OrdenPagoResponse = await response.json();

    // ACTUALIZAMOS NUESTRA BASE DE DATOS LOCAL
    if (data.status === 'APPROVED') {
      asignacion.estadoPago = 'Pagada' as any;
      asignacion.fechaPago = new Date() as any;
    } else if (data.status === 'REJECTED') {
      asignacion.estadoPago = 'Rechazada' as any;
    } else {
      asignacion.estadoPago = 'Pendiente' as any;
    }

    await this.asignacionRepo.save(asignacion);

    return data; // Le devolvemos a Angular el JSON para que muestre el ticket o el error
  }
}