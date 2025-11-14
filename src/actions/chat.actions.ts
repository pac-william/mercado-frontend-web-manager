"use server"

import { baseUrl } from "@/config/server";
import { auth0 } from "@/lib/auth0";

export interface StoreOwnerConversation {
    chatId: string;
    customerId: string;
    customerUsername: string;
    isActive: boolean;
    lastMessage: {
        message: string;
        timestamp: Date | string;
    } | null;
}

export interface ChatMessage {
    id: string;
    chatId: string;
    username: string;
    userId: string;
    message: string;
    readAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface ChatWithMessages {
    id: string;
    chatId: string;
    userId: string;
    marketId: string;
    isActive: boolean;
    lastMessageAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    messages: ChatMessage[];
}

export const getStoreOwnerConversations = async (marketId: string): Promise<StoreOwnerConversation[]> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/chats/market/${marketId}`, {
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
            throw new Error('Erro ao buscar conversas');
        }

        const data = await response.json() as StoreOwnerConversation[];
        return data;
    } catch (error) {
        console.error('Erro ao buscar conversas:', error);
        throw error;
    }
};

export const getChatByChatId = async (chatId: string): Promise<ChatWithMessages | null> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/chats/${chatId}`, {
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
                // Chat não existe ainda, retornar null ao invés de lançar erro
                return null;
            }
            throw new Error('Erro ao buscar chat');
        }

        const data = await response.json() as ChatWithMessages;
        return data;
    } catch (error) {
        console.error('Erro ao buscar chat:', error);
        throw error;
    }
};

export const createChat = async (chatId: string, userId: string, marketId: string) => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/chats`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
            body: JSON.stringify({ chatId, userId, marketId }),
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Usuário não autenticado');
            }
            throw new Error('Erro ao criar chat');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao criar chat:', error);
        throw error;
    }
};

export const createMessage = async (
    chatId: string,
    message: string
): Promise<ChatMessage> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/chats/${chatId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
            body: JSON.stringify({ message }),
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Usuário não autenticado');
            }
            if (response.status === 404) {
                throw new Error('Chat não encontrado');
            }
            throw new Error('Erro ao enviar mensagem');
        }

        const data = await response.json() as ChatMessage;
        return data;
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        throw error;
    }
};

export const markMessagesAsRead = async (chatId: string): Promise<{ success: boolean; count: number }> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/chats/${chatId}/read`, {
            method: "POST",
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
                throw new Error('Chat não encontrado');
            }
            throw new Error('Erro ao marcar mensagens como lidas');
        }

        const data = await response.json() as { success: boolean; count: number };
        return data;
    } catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
        throw error;
    }
};

