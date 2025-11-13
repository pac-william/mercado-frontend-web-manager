import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const placeholders = Array.from({ length: 3 });

export default function Loading() {
    return (
        <div className="flex flex-col flex-1 h-screen p-6 gap-6 container mx-auto">
            <Card>
                <CardHeader className="gap-6 md:flex md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border border-primary/30 bg-background shadow-sm">
                            <AvatarFallback className="p-0">
                                <Skeleton className="h-full w-full rounded-full" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <CardTitle className="text-3xl">
                                <Skeleton className="h-6 w-48" />
                            </CardTitle>
                            <CardDescription>
                                <Skeleton className="h-4 w-64" />
                            </CardDescription>
                        </div>
                    </div>
                    <div className="grid gap-2 text-sm text-muted-foreground md:text-right">
                        <Skeleton className="h-4 w-32 md:ml-auto" />
                        <Skeleton className="h-4 w-24 md:ml-auto" />
                        <Skeleton className="h-4 w-28 md:ml-auto" />
                        <Skeleton className="h-4 w-20 md:ml-auto" />
                    </div>
                </CardHeader>
            </Card>
            <Card className="flex flex-col flex-1">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle>
                            <Skeleton className="h-5 w-40" />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className="h-4 w-56" />
                        </CardDescription>
                    </div>
                    <Skeleton className="h-10 w-36 rounded-md" />
                </CardHeader>
                <Separator />
                <CardContent className="flex flex-col flex-1 p-0 m-4">
                    <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto pr-4">
                        <div className="flex flex-col gap-4">
                            {placeholders.map((_, index) => (
                                <Card
                                    key={index}
                                    className="flex flex-row flex-1 border border-muted"
                                >
                                    <CardHeader className="flex flex-row flex-1 items-center gap-4">
                                        <Skeleton className="h-16 w-16 rounded-full" />
                                        <div className="flex flex-col gap-2">
                                            <CardTitle className="text-2xl">
                                                <Skeleton className="h-5 w-48" />
                                            </CardTitle>
                                            <CardDescription>
                                                <Skeleton className="h-4 w-64" />
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-center">
                                        <Badge variant="outline" className="flex items-center justify-center gap-2 px-4 py-2">
                                            <Skeleton className="h-2 w-2 rounded-full" />
                                            <Skeleton className="h-4 w-16" />
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}