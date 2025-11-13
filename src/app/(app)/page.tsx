import { getMarkets } from "@/actions/market.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function Home() {

    const tenant = {
        name: "Mercado Manager Brasil",
        code: "TEN-4821",
        owner: "Romul Silva",
        plan: "Plano Enterprise",
        since: "Março/2024",
        markets: 5,
        status: "Ativo",
        logo: null,
    };

    const getInitials = (value: string) =>
        value
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "MM";

    const { markets } = await getMarkets({ page: 1, size: 10, ownerId: "69011ba353c5aabb5c5dd8d7" });
    
    enum Status {
        Aberto = "Aberto",
        Fechado = "Fechado",
    }
    const status: Status = Status.Aberto;


    return (
        <div className="flex flex-col flex-1 h-screen p-6 gap-6 container mx-auto">
            <Card >
                <CardHeader className="gap-6 md:flex md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border border-primary/30 bg-background shadow-sm">
                            <AvatarImage src={tenant.logo ?? undefined} alt={tenant.name} />
                            <AvatarFallback className="text-lg font-semibold">
                                {getInitials(tenant.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-3xl">{tenant.name}</CardTitle>
                            <CardDescription>
                                Código: {tenant.code} · Plano atual: {tenant.plan}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="grid gap-1 text-sm text-muted-foreground md:text-right">
                        <span><span className="font-semibold text-foreground">Responsável:</span> {tenant.owner}</span>
                        <span><span className="font-semibold text-foreground">Desde:</span> {tenant.since}</span>
                        <span><span className="font-semibold text-foreground">Mercados ativos:</span> {tenant.markets}</span>
                        <span className="uppercase tracking-wide text-primary">
                            {tenant.status}
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
                         <div className="flex flex-col gap-4">
                             {markets.map((market) => {
                                 const isOpen = status === Status.Aberto;
                                 return (
                                     <Link key={market.id} href={`/${market.id}/dashboard`}>
                                         <Card className="flex flex-row flex-1 border border-muted hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                                             <CardHeader className="flex flex-row flex-1 items-center gap-4">
                                                 <Avatar className="h-16 w-16">
                                                     <AvatarImage src={market.profilePicture ?? undefined} alt={market.name} />
                                                     <AvatarFallback className="text-lg font-semibold">
                                                         {getInitials(market.name)}
                                                     </AvatarFallback>
                                                 </Avatar>
                                                 <div className="flex flex-col gap-1">
                                                     <CardTitle className="text-2xl">{market.name}</CardTitle>
                                                     <CardDescription>{market.address}</CardDescription>
                                                 </div>
                                             </CardHeader>
                                             <CardContent className="flex items-center justify-center">
                                                 <Badge variant="outline" className="flex items-center justify-center gap-2">
                                                     <span className="relative flex size-2">
                                                         <span className={`relative inline-flex size-2 rounded-full ${isOpen ? "bg-green-500" : "bg-red-500"}`}></span>
                                                     </span>
                                                     <span>{isOpen ? "Aberto" : "Fechado"}</span>
                                                 </Badge>
                                             </CardContent>
                                         </Card>
                                     </Link>
                                 );
                             })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}