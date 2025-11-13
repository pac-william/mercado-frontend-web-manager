import { Category } from "./categoryDomain";
import { Meta } from "./metaDomain";

export class Product {
    constructor(
        public id: string,
        public name: string,
        public price: number,
        public unit: string,
        public marketId: string,
        public image?: string | null,
        public categoryId?: string,
        public category?: Category | null,
        public sku?: string | null,
    ) { }
}

export class ProductPaginatedResponse {
    constructor(
        public products: Product[],
        public meta: Meta,
    ) { }
}