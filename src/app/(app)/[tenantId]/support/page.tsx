import { SupportChat } from "./components/SupportChat"

type SupportPageParams = {
    tenantId: string
}

type SupportPageProps = {
    params: Promise<SupportPageParams>
}

export default async function SupportPage({ params }: SupportPageProps) {
    const { tenantId } = await params

    return (
        <section className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Atendimento ao Cliente</h1>
                <p className="text-muted-foreground">
                    Monitore conversas e responda clientes em tempo real. Todas as interações do mercado <span className="font-semibold">{tenantId}</span> ficam centralizadas aqui.
                </p>
            </header>

            <SupportChat />
        </section>
    )
}

