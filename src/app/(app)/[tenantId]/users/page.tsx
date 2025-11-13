import { HeaderInfo } from "@/app/components/HeaderInfo";
import { getUserByAuth0Id, getUsers } from "@/actions/user.actions";
import { auth0 } from "@/lib/auth0";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default async function UsersPage({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    const session = await auth0.getSession();

    let marketId: string | null = tenantId ?? null;
    if (session?.user?.sub) {
        const backendUser = await getUserByAuth0Id(session.user.sub);
        if (backendUser.marketId) {
            marketId = backendUser.marketId;
        }
    }

    const users = marketId ? await getUsers({ marketId, page: 1, size: 100 }) : [];

    return (
        <div className="space-y-6">
            <HeaderInfo title="Usuários" description="Gerencie os usuários do sistema" />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Lista de Usuários
                    </CardTitle>
                    <CardDescription>
                        Visualize e gerencie os usuários vinculados ao mercado
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {marketId ? (
                        users.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-muted-foreground">
                                        <tr className="border-b">
                                            <th className="text-left py-2 pr-4">Nome</th>
                                            <th className="text-left py-2 pr-4">Email</th>
                                            <th className="text-left py-2 pr-4">ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} className="border-b last:border-b-0">
                                                <td className="py-2 pr-4">{u.name}</td>
                                                <td className="py-2 pr-4">{u.email}</td>
                                                <td className="py-2 pr-4 text-muted-foreground">{u.id}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Nenhum usuário vinculado encontrado.</p>
                        )
                    ) : (
                        <p className="text-muted-foreground">Seu usuário não possui um mercado vinculado.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

