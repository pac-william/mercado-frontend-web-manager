"use server"

import { User } from "@/app/domain/userDomain";
import { baseUrl } from "@/config/server";
import { UserUpdateDTO } from "@/dtos/userDTO";
import { auth0 } from "@/lib/auth0";

export const getUsers = async (filters?: { page?: number; size?: number; marketId?: string; auth0Id?: string }): Promise<User[]> => {
    const session = await auth0.getSession();
    if (!session) {
        throw new Error("Usuário não autenticado");
    }

    const params = new URLSearchParams();
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.size) params.set("size", String(filters.size));
    if (filters?.marketId) params.set("marketId", String(filters.marketId));
    if (filters?.auth0Id) params.set("auth0Id", String(filters.auth0Id));

    const response = await fetch(`${baseUrl}/api/v1/users?${params.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.tokenSet.idToken}`,
        },
        cache: "no-store",
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Usuário não autenticado");
        }
        throw new Error("Erro ao listar usuários");
    }

    const users = await response.json() as User[];
    return users;
};

export const getUserMe = async (): Promise<User> => {
    const session = await auth0.getSession();
    if (!session) {
        throw new Error("Usuário não autenticado");
    }

    const response = await fetch(`${baseUrl}/api/v1/users/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.tokenSet.idToken}`,
        },
        cache: "no-store",
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Usuário não autenticado");
        }
        if (response.status === 404) {
            throw new Error("Usuário não encontrado");
        }
        if (response.status === 500) {
            throw new Error("Erro interno do servidor");
        }
        throw new Error("Erro ao buscar usuário");
    }

    const user = await response.json() as User;
    return user;
};

export const getUserByAuth0Id = async (auth0Id: string): Promise<User> => {
    const session = await auth0.getSession();
    if (!session) {
        throw new Error("Usuário não autenticado");
    }

    const response = await fetch(`${baseUrl}/api/v1/users/auth0/${encodeURIComponent(auth0Id)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.tokenSet.idToken}`,
        },
        cache: "no-store",
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Usuário não encontrado");
        }
        if (response.status === 401) {
            throw new Error("Usuário não autenticado");
        }
        throw new Error("Erro ao buscar usuário");
    }

    const user = await response.json() as User;
    return user;
};

export const updateUser = async (id: string, data: UserUpdateDTO): Promise<User> => {
    const session = await auth0.getSession();
    if (!session) {
        throw new Error("Usuário não autenticado");
    }

    const response = await fetch(`${baseUrl}/api/v1/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.tokenSet.idToken}`,
        },
        cache: "no-store",
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Usuário não autenticado");
        }
        if (response.status === 404) {
            throw new Error("Usuário não encontrado");
        }
        if (response.status === 409) {
            const err = (await response.json().catch(() => ({} as { message?: string }))) as {
                message?: string;
            };
            throw new Error(err?.message || "Email já está em uso");
        }
        if (response.status === 400) {
            const err = (await response.json().catch(() => ({} as { message?: string }))) as {
                message?: string;
            };
            throw new Error(err?.message || "Erro de validação");
        }
        throw new Error("Erro ao atualizar usuário");
    }

    const user = await response.json() as User;
    return user;
};
