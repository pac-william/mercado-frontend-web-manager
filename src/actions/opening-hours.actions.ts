"use server"

import { baseUrl } from "@/config/server"
import { auth0 } from "@/lib/auth0"

export interface OpeningHoursDay {
    dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    isOpen: boolean;
    openTime: string; // formato HH:mm
    closeTime: string; // formato HH:mm
}

export interface OpeningHours {
    marketId: string;
    days: OpeningHoursDay[];
}

const defaultDays: OpeningHoursDay[] = [
    { dayOfWeek: 0, isOpen: false, openTime: "08:00", closeTime: "18:00" }, // Domingo
    { dayOfWeek: 1, isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Segunda
    { dayOfWeek: 2, isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Terça
    { dayOfWeek: 3, isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Quarta
    { dayOfWeek: 4, isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Quinta
    { dayOfWeek: 5, isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Sexta
    { dayOfWeek: 6, isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Sábado
];

export const getOpeningHours = async (marketId: string): Promise<OpeningHours> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/markets/${marketId}/opening-hours`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 404) {
                // Se não existir, retorna valores padrão
                return {
                    marketId,
                    days: defaultDays,
                };
            }
            if (response.status === 401) {
                throw new Error('Usuário não autenticado');
            }
            throw new Error('Erro ao buscar horários de funcionamento');
        }

        const data = await response.json() as OpeningHours;
        return data;
    } catch (error) {
        console.error('Erro ao buscar horários de funcionamento:', error);
        // Em caso de erro, retorna valores padrão
        return {
            marketId,
            days: defaultDays,
        };
    }
}

export const saveOpeningHours = async (marketId: string, days: OpeningHoursDay[]): Promise<OpeningHours> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/markets/${marketId}/opening-hours`, {
            method: "PUT",
            body: JSON.stringify({ days }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Usuário não autenticado');
            }
            if (response.status === 403) {
                throw new Error('Acesso negado');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'Erro de validação');
            }
            throw new Error('Erro ao salvar horários de funcionamento');
        }

        const data = await response.json() as OpeningHours;
        return data;
    } catch (error) {
        console.error('Erro ao salvar horários de funcionamento:', error);
        throw error;
    }
}

