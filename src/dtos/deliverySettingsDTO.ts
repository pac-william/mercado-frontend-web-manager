import { z } from "zod";

export const DeliverySettingsDTO = z.object({
    marketId: z.string().min(1, { message: "ID do mercado é obrigatório" }),
    deliveryRadius: z.number().min(0, { message: "Raio de entrega deve ser maior ou igual a zero" }),
    deliveryFee: z.number().min(0, { message: "Valor da entrega deve ser maior ou igual a zero" }),
    allowsPickup: z.boolean().default(true),
});

export type DeliverySettingsDTO = z.infer<typeof DeliverySettingsDTO>;

export const DeliverySettingsUpdateDTO = DeliverySettingsDTO.partial().omit({ marketId: true });
export type DeliverySettingsUpdateDTO = z.infer<typeof DeliverySettingsUpdateDTO>;

