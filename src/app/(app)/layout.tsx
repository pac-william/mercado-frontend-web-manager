import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { LoadingProvider } from "@/contexts/LoadingContext";
import NavigationLoading from "@/components/NavigationLoading";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth0.getSession();

    if (!session) {
        redirect('/auth/login');
    }
    
    return (
        <LoadingProvider>
            <div>
                {children}
            </div>
            <NavigationLoading />
        </LoadingProvider>
    )
}