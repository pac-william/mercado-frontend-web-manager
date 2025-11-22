"use server"

import { Market, MarketPaginatedResponse } from "@/app/domain/marketDomain"
import { baseUrl } from "@/config/server"
import { MarketCreateDTO, MarketUpdateDTO } from "@/dtos/marketDTO"
import { auth0 } from "@/lib/auth0"
import { buildSearchParams } from "@/lib/misc"

interface GetMarketsFilters {
    page?: number;
    size?: number;
    name?: string;
    address?: string;
    ownerId?: string;
    managersIds?: string[];
}


export const getMarkets = async (filters?: GetMarketsFilters) => {
    try {
        const params = buildSearchParams({
            page: filters?.page,
            size: filters?.size,
            name: filters?.name,
            address: filters?.address,
            ownerId: filters?.ownerId,
            managersIds: filters?.managersIds,
        });

        const response = await fetch(`${baseUrl}/api/v1/markets?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar mercados');
        }

        const data = await response.json() as MarketPaginatedResponse;
        return data;
    } catch (error) {
        console.error('Erro ao buscar mercados:', error);
        throw error;
    }
}

export const getMarketById = async (id: string) => {
    try {
        const response = await fetch(`${baseUrl}/api/v1/markets/${id}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Mercado não encontrado');
            }
            throw new Error('Erro ao buscar mercado');
        }

        const data = await response.json() as Market;
        return data;
    } catch (error) {
        console.error('Erro ao buscar mercado:', error);
        throw error;
    }
}

export const createMarket = async (market: MarketCreateDTO) => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/markets`, {
            method: "POST",
            body: JSON.stringify(market),
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
            throw new Error('Erro ao criar mercado');
        }

        const data = await response.json() as Market;
        return data;
    } catch (error) {
        console.error('Erro ao criar mercado:', error);
        throw error;
    }
}

export const updateMarket = async (id: string, market: MarketUpdateDTO) => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/markets/${id}`, {
            method: "PUT",
            body: JSON.stringify(market),
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
            // Tentar obter mais informações do erro
            let errorMessage = 'Erro ao atualizar mercado';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                // Se não conseguir parsear o JSON, usar a mensagem padrão
            }
            throw new Error(errorMessage);
        }

        const data = await response.json() as Market;
        return data;
    } catch (error) {
        console.error('Erro ao atualizar mercado:', error);
        throw error;
    }
}

export const updateMarketPartial = async (id: string, market: MarketUpdateDTO) => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/markets/${id}`, {
            method: "PATCH",
            body: JSON.stringify(market),
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
            // Tentar obter mais informações do erro
            let errorMessage = 'Erro ao atualizar mercado';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                // Se não conseguir parsear o JSON, usar a mensagem padrão
            }
            throw new Error(errorMessage);
        }

        const data = await response.json() as Market;
        return data;
    } catch (error) {
        console.error('Erro ao atualizar mercado parcial:', error);
        throw error;
    }
}

export const updateMarketStatus = async (id: string, isOpen: boolean, managerPassword: string) => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/markets/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ isOpen, managerPassword }),
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
                throw new Error('Senha de gerente incorreta');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'Erro de validação');
            }
            throw new Error('Erro ao atualizar status do mercado');
        }

        const data = await response.json() as Market;
        return data;
    } catch (error) {
        console.error('Erro ao atualizar status do mercado:', error);
        throw error;
    }
}