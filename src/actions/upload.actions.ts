"use server"

import { baseUrl } from "@/config/server";
import { auth0 } from "@/lib/auth0";

export type UploadFileParams = {
    file: File;
    folder?: string;
    access?: string;
};

export type UploadResponse = {
    url: string;
    pathname: string;
    downloadUrl: string;
    contentType: string;
    access: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const uploadFile = async ({ file, folder, access }: UploadFileParams): Promise<UploadResponse> => {
    if (!(file instanceof File)) {
        throw new Error("Arquivo inválido");
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("O arquivo excede o tamanho máximo permitido (5 MB)");
    }

    const session = await auth0.getSession();
    if (!session) {
        throw new Error("Usuário não autenticado");
    }

    const formData = new FormData();
    formData.append("file", file);

    if (folder) {
        formData.append("folder", folder);
    }

    if (access) {
        formData.append("access", access);
    }

    const response = await fetch(`${baseUrl}/api/v1/uploads`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.tokenSet.idToken}`,
        },
        body: formData,
        cache: "no-store",
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Usuário não autenticado");
        }

        if (response.status === 403) {
            throw new Error("Acesso negado");
        }

        if (response.status === 413) {
            throw new Error("Arquivo muito grande");
        }

        if (response.status >= 500) {
            throw new Error("Erro no servidor ao realizar upload");
        }

        try {
            const error = await response.json();
            throw new Error(error?.message ?? "Falha no upload");
        } catch (cause) {
            if (cause instanceof Error) {
                throw cause;
            }
            throw new Error("Falha no upload");
        }
    }

    try {
        const data = await response.json() as UploadResponse;
        return data;
    } catch {
        throw new Error("Resposta inválida do servidor");
    }
};

