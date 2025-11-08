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
                <div className="flex min-h-screen w-full">
                    <AdminSidebar />
                    <SidebarInset>
                        <div className="flex h-full flex-col">
                            <Header />
                            <div className="flex-1 overflow-y-auto p-6">
                                {children}
                            </div>
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div >
    )
}