import { z } from "zod";
import { AddressDTO } from "./addressDTO";

export const MarketDTO = z.object({
    name: z.string({ error: "Nome do mercado é obrigatório" }),
    addressId: z.string({ error: "ID do endereço do mercado é obrigatório" }),
    profilePicture: z.string({ error: "Logo do mercado é obrigatório" }).optional(),
    ownerId: z.string({ error: "ID do proprietário é obrigatório" }),
    managersIds: z.array(z.string({ error: "ID do gerente é obrigatório" })).optional().default([]),
});

export type MarketDTO = z.infer<typeof MarketDTO>;

export const MarketCreateDTO = z.object({
    name: z.string({ error: "Nome do mercado é obrigatório" }),
    address: AddressDTO,
    profilePicture: z.string({ error: "Logo do mercado é obrigatório" }).optional(),
    ownerId: z.string({ error: "ID do proprietário é obrigatório" }),
    managersIds: z.array(z.string({ error: "ID do gerente é obrigatório" })).optional().default([]),
});

export type MarketCreateDTO = z.infer<typeof MarketCreateDTO>;

export const MarketUpdateDTO = MarketDTO.partial();
export type MarketUpdateDTO = z.infer<typeof MarketUpdateDTO>;