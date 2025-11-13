import { HeaderInfo } from "@/app/components/HeaderInfo"
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
            <HeaderInfo title="Atendimento ao Cliente" description={`Monitore conversas e responda clientes em tempo real. Todas as interações do mercado <span className="font-semibold">${tenantId}</span> ficam centralizadas aqui.`} />
            <div className="flex justify-center">
                <SupportChat />
            </div>
        </section >
    )
}

