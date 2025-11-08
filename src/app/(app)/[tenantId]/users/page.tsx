import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
                <p className="text-muted-foreground">
                    Gerencie os usuários do sistema
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Lista de Usuários
                    </CardTitle>
                    <CardDescription>
                        Visualize e gerencie os usuários cadastrados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Esta página será implementada em breve.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

