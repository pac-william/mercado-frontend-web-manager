import { getCampaignsByMarket } from "@/actions/campaign.actions";
import CampaignPageClient from "./components/CampaignPageClient";

interface CampaignsPageProps {
    params: Promise<{ tenantId: string }>;
}

export default async function CampaignsPage({ params }: CampaignsPageProps) {
    const { tenantId } = await params;
    const campaigns = await getCampaignsByMarket(tenantId);

    return (
        <CampaignPageClient
            tenantId={tenantId}
            initialCampaigns={campaigns}
        />
    );
}

