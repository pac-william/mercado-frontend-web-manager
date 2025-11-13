import { getCategories } from "@/actions/categories.actions";
import RouterBack from "@/components/RouterBack";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductCreateForm } from "./components/ProductCreateForm";

export default async function CreateProduct({params}: {params: {tenantId: string}}) {
    const { tenantId } = await params;
    const { categories } = await getCategories({ size: 100 });
    
    return (
        <div className="flex flex-col flex-1">
            <ScrollArea className="flex flex-col flex-grow h-0">
                <div className="flex flex-1 flex-col gap-4 container mx-auto my-4 mb-[120px]">
                    <RouterBack />
                    <div className="flex justify-center">
                        <ProductCreateForm tenantId={tenantId} categories={categories} />
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}