"use server"

import { OrderPaginatedResponse } from "@/app/domain/orderDomain";
import { baseUrl } from "@/config/server";
import { AssignDelivererDTO, OrderCreateDTO, OrderResponseDTO, OrderUpdateDTO } from "@/dtos/orderDTO";
import { auth0 } from "@/lib/auth0";
import { buildSearchParams } from "@/lib/misc";

interface GetOrdersFilters {
    page?: number;
    size?: number;
    status?: string;
    userId?: string;
    marketId?: string;
    delivererId?: string;
}

export const createOrder = async (data: OrderCreateDTO): Promise<OrderResponseDTO> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/orders`, {
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
            throw new Error('Erro ao criar pedido');
        }

        const order = await response.json() as OrderResponseDTO;
        return order;
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        throw error;
    }
}

export const getOrders = async (filters?: GetOrdersFilters): Promise<OrderPaginatedResponse> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const params = buildSearchParams({
            page: filters?.page,
            size: filters?.size,
            status: filters?.status,
            userId: filters?.userId,
            marketId: filters?.marketId,
            delivererId: filters?.delivererId,
        });

        const response = await fetch(`${baseUrl}/api/v1/orders?${params.toString()}`, {
            method: "GET",
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
            throw new Error('Erro ao buscar pedidos');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        throw error;
    }
}

interface GetOrdersByMarketIdFilters {
    page?: number;
    size?: number;
    status?: string;
    delivererId?: string;
}

export const getOrdersByMarketId = async (marketId: string, filters?: GetOrdersByMarketIdFilters): Promise<OrderPaginatedResponse> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const params = buildSearchParams({
            page: filters?.page,
            size: filters?.size,
            status: filters?.status,
            delivererId: filters?.delivererId,
        });

        const response = await fetch(`${baseUrl}/api/v1/orders/market/${marketId}?${params.toString()}`, {
            method: "GET",
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
                throw new Error('Mercado não encontrado');
            }
            if (response.status >= 500) {
                throw new Error('Erro interno do servidor');
            }
            throw new Error('Erro ao buscar pedidos do mercado');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar pedidos do mercado:', error);
        throw error;
    }
}

export const getOrderById = async (id: string): Promise<OrderResponseDTO> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/orders/${id}`, {
            method: "GET",
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
                throw new Error('Pedido não encontrado');
            }
            throw new Error('Erro ao buscar pedido');
        }

        const order = await response.json() as OrderResponseDTO;
        return order;
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        throw error;
    }
}

export const updateOrderStatus = async (id: string, data: OrderUpdateDTO): Promise<OrderResponseDTO> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/orders/${id}`, {
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
            if (response.status === 403) {
                throw new Error('Acesso negado');
            }
            if (response.status === 404) {
                throw new Error('Pedido não encontrado');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'Erro de validação');
            }
            throw new Error('Erro ao atualizar pedido');
        }

        const order = await response.json() as OrderResponseDTO;
        return order;
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        throw error;
    }
}

export const assignDeliverer = async (orderId: string, data: AssignDelivererDTO): Promise<OrderResponseDTO> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/orders/${orderId}/assign-deliverer`, {
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
            if (response.status === 403) {
                throw new Error('Acesso negado');
            }
            if (response.status === 404) {
                throw new Error('Pedido ou entregador não encontrado');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'Erro de validação');
            }
            throw new Error('Erro ao atribuir entregador');
        }

        const order = await response.json() as OrderResponseDTO;
        return order;
    } catch (error) {
        console.error('Erro ao atribuir entregador:', error);
        throw error;
    }
}

