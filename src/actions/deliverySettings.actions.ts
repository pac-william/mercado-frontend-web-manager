"use server"

import { DeliverySettings } from "@/app/domain/deliverySettingsDomain";
import { baseUrl } from "@/config/server";
import { DeliverySettingsDTO } from "@/dtos/deliverySettingsDTO";
import { auth0 } from "@/lib/auth0";

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

export const getDeliverySettingsByMarketId = async (marketId: string): Promise<DeliverySettings | null> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/delivery-settings/market/${encodeURIComponent(marketId)}`, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 403) {
                throw new Error("Acesso negado");
            }
            if (response.status >= 500) {
                throw new Error("Erro no servidor ao buscar configurações de entrega");
            }
            throw new Error("Erro ao buscar configurações de entrega");
        }

        const data = await response.json() as DeliverySettings;
        return data;
    } catch (error) {
        console.error("Erro ao buscar configurações de entrega:", error);
        throw error;
    }
};

export const upsertDeliverySettings = async (deliverySettings: DeliverySettingsDTO): Promise<DeliverySettings> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/delivery-settings/upsert`, {
            method: "POST",
            body: JSON.stringify(deliverySettings),
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
            throw new Error("Erro ao salvar configurações de entrega");
        }

        const data = await response.json() as DeliverySettings;
        return data;
    } catch (error) {
        console.error("Erro ao salvar configurações de entrega:", error);
        throw error;
    }
};

