import { getMarketById } from "@/actions/market.actions"

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
        const marketAny = market as typeof market & {
            addressData?: {
                id: string
                userId: string | null
                marketId: string | null
                name: string
                street: string
                number: string
                complement: string | null
                neighborhood: string
                city: string
                state: string
                zipCode: string
                isFavorite: boolean
                isActive: boolean
                latitude: number | null
                longitude: number | null
                createdAt: string
                updatedAt: string
            }
            addressId?: string | null
        }
        
        initialMarket = {
            name: market.name,
            profilePicture: market.profilePicture,
            isActive: true,
            ownerId: market.ownerId,
            managersIds: market.managersIds,
            addressId: marketAny.addressId || null,
            address: marketAny.addressData ? {
                name: marketAny.addressData.name,
                street: marketAny.addressData.street,
                number: marketAny.addressData.number,
                complement: marketAny.addressData.complement || undefined,
                neighborhood: marketAny.addressData.neighborhood,
                city: marketAny.addressData.city,
                state: marketAny.addressData.state,
                zipCode: marketAny.addressData.zipCode,
                isFavorite: marketAny.addressData.isFavorite || false,
                isActive: marketAny.addressData.isActive ?? true,
                latitude: marketAny.addressData.latitude || undefined,
                longitude: marketAny.addressData.longitude || undefined,
            } : null,
        }
    } catch {
        // Ignorar erro
    }

    return (
        <div className="flex flex-1 flex-col">
            <ScrollArea className="flex flex-grow flex-col h-0 overflow-y-auto">
                <div className="flex flex-col gap-6">
                    <HeaderInfo title="Configurações do Mercado" description="Gerencie as informações gerais e a identidade visual do seu mercado." />
                    <MarketSettingsClient tenantId={tenantId} initialMarket={initialMarket} />
                </div>
            </ScrollArea >
        </div >
    )
}

