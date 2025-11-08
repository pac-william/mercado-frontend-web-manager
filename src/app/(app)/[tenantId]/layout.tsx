import { getMarketById } from "@/actions/market.actions";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Header from "../../components/Header";
import AdminSidebar from "./components/AdminSidebar";

export default async function Layout({ children, params }: { children: React.ReactNode, params: { tenantId: string } }) {
    const { tenantId } = await params;
    const session = await auth0.getSession();

    if (!session) {
        redirect('/auth/login');
    }

    const market = await getMarketById(tenantId);

    return (
        <div className="flex flex-1 flex-col h-screen bg-background text-foreground">
            <SidebarProvider>
                <div className="flex flex-1">
                    <AdminSidebar tenantId={tenantId} />
                    <SidebarInset>
                        <Header market={market} />
                        <div className="flex flex-1 flex-col p-6">
                            {children}
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div >
    )
}