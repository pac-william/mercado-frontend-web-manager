"use server"

import { Category, CategoryPaginatedResponse } from "@/app/domain/categoryDomain";
import { ProductPaginatedResponse } from "@/app/domain/productDomain";
import { baseUrl } from "@/config/server";
import { CategoriesDTO, CategoriesUpdateDTO } from "@/dtos/categoriesDTO";
import { auth0 } from "@/lib/auth0";
import { buildSearchParams } from "@/lib/misc";

interface GetCategoriesFilters {
    page?: number;
    size?: number;
    name?: string;
}

export const getCategories = async (filters?: GetCategoriesFilters): Promise<CategoryPaginatedResponse> => {
    try {
        const params = buildSearchParams({
            page: filters?.page ?? 1,
            size: filters?.size ?? 10,
            name: filters?.name,
        });

        const response = await fetch(`${baseUrl}/api/v1/categories?${params.toString()}`, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Categorias não encontradas");
            }
            if (response.status >= 500) {
                throw new Error("Erro no servidor ao buscar categorias");
            }
            try {
                const error = await response.json();
                throw new Error(error.message || "Erro ao buscar categorias");
            } catch {
                throw new Error(`Erro ao buscar categorias (status: ${response.status})`);
            }
        }

        const data = await response.json() as CategoryPaginatedResponse;
        return data;
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
    }
};

export const getCategoryById = async (id: string): Promise<Category> => {
    try {
        const response = await fetch(`${baseUrl}/api/v1/categories/${encodeURIComponent(id)}`, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Categoria não encontrada");
            }
            if (response.status >= 500) {
                throw new Error("Erro no servidor ao buscar categoria");
            }
            try {
                const error = await response.json();
                throw new Error(error.message || "Erro ao buscar categoria");
            } catch {
                throw new Error(`Erro ao buscar categoria (status: ${response.status})`);
            }
        }

        const category = await response.json() as Category;
        return category;
    } catch (error) {
        console.error("Erro ao buscar categoria:", error);
        throw error;
    }
};

export const createCategory = async (category: CategoriesDTO): Promise<Category> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/categories`, {
            method: "POST",
            body: JSON.stringify(category),
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 403) {
                throw new Error("Acesso negado");
            }
            if (response.status === 409) {
                const error = await response.json().catch(() => ({} as { message?: string }));
                throw new Error(error?.message || "Categoria com este nome já existe");
            }
            if (response.status === 400) {
                const error = await response.json().catch(() => ({} as { message?: string }));
                throw new Error(error?.message || "Erro de validação");
            }
            throw new Error("Erro ao criar categoria");
        }

        const createdCategory = await response.json() as Category;
        return createdCategory;
    } catch (error) {
        console.error("Erro ao criar categoria:", error);
        throw error;
    }
};

export const updateCategory = async (id: string, category: CategoriesDTO): Promise<Category> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/categories/${encodeURIComponent(id)}`, {
            method: "PUT",
            body: JSON.stringify(category),
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 403) {
                throw new Error("Acesso negado");
            }
            if (response.status === 404) {
                throw new Error("Categoria não encontrada");
            }
            if (response.status === 409) {
                const error = await response.json().catch(() => ({} as { message?: string }));
                throw new Error(error?.message || "Categoria com este nome já existe");
            }
            if (response.status === 400) {
                const error = await response.json().catch(() => ({} as { message?: string }));
                throw new Error(error?.message || "Erro de validação");
            }
            throw new Error("Erro ao atualizar categoria");
        }

        const updatedCategory = await response.json() as Category;
        return updatedCategory;
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        throw error;
    }
};

export const partialUpdateCategory = async (id: string, category: CategoriesUpdateDTO): Promise<Category> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/categories/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify(category),
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 403) {
                throw new Error("Acesso negado");
            }
            if (response.status === 404) {
                throw new Error("Categoria não encontrada");
            }
            if (response.status === 409) {
                const error = await response.json().catch(() => ({} as { message?: string }));
                throw new Error(error?.message || "Categoria com este nome já existe");
            }
            if (response.status === 400) {
                const error = await response.json().catch(() => ({} as { message?: string }));
                throw new Error(error?.message || "Erro de validação");
            }
            throw new Error("Erro ao atualizar categoria");
        }

        const updatedCategory = await response.json() as Category;
        return updatedCategory;
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        throw error;
    }
};

export const deleteCategory = async (id: string): Promise<Category> => {
    try {
        const session = await auth0.getSession();
        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${baseUrl}/api/v1/categories/${encodeURIComponent(id)}`, {
            method: "DELETE",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.tokenSet.idToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário não autenticado");
            }
            if (response.status === 403) {
                throw new Error("Acesso negado");
            }
            if (response.status === 404) {
                throw new Error("Categoria não encontrada");
            }
            if (response.status >= 500) {
                throw new Error("Erro no servidor ao deletar categoria");
            }
            throw new Error("Erro ao deletar categoria");
        }

        const deletedCategory = await response.json() as Category;
        return deletedCategory;
    } catch (error) {
        console.error("Erro ao deletar categoria:", error);
        throw error;
    }
};

interface GetCategoryProductsFilters {
    page?: number;
    size?: number;
}

export const getCategoryProducts = async (categoryId: string, filters?: GetCategoryProductsFilters): Promise<ProductPaginatedResponse> => {
    try {
        const params = buildSearchParams({
            page: filters?.page ?? 1,
            size: filters?.size ?? 10,
        });

        const response = await fetch(`${baseUrl}/api/v1/categories/${encodeURIComponent(categoryId)}/products?${params.toString()}`, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Categoria não encontrada");
            }
            if (response.status >= 500) {
                throw new Error("Erro no servidor ao buscar produtos da categoria");
            }
            try {
                const error = await response.json();
                throw new Error(error.message || "Erro ao buscar produtos da categoria");
            } catch {
                throw new Error(`Erro ao buscar produtos da categoria (status: ${response.status})`);
            }
        }

        const data = await response.json() as ProductPaginatedResponse;
        return data;
    } catch (error) {
        console.error("Erro ao buscar produtos da categoria:", error);
        throw error;
    }
};