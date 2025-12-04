"use client";

import { useEffect, useState } from "react";
import { OrderResponseDTO } from "@/dtos/orderDTO";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getDelivererById } from "@/actions/deliverer.actions";
import { getProductById } from "@/actions/products.actions";
import { Deliverer } from "@/app/domain/delivererDomain";
import { Product } from "@/app/domain/productDomain";
import { OrderItemCard } from "./OrderItemCard";
import { Loader2 } from "lucide-react";

interface OrderDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: OrderResponseDTO | null;
}

export function OrderDetailsModal({ open, onOpenChange, order }: OrderDetailsModalProps) {
    const [deliverer, setDeliverer] = useState<Deliverer | null>(null);
    const [products, setProducts] = useState<Record<string, Product>>({});
    const [isLoadingDeliverer, setIsLoadingDeliverer] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    useEffect(() => {
        if (open && order) {
            loadDeliverer();
            loadProducts();
        } else {
            setDeliverer(null);
            setProducts({});
        }
    }, [open, order]);

    const loadDeliverer = async () => {
        if (!order?.delivererId) return;
        
        setIsLoadingDeliverer(true);
        try {
            const delivererData = await getDelivererById(order.delivererId);
            setDeliverer(delivererData);
        } catch (error) {
            console.error("Erro ao carregar entregador:", error);
        } finally {
            setIsLoadingDeliverer(false);
        }
    };

    const loadProducts = async () => {
        if (!order?.items || order.items.length === 0) return;
        
        setIsLoadingProducts(true);
        try {
            const productPromises = order.items.map(item => 
                getProductById(item.productId).catch(() => null)
            );
            const productsData = await Promise.all(productPromises);
            
            const productsMap: Record<string, Product> = {};
            order.items.forEach((item, index) => {
                if (productsData[index]) {
                    productsMap[item.productId] = productsData[index]!;
                }
            });
            setProducts(productsMap);
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    if (!order) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return "-";
        const d = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(d);
    };

    const getStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            PENDING: "Pendente",
            CONFIRMED: "Confirmado",
            PREPARING: "Preparando",
            READY_FOR_DELIVERY: "Pronto para Entrega",
            OUT_FOR_DELIVERY: "Saiu para Entrega",
            DELIVERED: "Entregue",
            CANCELLED: "Cancelado",
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colorMap: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            PREPARING: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
            READY_FOR_DELIVERY: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
            OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
            DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
        return colorMap[status] || "bg-muted text-muted-foreground";
    };

    const getPaymentMethodLabel = (method: string) => {
        const methodMap: Record<string, string> = {
            CREDIT_CARD: "Cartão de Crédito",
            DEBIT_CARD: "Cartão de Débito",
            PIX: "PIX",
            CASH: "Dinheiro",
        };
        return methodMap[method] || method;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalhes do Pedido</DialogTitle>
                    <DialogDescription>
                        ID: {order.id}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status e Informações Principais */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                            <Badge className={getStatusColor(order.status)}>
                                {getStatusLabel(order.status)}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Total</p>
                            <p className="text-lg font-semibold">{formatCurrency(order.total)}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Informações de Pagamento */}
                    <div>
                        <h3 className="font-semibold mb-3">Informações de Pagamento</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Método de Pagamento</p>
                                <p>{getPaymentMethodLabel(order.paymentMethod)}</p>
                            </div>
                            {order.discount && order.discount > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Desconto</p>
                                    <p className="text-green-600 dark:text-green-400">-{formatCurrency(order.discount)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Entregador */}
                    {order.delivererId && (
                        <>
                            <div>
                                <h3 className="font-semibold mb-3">Entregador</h3>
                                {isLoadingDeliverer ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Carregando...
                                    </div>
                                ) : deliverer ? (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">{deliverer.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {deliverer.vehicle.type}
                                            {deliverer.vehicle.plate && ` • ${deliverer.vehicle.plate}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {deliverer.phone}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        ID: {order.delivererId.slice(0, 8)}...
                                    </p>
                                )}
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Endereço de Entrega */}
                    <div>
                        <h3 className="font-semibold mb-3">Endereço de Entrega</h3>
                        <p className="text-sm">{order.deliveryAddress || "-"}</p>
                    </div>

                    <Separator />

                    {/* Itens do Pedido */}
                    <div>
                        <h3 className="font-semibold mb-3">Itens do Pedido</h3>
                        {isLoadingProducts ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <p className="text-sm">Carregando produtos...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item) => {
                                        const product = products[item.productId];
                                        return product ? (
                                            <OrderItemCard
                                                key={item.id}
                                                product={product}
                                                quantity={item.quantity}
                                                price={item.price}
                                            />
                                        ) : (
                                            <div key={item.id} className="flex justify-between items-start p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium text-muted-foreground">
                                                        Produto ID: {item.productId.slice(0, 8)}...
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Quantidade: {item.quantity} × {formatCurrency(item.price)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground">Nenhum item encontrado</p>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Informações Adicionais */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Data de Criação</p>
                            <p className="text-sm">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Última Atualização</p>
                            <p className="text-sm">{formatDate(order.updatedAt)}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

