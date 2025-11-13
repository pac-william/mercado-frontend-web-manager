"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

type PaymentMethodsSettingsProps = {
    tenantId: string
}

type PaymentConfig = {
    settlementFrequency: "daily" | "weekly" | "monthly"
    settlementDay: "monday" | "tuesday" | "wednesday" | "thursday" | "friday"
    notifyFinanceEmail: string
    card: {
        enabled: boolean
        acquirer: "stone" | "cielo" | "pagarme" | "mercadopago"
        feePercent: number
        captureMode: "auto" | "manual"
    }
    pix: {
        enabled: boolean
        provider: "gerencia-net" | "mercadopago" | "itau"
        dynamicQr: boolean
        reconciliationEmail: string
    }
    cash: {
        enabled: boolean
        drawerResponsible: string
        changeLimit: number
    }
}

const initialConfig: PaymentConfig = {
    settlementFrequency: "weekly",
    settlementDay: "tuesday",
    notifyFinanceEmail: "financeiro@mercadolocal.com",
    card: {
        enabled: true,
        acquirer: "stone",
        feePercent: 3.19,
        captureMode: "auto",
    },
    pix: {
        enabled: true,
        provider: "mercadopago",
        dynamicQr: true,
        reconciliationEmail: "financeiro+pix@mercadolocal.com",
    },
    cash: {
        enabled: false,
        drawerResponsible: "Caixa 01",
        changeLimit: 200,
    },
}

export function PaymentMethodsSettings({ tenantId }: PaymentMethodsSettingsProps) {
    const [config, setConfig] = useState<PaymentConfig>(initialConfig)
    const [isSaving, setIsSaving] = useState(false)
    const settlementFrequencyLabel = useMemo(
        () =>
            ({
                daily: "Repasse diário",
                weekly: "Repasse semanal",
                monthly: "Repasse mensal",
            })[config.settlementFrequency],
        [config.settlementFrequency]
    )

    const handleSave = () => {
        setIsSaving(true)
        setTimeout(() => {
            setIsSaving(false)
            toast.success("Configurações de pagamento salvas com sucesso!", {
                description: `Repasse ${settlementFrequencyLabel?.toLowerCase()} e métodos atualizados para o mercado ${tenantId}.`,
            })
        }, 800)
    }

    const handleReset = () => {
        setConfig(initialConfig)
        toast.info("Valores redefinidos para o padrão sugerido.")
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Repasses e notificações</CardTitle>
                    <CardDescription>Cadastre como o financeiro recebe os valores e alertas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Frequência de repasse</Label>
                        <Select
                            value={config.settlementFrequency}
                            onValueChange={(value: PaymentConfig["settlementFrequency"]) =>
                                setConfig((prev) => ({ ...prev, settlementFrequency: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Diário</SelectItem>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="monthly">Mensal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {config.settlementFrequency !== "daily" ? (
                        <div className="space-y-2">
                            <Label>Dia do repasse</Label>
                            <Select
                                value={config.settlementDay}
                                onValueChange={(value: PaymentConfig["settlementDay"]) =>
                                    setConfig((prev) => ({ ...prev, settlementDay: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monday">Segunda-feira</SelectItem>
                                    <SelectItem value="tuesday">Terça-feira</SelectItem>
                                    <SelectItem value="wednesday">Quarta-feira</SelectItem>
                                    <SelectItem value="thursday">Quinta-feira</SelectItem>
                                    <SelectItem value="friday">Sexta-feira</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ) : null}

                    <div className="space-y-2">
                        <Label>Email de notificações financeiras</Label>
                        <Input
                            type="email"
                            value={config.notifyFinanceEmail}
                            placeholder="financeiro@mercado.com"
                            onChange={(event) =>
                                setConfig((prev) => ({ ...prev, notifyFinanceEmail: event.target.value }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Cartão (crédito/débito)</CardTitle>
                    <CardDescription>Vendas via App e site repassadas pelo adquirente escolhido.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Aceitar pagamentos com cartão</p>
                            <p className="text-xs text-muted-foreground">
                                Quando desativado, os clientes não verão a opção de cartão no checkout.
                            </p>
                        </div>
                        <Switch
                            checked={config.card.enabled}
                            onCheckedChange={(checked) =>
                                setConfig((prev) => ({
                                    ...prev,
                                    card: { ...prev.card, enabled: checked },
                                }))
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Adquirente</Label>
                        <Select
                            value={config.card.acquirer}
                            onValueChange={(value: PaymentConfig["card"]["acquirer"]) =>
                                setConfig((prev) => ({
                                    ...prev,
                                    card: { ...prev.card, acquirer: value },
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="stone">Stone</SelectItem>
                                <SelectItem value="cielo">Cielo</SelectItem>
                                <SelectItem value="pagarme">Pagar.me</SelectItem>
                                <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Taxa (%)</Label>
                            <Input
                                type="number"
                                min={0}
                                step={0.01}
                                value={config.card.feePercent}
                                onChange={(event) =>
                                    setConfig((prev) => ({
                                        ...prev,
                                        card: { ...prev.card, feePercent: Number(event.target.value) },
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Captura</Label>
                            <Select
                                value={config.card.captureMode}
                                onValueChange={(value: PaymentConfig["card"]["captureMode"]) =>
                                    setConfig((prev) => ({
                                        ...prev,
                                        card: { ...prev.card, captureMode: value },
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">Automática</SelectItem>
                                    <SelectItem value="manual">Manual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pix</CardTitle>
                    <CardDescription>Receba por QR Code dinâmico ou chave cadastrada.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Habilitar Pix</p>
                            <p className="text-xs text-muted-foreground">
                                Clientes verão o QR Code dinâmico no checkout. A confirmação é em até 30 segundos.
                            </p>
                        </div>
                        <Switch
                            checked={config.pix.enabled}
                            onCheckedChange={(checked) =>
                                setConfig((prev) => ({
                                    ...prev,
                                    pix: { ...prev.pix, enabled: checked },
                                }))
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Provedor Pix</Label>
                        <Select
                            value={config.pix.provider}
                            onValueChange={(value: PaymentConfig["pix"]["provider"]) =>
                                setConfig((prev) => ({
                                    ...prev,
                                    pix: { ...prev.pix, provider: value },
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                                <SelectItem value="gerencia-net">Gerencianet</SelectItem>
                                <SelectItem value="itau">Itaú Shopline</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Usar QR dinâmico</p>
                            <p className="text-xs text-muted-foreground">
                                Um QR único é gerado para cada pedido, facilitando a conciliação.
                            </p>
                        </div>
                        <Switch
                            checked={config.pix.dynamicQr}
                            onCheckedChange={(checked) =>
                                setConfig((prev) => ({
                                    ...prev,
                                    pix: { ...prev.pix, dynamicQr: checked },
                                }))
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Email para conciliação</Label>
                        <Input
                            type="email"
                            value={config.pix.reconciliationEmail}
                            onChange={(event) =>
                                setConfig((prev) => ({
                                    ...prev,
                                    pix: { ...prev.pix, reconciliationEmail: event.target.value },
                                }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Dinheiro na entrega</CardTitle>
                    <CardDescription>Controle o troco e responsáveis por cada turno.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Aceitar dinheiro</p>
                            <p className="text-xs text-muted-foreground">
                                O cliente informa o valor do pagamento e o sistema já calcula o troco necessário.
                            </p>
                        </div>
                        <Switch
                            checked={config.cash.enabled}
                            onCheckedChange={(checked) =>
                                setConfig((prev) => ({
                                    ...prev,
                                    cash: { ...prev.cash, enabled: checked },
                                }))
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Responsável pelo caixa/troco</Label>
                        <Input
                            value={config.cash.drawerResponsible}
                            onChange={(event) =>
                                setConfig((prev) => ({
                                    ...prev,
                                    cash: { ...prev.cash, drawerResponsible: event.target.value },
                                }))
                            }
                            placeholder="Nome do colaborador"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Limite de troco disponível (R$)</Label>
                        <Input
                            type="number"
                            min={0}
                            step={10}
                            value={config.cash.changeLimit}
                            onChange={(event) =>
                                setConfig((prev) => ({
                                    ...prev,
                                    cash: { ...prev.cash, changeLimit: Number(event.target.value) },
                                }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>


            <Card>
                <CardHeader>
                    <CardTitle>Observações</CardTitle>
                    <CardDescription>
                        Documente acordos com adquirentes ou instruções específicas para o time financeiro.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="notes">Notas internas</Label>
                    <textarea
                        id="notes"
                        rows={4}
                        className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                        placeholder="Ex.: repasses das maquininhas caem na conta 1234-5 (Banco XPTO). Conferir taxa promocional válida até setembro/24."
                    />
                    <p className="text-xs text-muted-foreground">
                        Apenas administradores visualizam estas notas. Em breve será possível anexar contratos e
                        documentos.
                    </p>
                </CardContent>
                <CardFooter className="flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                        Restaurar padrão
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Salvando..." : "Salvar configurações"}
                    </Button>
                </CardFooter>
            </Card>
        </>

    )
}

