"use client"

import { createProduct, getProductById, updateProduct } from "@/actions/products.actions";
import { Category } from "@/app/domain/categoryDomain";
import CropperZoomSlider from "@/components/cropper-zoom-slider";
import ProductLivePreview from "@/components/product-live-preview";
import SingleImageUploader from "@/components/single-image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ProductDTO } from "@/dtos/productDTO";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface ProductCreateFormProps {
    tenantId: string;
    categories: Category[];
    productId?: string;
}

type CropArea = { x: number; y: number; width: number; height: number }

export const ProductCreateForm = ({ tenantId, categories, productId }: ProductCreateFormProps) => {
    const [productImage, setProductImage] = useState<string | null>(null);
    const [cropZoom, setCropZoom] = useState(1);
    const [cropArea, setCropArea] = useState<CropArea | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = Boolean(productId);

    const form = useForm<z.infer<typeof ProductDTO>>({
        resolver: zodResolver(ProductDTO),
        defaultValues: {
            marketId: tenantId,
            isActive: true,
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (productId) {
            setIsLoading(true);
            getProductById(productId)
                .then((productData) => {
                    setProductImage(productData.image || null);
                    form.reset({
                        name: productData.name,
                        price: productData.price,
                        marketId: tenantId,
                        categoryId: productData.categoryId || "",
                        sku: productData.sku || "",
                        isActive: productData.isActive ?? true,
                    });
                })
                .catch((error) => {
                    toast.error("Erro ao carregar produto");
                    console.error(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [productId, tenantId, form]);

    useEffect(() => {
        form.setValue("marketId", tenantId);
    }, [tenantId, form]);

    const handleSetProductImage = useCallback((image: string) => {
        setProductImage(image);
        setCropZoom(1);
        setCropArea(null);
    }, []);

    const handleCropChange = useCallback((crop: CropArea | null) => {
        setCropArea(crop);
    }, []);

    const handleZoomChange = useCallback((zoom: number) => {
        setCropZoom(zoom);
    }, []);

    async function onSubmit(values: z.infer<typeof ProductDTO>) {
        if (isSubmitting) return;

        if (!values.name || !values.name.trim()) {
            toast.error("Nome do produto é obrigatório");
            return;
        }

        if (!values.price || isNaN(Number(values.price)) || Number(values.price) <= 0) {
            toast.error("Preço deve ser um número válido maior que zero");
            return;
        }

        if (!values.categoryId || !values.categoryId.trim()) {
            toast.error("Categoria é obrigatória");
            return;
        }

        setIsSubmitting(true);

        const productData: ProductDTO = {
            name: values.name.trim(),
            price: Number(values.price),
            marketId: tenantId,
            image: productImage || undefined,
            sku: values.sku?.trim() || undefined,
            categoryId: values.categoryId.trim(),
            isActive: values.isActive ?? true,
        };

        try {
            if (isEditing && productId) {
                await updateProduct(productId, productData);
                toast.success("Produto atualizado com sucesso");
                // Limpar estados após atualização
                setCropArea(null);
                setCropZoom(1);
            } else {
                await createProduct(productData);
                toast.success("Produto cadastrado com sucesso");
                // Limpar tudo após criação
                form.reset({
                    name: "",
                    price: 0,
                    categoryId: "",
                    sku: "",
                    marketId: tenantId,
                    isActive: true,
                });
                setProductImage(null);
                setCropArea(null);
                setCropZoom(1);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : isEditing ? "Erro ao atualizar produto" : "Erro ao cadastrar produto";
            toast.error(errorMessage);
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <Card id="product-loading-card" className="max-w-3xl mx-auto">
                <CardContent className="pt-6 flex items-center justify-center min-h-[200px]">
                    <p id="product-loading-message" className="text-muted-foreground">Carregando produto...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div id="product-form-container" className="grid gap-6 grid-cols-12">
            <Card id="product-form-card" className="2xl:col-span-9 xl:col-span-8 lg:col-span-7 md:col-span-6 sm:col-span-5">
                <CardHeader>
                    <CardTitle id="product-form-title">{isEditing ? "Editar Produto" : "Cadastro de Produto"}</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="flex xl:flex-row flex-col gap-6">
                            <div id="product-image-upload-container" className="space-y-4">
                                {productImage ? (
                                    <div id="product-image-editor-container" className="space-y-4">
                                        <CropperZoomSlider
                                            image={productImage}
                                            onCropChange={handleCropChange}
                                            onZoomChange={handleZoomChange}
                                        />
                                        <Card id="product-image-card" className="flex flex-row items-center p-2 gap-2">
                                            <ImageIcon id="product-image-icon" size={16} />
                                            <span id="product-image-filename" className="text-xs text-muted-foreground">{productImage.split("/").pop()}</span>
                                            <Button id="product-remove-image-button" variant="ghost" className="ml-auto" size="icon_xs" onClick={() => setProductImage(null)}>
                                                <XIcon size={16} />
                                            </Button>
                                        </Card>
                                    </div>
                                ) : (
                                    <SingleImageUploader onImageChange={handleSetProductImage} />
                                )}
                            </div>
                            <div id="product-form-fields-container" className="flex flex-col gap-4 flex-1">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel id="product-name-label" htmlFor="product-name-input">Nome do Produto</FormLabel>
                                            <FormControl>
                                                <Input id="product-name-input" placeholder="Digite o nome do produto" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel id="product-category-label" htmlFor="product-category-select">Categoria</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger id="product-category-select">
                                                        <SelectValue placeholder="Selecione a categoria" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent id="product-category-select-content">
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} id={`product-category-option-${category.id}`} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div id="product-price-sku-grid" className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel id="product-price-label" htmlFor="product-price-input">Preço</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        id="product-price-input"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Digite o preço"
                                                        value={field.value && !Number.isNaN(field.value) ? field.value : ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (!value) {
                                                                field.onChange(undefined as unknown as number);
                                                            } else {
                                                                field.onChange(parseFloat(value));
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="sku"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel id="product-sku-label" htmlFor="product-sku-input">SKU (opcional)</FormLabel>
                                                <FormControl>
                                                    <Input id="product-sku-input" placeholder="Código interno" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem id="product-active-form-item" className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel id="product-active-label" htmlFor="product-active-switch" className="text-base">Produto ativo</FormLabel>
                                                <div id="product-active-description" className="text-sm text-muted-foreground">
                                                    {field.value ? "Produto visível para clientes" : "Produto oculto"}
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Switch id="product-active-switch" checked={field.value ?? true} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div id="product-form-actions" className="flex justify-end">
                                    <Button id="product-submit-button" type="submit" className="min-w-[120px]" disabled={isSubmitting}>
                                        {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar"}
                                    </Button>
                                </div>
                            </div>

                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div id="product-preview-container" className="2xl:col-span-3 xl:col-span-4 lg:col-span-5 md:col-span-6 sm:col-span-7">
                <ProductLivePreview
                    name={form.watch("name")}
                    price={Number(form.watch("price")) || 0}
                    sku={form.watch("sku")}
                    categoryName={
                        categories.find((category) => category.id === form.watch("categoryId"))?.name ?? "Categoria selecionada"
                    }
                    isActive={form.watch("isActive") ?? true}
                    imageUrl={productImage ?? undefined}
                    zoom={cropZoom}
                    cropArea={cropArea}
                />
            </div>
        </div>
    )
}
