"use server";

import { Campaign } from "@/app/domain/campaignDomain";
import { baseUrl } from "@/config/server";
import { CampaignDTO, CampaignUpdateDTO } from "@/dtos/campaignDTO";
import { auth0 } from "@/lib/auth0";
import { buildSearchParams } from "@/lib/misc";

type CampaignResponse = {
    id: string;
    marketId: string;
    title: string;
    imageUrl: string;
    slot: number;
    startDate: string;
    endDate: string | null;
    status: Campaign["status"];
    createdAt: string;
    updatedAt: string;
};

export const getCampaignsByMarket = async (
    marketId: string,
    status?: "DRAFT" | "SCHEDULED" | "ACTIVE" | "EXPIRED"
): Promise<Campaign[]> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const params = buildSearchParams({
            status,
        });

        const response = await fetch(
            `${baseUrl}/api/v1/campaigns/market/${marketId}?${params.toString()}`,
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
            const errorData = await response.json().catch(() => ({ message: "Erro ao buscar campanhas" }));
            throw new Error(errorData.message || "Erro ao buscar campanhas");
        }

        const data = (await response.json()) as CampaignResponse[];
        return data.map(
            (campaign) => ({
                id: campaign.id,
                marketId: campaign.marketId,
                title: campaign.title,
                imageUrl: campaign.imageUrl,
                slot: campaign.slot,
                startDate: new Date(campaign.startDate),
                endDate: campaign.endDate ? new Date(campaign.endDate) : null,
                status: campaign.status,
                createdAt: new Date(campaign.createdAt),
                updatedAt: new Date(campaign.updatedAt),
            } as Campaign)
        );
    } catch (error) {
        console.error("Erro ao buscar campanhas:", error);
        throw error;
    }
};

export const getCampaignById = async (id: string): Promise<Campaign> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/campaigns/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.tokenSet.idToken}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 404) {
                throw new Error("Campanha não encontrada");
            }
            throw new Error("Erro ao buscar campanha");
        }

        const campaign = (await response.json()) as CampaignResponse;
        return {
            id: campaign.id,
            marketId: campaign.marketId,
            title: campaign.title,
            imageUrl: campaign.imageUrl,
            slot: campaign.slot,
            startDate: new Date(campaign.startDate),
            endDate: campaign.endDate ? new Date(campaign.endDate) : null,
            status: campaign.status,
            createdAt: new Date(campaign.createdAt),
            updatedAt: new Date(campaign.updatedAt),
        } as Campaign;
    } catch (error) {
        console.error("Erro ao buscar campanha:", error);
        throw error;
    }
};

export const createCampaign = async (data: CampaignDTO): Promise<Campaign> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/campaigns`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.tokenSet.idToken}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || "Erro de validação");
            }
            throw new Error("Erro ao criar campanha");
        }

        const campaign = (await response.json()) as CampaignResponse;
        return {
            id: campaign.id,
            marketId: campaign.marketId,
            title: campaign.title,
            imageUrl: campaign.imageUrl,
            slot: campaign.slot,
            startDate: new Date(campaign.startDate),
            endDate: campaign.endDate ? new Date(campaign.endDate) : null,
            status: campaign.status,
            createdAt: new Date(campaign.createdAt),
            updatedAt: new Date(campaign.updatedAt),
        } as Campaign;
    } catch (error) {
        console.error("Erro ao criar campanha:", error);
        throw error;
    }
};

export const updateCampaign = async (
    id: string,
    data: CampaignUpdateDTO
): Promise<Campaign> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/campaigns/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.tokenSet.idToken}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 404) {
                throw new Error("Campanha não encontrada");
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || "Erro de validação");
            }
            throw new Error("Erro ao atualizar campanha");
        }

        const campaign = (await response.json()) as CampaignResponse;
        return {
            id: campaign.id,
            marketId: campaign.marketId,
            title: campaign.title,
            imageUrl: campaign.imageUrl,
            slot: campaign.slot,
            startDate: new Date(campaign.startDate),
            endDate: campaign.endDate ? new Date(campaign.endDate) : null,
            status: campaign.status,
            createdAt: new Date(campaign.createdAt),
            updatedAt: new Date(campaign.updatedAt),
        } as Campaign;
    } catch (error) {
        console.error("Erro ao atualizar campanha:", error);
        throw error;
    }
};

export const activateCampaign = async (id: string): Promise<Campaign> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/campaigns/${id}/activate`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.tokenSet.idToken}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 404) {
                throw new Error("Campanha não encontrada");
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || "Erro ao ativar campanha");
            }
            throw new Error("Erro ao ativar campanha");
        }

        const campaign = (await response.json()) as CampaignResponse;
        return {
            id: campaign.id,
            marketId: campaign.marketId,
            title: campaign.title,
            imageUrl: campaign.imageUrl,
            slot: campaign.slot,
            startDate: new Date(campaign.startDate),
            endDate: campaign.endDate ? new Date(campaign.endDate) : null,
            status: campaign.status,
            createdAt: new Date(campaign.createdAt),
            updatedAt: new Date(campaign.updatedAt),
        } as Campaign;
    } catch (error) {
        console.error("Erro ao ativar campanha:", error);
        throw error;
    }
};

export const deactivateCampaign = async (id: string): Promise<Campaign> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/campaigns/${id}/deactivate`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.tokenSet.idToken}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 404) {
                throw new Error("Campanha não encontrada");
            }
            throw new Error("Erro ao desativar campanha");
        }

        const campaign = (await response.json()) as CampaignResponse;
        return {
            id: campaign.id,
            marketId: campaign.marketId,
            title: campaign.title,
            imageUrl: campaign.imageUrl,
            slot: campaign.slot,
            startDate: new Date(campaign.startDate),
            endDate: campaign.endDate ? new Date(campaign.endDate) : null,
            status: campaign.status,
            createdAt: new Date(campaign.createdAt),
            updatedAt: new Date(campaign.updatedAt),
        } as Campaign;
    } catch (error) {
        console.error("Erro ao desativar campanha:", error);
        throw error;
    }
};

export const deleteCampaign = async (id: string): Promise<void> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/campaigns/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.tokenSet.idToken}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 404) {
                throw new Error("Campanha não encontrada");
            }
            throw new Error("Erro ao excluir campanha");
        }
    } catch (error) {
        console.error("Erro ao excluir campanha:", error);
        throw error;
    }
};

