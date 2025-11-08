"use client"

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Home, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminHeader() {
    const pathname = usePathname();
    const isInAdmin = pathname?.startsWith('/admin');

    return (
        <header className="bg-background border-b border-border">
            <div className="container mx-auto flex items-center gap-4 p-4">
                <SidebarTrigger className="-ml-2 md:hidden" />
                <Link
                    href="/admin"
                    className="text-2xl font-bold text-foreground hover:text-primary"
                >
                    Smart Market Admin
                </Link>
                <div className="ml-auto flex flex-row gap-2 items-center">
                    {isInAdmin ? (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/" className="flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                Voltar ao Site
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" asChild>
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-2"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
