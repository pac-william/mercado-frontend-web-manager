import { Meta } from "./metaDomain";
import { AddressDomain } from "./addressDomain";

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
        public addressId?: string | null,
        public addressData?: AddressDomain | null,
    ) { }
}

export class MarketPaginatedResponse {
    constructor(
        public markets: Market[],
        public meta: Meta,
    ) { }
}