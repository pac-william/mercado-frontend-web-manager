import { z } from "zod";

export const ProductDTO = z.object({
    name: z.string().min(1, { error: "Nome do produto é obrigatório" }),
    price: z.number({ error: "Preço do produto é obrigatório" }),
    marketId: z.string({ error: "ID do mercado é obrigatório" }),
    image: z.string().optional(),
    sku: z.string().optional(),
    unit: z.string().optional(),
    categoryId: z.string().min(1, { error: "ID da categoria é obrigatório" }),
    isActive: z.boolean().optional(),
});

export type ProductDTO = z.infer<typeof ProductDTO>;

export const ProductUpdateDTO = ProductDTO.partial();
export type ProductUpdateDTO = z.infer<typeof ProductUpdateDTO>; 