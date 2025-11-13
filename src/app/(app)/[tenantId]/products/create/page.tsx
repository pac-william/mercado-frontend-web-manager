import { getCategories } from "@/actions/categories.actions";
import { HeaderInfo } from "@/app/components/HeaderInfo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductCreateForm } from "./components/ProductCreateForm";

interface CreateProductProps {
    params: Promise<{ tenantId: string }>;
    searchParams: Promise<{ productId?: string }>;
}

export default async function CreateProduct({ params, searchParams }: CreateProductProps) {
    const { tenantId } = await params;
    const { productId } = await searchParams;
    const { categories } = await getCategories({ size: 100 });

    return (
        <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto pr-4">
            <div className="flex flex-1 flex-col gap-4">
                <HeaderInfo title="Cadastro de Produto" description="Cadastre um novo produto para o seu mercado" />
                <ProductCreateForm tenantId={tenantId} categories={categories} productId={productId} />
            </div>
        </ScrollArea>
    )
}