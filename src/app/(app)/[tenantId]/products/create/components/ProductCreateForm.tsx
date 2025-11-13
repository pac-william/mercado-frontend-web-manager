"use client"

import { createProduct } from "@/actions/products.actions";
import { Category } from "@/app/domain/categoryDomain";
import CropperZoomSlider from "@/components/cropper-zoom-slider";
import SingleImageUploader from "@/components/single-image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ProductDTO } from "@/dtos/productDTO";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useNavigationWithLoading } from "@/hooks/useNavigationWithLoading";

interface ProductCreateFormProps {
    tenantId: string;
    categories: Category[];
}

export const ProductCreateForm = ({tenantId, categories}: ProductCreateFormProps) => {
    const { navigate } = useNavigationWithLoading();
    const [productImage, setProductImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof ProductDTO>>({
        resolver: zodResolver(ProductDTO),
        defaultValues: {
            marketId: tenantId,
        },
        mode: "onChange",
    });

    useEffect(() => {
        form.setValue("marketId", tenantId);
    }, [tenantId, form]);

    const handleSetProductImage = useCallback((image: string) => {
        setProductImage(image);
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
        };

        try {
            await createProduct(productData);
            toast.success("Produto cadastrado com sucesso");
            navigate(`/${tenantId}/products`, "Redirecionando...");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao cadastrar produto";
            toast.error(errorMessage);
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Cadastro de Produto</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-[auto_1fr] gap-6 items-start">
                            <div className="flex-shrink-0">
                                {productImage ? (
                                    <CropperZoomSlider image={productImage} />
                                ) : (
                                    <SingleImageUploader onImageChange={handleSetProductImage} />
                                )}
                            </div>
                            <div className="flex flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Produto</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Digite o nome do produto" {...field} />
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
                                            <FormLabel>Categoria</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione a categoria" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Preço</FormLabel>
                                                <FormControl>
                                                    <Input
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
                                                <FormLabel>SKU (opcional)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Código interno"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        className="min-w-[120px]"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Salvando..." : "Cadastrar"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card >
    )
}
