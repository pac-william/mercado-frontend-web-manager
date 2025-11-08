import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Header from "../components/Header";
import AdminSidebar from "./components/AdminSidebar";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth0.getSession();

    if (!session) {
        redirect('/auth/login');
    }

    return (
        <div className="flex flex-1 flex-col h-screen bg-background text-foreground">
            <SidebarProvider>
                <div className="flex flex-1">
                    <AdminSidebar />
                    <SidebarInset>
                        <Header />
                        <div className="flex flex-1 flex-col p-6">
                            {children}
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div >
    )
}