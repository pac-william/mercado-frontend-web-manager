"use client";

import { Product } from "@/app/domain/productDomain";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { formatPrice } from "@/app/utils/formatters";

interface OrderItemCardProps {
    product: Product;
    quantity: number;
    price: number;
}

export function OrderItemCard({ product, quantity, price }: OrderItemCardProps) {
    const getImageSrc = () => {
        if (product.image && isValidUrl(product.image)) {
            return product.image;
        }
        return "https://ibassets.com.br/ib.item.image.medium/m-20161111154302022002734292c24125421585da814b5db62401.jpg";
    };

    const isValidUrl = (string: string) => {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <Card className="flex flex-row gap-4 p-4 hover:bg-muted/50 transition-colors">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border">
                <Image 
                    src={getImageSrc()} 
                    alt={product.name} 
                    fill
                    className="object-cover"
                />
            </div>
            <CardContent className="flex-1 flex flex-col justify-between p-0">
                <div>
                    <h4 className="font-semibold text-base mb-1">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                        Quantidade: {quantity} × {formatPrice(price)}
                    </p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        Subtotal
                    </span>
                    <span className="font-bold text-lg text-primary">
                        {formatPrice(price * quantity)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

