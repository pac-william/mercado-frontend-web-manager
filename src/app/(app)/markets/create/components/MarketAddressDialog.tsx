"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { reverseGeocode } from "@/actions/geocoding.actions"
import GoogleMaps from "@/app/components/GoogleMaps"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AddressDTO as addressSchema, type AddressDTO as AddressFormValues } from "@/dtos/addressDTO"
import { Navigation } from "lucide-react"

interface MarketAddressDialogProps {
    initialValues?: Partial<AddressFormValues>;
    onAddressSelect: (address: AddressFormValues) => void;
    selectedAddress?: AddressFormValues | null;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function MarketAddressDialog({
    initialValues,
    onAddressSelect,
    selectedAddress,
    defaultOpen = false,
    onOpenChange
}: MarketAddressDialogProps) {
    const [open, setOpen] = useState(defaultOpen)
    const [isFetchingCep, setIsFetchingCep] = useState(false)
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const lastFetchedCepRef = useRef<string | null>(null)

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            name: initialValues?.name ?? "Endereço do mercado",
            street: initialValues?.street ?? "",
            number: initialValues?.number ?? "",
            neighborhood: initialValues?.neighborhood ?? "",
            city: initialValues?.city ?? "",
            state: initialValues?.state ?? "",
            zipCode: initialValues?.zipCode ?? "",
            complement: initialValues?.complement ?? "",
            isFavorite: false,
            isActive: true,
            latitude: initialValues?.latitude ?? undefined,
            longitude: initialValues?.longitude ?? undefined,
        },
    })

    useEffect(() => {
        if (initialValues) {
            form.reset({
                name: initialValues.name ?? "Endereço do mercado",
                street: initialValues.street ?? "",
                number: initialValues.number ?? "",
                neighborhood: initialValues.neighborhood ?? "",
                city: initialValues.city ?? "",
                state: initialValues.state ?? "",
                zipCode: initialValues.zipCode ?? "",
                complement: initialValues.complement ?? "",
                isFavorite: false,
                isActive: true,
                latitude: initialValues.latitude ?? undefined,
                longitude: initialValues.longitude ?? undefined,
            })
        }
    }, [initialValues, form])

    const zipCodeValue = form.watch("zipCode")
    const latitudeValue = form.watch("latitude")
    const longitudeValue = form.watch("longitude")
    const hasLocation = latitudeValue !== undefined && latitudeValue !== null &&
        longitudeValue !== undefined && longitudeValue !== null

    useEffect(() => {
        const sanitizedCep = zipCodeValue?.replace(/\D/g, "") ?? ""

        if (sanitizedCep.length !== 8 || sanitizedCep === lastFetchedCepRef.current) {
            if (sanitizedCep.length < 8) {
                form.clearErrors("zipCode")
                form.setValue("latitude", undefined, {
                    shouldDirty: false,
                    shouldTouch: false,
                    shouldValidate: false,
                })
                form.setValue("longitude", undefined, {
                    shouldDirty: false,
                    shouldTouch: false,
                    shouldValidate: false,
                })
            }
            return
        }

        const fetchCoordinates = async (cep: string) => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=Brazil&format=json`,
                    {
                        headers: {
                            "Accept": "application/json",
                        },
                    },
                )
                if (!response.ok) {
                    return
                }

                const data: Array<{ lat: string; lon: string }> = await response.json()
                if (!Array.isArray(data) || data.length === 0) {
                    return
                }

                const { lat, lon } = data[0]
                const latitude = Number.parseFloat(lat)
                const longitude = Number.parseFloat(lon)

                if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
                    form.setValue("latitude", latitude, { shouldDirty: true, shouldValidate: true })
                    form.setValue("longitude", longitude, { shouldDirty: true, shouldValidate: true })
                }
            } catch (error) {
                console.error("Erro ao buscar coordenadas do CEP:", error)
            }
        }

        const fetchCep = async () => {
            setIsFetchingCep(true)
            try {
                const response = await fetch(`https://viacep.com.br/ws/${sanitizedCep}/json/`)
                if (!response.ok) {
                    throw new Error("Não foi possível buscar o CEP")
                }

                const data: {
                    erro?: boolean
                    logradouro?: string
                    bairro?: string
                    localidade?: string
                    uf?: string
                    complemento?: string
                } = await response.json()

                if (data.erro) {
                    const message = "CEP não encontrado"
                    form.setError("zipCode", { message })
                    toast.error(message)
                    return
                }

                const currentZip = form.getValues("zipCode").replace(/\D/g, "")
                if (currentZip !== sanitizedCep) {
                    return
                }

                form.clearErrors("zipCode")
                lastFetchedCepRef.current = sanitizedCep

                if (data.logradouro) {
                    form.setValue("street", data.logradouro, { shouldDirty: true })
                }
                if (data.bairro) {
                    form.setValue("neighborhood", data.bairro, { shouldDirty: true })
                }
                if (data.localidade) {
                    form.setValue("city", data.localidade, { shouldDirty: true })
                }
                if (data.uf) {
                    form.setValue("state", data.uf, { shouldDirty: true })
                }
                if (data.complemento) {
                    form.setValue("complement", data.complemento, { shouldDirty: true })
                }

                await fetchCoordinates(sanitizedCep)
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Erro ao consultar CEP"
                form.setError("zipCode", { message })
                toast.error(message)
            } finally {
                setIsFetchingCep(false)
            }
        }

        fetchCep()
    }, [zipCodeValue, form])

    useEffect(() => {
        setOpen(defaultOpen)
    }, [defaultOpen])

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen)
        onOpenChange?.(nextOpen)
        if (!nextOpen) {
            form.reset({
                name: "Endereço do mercado",
                street: "",
                number: "",
                neighborhood: "",
                city: "",
                state: "",
                zipCode: "",
                complement: "",
                isFavorite: false,
                isActive: true,
                latitude: undefined,
                longitude: undefined,
            })
            form.clearErrors()
            lastFetchedCepRef.current = null
            setIsFetchingCep(false)
        }
    }

    const handleLocationChange = (coordinates: { latitude: number; longitude: number }) => {
        form.setValue("latitude", coordinates.latitude, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
        form.setValue("longitude", coordinates.longitude, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    }

    const handleGetLocation = async () => {
        if (!navigator.geolocation) {
            toast.error("Geolocalização não é suportada pelo seu navegador")
            return
        }

        setIsLoadingLocation(true)

        try {
            try {
                if (navigator.permissions) {
                    const permissionStatus = await navigator.permissions.query({ name: "geolocation" as PermissionName })
                    if (permissionStatus.state === "denied") {
                        toast.error("Permissão de localização negada. Por favor, permita o acesso à localização nas configurações do navegador.")
                        setIsLoadingLocation(false)
                        return
                    }
                }
            } catch {
                //
            }
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    }
                )
            })

            const { latitude, longitude } = position.coords
            const addressData = await reverseGeocode(latitude, longitude)

            if (addressData.street) {
                form.setValue("street", addressData.street, { shouldDirty: true })
            }
            if (addressData.number) {
                form.setValue("number", addressData.number, { shouldDirty: true })
            }
            if (addressData.neighborhood) {
                form.setValue("neighborhood", addressData.neighborhood, { shouldDirty: true })
            }
            if (addressData.city) {
                form.setValue("city", addressData.city, { shouldDirty: true })
            }
            if (addressData.state) {
                form.setValue("state", addressData.state, { shouldDirty: true })
            }
            if (addressData.zipCode) {
                form.setValue("zipCode", addressData.zipCode.replace(/\D/g, "").replace(/(\d{5})(\d{0,3})/, (_, p1: string, p2: string) => p2 ? `${p1}-${p2}` : p1), { shouldDirty: true })
            }
            form.setValue("latitude", addressData.latitude, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
            form.setValue("longitude", addressData.longitude, { shouldDirty: true, shouldTouch: true, shouldValidate: true })

            toast.success("Endereço encontrado e preenchido automaticamente!")
        } catch (error) {
            if (error instanceof GeolocationPositionError) {
                if (error.code === error.PERMISSION_DENIED) {
                    toast.error("Permissão de localização negada. Por favor, permita o acesso à localização.")
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    toast.error("Localização indisponível. Tente novamente mais tarde.")
                } else if (error.code === error.TIMEOUT) {
                    toast.error("Tempo esgotado ao buscar localização. Tente novamente.")
                } else {
                    toast.error("Erro ao buscar localização. Tente novamente.")
                }
            } else if (error instanceof Error) {
                toast.error(error.message || "Erro ao buscar endereço. Tente novamente.")
            } else {
                toast.error("Erro ao buscar endereço. Tente novamente.")
            }
        } finally {
            setIsLoadingLocation(false)
        }
    }

    const onSubmit = (values: AddressFormValues) => {
        const addressData: AddressFormValues = {
            ...values,
            name: values.name.trim(),
            street: values.street.trim(),
            number: values.number.trim(),
            neighborhood: values.neighborhood.trim(),
            city: values.city.trim(),
            state: values.state.trim(),
            zipCode: values.zipCode.trim(),
            complement: values.complement?.trim() || undefined,
            isFavorite: false,
            isActive: true,
            latitude: values.latitude ?? undefined,
            longitude: values.longitude ?? undefined,
        }
        onAddressSelect(addressData)
        toast.success("Endereço selecionado")
        handleOpenChange(false)
        // Não criar mercado aqui - apenas selecionar o endereço
    }

    return (
        <Form {...form}>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="flex flex-col flex-1 sm:max-w-[520px] h-[90vh] p-0 gap-0">
                    <DialogHeader className="p-4">
                        <DialogTitle>Endereço do mercado</DialogTitle>
                        <DialogDescription>
                            Preencha as informações abaixo para cadastrar o endereço do mercado.
                        </DialogDescription>
                    </DialogHeader>

                    <Separator />

                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1">
                        <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto p-4 space-y-4">
                            <div className="flex flex-col flex-1 gap-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleGetLocation}
                                        disabled={isLoadingLocation}
                                        className="w-full sm:col-span-2"
                                    >
                                        <Navigation className="mr-2 size-4" />
                                        {isLoadingLocation ? "Buscando localização..." : "Usar minha localização atual"}
                                    </Button>
                                    <FormField
                                        control={form.control}
                                        name="zipCode"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>CEP</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="00000-000"
                                                        {...field}
                                                        value={field.value}
                                                        onChange={(event) => {
                                                            const digitsOnly = event.target.value
                                                                .replace(/\D/g, "")
                                                                .slice(0, 8)
                                                            const formatted = digitsOnly.replace(
                                                                /(\d{5})(\d{0,3})/,
                                                                (_, p1: string, p2: string) =>
                                                                    p2 ? `${p1}-${p2}` : p1,
                                                            )
                                                            lastFetchedCepRef.current = null
                                                            field.onChange(formatted)
                                                        }}
                                                        onBlur={(event) => {
                                                            field.onBlur()
                                                            const digitsOnly = event.target.value.replace(/\D/g, "")
                                                            if (digitsOnly.length !== 8) {
                                                                form.setError("zipCode", {
                                                                    message: "Informe um CEP válido com 8 dígitos",
                                                                })
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>Identificação do endereço</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Endereço do mercado" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="street"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>Rua</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Rua das Flores" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Número</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="complement"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Complemento (opcional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Apto 101" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="neighborhood"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bairro</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Centro" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="latitude"
                                        render={({ field }) => (
                                            <input type="hidden" {...field} value={field.value ?? ""} />
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="longitude"
                                        render={({ field }) => (
                                            <input type="hidden" {...field} value={field.value ?? ""} />
                                        )}
                                    />
                                    <div className="grid sm:grid-cols-3 gap-4 sm:col-span-1">
                                        <FormField
                                            control={form.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem className="sm:col-span-2">
                                                    <FormLabel>Cidade</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="São Paulo" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="state"
                                            render={({ field }) => (
                                                <FormItem className="sm:col-span-1">
                                                    <FormLabel>Estado</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="SP" maxLength={2} {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <GoogleMaps
                                    latitude={latitudeValue}
                                    longitude={longitudeValue}
                                    height="260px"
                                    zoom={hasLocation ? 16 : 12}
                                    controls={false}
                                    onLocationChange={handleLocationChange}
                                />
                            </div>
                        </ScrollArea>
                        
                        <Separator />

                        {form.formState.errors.root?.message ? (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.root.message}
                            </p>
                        ) : null}
                        <DialogFooter className="gap-2 p-4">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isFetchingCep}>
                                {isFetchingCep
                                    ? "Consultando CEP..."
                                    : "Selecionar endereço"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Form>
    )
}

