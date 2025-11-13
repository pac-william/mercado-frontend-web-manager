"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
    ArrowLeftIcon,
    CircleUserRoundIcon,
    XIcon,
    ZoomInIcon,
    ZoomOutIcon,
} from "lucide-react"
import NextImage from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { updateMarket } from "@/actions/market.actions"
import { uploadFile } from "@/actions/upload.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Cropper,
    CropperCropArea,
    CropperDescription,
    CropperImage,
} from "@/components/ui/cropper"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useFileUpload } from "@/hooks/use-file-upload"

type Area = { x: number; y: number; width: number; height: number }

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener("load", () => resolve(image))
        image.addEventListener("error", (error: unknown) => reject(error))
        image.setAttribute("crossOrigin", "anonymous")
        image.src = url
    })

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
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

const marketSettingsSchema = z.object({
    name: z.string().min(1, "Nome do mercado é obrigatório"),
    address: z.string().min(1, "Endereço é obrigatório"),
    contactEmail: z.string().email("E-mail inválido").optional(),
    contactPhone: z.string().optional(),
    whatsappNumber: z.string().optional(),
    profilePicture: z.any().optional(),
    isActive: z.boolean(),
})

export type MarketSettingsFormValues = z.infer<typeof marketSettingsSchema>

export type MarketSettingsInitialData = Partial<MarketSettingsFormValues> & {
    profilePicture?: string | null
    ownerId?: string | null
    managersIds?: string[] | null
}

type MarketSettingsClientProps = {
    tenantId: string
    initialMarket: MarketSettingsInitialData
}

export function MarketSettingsClient({ tenantId, initialMarket }: MarketSettingsClientProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [finalImageUrl, setFinalImageUrl] = useState<string | null>(initialMarket.profilePicture ?? null)
    const [finalImageFile, setFinalImageFile] = useState<File | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [zoom, setZoom] = useState(1)

    const previousFileIdRef = useRef<string | undefined | null>(null)

    const [
        { files, isDragging },
        {
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            openFileDialog,
            removeFile,
            getInputProps,
        },
    ] = useFileUpload({
        accept: "image/*",
        maxSize: 5 * 1024 * 1024,
        multiple: false,
    })

    const previewUrl = files[0]?.preview ?? null
    const fileId = files[0]?.id
    const originalFile = files[0]?.file

    const form = useForm<MarketSettingsFormValues>({
        resolver: zodResolver(marketSettingsSchema),
        defaultValues: {
            name: initialMarket.name ?? "",
            address: initialMarket.address ?? "",
            contactEmail: initialMarket.contactEmail ?? undefined,
            contactPhone: initialMarket.contactPhone ?? undefined,
            whatsappNumber: initialMarket.whatsappNumber ?? undefined,
            profilePicture: undefined,
            isActive: initialMarket.isActive ?? true,
        },
        mode: "onChange",
    })

    useEffect(() => {
        form.reset({
            name: initialMarket.name ?? "",
            address: initialMarket.address ?? "",
            contactEmail: initialMarket.contactEmail ?? undefined,
            contactPhone: initialMarket.contactPhone ?? undefined,
            whatsappNumber: initialMarket.whatsappNumber ?? undefined,
            profilePicture: undefined,
            isActive: initialMarket.isActive ?? true,
        })
        setFinalImageUrl(initialMarket.profilePicture ?? null)
    }, [initialMarket, form])

    const handleCropChange = useCallback((pixels: Area | null) => {
        setCroppedAreaPixels(pixels)
    }, [])

    const revokeFinalUrl = useCallback((url: string | null) => {
        if (url && url.startsWith("blob:")) {
            URL.revokeObjectURL(url)
        }
    }, [])

    const closeCropDialog = useCallback(
        (targetFileId?: string) => {
            const uploadId = targetFileId ?? fileId
            if (uploadId) {
                removeFile(uploadId)
            }
            setCroppedAreaPixels(null)
            setZoom(1)
            setIsDialogOpen(false)
        },
        [fileId, removeFile]
    )

    const handleApply = useCallback(async () => {
        if (!previewUrl || !fileId || !croppedAreaPixels) {
            console.error("Missing data for apply:", { previewUrl, fileId, croppedAreaPixels })
            return
        }

        try {
            const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels)

            if (!croppedBlob) {
                throw new Error("Falha ao gerar imagem recortada.")
            }

            const currentUrl = finalImageUrl
            const fileName =
                originalFile instanceof File
                    ? originalFile.name
                    : `market-avatar-${Date.now()}.jpg`
            const croppedFile = new File([croppedBlob], fileName, {
                type: croppedBlob.type || "image/jpeg",
            })

            revokeFinalUrl(currentUrl)
            const newUrl = URL.createObjectURL(croppedFile)

            setFinalImageFile(croppedFile)
            setFinalImageUrl(newUrl)
            form.setValue("profilePicture", croppedFile)
            form.clearErrors("profilePicture")

            closeCropDialog(fileId)
        } catch (error) {
            console.error("Error during apply:", error)
            toast.error("Não foi possível aplicar o recorte da imagem.")
            closeCropDialog(fileId)
        }
    }, [
        closeCropDialog,
        croppedAreaPixels,
        fileId,
        finalImageUrl,
        form,
        originalFile,
        previewUrl,
        revokeFinalUrl,
    ])

    const handleRemoveFinalImage = useCallback(() => {
        revokeFinalUrl(finalImageUrl)
        setFinalImageUrl(null)
        setFinalImageFile(null)
        form.setValue("profilePicture", undefined)
    }, [finalImageUrl, form, revokeFinalUrl])

    useEffect(() => {
        const currentFinalUrl = finalImageUrl
        return () => {
            revokeFinalUrl(currentFinalUrl)
        }
    }, [finalImageUrl, revokeFinalUrl])

    useEffect(() => {
        if (fileId && fileId !== previousFileIdRef.current) {
            setIsDialogOpen(true)
            setCroppedAreaPixels(null)
            setZoom(1)
        }
        previousFileIdRef.current = fileId
    }, [fileId])

    const handleDialogOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                closeCropDialog()
            } else {
                setIsDialogOpen(true)
            }
        },
        [closeCropDialog]
    )

    const onSubmit = useCallback(
        async (values: MarketSettingsFormValues) => {
            if (isSaving) return

            setIsSaving(true)
            try {
                let uploadedImageUrl: string | undefined =
                    typeof initialMarket.profilePicture === "string" ? initialMarket.profilePicture : undefined

                if (finalImageFile) {
                    const uploadResult = await uploadFile({
                        file: finalImageFile,
                        folder: `markets/${tenantId}`,
                    })

                    uploadedImageUrl = uploadResult.url
                    setFinalImageUrl(uploadResult.url)
                }

                const payload = {
                    name: values.name,
                    address: values.address,
                    profilePicture: uploadedImageUrl,
                } as {
                    name: string
                    address: string
                    profilePicture?: string
                    ownerId?: string
                    managersIds?: string[]
                }

                if (initialMarket.ownerId) {
                    payload.ownerId = initialMarket.ownerId
                }

                if (initialMarket.managersIds && initialMarket.managersIds.length > 0) {
                    payload.managersIds = initialMarket.managersIds
                }

                await updateMarket(tenantId, payload)

                toast.success("Configurações salvas com sucesso.")
            } catch (error) {
                console.error(error)
                toast.error("Não foi possível salvar as configurações.")
            } finally {
                setIsSaving(false)
            }
        },
        [finalImageFile, initialMarket.managersIds, initialMarket.ownerId, initialMarket.profilePicture, isSaving, tenantId]
    )

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Informações Gerais</CardTitle>
                    <CardDescription>
                        Atualize os dados exibidos para os seus clientes.
                    </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="flex flex-col gap-4 pt-6 space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative inline-flex">
                            <button
                                type="button"
                                className="relative flex cursor-pointer size-24 items-center justify-center overflow-hidden rounded-full border border-dashed border-input transition-colors outline-none hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none data-[dragging=true]:bg-accent/50"
                                onClick={openFileDialog}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                data-dragging={isDragging || undefined}
                                aria-label={finalImageUrl ? "Alterar imagem" : "Enviar imagem"}
                                disabled={isSaving}
                            >
                                {finalImageUrl ? (
                                    <NextImage
                                        src={finalImageUrl}
                                        alt="Logo do mercado"
                                        width={96}
                                        height={96}
                                        className="size-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <CircleUserRoundIcon className="size-6 opacity-60" aria-hidden="true" />
                                )}
                            </button>

                            {finalImageUrl && (
                                <Button
                                    type="button"
                                    onClick={handleRemoveFinalImage}
                                    size="icon"
                                    variant="secondary"
                                    className="absolute -top-1 -right-1 size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background"
                                    aria-label="Remover imagem"
                                    disabled={isSaving}
                                >
                                    <XIcon className="size-3.5" aria-hidden="true" />
                                </Button>
                            )}

                            <input
                                {...getInputProps()}
                                className="sr-only"
                                aria-label="Upload de imagem"
                                tabIndex={-1}
                                disabled={isSaving}
                            />
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Formatos aceitos: JPG ou PNG até 5MB.
                        </p>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do mercado</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex.: Supermercado Central"
                                                    disabled={isSaving}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-1">
                                            <FormLabel>Endereço</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Rua, número, bairro, cidade"
                                                    disabled={isSaving}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="contactEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-mail de contato</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="contato@mercado.com"
                                                    disabled={isSaving}
                                                    value={field.value ?? ""}
                                                    onChange={(event) => field.onChange(event.target.value)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="contactPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Telefone fixo</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="(31) 1234-5678"
                                                    disabled={isSaving}
                                                    value={field.value ?? ""}
                                                    onChange={(event) => field.onChange(event.target.value)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="whatsappNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>WhatsApp</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="(31) 91234-5678"
                                                    disabled={isSaving}
                                                    value={field.value ?? ""}
                                                    onChange={(event) => field.onChange(event.target.value)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Mercado ativo</FormLabel>
                                            <CardDescription>
                                                Controle se o mercado está visível para os clientes.
                                            </CardDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isSaving}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end pt-2">
                                <Button type="submit" className="min-w-[160px]" disabled={isSaving}>
                                    {isSaving ? "Salvando..." : "Salvar alterações"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogContent className="gap-0 p-0 sm:max-w-140 *:[button]:hidden">
                    <DialogDescription className="sr-only">Crop image dialog</DialogDescription>
                    <DialogHeader className="contents space-y-0 text-left">
                        <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="-my-1 opacity-60"
                                    onClick={() => handleDialogOpenChange(false)}
                                    aria-label="Cancelar"
                                >
                                    <ArrowLeftIcon aria-hidden="true" />
                                </Button>
                                <span>Recortar imagem</span>
                            </div>
                            <Button type="button" className="-my-1" onClick={handleApply} disabled={!previewUrl}>
                                Aplicar
                            </Button>
                        </DialogTitle>
                    </DialogHeader>

                    {previewUrl && (
                        <Cropper className="h-96 sm:h-120" image={previewUrl} zoom={zoom} onCropChange={handleCropChange} onZoomChange={setZoom}>
                            <CropperDescription />
                            <CropperImage />
                            <CropperCropArea />
                        </Cropper>
                    )}

                    <DialogFooter className="border-t px-4 py-6">
                        <div className="mx-auto flex w-full max-w-80 items-center gap-4">
                            <ZoomOutIcon className="shrink-0 opacity-60" size={16} aria-hidden="true" />
                            <Slider
                                defaultValue={[1]}
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(value) => setZoom(value[0])}
                                aria-label="Zoom slider"
                            />
                            <ZoomInIcon className="shrink-0 opacity-60" size={16} aria-hidden="true" />
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}