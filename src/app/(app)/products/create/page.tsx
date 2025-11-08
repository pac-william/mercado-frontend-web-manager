import { getMarkets } from "@/actions/market.actions";
import ProductCard from "@/app/components/ProductCard";
import RouterBack from "@/components/RouterBack";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductCreateForm } from "./components/ProductCreateForm";

export default async function CreateProduct() {
    const { markets } = await getMarkets();
    return (
        <div className="flex flex-col flex-1">
            <ScrollArea className="flex flex-col flex-grow h-0">
                <div className="flex flex-1 flex-col gap-4 container mx-auto my-4 mb-[120px]    ">
                    <RouterBack />
                    <h1 className="text-2xl font-bold">Cadastro de Produto</h1>
                    <div className="grid grid-cols-2 gap-4">
                        <ProductCreateForm markets={markets} />
                        <ProductCard product={{ name: "Produto 1", price: 100, marketId: "1", id: "1", unit: "kg" }} />
                    </div>

                </div>
            </ScrollArea>
        </div>
    )
}