"use server"

import { Product, ProductPaginatedResponse } from "@/app/domain/productDomain";
import { baseUrl } from "@/config/server";
import { ProductDTO, ProductUpdateDTO } from "@/dtos/productDTO";
import { auth0 } from "@/lib/auth0";
import { buildSearchParams } from "@/lib/misc";

interface GetProductsFilters {
    page?: number;
    size?: number;
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    marketId?: string;
    categoryId?: string[];
}

type ValidationErrorResponse = {
    message?: string;
    errors?: Array<{ field?: string; message?: string }>;
};

const formatValidationErrors = (errors?: Array<{ field?: string; message?: string }>) => {
    if (!Array.isArray(errors)) {
        return undefined;
    }

    const formatted = errors
        .map((validationError) => {
            const field = validationError.field ?? "campo";
            const message = validationError.message ?? "inválido";
            return `${field}: ${message}`;
        })
        .filter(Boolean)
        .join(", ");

    return formatted || undefined;
};

export const getProducts = async (filters?: GetProductsFilters): Promise<ProductPaginatedResponse> => {
    try {
        const params = buildSearchParams({
            page: filters?.page ?? 1,
            size: filters?.size ?? 10,
            name: filters?.name,
            minPrice: filters?.minPrice,
            maxPrice: filters?.maxPrice,
            marketId: filters?.marketId,
            categoryId: undefined,
        });

        if (filters?.categoryId && filters.categoryId.length > 0) {
            params.delete("categoryId");
            filters.categoryId.forEach((id) => params.append("categoryId", id));
        }

        const response = await fetch(`${baseUrl}/api/v1/products?${params.toString()}`, {
            method: "GET",
            cache: 'no-store',
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Produtos não encontrados');
            }
            if (response.status >= 500) {
                throw new Error('Erro no servidor ao buscar produtos');
            }
            try {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao buscar produtos');
            } catch {
                throw new Error(`Erro ao buscar produtos (status: ${response.status})`);
            }
        }

        const data = await response.json() as ProductPaginatedResponse;
        return data;
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
    }
}

export const getProductsByMarket = async (marketId: string, filters?: GetProductsFilters) => {
    try {
        const params = buildSearchParams({
            page: filters?.page,
            size: filters?.size,
            name: filters?.name,
            categoryId: undefined,
        });

        if (filters?.categoryId && filters.categoryId.length > 0) {
            params.delete("categoryId");
            filters.categoryId.forEach((id) => params.append("categoryId", id));
        }

        const response = await fetch(`${baseUrl}/api/v1/products/markets/${marketId}?${params.toString()}`, {
            cache: 'no-store',
            headers: {
                "Content-Type": "application/json",
            },
        });


        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Produtos não encontrados');
            }
            if (response.status >= 500) {
                throw new Error('Erro no servidor ao buscar produtos');
            }
            try {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao buscar produtos');
            } catch {
                throw new Error(`Erro ao buscar produtos (status: ${response.status})`);
            }
        }

        const data = await response.json() as ProductPaginatedResponse;
        return data;
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
    }
}

export const getProductById = async (id: string): Promise<Product> => {
    try {
        const response = await fetch(`${baseUrl}/api/v1/products/${id}`, {
            cache: 'no-store',
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Produto não encontrado');
            }
            if (response.status >= 500) {
                throw new Error('Erro no servidor ao buscar produto');
            }
            throw new Error('Erro ao buscar produto');
        }

        const data = await response.json() as Product;
        return data;
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        throw error;
    }
}

export const createProduct = async (product: ProductDTO) => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/products`, {
            method: "POST",
            body: JSON.stringify(product),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Usuário não autenticado');
            }
            if (response.status === 403) {
                throw new Error('Acesso negado');
            }
            if (response.status === 400) {
                const error = await response.json().catch(() => ({} as ValidationErrorResponse));
                const validationMessage = error?.message || formatValidationErrors(error?.errors);
                throw new Error(validationMessage || 'Erro de validação');
            }
            if (response.status >= 500) {
                throw new Error('Erro interno do servidor');
            }
            throw new Error('Erro ao criar produto');
        }

        const data = await response.json() as Product;
        return data;
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        throw error;
    }
}

export const updateProduct = async (id: string, product: ProductDTO): Promise<Product> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/products/${encodeURIComponent(id)}`, {
            method: "PUT",
            body: JSON.stringify(product),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Usuário não autenticado');
            }
            if (response.status === 403) {
                throw new Error('Acesso negado');
            }
            if (response.status === 404) {
                throw new Error('Produto não encontrado');
            }
            if (response.status === 400) {
                const error = await response.json().catch(() => ({} as ValidationErrorResponse));
                const validationMessage = error?.message || formatValidationErrors(error?.errors);
                throw new Error(validationMessage || 'Erro de validação');
            }
            if (response.status >= 500) {
                throw new Error('Erro interno do servidor');
            }
            throw new Error('Erro ao atualizar produto');
        }

        const data = await response.json() as Product;
        return data;
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
    }
};

export const partialUpdateProduct = async (id: string, product: ProductUpdateDTO): Promise<Product> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/products/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify(product),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Usuário não autenticado');
            }
            if (response.status === 403) {
                throw new Error('Acesso negado');
            }
            if (response.status === 404) {
                throw new Error('Produto não encontrado');
            }
            if (response.status === 400) {
                const error = await response.json().catch(() => ({} as ValidationErrorResponse));
                const validationMessage = error?.message || formatValidationErrors(error?.errors);
                throw new Error(validationMessage || 'Erro de validação');
            }
            if (response.status >= 500) {
                throw new Error('Erro interno do servidor');
            }
            throw new Error('Erro ao atualizar produto');
        }

        const data = await response.json() as Product;
        return data;
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
    }
};

export const deleteProduct = async (id: string): Promise<Product> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${baseUrl}/api/v1/products/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Usuário não autenticado');
            }
            if (response.status === 403) {
                throw new Error('Acesso negado');
            }
            if (response.status === 404) {
                throw new Error('Produto não encontrado');
            }
            if (response.status >= 500) {
                throw new Error('Erro interno do servidor');
            }
            throw new Error('Erro ao deletar produto');
        }

        const data = await response.json() as Product;
        return data;
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        throw error;
    }
};