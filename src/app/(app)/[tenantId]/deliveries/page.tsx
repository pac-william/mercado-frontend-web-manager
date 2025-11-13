import RouterBack from "@/components/RouterBack";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeliverySettingsForm } from "./components/DeliverySettingsForm";

interface DeliveriesPageProps {
    params: Promise<{ tenantId: string }>;
}

export default async function DeliveriesPage({ params }: DeliveriesPageProps) {
    const { tenantId } = await params;

    return (
        <div className="flex flex-col flex-1">
            <ScrollArea className="flex flex-col flex-grow h-0">
                <div className="flex flex-1 flex-col gap-4 container mx-auto my-4 mb-[120px]">
                    <RouterBack />
                    <div className="flex justify-center">
                        <DeliverySettingsForm tenantId={tenantId} />
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}

