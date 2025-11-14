"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

import { createMessage, getChatByChatId, getStoreOwnerConversations, markMessagesAsRead } from "@/actions/chat.actions"
import { getUserMe } from "@/actions/user.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { AlertCircle, Check, CheckCheck } from "lucide-react"

type MessageAuthor = "client" | "agent"
type MessageStatus = "not_sent" | "sent" | "delivered" | "read"

type ChatMessage = {
    id: string
    author: MessageAuthor
    content: string
    timestamp: Date
    status?: MessageStatus
    userId?: string
}

type ConversationStatus = "open" | "waiting" | "resolved"

type Conversation = {
    id: string
    roomId: string
    clienteId: string
    customerName: string
    channel: "App" | "WhatsApp" | "Site"
    status: ConversationStatus
    priority: "normal" | "alta"
    lastInteraction: Date
    orderRef?: string
    messages: ChatMessage[]
    isActive: boolean
}

type ServerConversa = {
    chatId: string
    clienteId: string
    clienteUsername: string
    isActive: boolean
    lastMessage: {
        message: string
        timestamp: Date
    } | null
}

type ServerMessage = {
    id: string
    chat: string
    username: string
    message: string
    timestamp: string | Date
}

const statusLabels: Record<ConversationStatus, string> = {
    open: "Em andamento",
    waiting: "Aguardando cliente",
    resolved: "Finalizado",
}

const statusBadgeStyles: Record<ConversationStatus, string> = {
    open: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    waiting: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
    resolved: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
}

const channelBadgeStyles: Record<Conversation["channel"], string> = {
    App: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
    WhatsApp: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    Site: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
}

const formatTimestamp = (date: Date) =>
    date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    })

const MESSAGING_SERVER_URL = process.env.NEXT_PUBLIC_MESSAGING_SERVER_URL

type SupportChatProps = {
    tenantId: string
}

export function SupportChat({ tenantId }: SupportChatProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
    const [messageDraft, setMessageDraft] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [storeOwnerUserId, setStoreOwnerUserId] = useState<string | null>(null)
    const storeOwnerUserIdRef = useRef<string | null>(null)

    const scrollRef = useRef<HTMLDivElement>(null)
    const socketRef = useRef<Socket | null>(null)
    const currentRoomIdRef = useRef<string | null>(null)
    const activeConversationIdRef = useRef<string | null>(null)

    const activeConversation = useMemo(
        () => conversations.find((conversation) => conversation.id === activeConversationId),
        [conversations, activeConversationId]
    )

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [activeConversation?.messages.length, isTyping])

    // Configuração do Socket.IO
    useEffect(() => {
        // Conectar ao servidor
        const socket = io(MESSAGING_SERVER_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })

        socketRef.current = socket

        // Registrar como lojista ao conectar
        socket.on("connect", () => {
            console.log("Conectado ao servidor de mensageria:", socket.id)
            socket.emit("lojista:register", {
                username: "Atendente",
                marketId: tenantId,
            })
        })

        // Após registro do lojista
        socket.on("lojista:registered", async (data) => {
            console.log("Lojista registrado:", data)
            // Buscar userId do lojista logado
            let storeOwnerId: string | null = null;
            try {
                const storeOwner = await getUserMe()
                storeOwnerId = storeOwner.id
                setStoreOwnerUserId(storeOwnerId)
                storeOwnerUserIdRef.current = storeOwnerId
            } catch (error) {
                console.error("Erro ao buscar userId do lojista:", error)
            }
            
            // Buscar conversas persistidas do backend
            try {
                const backendConversations = await getStoreOwnerConversations(tenantId)
                
                const newConversations: Conversation[] = backendConversations.map((conv) => ({
                    id: conv.chatId,
                    roomId: conv.chatId,
                    clienteId: conv.customerId,
                    customerName: conv.customerUsername,
                    channel: "Site",
                    status: conv.isActive ? "open" : "waiting",
                    priority: "normal",
                    lastInteraction: conv.lastMessage
                        ? typeof conv.lastMessage.timestamp === 'string'
                            ? new Date(conv.lastMessage.timestamp)
                            : conv.lastMessage.timestamp
                        : new Date(),
                    messages: [],
                    isActive: conv.isActive,
                }))

                setConversations(newConversations)
                
                // Se temos uma conversa ativa, carregar suas mensagens com o userId correto
                if (newConversations.length > 0) {
                    const firstConv = newConversations[0];
                    try {
                        const chatWithMessages = await getChatByChatId(firstConv.roomId);
                        if (chatWithMessages && chatWithMessages.messages.length > 0) {
                            // Extrair userId do cliente do chat (userId do chat = cliente)
                            const customerUserId = chatWithMessages.userId;
                            
                            const conversationMessages: ChatMessage[] = chatWithMessages.messages.map((msg) => {
                                const isAgent = msg.userId !== customerUserId;
                                let status: MessageStatus | undefined = undefined;
                                
                                if (isAgent && storeOwnerId) {
                                    // Se é mensagem do lojista, verificar se foi lida
                                    status = msg.readAt ? "read" as MessageStatus : "delivered" as MessageStatus;
                                }
                                
                                return {
                                    id: msg.id,
                                    author: isAgent ? "agent" : "client",
                                    content: msg.message,
                                    timestamp: typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : msg.createdAt,
                                    status,
                                    userId: msg.userId
                                } as ChatMessage;
                            });
                            
                            conversationMessages.sort(
                                (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
                            );
                            
                            setConversations(prev => prev.map(conv =>
                                conv.roomId === firstConv.roomId
                                    ? { ...conv, messages: conversationMessages }
                                    : conv
                            ));
                        }
                    } catch (error) {
                        console.error("Erro ao carregar mensagens da primeira conversa:", error);
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar conversas do backend:", error)
                // Fallback: listar conversas via socket
                socket.emit("lojista:conversas")
            }
        })

        // Receber lista de conversas (fallback)
        socket.on("lojista:conversas", (conversas: ServerConversa[]) => {
            console.log("Conversas recebidas via socket:", conversas)

            const newConversations: Conversation[] = conversas.map((conv) => ({
                id: conv.chatId,
                roomId: conv.chatId,
                clienteId: conv.clienteId,
                customerName: conv.clienteUsername,
                channel: "Site",
                status: conv.isActive ? "open" : "waiting",
                priority: "normal",
                lastInteraction: conv.lastMessage
                    ? new Date(conv.lastMessage.timestamp)
                    : new Date(),
                messages: [],
                isActive: conv.isActive,
            }))

            setConversations(newConversations)

            // Selecionar a primeira conversa se não houver nenhuma selecionada
            setActiveConversationId((currentId) => {
                if (newConversations.length > 0 && !currentId) {
                    const firstConv = newConversations[0]
                    // Entrar no chat da primeira conversa
                    if (socket.connected && firstConv.roomId) {
                        socket.emit("lojista:join-chat", {
                            chatId: firstConv.roomId,
                        })
                        currentRoomIdRef.current = firstConv.roomId
                    }
                    activeConversationIdRef.current = firstConv.id
                    return firstConv.id
                }
                activeConversationIdRef.current = currentId
                return currentId
            })
        })

        // Removido: Não notificar quando cliente entra no chat
        // O lojista só será notificado quando receber uma mensagem

        // Receber histórico de mensagens ao entrar em um chat
        socket.on("chat:messages", async (messages: ServerMessage[]) => {
            console.log("Histórico de mensagens recebido via socket:", messages)

            const chatId = messages[0]?.chat || currentRoomIdRef.current
            if (!chatId) return

            // Buscar mensagens persistidas do backend
            try {
                const chatWithMessages = await getChatByChatId(chatId)
                
                if (chatWithMessages && chatWithMessages.messages.length > 0) {
                    // Extrair userId do cliente do chatId (formato: {userId}-{marketId})
                    const customerUserId = chatWithMessages.userId;
                    
                    // Converter mensagens do backend para o formato esperado
                    // Se msg.userId === customerUserId, é mensagem do cliente
                    // Caso contrário, é mensagem do lojista (ou alguém do market)
                    const conversationMessages: ChatMessage[] = chatWithMessages.messages.map((msg) => {
                        const isAgent = msg.userId !== customerUserId;
                        let status: MessageStatus | undefined = undefined;
                        
                        // Usar ref para acessar o valor atual do storeOwnerUserId dentro do listener
                        const currentStoreOwnerId = storeOwnerUserIdRef.current;
                        if (isAgent && currentStoreOwnerId) {
                            // Se é mensagem do lojista, verificar se foi lida
                            status = msg.readAt ? "read" as MessageStatus : "delivered" as MessageStatus;
                        }
                        
                        return {
                            id: msg.id,
                            author: isAgent ? "agent" : "client",
                            content: msg.message,
                            timestamp: typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : msg.createdAt,
                            status,
                            userId: msg.userId
                        } as ChatMessage;
                    })

                    // Ordenar por timestamp
                    conversationMessages.sort(
                        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
                    )

                    // Atualizar mensagens da conversa correspondente
                    setConversations((prev) =>
                        prev.map((conv) => {
                            if (conv.roomId === chatId) {
                                return {
                                    ...conv,
                                    messages: conversationMessages,
                                    lastInteraction:
                                        conversationMessages.length > 0
                                            ? conversationMessages[conversationMessages.length - 1].timestamp
                                            : conv.lastInteraction,
                                }
                            }
                            return conv
                        })
                    )
                } else {
                    // Chat não existe ainda ou não tem mensagens, usar mensagens do socket
                    // Nota: mensagens do socket não têm userId, então usamos username como fallback
                    if (messages && messages.length > 0) {
                        setConversations((prev) =>
                            prev.map((conv) => {
                                if (conv.roomId === chatId) {
                                    const conversationMessages: ChatMessage[] = messages.map((msg) => ({
                                        id: msg.id,
                                        author: msg.username === "Atendente" ? "agent" : "client",
                                        content: msg.message,
                                        timestamp: new Date(msg.timestamp),
                                    }))

                                    conversationMessages.sort(
                                        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
                                    )

                                    return {
                                        ...conv,
                                        messages: conversationMessages,
                                        lastInteraction:
                                            conversationMessages.length > 0
                                                ? conversationMessages[conversationMessages.length - 1].timestamp
                                                : conv.lastInteraction,
                                    }
                                }
                                return conv
                            })
                        )
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar mensagens do backend:", error)
                // Fallback para mensagens do socket
                if (messages && messages.length > 0) {
                    setConversations((prev) =>
                        prev.map((conv) => {
                            if (conv.roomId === chatId) {
                                const conversationMessages: ChatMessage[] = messages.map((msg) => ({
                                    id: msg.id,
                                    author: msg.username === "Atendente" ? "agent" : "client",
                                    content: msg.message,
                                    timestamp: new Date(msg.timestamp),
                                }))

                                conversationMessages.sort(
                                    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
                                )

                                return {
                                    ...conv,
                                    messages: conversationMessages,
                                    lastInteraction:
                                        conversationMessages.length > 0
                                            ? conversationMessages[conversationMessages.length - 1].timestamp
                                            : conv.lastInteraction,
                                }
                            }
                            return conv
                        })
                    )
                }
            }
        })

        // Receber novas mensagens em tempo real
        socket.on("chat:message-received", async (message: ServerMessage) => {
            console.log("[LOJISTA] Nova mensagem recebida via socket:", message)

            // Buscar informações do chat do backend para determinar corretamente o autor
            try {
                const chatWithMessages = await getChatByChatId(message.chat);
                if (chatWithMessages) {
                    const customerUserId = chatWithMessages.userId;
                    
                    // Buscar a mensagem recém-criada do backend para obter o userId correto
                    // Como a mensagem foi recém-criada, ela deve estar no final da lista
                    const latestMessage = chatWithMessages.messages[chatWithMessages.messages.length - 1];
                    const isAgent = latestMessage && latestMessage.userId !== customerUserId;
                    
                    // Usar ref para acessar o valor atual do storeOwnerUserId
                    const currentStoreOwnerId = storeOwnerUserIdRef.current;
                    
                    // Encontrar conversa pelo chatId
                    setConversations((prev) => {
                        const existingConversation = prev.find((conv) => conv.roomId === message.chat)

                        if (existingConversation) {
                            // Verificar se a mensagem já existe pelo ID persistido
                            const messageExistsById = existingConversation.messages.some(
                                (msg) => msg.id === message.id
                            )

                            if (messageExistsById) {
                                console.log("[LOJISTA] Mensagem já existe pelo ID, ignorando");
                                return prev
                            }

                            // Se é mensagem do próprio lojista, verificar se já existe uma mensagem temporária
                            if (isAgent && currentStoreOwnerId && latestMessage?.userId === currentStoreOwnerId) {
                                console.log("[LOJISTA] É mensagem própria, verificando duplicação...");
                                
                                // Procurar mensagem temporária com o mesmo conteúdo e userId
                                const tempMessageIndex = existingConversation.messages.findIndex((msg) => {
                                    const isTempMessage = msg.id?.startsWith('temp-');
                                    const sameContent = msg.content === message.message;
                                    const sameUserId = msg.userId === currentStoreOwnerId;
                                    return isTempMessage && sameContent && sameUserId;
                                });

                                if (tempMessageIndex !== -1) {
                                    console.log("[LOJISTA] Encontrada mensagem temporária, atualizando com dados persistidos");
                                    // Atualizar mensagem temporária com dados persistidos
                                    return prev.map((conv) =>
                                        conv.roomId === message.chat
                                            ? {
                                                ...conv,
                                                messages: conv.messages.map((msg, index) => 
                                                    index === tempMessageIndex
                                                        ? {
                                                            ...msg,
                                                            id: message.id,
                                                            timestamp: new Date(message.timestamp),
                                                            status: "delivered" as MessageStatus,
                                                            userId: latestMessage?.userId || msg.userId
                                                        }
                                                        : msg
                                                ),
                                                lastInteraction: new Date(message.timestamp),
                                                status: conv.status === "resolved" ? "open" : conv.status,
                                            }
                                            : conv
                                    );
                                }

                                // Verificar por conteúdo e timestamp próximo (caso a mensagem persistida ainda não tenha sido adicionada)
                                const messageTime = typeof message.timestamp === 'string'
                                    ? new Date(message.timestamp).getTime()
                                    : new Date(message.timestamp).getTime();

                                const duplicateByContent = existingConversation.messages.some(msg => {
                                    const msgTime = msg.timestamp.getTime();
                                    const timeDiff = Math.abs(messageTime - msgTime);
                                    const sameContent = msg.content === message.message;
                                    const sameUserId = msg.userId === currentStoreOwnerId;
                                    return sameContent && sameUserId && timeDiff < 10000; // 10 segundos
                                });

                                if (duplicateByContent) {
                                    console.log("[LOJISTA] Mensagem duplicada por conteúdo/timestamp detectada, ignorando");
                                    return prev;
                                }
                            }

                            // Adicionar mensagem à conversa existente com autor correto (não é duplicada)
                            console.log("[LOJISTA] Adicionando mensagem ao estado (não é duplicada)");
                            return prev.map((conv) =>
                                conv.roomId === message.chat
                                    ? {
                                        ...conv,
                                        messages: [
                                            ...conv.messages,
                                            {
                                                id: message.id,
                                                author: isAgent ? "agent" : "client",
                                                content: message.message,
                                                timestamp: new Date(message.timestamp),
                                                // Mensagens recebidas via socket têm status "delivered" por padrão
                                                status: (isAgent ? "delivered" as MessageStatus : undefined),
                                                userId: latestMessage?.userId
                                            } as ChatMessage,
                                        ],
                                        lastInteraction: new Date(message.timestamp),
                                        status: conv.status === "resolved" ? "open" : conv.status,
                                    }
                                    : conv
                            )
                        } else {
                            // Criar nova conversa (caso não tenha sido criada antes)
                            const newConversation: Conversation = {
                                id: message.chat,
                                roomId: message.chat,
                                clienteId: customerUserId,
                                customerName: message.username,
                                channel: "Site",
                                status: "open",
                                priority: "normal",
                                lastInteraction: new Date(message.timestamp),
                                messages: [
                                    {
                                        id: message.id,
                                        author: isAgent ? "agent" : "client",
                                        content: message.message,
                                        timestamp: new Date(message.timestamp),
                                        status: (isAgent ? "delivered" as MessageStatus : undefined),
                                        userId: latestMessage?.userId
                                    } as ChatMessage,
                                ],
                                isActive: true,
                            }
                            return [newConversation, ...prev]
                        }
                    })
                }
            } catch (error) {
                console.error("Erro ao buscar informações do chat:", error);
                // Fallback: usar username para determinar autor
                const currentStoreOwnerId = storeOwnerUserIdRef.current;
                setConversations((prev) => {
                    const existingConversation = prev.find((conv) => conv.roomId === message.chat)
                    if (existingConversation) {
                        // Verificar se a mensagem já existe pelo ID
                        const messageExistsById = existingConversation.messages.some(
                            (msg) => msg.id === message.id
                        )
                        if (messageExistsById) {
                            return prev
                        }

                        // Se é mensagem do lojista, verificar duplicação por conteúdo
                        if (message.username === "Atendente" && currentStoreOwnerId) {
                            const messageTime = typeof message.timestamp === 'string'
                                ? new Date(message.timestamp).getTime()
                                : new Date(message.timestamp).getTime();

                            const duplicateByContent = existingConversation.messages.some(msg => {
                                const msgTime = msg.timestamp.getTime();
                                const timeDiff = Math.abs(messageTime - msgTime);
                                const sameContent = msg.content === message.message;
                                const sameUserId = msg.userId === currentStoreOwnerId;
                                return sameContent && sameUserId && timeDiff < 10000;
                            });

                            if (duplicateByContent) {
                                console.log("[LOJISTA] Mensagem duplicada por conteúdo detectada no fallback, ignorando");
                                return prev;
                            }
                        }

                        return prev.map((conv) =>
                            conv.roomId === message.chat
                                ? {
                                    ...conv,
                                    messages: [
                                        ...conv.messages,
                                        {
                                            id: message.id,
                                            author: message.username === "Atendente" ? "agent" : "client",
                                            content: message.message,
                                            timestamp: new Date(message.timestamp),
                                            status: (message.username === "Atendente" ? "delivered" as MessageStatus : undefined),
                                        } as ChatMessage,
                                    ],
                                    lastInteraction: new Date(message.timestamp),
                                    status: conv.status === "resolved" ? "open" : conv.status,
                                }
                                : conv
                        )
                    }
                    return prev
                })
            }
        })

        // Receber notificação quando cliente marca mensagens como lidas
        socket.on("chat:messages-read", (data: { chatId: string; readBy: string; readAt: Date }) => {
            console.log("[LOJISTA] Mensagens marcadas como lidas pelo cliente:", data)
            
            // Atualizar status de todas as mensagens do lojista para "read"
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.roomId === data.chatId
                        ? {
                            ...conv,
                            messages: conv.messages.map((msg) => {
                                // Se é mensagem do agente (lojista), atualizar status para "read"
                                if (msg.author === "agent" && msg.status && msg.status !== "read") {
                                    return {
                                        ...msg,
                                        status: "read" as MessageStatus
                                    }
                                }
                                return msg
                            }),
                        }
                        : conv
                )
            )
        })

        // Tratamento de erros
        socket.on("error", (error: { message: string }) => {
            console.error("Erro no Socket.IO:", error.message)
        })

        // Limpeza ao desmontar
        return () => {
            if (currentRoomIdRef.current) {
                socket.emit("chat:leave")
            }
            socket.disconnect()
            socketRef.current = null
            currentRoomIdRef.current = null
            activeConversationIdRef.current = null
        }
        // storeOwnerUserId é obtido dentro do listener do socket e acessado via ref (storeOwnerUserIdRef) para evitar dependências
    }, [tenantId])

    const handleSelectConversation = async (conversationId: string) => {
        const conversation = conversations.find((conv) => conv.id === conversationId)
        if (!conversation || !socketRef.current?.connected) return

        setActiveConversationId(conversationId)
        activeConversationIdRef.current = conversationId

        // Sair da sala anterior se houver
        if (currentRoomIdRef.current && currentRoomIdRef.current !== conversation.roomId) {
            socketRef.current.emit("chat:leave")
        }

        // Entrar no chat da conversa selecionada
        socketRef.current.emit("lojista:join-chat", {
            chatId: conversation.roomId,
        })

        // Atualizar sala atual
        currentRoomIdRef.current = conversation.roomId

        // Marcar mensagens como lidas quando o lojista visualiza o chat
        try {
            await markMessagesAsRead(conversation.roomId)
            console.log("[LOJISTA] Mensagens marcadas como lidas")
            
            // Notificar o cliente via socket que as mensagens foram lidas
            if (socketRef.current?.connected) {
                socketRef.current.emit("chat:messages-read", {
                    chatId: conversation.roomId,
                })
            }
        } catch (error) {
            console.error("[LOJISTA] Erro ao marcar mensagens como lidas:", error)
        }

        setIsTyping(false)
    }

    const handleSendMessage = async () => {
        const trimmed = messageDraft.trim()
        if (!trimmed || !activeConversation || !storeOwnerUserId) return

        const roomId = activeConversation.roomId
        if (!roomId) {
            console.error("RoomId não encontrado na conversa ativa")
            return
        }

        setMessageDraft("")

        // Atualizar roomId atual se necessário
        if (currentRoomIdRef.current !== roomId) {
            currentRoomIdRef.current = roomId
        }

        // Criar ID temporário para a mensagem
        const tempId = `temp-${Date.now()}-${Math.random()}`

        // Adicionar mensagem ao estado IMEDIATAMENTE com status "not_sent"
        const newMessage: ChatMessage = {
            id: tempId,
            author: "agent",
            content: trimmed,
            timestamp: new Date(),
            status: "not_sent",
            userId: storeOwnerUserId
        }

        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === activeConversation.id
                    ? {
                        ...conv,
                        messages: [...conv.messages, newMessage],
                    }
                    : conv
            )
        )

        // Enviar via Socket.IO PRIMEIRO (garantir que sempre envia)
        if (socketRef.current?.connected && activeConversation) {
            console.log("[LOJISTA] Enviando mensagem via socket, roomId:", roomId)
            socketRef.current.emit("chat:send-message", {
                message: trimmed,
            })

            // Atualizar status para "sent" após enviar
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === activeConversation.id
                        ? {
                            ...conv,
                            messages: conv.messages.map((msg) =>
                                msg.id === tempId ? { ...msg, status: "sent" as MessageStatus } : msg
                            ),
                        }
                        : conv
                )
            )
        } else {
            console.error("[LOJISTA] Socket não conectado ou conversa não ativa:", {
                connected: socketRef.current?.connected,
                activeConversation: !!activeConversation
            })
        }

        // Tentar persistir no backend DEPOIS de enviar via socket
        try {
            const persistedMessage = await createMessage(roomId, trimmed)
            console.log("[LOJISTA] Mensagem persistida:", persistedMessage.id)

            // Atualizar mensagem temporária com dados persistidos e status "delivered"
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === activeConversation.id
                        ? {
                            ...conv,
                            messages: conv.messages.map((msg) => {
                                // Atualizar se for a mensagem temporária
                                if (msg.id === tempId) {
                                    console.log("[LOJISTA] Atualizando mensagem temporária com ID persistido:", persistedMessage.id);
                                    return {
                                        ...msg,
                                        id: persistedMessage.id,
                                        timestamp: typeof persistedMessage.createdAt === 'string'
                                            ? new Date(persistedMessage.createdAt)
                                            : persistedMessage.createdAt,
                                        userId: persistedMessage.userId,
                                        status: "delivered" as MessageStatus
                                    }
                                }
                                // Se já foi atualizada com o ID persistido, não fazer nada
                                if (msg.id === persistedMessage.id) {
                                    return msg;
                                }
                                // Se for mensagem própria com mesmo conteúdo e status "sent", atualizar
                                if (msg.userId === storeOwnerUserId &&
                                    msg.content === trimmed &&
                                    msg.status === "sent" &&
                                    !msg.id.startsWith('temp-')) {
                                    // Não atualizar, deixar o listener do socket atualizar
                                    return msg;
                                }
                                return msg
                            }),
                        }
                        : conv
                )
            )
        } catch (error) {
            console.error("Erro ao persistir mensagem no backend:", error)
            // Se falhar a persistência, manter status "sent" (mensagem enviada mas não persistida)
        }
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        handleSendMessage()
    }

    // Componente para exibir ícone de status da mensagem
    const MessageStatusIcon = ({ status }: { status: MessageStatus }) => {
        const getStatusConfig = () => {
            switch (status) {
                case "not_sent":
                    return {
                        icon: AlertCircle,
                        label: "Não enviado",
                        className: "text-red-400"
                    };
                case "sent":
                    return {
                        icon: Check,
                        label: "Enviado",
                        className: "text-muted-foreground"
                    };
                case "delivered":
                    return {
                        icon: CheckCheck,
                        label: "Enviado/Recebido",
                        className: "text-muted-foreground"
                    };
                case "read":
                    return {
                        icon: CheckCheck,
                        label: "Lido",
                        className: "text-blue-400"
                    };
                default:
                    return {
                        icon: Check,
                        label: "Enviado",
                        className: "text-muted-foreground"
                    };
            }
        };

        const config = getStatusConfig();
        const Icon = config.icon;

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-flex items-center">
                            <Icon className={cn("h-3 w-3", config.className)} />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{config.label}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr] h-full">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Conversas</CardTitle>
                    <CardDescription>Clientes aguardando atendimento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {conversations.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground">
                            Nenhuma conversa ainda. As mensagens aparecerão aqui quando chegarem.
                        </p>
                    ) : (
                        conversations.map((conversation) => {
                            const lastMessage = conversation.messages[conversation.messages.length - 1]
                            const preview = lastMessage?.content.slice(0, 70) ?? ""

                            return (
                                <button
                                    key={conversation.id}
                                    type="button"
                                    onClick={() => handleSelectConversation(conversation.id)}
                                    className={`w-full rounded-lg border p-4 text-left transition hover:bg-muted ${activeConversationId === conversation.id
                                        ? "border-primary bg-muted/60"
                                        : "border-transparent bg-card"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-sm">{conversation.customerName}</div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatTimestamp(conversation.lastInteraction)}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                        <Badge variant="secondary" className={channelBadgeStyles[conversation.channel]}>
                                            {conversation.channel}
                                        </Badge>
                                        <Badge variant="secondary" className={statusBadgeStyles[conversation.status]}>
                                            {statusLabels[conversation.status]}
                                        </Badge>
                                        {conversation.priority === "alta" ? (
                                            <Badge variant="destructive">Prioridade alta</Badge>
                                        ) : null}
                                        {conversation.orderRef ? (
                                            <Badge variant="outline">Pedido {conversation.orderRef}</Badge>
                                        ) : null}
                                    </div>
                                    {preview ? (
                                        <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{preview}</p>
                                    ) : null}
                                </button>
                            )
                        }))}
                </CardContent>
            </Card>

            <Card className="flex h-full flex-col">
                {activeConversation ? (
                    <>
                        <CardHeader className="space-y-2 border-b">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <CardTitle>{activeConversation.customerName}</CardTitle>
                                    <CardDescription>
                                        {activeConversation.channel} • Última interação{" "}
                                        {formatTimestamp(activeConversation.lastInteraction)}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col gap-2 text-xs text-right text-muted-foreground">
                                    <span>
                                        Status:{" "}
                                        <span className="font-medium text-foreground">
                                            {statusLabels[activeConversation.status]}
                                        </span>
                                    </span>
                                    {activeConversation.orderRef ? (
                                        <span>
                                            Pedido:{" "}
                                            <span className="font-medium text-foreground">
                                                {activeConversation.orderRef}
                                            </span>
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-4 pt-6">
                            <ScrollArea className="h-[420px] pr-4">
                                <div ref={scrollRef} className="flex flex-col gap-4">
                                    {activeConversation.messages.map((message) => {
                                        const isAgent = message.author === "agent"
                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isAgent ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={cn(
                                                        "max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm",
                                                        isAgent
                                                            ? "bg-lime-200 text-gray-700"
                                                            : "bg-muted text-foreground"
                                                    )}
                                                >
                                                    <p className="whitespace-pre-wrap text-sm">
                                                        {message.content}
                                                    </p>
                                                    <div className="mt-1 flex items-center justify-between gap-2">
                                                        <span
                                                            className={cn(
                                                                "text-[11px]"
                                                            )}
                                                        >
                                                            {isAgent ? "Você" : activeConversation.customerName} •{" "}
                                                            {formatTimestamp(message.timestamp)}
                                                        </span>
                                                        {isAgent && message.status && (
                                                            <MessageStatusIcon status={message.status} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {isTyping ? (
                                        <div className="flex justify-start">
                                            <div className="max-w-[70%] rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-2">
                                                    {activeConversation.customerName} está digitando
                                                    <span className="flex gap-1">
                                                        <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground" />
                                                        <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground delay-150" />
                                                        <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground delay-300" />
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <CardFooter className="border-t bg-muted/20">
                            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
                                <textarea
                                    value={messageDraft}
                                    onChange={(event) => setMessageDraft(event.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            if (messageDraft.trim()) {
                                                handleSendMessage();
                                            }
                                        }
                                    }}
                                    rows={3}
                                    placeholder="Digite aqui sua resposta para o cliente... (Enter para enviar, Shift+Enter para nova linha)"
                                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                <div className="flex justify-between gap-2">
                                    <p className="text-xs text-muted-foreground">
                                        Utilize mensagens claras e confirme qualquer alteração no pedido.
                                    </p>
                                    <Button type="submit" disabled={!messageDraft.trim()}>
                                        Enviar resposta
                                    </Button>
                                </div>
                            </form>
                        </CardFooter>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                        <CardTitle>Selecione uma conversa para começar</CardTitle>
                        <CardDescription>Escolha um cliente na lista para visualizar o histórico.</CardDescription>
                    </div>
                )}
            </Card>
        </div>
    )
}

