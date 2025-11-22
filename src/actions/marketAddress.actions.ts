"use server"

import { baseUrl } from "@/config/server";
import { AddressDTO, AddressUpdateDTO } from "@/dtos/addressDTO";
import { auth0 } from "@/lib/auth0";

export interface MarketAddressDomain {
    id: string;
    marketId: string;
    name: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number | null;
    longitude?: number | null;
    createdAt: string;
    updatedAt: string;
}

export const createMarketAddress = async (marketId: string, data: AddressDTO): Promise<MarketAddressDomain> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/markets/${marketId}/address`, {
            method: "POST",
            body: JSON.stringify(data),
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
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'Erro de validação');
            }
            throw new Error('Erro ao criar endereço do mercado');
        }

        const address = await response.json() as MarketAddressDomain;
        return address;
    } catch (error) {
        console.error('Erro ao criar endereço do mercado:', error);
        throw error;
    }
}

export const getMarketAddressByMarketId = async (marketId: string): Promise<MarketAddressDomain | null> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/markets/${marketId}/address`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            if (response.status === 401) {
                throw new Error('Usuário não autenticado');
            }
            throw new Error('Erro ao buscar endereço do mercado');
        }

        const address = await response.json() as MarketAddressDomain;
        return address;
    } catch (error) {
        console.error('Erro ao buscar endereço do mercado:', error);
        throw error;
    }
}

export const getMarketAddressById = async (id: string): Promise<MarketAddressDomain> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/markets/address/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Endereço não encontrado');
            }
            if (response.status === 401) {
                throw new Error('Usuário não autenticado');
            }
            throw new Error('Erro ao buscar endereço do mercado');
        }

        const address = await response.json() as MarketAddressDomain;
        return address;
    } catch (error) {
        console.error('Erro ao buscar endereço do mercado:', error);
        throw error;
    }
}

export const updateMarketAddress = async (id: string, data: AddressDTO): Promise<MarketAddressDomain> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/markets/address/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
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
            if (response.status === 404) {
                throw new Error('Endereço não encontrado');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'Erro de validação');
            }
            throw new Error('Erro ao atualizar endereço do mercado');
        }

        const address = await response.json() as MarketAddressDomain;
        return address;
    } catch (error) {
        console.error('Erro ao atualizar endereço do mercado:', error);
        throw error;
    }
}

export const updateMarketAddressPartial = async (id: string, data: AddressUpdateDTO): Promise<MarketAddressDomain> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/markets/address/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
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
            if (response.status === 404) {
                throw new Error('Endereço não encontrado');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'Erro de validação');
            }
            throw new Error('Erro ao atualizar endereço do mercado');
        }

        const address = await response.json() as MarketAddressDomain;
        return address;
    } catch (error) {
        console.error('Erro ao atualizar endereço do mercado:', error);
        throw error;
    }
}

export const deleteMarketAddress = async (id: string): Promise<void> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/markets/address/${id}`, {
            method: "DELETE",
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
            if (response.status === 404) {
                throw new Error('Endereço não encontrado');
            }
            throw new Error('Erro ao deletar endereço do mercado');
        }
    } catch (error) {
        console.error('Erro ao deletar endereço do mercado:', error);
        throw error;
    }
}

