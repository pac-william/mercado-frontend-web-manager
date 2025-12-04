"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrderPaginatedResponse } from "@/app/domain/orderDomain";
import { OrderResponseDTO } from "@/dtos/orderDTO";
import { getOrderById } from "@/actions/order.actions";
import { HeaderInfo } from "@/app/components/HeaderInfo";
import Pagination from "@/app/components/Pagination";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SelectFilter } from "./SelectFilter";
import { OrderTabs } from "./OrderTabs";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderActions } from "./OrderActions";
import { OrderQuickActions } from "./OrderQuickActions";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrdersPageClientProps {
    tenantId: string;
    initialOrders: OrderPaginatedResponse;
}

export function OrdersPageClient({ tenantId, initialOrders }: OrdersPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);
    const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

    const status = searchParams.get("status") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";

    const filteredOrders = useMemo(() => {
        let orders = initialOrders.orders;
        
        const completedStatuses = ["DELIVERED", "CANCELLED"];
        if (activeTab === "completed") {
            orders = orders.filter(order => completedStatuses.includes(order.status));
        } else {
            orders = orders.filter(order => !completedStatuses.includes(order.status));
        }
        
        if (status && status !== "__all__") {
            orders = orders.filter(order => order.status === status);
        }
        
        if (paymentMethod && paymentMethod !== "__all__") {
            orders = orders.filter(order => order.paymentMethod === paymentMethod);
        }
        
        return orders;
    }, [initialOrders.orders, activeTab, status, paymentMethod]);

    const handleTabChange = (tab: "active" | "completed") => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("status");
        params.delete("page");
        router.push(`/${tenantId}/orders?${params.toString()}`);
    };

    const handleViewDetails = async (orderId: string) => {
        setIsLoadingOrder(true);
        try {
            const order = await getOrderById(orderId);
            setSelectedOrder(order);
            setIsDetailsModalOpen(true);
        } catch (error) {
            console.error("Erro ao carregar detalhes do pedido:", error);
        } finally {
            setIsLoadingOrder(false);
        }
    };

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
            PENDING: "text-yellow-600 dark:text-yellow-400",
            CONFIRMED: "text-blue-600 dark:text-blue-400",
            PREPARING: "text-orange-600 dark:text-orange-400",
            READY_FOR_DELIVERY: "text-purple-600 dark:text-purple-400",
            OUT_FOR_DELIVERY: "text-indigo-600 dark:text-indigo-400",
            DELIVERED: "text-green-600 dark:text-green-400",
            CANCELLED: "text-red-600 dark:text-red-400",
        };
        return colorMap[status] || "text-muted-foreground";
    };

    return (
        <div className="flex flex-1 flex-col gap-4 pr-4">
            <HeaderInfo title="Pedidos" description="Visualize e gerencie os pedidos do mercado" />

            <Card className="flex flex-col flex-1">
                <CardHeader className="space-y-4">
                    <OrderTabs activeTab={activeTab} onTabChange={handleTabChange} />
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-2">
                            <SelectFilter
                                options={[
                                    { label: "Todos", value: "" },
                                    { label: "Pendente", value: "PENDING" },
                                    { label: "Confirmado", value: "CONFIRMED" },
                                    { label: "Preparando", value: "PREPARING" },
                                    { label: "Pronto para Entrega", value: "READY_FOR_DELIVERY" },
                                    { label: "Saiu para Entrega", value: "OUT_FOR_DELIVERY" },
                                    { label: "Entregue", value: "DELIVERED" },
                                    { label: "Cancelado", value: "CANCELLED" },
                                ]}
                                value={status}
                                label="Status"
                                placeholder="Filtrar por status"
                                filterKey="status"
                                basePath={`/${tenantId}/orders`}
                            />
                        </div>
                        <div className="col-span-2">
                            <SelectFilter
                                options={[
                                    { label: "Todos", value: "" },
                                    { label: "Cartão de Crédito", value: "CREDIT_CARD" },
                                    { label: "Cartão de Débito", value: "DEBIT_CARD" },
                                    { label: "PIX", value: "PIX" },
                                    { label: "Dinheiro", value: "CASH" },
                                ]}
                                value={paymentMethod}
                                label="Método de Pagamento"
                                placeholder="Filtrar por pagamento"
                                filterKey="paymentMethod"
                                basePath={`/${tenantId}/orders`}
                            />
                        </div>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="flex flex-col flex-1">
                    {filteredOrders.length > 0 ? (
                        <div className="space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-muted-foreground border-b">
                                        <tr>
                                            <th className="text-left py-3 pr-4 font-semibold">Pedido</th>
                                            <th className="text-left py-3 pr-4 font-semibold">Status</th>
                                            <th className="text-left py-3 pr-4 font-semibold">Total</th>
                                            <th className="text-left py-3 pr-4 font-semibold">Pagamento</th>
                                            <th className="text-left py-3 pr-4 font-semibold">Endereço</th>
                                            <th className="text-left py-3 pr-4 font-semibold">Itens</th>
                                            <th className="text-left py-3 pr-4 font-semibold">Data</th>
                                            <th className="text-left py-3 pr-4 font-semibold">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => {
                                            const orderDTO: OrderResponseDTO = {
                                                id: order.id,
                                                userId: order.userId,
                                                marketId: order.marketId,
                                                addressId: order.addressId,
                                                delivererId: order.delivererId,
                                                couponId: order.couponId,
                                                status: order.status,
                                                total: order.total,
                                                discount: order.discount,
                                                paymentMethod: order.paymentMethod as "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "CASH",
                                                deliveryAddress: order.deliveryAddress,
                                                items: order.items || [],
                                                createdAt: order.createdAt,
                                                updatedAt: order.updatedAt,
                                            };

                                            return (
                                                <tr key={order.id} className="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                                                    <td className="py-4 pr-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-base">Pedido #{order.id.slice(0, 8).toUpperCase()}</span>
                                                            <span className="text-xs text-muted-foreground font-mono">{order.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <Badge 
                                                            variant="outline" 
                                                            className={`${getStatusColor(order.status)} border-current`}
                                                        >
                                                            {getStatusLabel(order.status)}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-lg text-primary">
                                                                {formatCurrency(order.total)}
                                                            </span>
                                                            {order.discount && order.discount > 0 && (
                                                                <span className="text-xs text-green-600 dark:text-green-400">
                                                                    Desconto: {formatCurrency(order.discount)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <span className="text-sm">
                                                            {order.paymentMethod === "CREDIT_CARD" && "Cartão de Crédito"}
                                                            {order.paymentMethod === "DEBIT_CARD" && "Cartão de Débito"}
                                                            {order.paymentMethod === "PIX" && "PIX"}
                                                            {order.paymentMethod === "CASH" && "Dinheiro"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 pr-4 max-w-xs">
                                                        <span className="text-sm text-muted-foreground truncate block" title={order.deliveryAddress || "-"}>
                                                            {order.deliveryAddress || "-"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <span className="text-sm font-medium">
                                                            {order.items?.length || 0} {order.items?.length === 1 ? "item" : "itens"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatDate(order.createdAt)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {order.status === "PENDING" ? (
                                                                <>
                                                                    <OrderQuickActions order={orderDTO} />
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleViewDetails(order.id)}
                                                                        disabled={isLoadingOrder}
                                                                        title="Ver detalhes"
                                                                    >
                                                                        <Eye className="h-4 w-4 mr-1" />
                                                                        Detalhes
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleViewDetails(order.id)}
                                                                        disabled={isLoadingOrder}
                                                                        title="Ver detalhes"
                                                                    >
                                                                        <Eye className="h-4 w-4 mr-1" />
                                                                        Detalhes
                                                                    </Button>
                                                                    <OrderActions 
                                                                        order={orderDTO} 
                                                                        tenantId={tenantId} 
                                                                    />
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
                    )}
                </CardContent>
                <Separator />
                <CardFooter>
                    {initialOrders.meta && <Pagination meta={initialOrders.meta} />}
                </CardFooter>
            </Card>

            <OrderDetailsModal
                open={isDetailsModalOpen}
                onOpenChange={setIsDetailsModalOpen}
                order={selectedOrder}
            />
        </div>
    );
}

