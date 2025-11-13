import { HeaderInfo } from "@/app/components/HeaderInfo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaymentMethodsSettings } from "../settings/components/PaymentMethodsSettings";

export default async function PaymentMethodsPage({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;

    return (
        <div className="flex flex-1 flex-col">
            <ScrollArea className="flex flex-grow flex-col h-0 overflow-y-auto">
                <div className="flex flex-col gap-6">
                    <HeaderInfo title="Métodos de pagamento" description="Ative e configure os meios aceitos pelo mercado. Essas definições refletem nos canais App e Web e ajudam o financeiro a conciliar os repasses corretamente." />
                    <PaymentMethodsSettings tenantId={tenantId} />
                </div>
            </ScrollArea >
        </div >
    )
}