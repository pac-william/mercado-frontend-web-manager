"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

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
    customerName: string
    channel: "App" | "WhatsApp" | "Site"
    status: ConversationStatus
    priority: "normal" | "alta"
    lastInteraction: Date
    orderRef?: string
    messages: ChatMessage[]
}

const mockConversations: Conversation[] = [
    {
        id: "1",
        customerName: "Mariana Lopes",
        channel: "App",
        status: "open",
        priority: "alta",
        lastInteraction: new Date(Date.now() - 1000 * 60 * 3),
        orderRef: "#98234",
        messages: [
            {
                id: "1",
                author: "client",
                content: "Olá! O entregador está vindo? O pedido está marcado como em entrega desde às 12h45.",
                timestamp: new Date(Date.now() - 1000 * 60 * 18),
            },
            {
                id: "2",
                author: "agent",
                content: "Oi, Mariana! Verificando aqui… vejo que o parceiro saiu há 15 minutos. Vou confirmar com ele e já retorno, tudo bem?",
                timestamp: new Date(Date.now() - 1000 * 60 * 14),
            },
            {
                id: "3",
                author: "client",
                content: "Perfeito, obrigada! Meu telefone está disponível caso precise falar comigo.",
                timestamp: new Date(Date.now() - 1000 * 60 * 3),
            },
        ],
    },
    {
        id: "2",
        customerName: "Carlos Ferreira",
        channel: "WhatsApp",
        status: "waiting",
        priority: "normal",
        lastInteraction: new Date(Date.now() - 1000 * 60 * 55),
        orderRef: "#98190",
        messages: [
            {
                id: "1",
                author: "client",
                content: "Boa tarde! É possível trocar o suco de laranja por refrigerante no pedido?",
                timestamp: new Date(Date.now() - 1000 * 60 * 70),
            },
            {
                id: "2",
                author: "agent",
                content: "Olá, Carlos! Consegui checar com o mercado. A troca foi feita e atualizamos o valor da compra, ok?",
                timestamp: new Date(Date.now() - 1000 * 60 * 62),
            },
            {
                id: "3",
                author: "client",
                content: "Tudo certo. Obrigado pela agilidade!",
                timestamp: new Date(Date.now() - 1000 * 60 * 55),
            },
        ],
    },
    {
        id: "3",
        customerName: "Julia Andrade",
        channel: "Site",
        status: "resolved",
        priority: "normal",
        lastInteraction: new Date(Date.now() - 1000 * 60 * 110),
        messages: [
            {
                id: "1",
                author: "client",
                content: "Meu pagamento não foi aprovado, vocês podem me orientar?",
                timestamp: new Date(Date.now() - 1000 * 60 * 150),
            },
            {
                id: "2",
                author: "agent",
                content: "Oi, Julia! Identificamos que o cartão estava sem saldo. Queres tentar outro método ou boleto?",
                timestamp: new Date(Date.now() - 1000 * 60 * 140),
            },
            {
                id: "3",
                author: "client",
                content: "Consegui pagar com outro cartão. Obrigada!",
                timestamp: new Date(Date.now() - 1000 * 60 * 110),
            },
        ],
    },
]

const autoReplies = [
    "Obrigada pelo retorno! O entregador deve chegar em até 10 minutos ✔️",
    "Claro! Já atualizamos isso pra você 🙂",
    "Estamos acompanhando com a loja e te aviso assim que tiver novidade.",
    "Recebi! Caso precise de algo adicional é só chamar.",
]

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

export function SupportChat() {
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
    const [activeConversationId, setActiveConversationId] = useState<string>(mockConversations[0].id)
    const [messageDraft, setMessageDraft] = useState("")
    const [isTyping, setIsTyping] = useState(false)

    const scrollRef = useRef<HTMLDivElement>(null)

    const activeConversation = useMemo(
        () => conversations.find((conversation) => conversation.id === activeConversationId),
        [conversations, activeConversationId]
    )

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [activeConversation?.messages.length, isTyping])

    const handleSelectConversation = (conversationId: string) => {
        setActiveConversationId(conversationId)
        setIsTyping(false)
    }

    const handleSendMessage = () => {
        const trimmed = messageDraft.trim()
        if (!trimmed || !activeConversation) return

        const newMessage: ChatMessage = {
            id: crypto.randomUUID(),
            author: "agent",
            content: trimmed,
            timestamp: new Date(),
        }

        setMessageDraft("")
        setConversations((prev) =>
            prev.map((conversation) =>
                conversation.id === activeConversation.id
                    ? {
                          ...conversation,
                          messages: [...conversation.messages, newMessage],
                          status: conversation.status === "resolved" ? "open" : conversation.status,
                          lastInteraction: newMessage.timestamp,
                      }
                    : conversation
            )
        )

        setIsTyping(true)

        const autoReply = autoReplies[Math.floor(Math.random() * autoReplies.length)]
        setTimeout(() => {
            setConversations((prev) =>
                prev.map((conversation) =>
                    conversation.id === activeConversation.id
                        ? {
                              ...conversation,
                              messages: [
                                  ...conversation.messages,
                                  newMessage,
                                  {
                                      id: crypto.randomUUID(),
                                      author: "client",
                                      content: autoReply,
                                      timestamp: new Date(),
                                  },
                              ],
                              lastInteraction: new Date(),
                          }
                        : conversation
                )
            )
            setIsTyping(false)
        }, 1500)
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        handleSendMessage()
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Conversas</CardTitle>
                    <CardDescription>Clientes aguardando atendimento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {conversations.map((conversation) => {
                        const lastMessage = conversation.messages[conversation.messages.length - 1]
                        const preview = lastMessage?.content.slice(0, 70) ?? ""

                        return (
                            <button
                                key={conversation.id}
                                type="button"
                                onClick={() => handleSelectConversation(conversation.id)}
                                className={`w-full rounded-lg border p-4 text-left transition hover:bg-muted ${
                                    activeConversationId === conversation.id
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
                    })}
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
                            <Separator />
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
                                                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                                                        isAgent
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted text-muted-foreground"
                                                    }`}
                                                >
                                                    <p className="whitespace-pre-wrap text-sm text-foreground/95 dark:text-foreground">
                                                        {message.content}
                                                    </p>
                                                    <span
                                                        className={`mt-1 block text-[11px] ${
                                                            isAgent
                                                                ? "text-primary-foreground/70"
                                                                : "text-muted-foreground/70"
                                                        }`}
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
                                    rows={3}
                                    placeholder="Digite aqui sua resposta para o cliente..."
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

