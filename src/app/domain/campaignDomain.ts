export type CampaignStatus = "DRAFT" | "SCHEDULED" | "ACTIVE" | "EXPIRED";

export class Campaign {
    constructor(
        public id: string,
        public marketId: string,
        public title: string,
        public imageUrl: string,
        public slot: number,
        public startDate: Date,
        public endDate: Date | null,
        public status: CampaignStatus,
        public createdAt: Date,
        public updatedAt: Date,
    ) { }
}

