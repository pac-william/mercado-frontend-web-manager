import { HeaderInfo } from "@/app/components/HeaderInfo";
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
                <HeaderInfo title="Entregas" description="Gerencie as entregas cadastradas" />
                <div className="flex justify-center">
                    <DeliverySettingsForm tenantId={tenantId} />
                </div>
            </ScrollArea>
        </div>
    );
}

