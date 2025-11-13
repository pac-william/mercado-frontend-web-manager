import { getCategories } from "@/actions/categories.actions";
import { getProducts } from "@/actions/products.actions";
import MultiSelect from "@/components/MultiSelect";
import RouterBack from "@/components/RouterBack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPrice } from "@/app/utils/formatters";
import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";

interface ProductsSearchParams {
    page?: string;
    size?: string;
    name?: string;
    minPrice?: string;
    maxPrice?: string;
    categoryId?: string | string[];
}

export default async function Products({ searchParams, params }: { searchParams: Promise<ProductsSearchParams>, params: { tenantId: string } }) {
    const { tenantId } = await params;
    const { categoryId, page, size, minPrice, maxPrice, name } = await searchParams;
    const categoryFilter = Array.isArray(categoryId) ? categoryId : categoryId ? [categoryId] : undefined;

    const { products } = await getProducts({
        page: Number(page),
        size: Number(size),
        name: name,
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
        marketId: tenantId,
        categoryId: categoryFilter,
    });
    const { categories } = await getCategories({ size: 100 });

    const getImageSrc = (image?: string | null) => {
        if (image && image.startsWith('http')) {
            return image;
        }
        return "https://ibassets.com.br/ib.item.image.medium/m-20161111154302022002734292c24125421585da814b5db62401.jpg";
    };

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
                    {products.map((product) => (
                        <Card key={product.id} className="flex flex-col w-full max-w-xs">
                            <CardHeader>
                                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 relative w-full aspect-square">
                                <Image 
                                    src={getImageSrc(product.image)} 
                                    alt={product.name} 
                                    fill 
                                    className="object-cover p-4" 
                                />
                            </CardContent>
                            <CardContent className="flex flex-col gap-2">
                                <div className="flex flex-row items-center justify-between">
                                    <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        className="h-8 w-8"
                                    >
                                        <Link href={`/${tenantId}/products/create?productId=${product.id}`}>
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                                {product.sku && (
                                    <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </ScrollArea>
    )
}