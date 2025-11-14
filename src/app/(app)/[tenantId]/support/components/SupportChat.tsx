"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

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
    roomId: string
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
    room: string
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

const MESSAGING_SERVER_URL = "http://localhost:4000"

type SupportChatProps = {
    tenantId: string
}

export function SupportChat({ tenantId }: SupportChatProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
    const [messageDraft, setMessageDraft] = useState("")
    const [isTyping, setIsTyping] = useState(false)

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
        socket.on("lojista:registered", (data) => {
            console.log("Lojista registrado:", data)
            // Listar conversas existentes
            socket.emit("lojista:conversas")
        })

        // Receber lista de conversas
        socket.on("lojista:conversas", (conversas: ServerConversa[]) => {
            console.log("Conversas recebidas:", conversas)

            const newConversations: Conversation[] = conversas.map((conv) => ({
                id: conv.roomId,
                roomId: conv.roomId,
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
                    // Entrar na sala da primeira conversa
                    if (socket.connected && firstConv.roomId) {
                        socket.emit("lojista:join-room", {
                            roomId: firstConv.roomId,
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

        // Notificação quando cliente entra no chat
        socket.on("chat:cliente-entered", (data) => {
            console.log("Cliente entrou no chat:", data)

            // Verificar se a conversa já existe
            setConversations((prev) => {
                const existing = prev.find((conv) => conv.roomId === data.roomId)

                if (existing) {
                    return prev.map((conv) =>
                        conv.roomId === data.roomId
                            ? { ...conv, isActive: true, status: "open" }
                            : conv
                    )
                } else {
                    // Criar nova conversa
                    const newConversation: Conversation = {
                        id: data.roomId,
                        roomId: data.roomId,
                        clienteId: data.clienteId,
                        customerName: data.clienteUsername,
                        channel: "Site",
                        status: "open",
                        priority: "normal",
                        lastInteraction: new Date(),
                        messages: [],
                        isActive: true,
                    }
                    
                    // Se não há conversa ativa, selecionar e entrar na nova
                    const shouldAutoSelect = !activeConversationIdRef.current || prev.length === 0
                    
                    if (shouldAutoSelect && socket.connected) {
                        // Entrar na sala da nova conversa
                        socket.emit("lojista:join-room", {
                            roomId: data.roomId,
                        })
                        currentRoomIdRef.current = data.roomId
                        activeConversationIdRef.current = data.roomId
                        setActiveConversationId(data.roomId)
                    }
                    
                    return [newConversation, ...prev]
                }
            })
        })

        // Receber histórico de mensagens ao entrar em uma sala
        socket.on("chat:messages", (messages: ServerMessage[]) => {
            console.log("Histórico de mensagens recebido:", messages)

            if (!messages || messages.length === 0) return

            const roomId = messages[0]?.room
            if (!roomId) return

            // Atualizar mensagens da conversa correspondente
            setConversations((prev) =>
                prev.map((conv) => {
                    if (conv.roomId === roomId) {
                        const conversationMessages: ChatMessage[] = messages.map((msg) => ({
                            id: msg.id,
                            author: msg.username === "Atendente" ? "agent" : "client",
                            content: msg.message,
                            timestamp: new Date(msg.timestamp),
                        }))

                        // Ordenar por timestamp
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
        })

        // Receber novas mensagens em tempo real
        socket.on("chat:message-received", (message: ServerMessage) => {
            console.log("Nova mensagem recebida:", message)

            // Encontrar conversa pelo roomId
            setConversations((prev) => {
                const existingConversation = prev.find((conv) => conv.roomId === message.room)

                if (existingConversation) {
                    // Verificar se a mensagem já existe (evitar duplicação)
                    const messageExists = existingConversation.messages.some(
                        (msg) => msg.id === message.id
                    )

                    if (messageExists) {
                        return prev
                    }

                    // Adicionar mensagem à conversa existente
                    return prev.map((conv) =>
                        conv.roomId === message.room
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
                } else {
                    // Criar nova conversa (caso não tenha sido criada antes)
                    const newConversation: Conversation = {
                        id: message.room,
                        roomId: message.room,
                        clienteId: "", // Será preenchido quando receber dados completos
                        customerName: message.username,
                        channel: "Site",
                        status: "open",
                        priority: "normal",
                        lastInteraction: new Date(message.timestamp),
                        messages: [
                            {
                                id: message.id,
                                author: "client",
                                content: message.message,
                                timestamp: new Date(message.timestamp),
                            },
                        ],
                        isActive: true,
                    }
                    return [newConversation, ...prev]
                }
            })
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

        // Entrar na sala da conversa selecionada
        socketRef.current.emit("lojista:join-room", {
            roomId: conversation.roomId,
        })

        // Atualizar sala atual
        currentRoomIdRef.current = conversation.roomId

        setIsTyping(false)
    }

    const handleSendMessage = () => {
        const trimmed = messageDraft.trim()
        if (!trimmed || !activeConversation) return

        setMessageDraft("")

        // Enviar mensagem através do Socket.IO
        if (socketRef.current?.connected && activeConversation) {
            // Atualizar roomId atual se necessário
            if (currentRoomIdRef.current !== activeConversation.roomId) {
                currentRoomIdRef.current = activeConversation.roomId
            }

            socketRef.current.emit("chat:send-message", {
                message: trimmed,
            })
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

