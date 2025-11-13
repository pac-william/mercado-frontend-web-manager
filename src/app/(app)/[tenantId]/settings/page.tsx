import { getMarketById } from "@/actions/market.actions"

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
        <MarketSettingsClient tenantId={tenantId} initialMarket={initialMarket} />
    )
}

