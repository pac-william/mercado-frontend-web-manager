"use client"

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
    Settings,
    ShoppingCart,
    Truck,
    Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";



interface AdminSidebarProps {
    tenantId: string;
}

export default function AdminSidebar({ tenantId }: AdminSidebarProps) {


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
                                                className="flex items-center gap-3"
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span>{item.title}</span>
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