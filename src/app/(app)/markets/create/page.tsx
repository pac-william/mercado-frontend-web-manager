import { getUserMe } from "@/actions/user.actions";
import { HeaderInfo } from "@/app/components/HeaderInfo";
import RouterBack from "@/components/RouterBack";
import { MarketCreateClient, type MarketCreateInitialData } from "./components/MarketCreateClient";

export default async function CreateMarketPage() {
    const currentUser = await getUserMe();

    const initialMarket: MarketCreateInitialData = {
        name: "",
        profilePicture: null,
        ownerId: currentUser.id,
        managersIds: [],
        address: null,
    };

    return (
        <div className="flex flex-col flex-1 h-screen p-6 gap-6 container mx-auto">
            <div className="flex flex-col flex-1 gap-6">
                <RouterBack />
                <HeaderInfo title="Cadastro de Mercado" description="Cadastre um novo mercado para gerenciar seus produtos e pedidos." />
                <MarketCreateClient initialMarket={initialMarket} />
            </div>
        </div>
    )
}

