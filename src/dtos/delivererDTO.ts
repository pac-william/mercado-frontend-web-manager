import { z } from "zod";

export const VehicleDTO = z.object({
    type: z.enum(["bicicleta", "moto", "carro"]),
    plate: z.string().optional(),
    description: z.string().optional(),
});

export const DelivererDTO = z.object({
    name: z.string().min(1, { message: "Nome do entregador é obrigatório" }),
    document: z.string().min(1, { message: "Documento é obrigatório" }),
    phone: z.string().min(1, { message: "Telefone é obrigatório" }),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    vehicle: VehicleDTO,
});

export type DelivererDTO = z.infer<typeof DelivererDTO>;

export const DelivererUpdateDTO = DelivererDTO.partial();
export type DelivererUpdateDTO = z.infer<typeof DelivererUpdateDTO>;

