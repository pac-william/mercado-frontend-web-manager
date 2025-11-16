import { getUserMe } from "@/actions/user.actions";
import { HeaderInfo } from "@/app/components/HeaderInfo";
import RouterBack from "@/components/RouterBack";
import { MarketCreateClient, type MarketCreateInitialData } from "./components/MarketCreateClient";

type CreateMarketPageParams = {
    tenantId: string;
}

type CreateMarketPageProps = {
    params: Promise<CreateMarketPageParams>;
}

export default async function CreateMarketPage({ params }: CreateMarketPageProps) {
    const { tenantId } = await params;
    const currentUser = await getUserMe();

    const initialMarket: MarketCreateInitialData = {
        name: "",
        address: "",
        profilePicture: null,
        ownerId: currentUser.id,
        managersIds: [],
    };

    return (
        <div className="flex flex-col flex-1 h-screen p-6 gap-6 container mx-auto">
            <div className="flex flex-col flex-1 gap-6">
                <RouterBack />
                <HeaderInfo title="Cadastro de Mercado" description="Cadastre um novo mercado para gerenciar seus produtos e pedidos." />
                <MarketCreateClient tenantId={tenantId} initialMarket={initialMarket} />
            </div>
        </div>
    )
}

