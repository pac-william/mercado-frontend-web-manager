"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import {
    FileText,
    LayoutDashboard,
    LogOut,
    Package,
    ShoppingCart,
    Truck,
    Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Produtos",
        href: "/products",
        icon: Package,
    },
    {
        title: "Entrega",
        href: "/deliveries",
        icon: ShoppingCart,
    },
    {
        title: "Entregadores",
        href: "/deliverers",
        icon: Truck,
    },
    {
        title: "Usuários",
        href: "/users",
        icon: Users,
    },
    {
        title: "Relatórios",
        href: "/reports",
        icon: FileText,
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="px-2 py-4">
                <Link
                    href="/dashboard"
                    className="text-lg font-semibold leading-none text-sidebar-foreground group-data-[collapsible=icon]:hidden"
                >
                    Smart Market
                </Link>
            </SidebarHeader>
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
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            variant="outline"
                            tooltip="Sair"
                        >
                            <a
                                href="/auth/logout"
                                className="flex items-center gap-3"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sair</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}