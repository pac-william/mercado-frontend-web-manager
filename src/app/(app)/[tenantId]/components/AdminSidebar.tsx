"use client"

import { getUnreadMessagesCountByMarketId } from "@/actions/chat.actions";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import {
    CreditCard,
    FileText,
    Home,
    LayoutDashboard,
    MessagesSquare,
    Package,
    Receipt,
    Settings,
    ShoppingCart,
    Truck,
    Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";



interface AdminSidebarProps {
    tenantId: string;
}

export default function AdminSidebar({ tenantId }: AdminSidebarProps) {
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    useEffect(() => {
        const fetchUnreadMessagesCount = async () => {
            try {
                const count = await getUnreadMessagesCountByMarketId(tenantId);
                setUnreadMessagesCount(count);
            } catch (error) {
                console.error("Erro ao buscar contagem de mensagens não lidas:", error);
                setUnreadMessagesCount(0);
            }
        }
        fetchUnreadMessagesCount();

        // Atualizar a cada 10 segundos
        const interval = setInterval(fetchUnreadMessagesCount, 10000);
        return () => clearInterval(interval);
    }, [tenantId]);

    const menuItems = [
        {
            title: "Meus mercados",
            href: `/`,
            icon: Home,
        },
        {
            title: "Dashboard",
            href: `/${tenantId}/dashboard`,
            icon: LayoutDashboard,
        },
        {
            title: "Produtos",
            href: `/${tenantId}/products`,
            icon: Package,
        },
        {
            title: "Pedidos",
            href: `/${tenantId}/orders`,
            icon: Receipt,
        },
        {
            title: "Entrega",
            href: `/${tenantId}/deliveries`,
            icon: ShoppingCart,
        },
        {
            title: "Entregadores",
            href: `/${tenantId}/deliverers`,
            icon: Truck,
        },
        {
            title: "Atendimento",
            href: `/${tenantId}/support`,
            icon: MessagesSquare,
        },
        {
            title: "Usuários",
            href: `/${tenantId}/users`,
            icon: Users,
        },
        {
            title: "Relatórios",
            href: `/${tenantId}/reports`,
            icon: FileText,
        },
        {
            title: "Métodos de pagamento",
            href: `/${tenantId}/payment-methods`,
            icon: CreditCard,
        },
        {
            title: "Configurações",
            href: `/${tenantId}/settings`,
            icon: Settings,
        }
    ];

    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon">

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Gerenciamento</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive =
                                    pathname === item.href ||
                                    pathname?.startsWith(item.href + "/");

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                        >
                                            <Link
                                                href={item.href}
                                                className="flex items-center gap-3 relative"
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                                {item.title === "Atendimento" && unreadMessagesCount > 0 && (
                                                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                                                        {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}