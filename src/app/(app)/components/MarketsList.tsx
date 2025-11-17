"use client"

import { Market } from "@/app/domain/marketDomain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { MarketStatusSwitch } from "./MarketStatusSwitch";

interface MarketsListProps {
    markets: Market[];
}

export function MarketsList({ markets }: MarketsListProps) {
    const getInitials = (value: string) =>
        value
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "MM";
    const [marketStatuses, setMarketStatuses] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        markets.forEach((market) => {
            // Try to get isOpen from market if it exists (even if not in TypeScript type)
            const marketAny = market as unknown as { isOpen?: boolean };
            initial[market.id] = marketAny.isOpen ?? true; // Default to open if not provided
        });
        return initial;
    });

    const handleStatusChange = (marketId: string, isOpen: boolean) => {
        setMarketStatuses((prev) => ({
            ...prev,
            [marketId]: isOpen,
        }));
    };

    return (
        <div className="flex flex-col gap-4">
            {markets.map((market) => {
                const isOpen = marketStatuses[market.id] ?? true;
                return (
                    <Card
                        key={market.id}
                        className="flex flex-row flex-1 border border-muted hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                    >
                        <Link
                            href={`/${market.id}/dashboard`}
                            className="flex flex-row flex-1"
                        >
                            <CardHeader className="flex flex-row flex-1 items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage
                                        src={market.profilePicture ?? undefined}
                                        alt={market.name}
                                    />
                                    <AvatarFallback className="text-lg font-semibold">
                                        {getInitials(market.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-1">
                                    <CardTitle className="text-2xl">
                                        {market.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {market.address}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                        </Link>
                        <CardContent className="flex items-center justify-center gap-4">
                            <Badge
                                variant="outline"
                                className="flex items-center justify-center gap-2"
                            >
                                <span className="relative flex size-2">
                                    <span
                                        className={`relative inline-flex size-2 rounded-full ${
                                            isOpen
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                        }`}
                                    ></span>
                                </span>
                                <span>{isOpen ? "Aberto" : "Fechado"}</span>
                            </Badge>
                            <div
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <MarketStatusSwitch
                                    marketId={market.id}
                                    marketName={market.name}
                                    initialStatus={isOpen}
                                    onStatusChange={(newStatus) =>
                                        handleStatusChange(market.id, newStatus)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

