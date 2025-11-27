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
        <Card id="market-address-card" className="flex flex-col flex-1">
            <CardHeader id="market-address-card-header" className="flex flex-row items-center justify-between">
                <CardTitle id="market-address-card-title" className="text-card-foreground">{address.name}</CardTitle>
                <div id="market-address-card-actions" className="flex items-center gap-2">
                    <Button
                        id="market-address-card-edit-button"
                        variant="ghost"
                        size="icon_xs"
                        className="rounded-full"
                        onClick={onEdit}
                    >
                        <Pencil id="market-address-card-edit-button-icon" size={14} />
                    </Button>
                    {showRemove && onRemove && (
                        <Button
                            id="market-address-card-remove-button"
                            variant="ghost"
                            size="icon_xs"
                            className="text-xs rounded-full text-destructive hover:text-destructive/80"
                            onClick={onRemove}
                        >
                            <Trash2 id="market-address-card-remove-button-icon" size={14} />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <Separator id="market-address-card-separator" />
            <CardContent id="market-address-card-content" className="flex flex-col flex-1 p-4 gap-4">
                <div id="market-address-card-address-info" className="space-y-1 text-sm text-muted-foreground">
                    <p id="market-address-card-street-number">
                        {address.street}, {address.number}
                        {address.complement && ` - ${address.complement}`}
                    </p>
                    <p id="market-address-card-neighborhood">{address.neighborhood}</p>
                    <p id="market-address-card-city-state-zip">
                        {address.city} - {address.state}, {address.zipCode}
                    </p>
                </div>
                <div id="market-address-card-map-container">
                    <GoogleMaps
                        latitude={address.latitude}
                        longitude={address.longitude}
                        height="220px"
                        zoom={hasLocation ? 16 : 12}
                        interactive={false}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

