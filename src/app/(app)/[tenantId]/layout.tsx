import { getMarketById } from "@/actions/market.actions";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "../../components/Header";
import AdminSidebar from "./components/AdminSidebar";

type LayoutParams = {
    tenantId: string;
};

type TenantLayoutProps = {
    children: React.ReactNode;
    params: Promise<LayoutParams>;
};

export default async function Layout({ children, params }: TenantLayoutProps) {
    const { tenantId } = await params;

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