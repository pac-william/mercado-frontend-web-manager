import { getMarkets } from "@/actions/market.actions";
import { getUserMe } from "@/actions/user.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { auth0 } from "@/lib/auth0";
import { Plus } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MarketsList } from "./components/MarketsList";
moment.locale("pt-br");

export type Role = "OWNER" | "MANAGER" | "CUSTOMER";

export default async function Home() {

    const session = await auth0.getSession();

    if (!session) {
        redirect("/auth/login");
    }

    const user = await getUserMe();

    const getInitials = (value: string) =>
        value
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "MM";

        const { markets } = await getMarkets({ page: 1, size: 100, ownerId: user.id });


    const getRoleName = (role: Role) => {
        switch (role) {
            case "OWNER":
                return "Proprietário";
            case "MANAGER":
                return "Gerente";
            case "CUSTOMER":
                return "Cliente";
            default:
                return role;
        }
    }
    

    return (
        <div className="flex flex-col flex-1 h-screen p-6 gap-6 container mx-auto">
            <Card >
                <CardHeader className="gap-6 md:flex md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border border-primary/30 bg-background shadow-sm">
                            <AvatarImage src={user.profilePicture ?? undefined} alt={user.email ?? ""} />
                            <AvatarFallback className="text-lg font-semibold">
                                {getInitials(user.name ?? "")}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-3xl">{user.name}</CardTitle>
                            <CardDescription>
                                Código: {user.id} · Plano atual: {getRoleName(user.role as Role)}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="grid gap-1 text-sm text-muted-foreground md:text-right">
                        <span><span className="font-semibold text-foreground">Responsável:</span> {user.name}</span>
                        <span>
                            <span className="font-semibold text-foreground">Desde:</span> {moment(user.createdAt).format("LL")}
                        </span>
                        <span><span className="font-semibold text-foreground">Mercados ativos:</span> {markets.length}</span>
                        <span className="uppercase tracking-wide text-primary">
                            {getRoleName(user.role as Role)}
                        </span>
                    </div>
                </CardHeader>
            </Card>
            <Card className="flex flex-col flex-1">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Suas lojas</CardTitle>
                        <CardDescription>Gerencie suas lojas cadastradas</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/markets/create">
                            <Plus size={16} />
                            Cadastrar loja
                        </Link>
                    </Button>
                </CardHeader>
                <Separator />
                <CardContent className="flex flex-col flex-1 p-0 m-4">
                    <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto pr-4">
                        <MarketsList markets={markets} />
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}