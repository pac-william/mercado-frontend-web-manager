"use server";

import { baseUrl } from "@/config/server";
import { auth0 } from "@/lib/auth0";

interface ReverseGeocodeResult {
    address: string;
    formattedAddress?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    latitude: number;
    longitude: number;
}

export const reverseGeocode = async (
    latitude: number,
    longitude: number
): Promise<ReverseGeocodeResult> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(
            `${baseUrl}/api/v1/geo-location/decode?latitude=${latitude}&longitude=${longitude}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.tokenSet.idToken}`,
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 404) {
                throw new Error("Endereço não encontrado para as coordenadas fornecidas");
            }
            throw new Error("Erro ao buscar endereço das coordenadas");
        }

        const data = (await response.json()) as ReverseGeocodeResult;
        return data;
    } catch (error) {
        console.error("Erro ao buscar endereço:", error);
        throw error;
    }
};

