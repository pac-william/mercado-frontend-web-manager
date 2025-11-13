import { getCategories } from "@/actions/categories.actions";
import { getProducts } from "@/actions/products.actions";
import MultiSelect from "@/components/MultiSelect";
import RouterBack from "@/components/RouterBack";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import ProductCardAdmin from "./components/ProductCardAdmin";

interface ProductsSearchParams {
    page?: string;
    size?: string;
    name?: string;
    minPrice?: string;
    maxPrice?: string;
    categoryId?: string | string[];
}

export default async function Products({ searchParams, params }: { searchParams: Promise<ProductsSearchParams>, params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    const { categoryId, page, minPrice, maxPrice, name } = await searchParams;
    const categoryFilter = Array.isArray(categoryId) ? categoryId : categoryId ? [categoryId] : undefined;

    const { products } = await getProducts({
        page: Number(page),
        size: Number(100),
        name: name,
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
        marketId: tenantId,
        categoryId: categoryFilter,
    });
    const { categories } = await getCategories({ size: 100 });

    return (
        <ScrollArea className="flex flex-col flex-grow h-0">
            <div className="flex flex-1 flex-col gap-4 pr-4">
                <RouterBack />
                <div className="flex flex-row gap-4 items-center justify-between">
                    <MultiSelect marketId={tenantId} options={categories.map((category) => ({
                        label: category.name,
                        value: category.id,
                    }))} label="Categorias" placeholder="Selecione as categorias" emptyIndicator="Nenhuma categoria encontrada" />
                    <Button asChild>
                        <Link href={`/${tenantId}/products/create`}>
                            Cadastrar Produto
                        </Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 justify-items-center">
                    {products.map((product) => (
                        <ProductCardAdmin
                            key={product.id}
                            product={product}
                            tenantId={tenantId}
                        />
                    ))}
                </div>
            </div>
        </ScrollArea>
    )
}