import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class Pagos {

    // Paso 1: Pedir el token temporal (dura 5 mins)
    private async getToken(): Promise<string> {
        const res = await fetch(`${process.env.PAGOS_BASE_URL}/v1/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ privateKey: process.env.PAGOS_PRIVATE_KEY })
        });
        const data = await res.json();
        return data.access_token;
    }

    // Paso 2: Crear la orden ANTES de que el frontend redirija
    async crearOrdenPago(referenceId: string, amount: number, description: string) {
        const token = await this.getToken();
        const res = await fetch(`${process.env.PAGOS_BASE_URL}/v1/payments/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                referenceId: referenceId, // Ejemplo: "ASIG-15"
                originService: 'RESIDENCIA', // <-- Obligatorio según el PDF [cite: 122]
                amount: amount,
                paymentMethod: 'TARJETA', // Puede ser TRANSFERENCIA o BILLETERA [cite: 124]
                description: description
            })
        });

        // Si el ID ya existe, lanzan un 409 [cite: 129]
        if (res.status === 409) throw new InternalServerErrorException('Orden duplicada');

        return res.json(); // Esto devolverá el estado "PENDING" 
    }

    // Paso 3: Tu backend pregunta cómo va el pago
    async consultarEstado(referenceId: string) {
        const token = await this.getToken();
        const res = await fetch(`${process.env.PAGOS_BASE_URL}/v1/payments/${referenceId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        // Retorna PENDING, APPROVED, REJECTED o CANCELLED 
        return data.status;
    }
}