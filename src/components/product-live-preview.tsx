"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

import { formatPrice as formatCurrency } from "@/app/utils/formatters"

type CropArea = { x: number; y: number; width: number; height: number }

type ProductLivePreviewProps = {
    name?: string
    price: number
    sku?: string
    categoryName?: string
    isActive: boolean
    imageUrl?: string
    zoom?: number
    cropArea?: CropArea | null
}

// Helper function to create an image element from a URL
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new window.Image()
        image.addEventListener("load", () => resolve(image))
        image.addEventListener("error", (error: ErrorEvent) => reject(error))
        image.setAttribute("crossOrigin", "anonymous")
        image.src = url
    })

// Helper function to get a cropped image blob
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: CropArea,
    outputWidth: number = pixelCrop.width,
    outputHeight: number = pixelCrop.height
): Promise<Blob | null> {
    try {
        const image = await createImage(imageSrc)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
            return null
        }

        canvas.width = outputWidth
        canvas.height = outputHeight

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            outputWidth,
            outputHeight
        )

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob)
            }, "image/jpeg")
        })
    } catch (error) {
        console.error("Error in getCroppedImg:", error)
        return null
    }
}

export default function ProductLivePreview({
    name,
    price,
    sku,
    categoryName,
    isActive,
    imageUrl,
    zoom = 1,
    cropArea,
}: ProductLivePreviewProps) {
    const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)

    // Generate cropped image in real-time when cropArea or zoom changes
    useEffect(() => {
        if (!imageUrl || !cropArea) {
            setCroppedImageUrl((prevUrl) => {
                if (prevUrl && prevUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(prevUrl)
                }
                return null
            })
            return
        }

        let isCancelled = false
        let previousUrl: string | null = null

        const generateCroppedImage = async () => {
            try {
                const croppedBlob = await getCroppedImg(imageUrl, cropArea)

                if (isCancelled) {
                    return
                }

                if (!croppedBlob) {
                    throw new Error("Failed to generate cropped image blob.")
                }

                // Revoke the old URL if it exists
                if (previousUrl && previousUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(previousUrl)
                }

                // Create a new object URL
                const newCroppedUrl = URL.createObjectURL(croppedBlob)
                previousUrl = newCroppedUrl
                setCroppedImageUrl(newCroppedUrl)
            } catch (error) {
                console.error("Error during cropping:", error)
                setCroppedImageUrl((prevUrl) => {
                    if (prevUrl && prevUrl.startsWith("blob:")) {
                        URL.revokeObjectURL(prevUrl)
                    }
                    return null
                })
            }
        }

        generateCroppedImage()

        return () => {
            isCancelled = true
            if (previousUrl && previousUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previousUrl)
            }
        }
    }, [imageUrl, cropArea, zoom])

    // Cleanup blob URLs on unmount or when imageUrl changes
    useEffect(() => {
        const currentUrl = croppedImageUrl
        return () => {
            if (currentUrl && currentUrl.startsWith("blob:")) {
                URL.revokeObjectURL(currentUrl)
            }
        }
    }, [croppedImageUrl, imageUrl])

    // Use cropped image if available, otherwise use original
    const displayImageUrl = croppedImageUrl || imageUrl
    return (
        <div className="border border-dashed border-muted-foreground/30 rounded-xl p-16">
            <div className="flex flex-col rounded-xl border bg-card shadow-sm">
                <div className="border-b p-4">
                    <h3 className="text-lg font-semibold line-clamp-2">
                        {name?.trim() || "Nome do produto em destaque"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {categoryName || "Selecione uma categoria para atualizar esta informação"}
                    </p>
                </div>
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {displayImageUrl ? (
                        <Image
                            src={displayImageUrl}
                            alt={name || "Prévia do produto"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 320px"
                            unoptimized={displayImageUrl.startsWith("blob:")}
                        />
                    ) : (
                        <div className="grid h-full place-content-center text-sm text-muted-foreground">
                            Imagem prévia aparecerá aqui
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between gap-2 border-t p-4">
                    <div className="grid gap-1">
                        <span className="text-lg font-semibold text-foreground">
                            {formatCurrency(price)}
                        </span>
                        {sku ? (
                            <span className="text-xs text-muted-foreground">SKU: {sku}</span>
                        ) : null}
                    </div>
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300"
                            }`}
                    >
                        {isActive ? "Disponível" : "Oculto"}
                    </span>
                </div>
            </div>
        </div>
    )
}

