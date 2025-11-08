import { getCategories } from "@/actions/categories.actions";
import { getProducts } from "@/actions/products.actions";
import ProductCard from "@/app/components/ProductCard";
import MultiSelect from "@/components/MultiSelect";
import RouterBack from "@/components/RouterBack";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

type ProductsSearchParams = {
    page?: string;
    size?: string;
    name?: string;
    minPrice?: string;
    maxPrice?: string;
    marketId?: string;
    categoryId?: string | string[];
};

export default async function Products({ searchParams = {} }: { searchParams?: ProductsSearchParams }) {
    const rawCategoryFilter = searchParams.categoryId;
    const categoryFilter = Array.isArray(rawCategoryFilter)
        ? rawCategoryFilter
        : rawCategoryFilter
            ? [rawCategoryFilter]
            : undefined;

    const page = searchParams.page ? Number(searchParams.page) : 1;
    const size = searchParams.size ? Number(searchParams.size) : 100;
    const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
    const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;

    const { products } = await getProducts({
        page: Number.isFinite(page) ? page : 1,
        size: Number.isFinite(size) ? size : 100,
        name: searchParams.name,
        minPrice: minPrice !== undefined && Number.isFinite(minPrice) ? minPrice : undefined,
        maxPrice: maxPrice !== undefined && Number.isFinite(maxPrice) ? maxPrice : undefined,
        marketId: searchParams.marketId,
        categoryId: categoryFilter,
    });
    const { categories } = await getCategories({ size: 100 });

    return (
        <ScrollArea className="flex flex-col flex-grow h-0">
            <div className="flex flex-1 flex-col gap-4 pr-4">
                <RouterBack />
                <div className="flex flex-row gap-4 items-center justify-between">
                    <MultiSelect options={categories.map((category) => ({
                        label: category.name,
                        value: category.id,
                    }))} label="Categorias" placeholder="Selecione as categorias" emptyIndicator="Nenhuma categoria encontrada" />
                    <Button asChild>
                        <Link href="/admin/products/create">
                            Cadastrar Produto
                        </Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} variant="admin" />
                    ))}
                </div>
            </div>
        </ScrollArea>
    )
}