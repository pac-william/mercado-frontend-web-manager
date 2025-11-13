import RouterBack from "@/components/RouterBack";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DelivererCreateForm } from "../components/DelivererCreateForm";

interface CreateDelivererProps {
    params: Promise<{ tenantId: string }>;
    searchParams: Promise<{ delivererId?: string }>;
}

export default async function CreateDeliverer({params, searchParams}: CreateDelivererProps) {
    const { tenantId } = await params;
    const { delivererId } = await searchParams;
    
    return (
        <div className="flex flex-col flex-1">
            <ScrollArea className="flex flex-col flex-grow h-0">
                <div className="flex flex-1 flex-col gap-4 container mx-auto my-4 mb-[120px]">
                    <RouterBack />
                    <div className="flex justify-center">
                        <DelivererCreateForm tenantId={tenantId} delivererId={delivererId} />
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}

