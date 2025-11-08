import { getProducts } from "@/actions/products.actions";
import ProductCard from "@/app/components/ProductCard";
import RouterBack from "@/components/RouterBack";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default async function Products() {
    const { products } = await getProducts({ page: 1, size: 100 });
    return (
        <div className="flex flex-col flex-1">
            <ScrollArea className="flex flex-col flex-grow h-0">
                <div className="flex flex-1 flex-col gap-4 container mx-auto my-4 mb-[120px]    ">
                    <RouterBack />
                    <div className="flex flex-row gap-4 items-center justify-between">
                        <h1 className="text-2xl font-bold">Produtos</h1>
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
        </div>
    )
}