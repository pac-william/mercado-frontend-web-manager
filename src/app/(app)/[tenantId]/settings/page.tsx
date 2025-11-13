import { getMarketById } from "@/actions/market.actions"

import { HeaderInfo } from "@/app/components/HeaderInfo"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarketSettingsClient, type MarketSettingsInitialData } from "./components/MarketSettingsClient"
import { PaymentMethodsSettings } from "./components/PaymentMethodsSettings"

type SettingsPageParams = {
    tenantId: string
}

type SettingsPageProps = {
    params: Promise<SettingsPageParams>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
    const { tenantId } = await params

    let initialMarket: MarketSettingsInitialData = {
        name: "",
        address: "",
        profilePicture: null,
        isActive: true,
        ownerId: null,
        managersIds: [],
    }

    try {
        const market = await getMarketById(tenantId)
        initialMarket = {
            name: market.name,
            address: market.address,
            profilePicture: market.profilePicture,
            isActive: true,
            ownerId: market.ownerId,
            managersIds: market.managersIds,
        }
    } catch (error) {
        console.error("Erro ao buscar mercado:", error)
    }

    return (
        <div className="flex flex-1 flex-col">
            <ScrollArea className="flex flex-grow flex-col h-0 overflow-y-auto">
                <div className="flex flex-col gap-6">
                    <HeaderInfo title="Configurações do Mercado" description="Gerencie as informações gerais e a identidade visual do seu mercado." />
                    <MarketSettingsClient tenantId={tenantId} initialMarket={initialMarket} />
                    <HeaderInfo title="Métodos de pagamento" description="Ative e configure os meios aceitos pelo mercado. Essas definições refletem nos canais App e Web e ajudam o financeiro a conciliar os repasses corretamente." />
                    <PaymentMethodsSettings tenantId={tenantId} />
                </div>
            </ScrollArea >
        </div >
    )
}

