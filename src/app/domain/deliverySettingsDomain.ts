export class DeliverySettings {
    constructor(
        public id: string,
        public marketId: string,
        public deliveryRadius: number,
        public deliveryFee: number,
        public allowsPickup: boolean,
        public createdAt?: Date,
        public updatedAt?: Date,
    ) { }
}

