import { getMarketById } from "@/actions/market.actions"
import { getMarketAddressByMarketId } from "@/actions/marketAddress.actions"

import { HeaderInfo } from "@/app/components/HeaderInfo"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarketSettingsClient, type MarketSettingsInitialData } from "./components/MarketSettingsClient"

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
        profilePicture: null,
        isActive: true,
        ownerId: null,
        managersIds: [],
        addressId: null,
        address: null,
    }

    try {
        const market = await getMarketById(tenantId)
        const marketAddress = await getMarketAddressByMarketId(tenantId)
        
        initialMarket = {
            name: market.name,
            profilePicture: market.profilePicture,
            isActive: true,
            ownerId: market.ownerId,
            managersIds: market.managersIds,
            addressId: marketAddress?.id || null,
            address: marketAddress ? {
                name: marketAddress.name,
                street: marketAddress.street,
                number: marketAddress.number,
                complement: marketAddress.complement || undefined,
                neighborhood: marketAddress.neighborhood,
                city: marketAddress.city,
                state: marketAddress.state,
                zipCode: marketAddress.zipCode,
                isFavorite: false,
                isActive: true,
                latitude: marketAddress.latitude || undefined,
                longitude: marketAddress.longitude || undefined,
            } : null,
        }
    } catch {
        // Ignorar erro
    }

    return (
        <div className="flex flex-1 flex-col">
            <ScrollArea className="flex flex-grow flex-col h-0 pr-4">
                <div className="flex flex-col flex-1 gap-6">
                    <HeaderInfo title="Configurações do Mercado" description="Gerencie as informações gerais e a identidade visual do seu mercado." />
                    <MarketSettingsClient tenantId={tenantId} initialMarket={initialMarket} />
                </div>
            </ScrollArea >
        </div >
    )
}

