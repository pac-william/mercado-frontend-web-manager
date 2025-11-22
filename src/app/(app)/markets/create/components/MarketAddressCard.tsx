"use client"

import GoogleMaps from "@/app/components/GoogleMaps"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { type AddressDTO as AddressFormValues } from "@/dtos/addressDTO"
import { Pencil, Trash2 } from "lucide-react"

interface MarketAddressCardProps {
    address: AddressFormValues
    onEdit: () => void
    onRemove?: () => void
    showRemove?: boolean
}

export function MarketAddressCard({ address, onEdit, onRemove, showRemove = true }: MarketAddressCardProps) {
    const hasLocation = address.latitude !== null && address.latitude !== undefined &&
        address.longitude !== null && address.longitude !== undefined

    return (
        <Card className="flex flex-col flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-card-foreground">{address.name}</CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon_xs"
                        className="rounded-full"
                        onClick={onEdit}
                    >
                        <Pencil size={14} />
                    </Button>
                    {showRemove && onRemove && (
                        <Button
                            variant="ghost"
                            size="icon_xs"
                            className="text-xs rounded-full text-destructive hover:text-destructive/80"
                            onClick={onRemove}
                        >
                            <Trash2 size={14} />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-col flex-1 p-4 gap-4">
                <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                        {address.street}, {address.number}
                        {address.complement && ` - ${address.complement}`}
                    </p>
                    <p>{address.neighborhood}</p>
                    <p>
                        {address.city} - {address.state}, {address.zipCode}
                    </p>
                </div>
                <GoogleMaps
                    latitude={address.latitude}
                    longitude={address.longitude}
                    height="220px"
                    zoom={hasLocation ? 16 : 12}
                    interactive={false}
                />
            </CardContent>
        </Card>
    )
}

