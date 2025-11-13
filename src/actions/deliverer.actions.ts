"use server"

import { Deliverer, DelivererPaginatedResponse } from "@/app/domain/delivererDomain";
import { baseUrl } from "@/config/server";
import { DelivererDTO, DelivererUpdateDTO } from "@/dtos/delivererDTO";
import { auth0 } from "@/lib/auth0";
import { buildSearchParams } from "@/lib/misc";

interface GetDeliverersFilters {
    page?: number;
    size?: number;
    status?: string;
}

type ValidationErrorResponse = {
    message?: string;
    errors?: Array<{ field?: string; message?: string }>;
};

const formatValidationErrors = (errors?: Array<{ field?: string; message?: string }>) => {
    if (!Array.isArray(errors)) {
        return undefined;
    }

    const formatted = errors
        .map((validationError) => {
            const field = validationError.field ?? "campo";
            const message = validationError.message ?? "inválido";
            return `${field}: ${message}`;
        })
        .filter(Boolean)
        .join(", ");

    return formatted || undefined;
};

export const getDeliverers = async (filters?: GetDeliverersFilters): Promise<DelivererPaginatedResponse> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const params = buildSearchParams({
            page: filters?.page ?? 1,
            size: filters?.size ?? 10,
            status: filters?.status,
        });

        const response = await fetch(`${baseUrl}/api/v1/deliverers?${params.toString()}`, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 403) {
                throw new Error("Acesso negado");
            }
            if (response.status === 404) {
                throw new Error("Entregadores não encontrados");
            }
            if (response.status >= 500) {
                throw new Error("Erro no servidor ao buscar entregadores");
            }
            try {
                const error = await response.json();
                throw new Error(error.message || "Erro ao buscar entregadores");
            } catch {
                throw new Error(`Erro ao buscar entregadores (status: ${response.status})`);
            }
        }

        const data = await response.json() as DelivererPaginatedResponse;
        return data;
    } catch (error) {
        console.error("Erro ao buscar entregadores:", error);
        throw error;
    }
};

export const getDelivererById = async (id: string): Promise<Deliverer> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/deliverers/${encodeURIComponent(id)}`, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Entregador não encontrado");
            }
            if (response.status >= 500) {
                throw new Error("Erro no servidor ao buscar entregador");
            }
            throw new Error("Erro ao buscar entregador");
        }

        const data = await response.json() as Deliverer;
        return data;
    } catch (error) {
        console.error("Erro ao buscar entregador:", error);
        throw error;
    }
};

export const createDeliverer = async (deliverer: DelivererDTO): Promise<Deliverer> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/deliverers`, {
            method: "POST",
            body: JSON.stringify(deliverer),
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
            if (response.status === 403) {
                throw new Error("Acesso negado");
            }
            if (response.status === 400) {
                const error = await response.json().catch(() => ({} as ValidationErrorResponse));
                const validationMessage = error?.message || formatValidationErrors(error?.errors);
                throw new Error(validationMessage || "Erro de validação");
            }
            if (response.status >= 500) {
                throw new Error("Erro interno do servidor");
            }
            throw new Error("Erro ao criar entregador");
        }

        const data = await response.json() as Deliverer;
        return data;
    } catch (error) {
        console.error("Erro ao criar entregador:", error);
        throw error;
    }
};

export const updateDeliverer = async (id: string, deliverer: DelivererDTO): Promise<Deliverer> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/deliverers/${encodeURIComponent(id)}`, {
            method: "PUT",
            body: JSON.stringify(deliverer),
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
            if (response.status === 403) {
                throw new Error("Acesso negado");
            }
            if (response.status === 404) {
                throw new Error("Entregador não encontrado");
            }
            if (response.status === 400) {
                const error = await response.json().catch(() => ({} as ValidationErrorResponse));
                const validationMessage = error?.message || formatValidationErrors(error?.errors);
                throw new Error(validationMessage || "Erro de validação");
            }
            if (response.status >= 500) {
                throw new Error("Erro interno do servidor");
            }
            throw new Error("Erro ao atualizar entregador");
        }

        const data = await response.json() as Deliverer;
        return data;
    } catch (error) {
        console.error("Erro ao atualizar entregador:", error);
        throw error;
    }
};

export const partialUpdateDeliverer = async (id: string, deliverer: DelivererUpdateDTO): Promise<Deliverer> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/deliverers/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify(deliverer),
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
            if (response.status === 403) {
                throw new Error("Acesso negado");
            }
            if (response.status === 404) {
                throw new Error("Entregador não encontrado");
            }
            if (response.status === 400) {
                const error = await response.json().catch(() => ({} as ValidationErrorResponse));
                const validationMessage = error?.message || formatValidationErrors(error?.errors);
                throw new Error(validationMessage || "Erro de validação");
            }
            if (response.status >= 500) {
                throw new Error("Erro interno do servidor");
            }
            throw new Error("Erro ao atualizar entregador");
        }

        const data = await response.json() as Deliverer;
        return data;
    } catch (error) {
        console.error("Erro ao atualizar entregador:", error);
        throw error;
    }
};

export const deleteDeliverer = async (id: string): Promise<Deliverer> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/deliverers/${encodeURIComponent(id)}`, {
            method: "DELETE",
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
            if (response.status === 403) {
                throw new Error("Acesso negado");
            }
            if (response.status === 404) {
                throw new Error("Entregador não encontrado");
            }
            if (response.status >= 500) {
                throw new Error("Erro interno do servidor");
            }
            throw new Error("Erro ao deletar entregador");
        }

        const data = await response.json() as Deliverer;
        return data;
    } catch (error) {
        console.error("Erro ao deletar entregador:", error);
        throw error;
    }
};

