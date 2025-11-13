"use client";

import { deleteProduct, partialUpdateProduct } from "@/actions/products.actions";
import { Product } from "@/app/domain/productDomain";
import { formatPrice } from "@/app/utils/formatters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardAdminProps {
    product: Product;
    tenantId: string;
}

export default function ProductCardAdmin({ product, tenantId }: ProductCardAdminProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isActive, setIsActive] = useState(product.isActive ?? true);
    const [isToggling, setIsToggling] = useState(false);

    const getImageSrc = (image?: string | null) => {
        if (image && image.startsWith('http')) {
            return image;
        }
        return "https://ibassets.com.br/ib.item.image.medium/m-20161111154302022002734292c24125421585da814b5db62401.jpg";
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteProduct(product.id);
            toast.success("Produto excluído com sucesso");
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao excluir produto";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleActive = async (checked: boolean) => {
        setIsToggling(true);
        try {
            await partialUpdateProduct(product.id, { isActive: checked });
            setIsActive(checked);
            toast.success(checked ? "Produto ativado com sucesso" : "Produto desativado com sucesso");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar status do produto";
            toast.error(errorMessage);
            // Reverte o estado em caso de erro
            setIsActive(!checked);
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <Card className="flex flex-col w-full">
            <CardHeader>
                <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative w-full aspect-square">
                <Image 
                    src={getImageSrc(product.image)} 
                    alt={product.name} 
                    fill 
                    className="object-cover p-4" 
                />
            </CardContent>
            <CardContent className="flex flex-col gap-2 mt-auto">
                <div className="flex flex-row items-center justify-between">
                    <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                    <div className="flex flex-row gap-1">
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
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir produto</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tem certeza que deseja excluir o produto &quot;{product.name}&quot;? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {isDeleting ? "Excluindo..." : "Excluir"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                {product.sku && (
                    <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                )}
                <div className="flex flex-row items-center justify-between pt-2 border-t">
                    <Label htmlFor={`active-${product.id}`} className="text-sm">
                        {isActive ? "Ativo" : "Inativo"}
                    </Label>
                    <Switch
                        id={`active-${product.id}`}
                        checked={isActive}
                        onCheckedChange={handleToggleActive}
                        disabled={isToggling}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

