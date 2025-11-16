import { HeaderInfo } from "@/app/components/HeaderInfo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeliverySettingsForm } from "./components/DeliverySettingsForm";

interface DeliveriesPageProps {
    params: Promise<{ tenantId: string }>;
}

export default async function DeliveriesPage({ params }: DeliveriesPageProps) {
    const { tenantId } = await params;

    return (
        <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto pr-4">
            <div className="flex flex-1 flex-col gap-6">
                <HeaderInfo title="Entregas" description="Gerencie as entregas cadastradas" />
                <DeliverySettingsForm tenantId={tenantId} />
            </div>
        </ScrollArea>
    );
}

