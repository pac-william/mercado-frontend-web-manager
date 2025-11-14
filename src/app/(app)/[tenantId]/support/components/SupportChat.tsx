"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

import { createMessage, getChatByChatId, getStoreOwnerConversations } from "@/actions/chat.actions"
import { getUserMe } from "@/actions/user.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type MessageAuthor = "client" | "agent"

type ChatMessage = {
    id: string
    author: MessageAuthor
    content: string
    timestamp: Date
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
                            
                            const conversationMessages: ChatMessage[] = chatWithMessages.messages.map((msg) => ({
                                id: msg.id,
                                author: msg.userId === customerUserId ? "client" : "agent",
                                content: msg.message,
                                timestamp: typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : msg.createdAt,
                            }));
                            
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
                    const conversationMessages: ChatMessage[] = chatWithMessages.messages.map((msg) => ({
                        id: msg.id,
                        author: msg.userId === customerUserId ? "client" : "agent",
                        content: msg.message,
                        timestamp: typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : msg.createdAt,
                    }))

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
            console.log("Nova mensagem recebida:", message)

            // Buscar informações do chat do backend para determinar corretamente o autor
            try {
                const chatWithMessages = await getChatByChatId(message.chat);
                if (chatWithMessages) {
                    const customerUserId = chatWithMessages.userId;
                    
                    // Buscar a mensagem recém-criada do backend para obter o userId correto
                    // Como a mensagem foi recém-criada, ela deve estar no final da lista
                    const latestMessage = chatWithMessages.messages[chatWithMessages.messages.length - 1];
                    const isAgent = latestMessage && latestMessage.userId !== customerUserId;
                    
                    // Encontrar conversa pelo chatId
                    setConversations((prev) => {
                        const existingConversation = prev.find((conv) => conv.roomId === message.chat)

                        if (existingConversation) {
                            // Verificar se a mensagem já existe (evitar duplicação)
                            const messageExists = existingConversation.messages.some(
                                (msg) => msg.id === message.id
                            )

                            if (messageExists) {
                                return prev
                            }

                            // Adicionar mensagem à conversa existente com autor correto
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
                                            },
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
                                    },
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
                setConversations((prev) => {
                    const existingConversation = prev.find((conv) => conv.roomId === message.chat)
                    if (existingConversation) {
                        const messageExists = existingConversation.messages.some(
                            (msg) => msg.id === message.id
                        )
                        if (messageExists) {
                            return prev
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
                                        },
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
    }, [tenantId])

    const handleSelectConversation = (conversationId: string) => {
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

        setIsTyping(false)
    }

    const handleSendMessage = async () => {
        const trimmed = messageDraft.trim()
        if (!trimmed || !activeConversation) return

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

        // Enviar mensagem através do Socket.IO (tempo real)
        if (socketRef.current?.connected && activeConversation) {
            console.log("[LOJISTA] Enviando mensagem via socket, roomId:", roomId);
            console.log("[LOJISTA] Current roomId ref:", currentRoomIdRef.current);
            socketRef.current.emit("chat:send-message", {
                message: trimmed,
            })
        } else {
            console.error("[LOJISTA] Socket não conectado ou conversa não ativa:", {
                connected: socketRef.current?.connected,
                activeConversation: !!activeConversation
            });
        }

        // Persistir no backend usando o roomId da conversa
        try {
            await createMessage(roomId, trimmed)
        } catch (error) {
            console.error("Erro ao persistir mensagem no backend:", error)
            // Não bloqueia o envio mesmo se falhar a persistência
        }

        // Não adicionar localmente - a mensagem será recebida do servidor via chat:message-received
        // Isso evita duplicação e garante que temos o ID correto do servidor
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        handleSendMessage()
    }

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
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted text-foreground"
                                                    )}
                                                >
                                                    <p className="whitespace-pre-wrap text-sm">
                                                        {message.content}
                                                    </p>
                                                    <span
                                                        className={cn(
                                                            "mt-1 block text-[11px]",
                                                            isAgent
                                                                ? "text-primary-foreground/70"
                                                                : "text-muted-foreground"
                                                        )}
                                                    >
                                                        {isAgent ? "Você" : activeConversation.customerName} •{" "}
                                                        {formatTimestamp(message.timestamp)}
                                                    </span>
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

