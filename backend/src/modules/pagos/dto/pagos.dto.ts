import { IsIn, IsOptional, IsString } from "class-validator";

// Lo que NestJS le enviará a la API de Pagos
export interface CrearOrdenPayload {
    referenceId: string;
    originService: string;
    amount: number;
    paymentMethod: string;
    callbackUrl: string;
    description: string;
}

// Lo que la API de Pagos nos responde
export interface OrdenPagoResponse {
    id: string;
    referenceId: string;
    originService: string;
    amount: number | string;
    status: string;
    paymentMethod: string;
    rejectionReason: string | null;
    callbackUrl: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

// El DTO para que Angular nos avise que quiere simular/confirmar el pago
export class ConfirmarPagoDTO {
    @IsString()
    @IsIn(['APPROVED', 'REJECTED'], { message: 'El estado debe ser APPROVED o REJECTED' })
    status!: 'APPROVED' | 'REJECTED';

    @IsOptional()
    @IsString()
    rejectionReason?: string;
}