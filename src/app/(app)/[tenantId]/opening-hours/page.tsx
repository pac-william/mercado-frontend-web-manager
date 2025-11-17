import { HeaderInfo } from "@/app/components/HeaderInfo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OpeningHoursClient } from "./components/OpeningHoursClient";

type OpeningHoursPageParams = {
    tenantId: string;
};

type OpeningHoursPageProps = {
    params: Promise<OpeningHoursPageParams>;
};

export default async function OpeningHoursPage({ params }: OpeningHoursPageProps) {
    const { tenantId } = await params;

    return (
        <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto pr-4">
            <div className="flex flex-1 flex-col gap-6">
                <HeaderInfo 
                    title="Horários de Funcionamento" 
                    description="Configure os horários de abertura e fechamento do mercado" 
                />

                <OpeningHoursClient marketId={tenantId} />
            </div>
        </ScrollArea>
    );
}
