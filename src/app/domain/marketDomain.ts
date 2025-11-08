import { Meta } from "./metaDomain";

export class Market {
    constructor(
        public id: string,
        public name: string,
        public address: string,
        public profilePicture: string,
        public ownerId: string,
        public managersIds: string[],
        public createdAt: Date,
        public updatedAt: Date,
    ) { }
}

export class MarketPaginatedResponse {
    constructor(
        public markets: Market[],
        public meta: Meta,
    ) { }
}