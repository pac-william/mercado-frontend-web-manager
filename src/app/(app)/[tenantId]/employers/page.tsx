import { HeaderInfo } from "@/app/components/HeaderInfo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase } from "lucide-react";
import { EmployersList } from "./components/EmployersList";

type EmployersPageParams = {
    tenantId: string;
};

type EmployersPageProps = {
    params: Promise<EmployersPageParams>;
};

export default async function EmployersPage({ params }: EmployersPageProps) {
    const { tenantId } = await params;
    void tenantId; // Será usado quando a funcionalidade completa for implementada

    return (
        <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto pr-4">
            <div className="flex flex-1 flex-col gap-6">
                <HeaderInfo 
                    title="Funcionários" 
                    description="Gerencie os funcionários e suas permissões no mercado" 
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Lista de Funcionários
                        </CardTitle>
                        <CardDescription>
                            Visualize e gerencie os funcionários vinculados ao mercado. Altere a role de cada funcionário conforme necessário.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EmployersList />
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    );
}
