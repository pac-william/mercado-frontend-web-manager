import { z } from "zod";

export const UserDTO = z.object({
    name: z.string({ error: "Nome do usuário é obrigatório" }),
    email: z.string().email({ error: "Email deve ter um formato válido" }),
    password: z.string().min(6, { error: "Senha deve ter pelo menos 6 caracteres" }).optional(),
    phone: z.string().optional(),
    profilePicture: z.string().optional(),
    birthDate: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    auth0Id: z.string().optional(),
    role: z.string().optional(),
});

export type UserDTO = z.infer<typeof UserDTO>;

export const UserUpdateDTO = UserDTO.partial();
export type UserUpdateDTO = z.infer<typeof UserUpdateDTO>;