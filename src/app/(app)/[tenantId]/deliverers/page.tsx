import { getDeliverers } from "@/actions/deliverer.actions";
import { HeaderInfo } from "@/app/components/HeaderInfo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import Link from "next/link";
import DelivererCardAdmin from "./components/DelivererCardAdmin";

interface DeliverersPageProps {
    params: Promise<{ tenantId: string }>;
    searchParams: Promise<{ page?: string; size?: string; status?: string }>;
}

export default async function DeliverersPage({ params, searchParams }: DeliverersPageProps) {
    const { tenantId } = await params;
    const { page, size, status } = await searchParams;

    const { deliverers } = await getDeliverers({
        page: Number(page) || 1,
        size: Number(size) || 10,
        status: status,
    });

    return (
        <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto pr-4">
            <div className="flex flex-1 flex-col gap-6">
                <div className="flex flex-row gap-4 items-center justify-between">
                    <HeaderInfo title="Entregadores" description="Gerencie os entregadores cadastrados" />
                    <Button asChild>
                        <Link href={`/${tenantId}/deliverers/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Cadastrar Entregador
                        </Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
                    {deliverers.map((deliverer) => (
                        <DelivererCardAdmin 
                            key={deliverer.id} 
                            deliverer={deliverer} 
                            tenantId={tenantId}
                        />
                    ))}
                </div>
            </div>
        </ScrollArea>
    );
}

