import { getMarkets } from "@/actions/market.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ManageMarketButton from "@/components/ManageMarketButton";
import Link from "next/link";

export default async function Home() {

    const { markets } = await getMarkets({ page: 1, size: 10, ownerId: "69011ba353c5aabb5c5dd8d7" });

    return (
        <div className="h-screen w-screen p-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mercados</CardTitle>
                        <CardDescription>Mercados cadastrados</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/markets/create">
                            Cadastrar mercado
                        </Link>
                    </Button>
                </CardHeader>
                <Separator />
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Endereço</TableHead>
                                <TableHead>Logo</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {markets.map((market) => (
                                <TableRow key={market.id}>
                                    <TableCell>{market.id}</TableCell>
                                    <TableCell>{market.name}</TableCell>
                                    <TableCell>{market.address}</TableCell>
                                    <TableCell>{market.profilePicture}</TableCell>
                                    <TableCell>
                                        <ManageMarketButton marketId={market.id} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}