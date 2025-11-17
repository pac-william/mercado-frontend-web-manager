import { z } from "zod";

export const CampaignStatusEnum = z.enum(["DRAFT", "SCHEDULED", "ACTIVE", "EXPIRED"]);

export const CampaignDTO = z.object({
    marketId: z.string({ message: "ID do mercado é obrigatório" }),
    title: z.string({ message: "Título da campanha é obrigatório" }).min(1, "Título não pode ser vazio"),
    imageUrl: z.string({ message: "URL da imagem é obrigatória" }).url("URL da imagem inválida"),
    slot: z.number({ message: "Slot é obrigatório" })
        .int("Slot deve ser um número inteiro")
        .min(1, "Slot deve ser entre 1 e 8")
        .max(8, "Slot deve ser entre 1 e 8"),
    startDate: z.coerce.date({ message: "Data de início é obrigatória" }),
    endDate: z.coerce.date().optional().nullable(),
    status: CampaignStatusEnum.optional().default("DRAFT"),
});

export type CampaignDTO = z.infer<typeof CampaignDTO>;

export const CampaignUpdateDTO = CampaignDTO.partial();
export type CampaignUpdateDTO = z.infer<typeof CampaignUpdateDTO>;

