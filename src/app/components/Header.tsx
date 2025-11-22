import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth0 } from "@/lib/auth0";
import { SessionData, User } from "@auth0/nextjs-auth0/types";
import { Market } from "../domain/marketDomain";
import AuthButtons from "./AuthButtons";
import { ProfileMenuDropDown } from "./ProfileMenuDropDown";

interface HeaderProps {
    market: Market;
}

export default async function Header({ market }: HeaderProps) {
    const session = await auth0.getSession() as SessionData;

    return (
        <header className="flex w-full justify-between items-center p-4 bg-background border-b border-border">
            <div className="grid grid-cols-3 gap-4 w-full items-center">
                <div className="flex flex-row gap-2">
                    <Avatar className="h-12 w-12 border shadow-md">
                        {market.profilePicture ? (
                            <AvatarImage src={market.profilePicture} alt={market.name} />
                        ) : null}
                        <AvatarFallback className="text-sm font-medium">
                            {market.name?.charAt(0)?.toUpperCase() ?? "M"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="rounded-full flex flex-col gap-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-card-foreground">{market.name}</span>
                            <span className="text-sm text-muted-foreground">
                                {market.addressData 
                                    ? `${market.addressData.street}, ${market.addressData.number}${market.addressData.complement ? ` - ${market.addressData.complement}` : ''} - ${market.addressData.neighborhood}, ${market.addressData.city} - ${market.addressData.state}`
                                    : market.address || 'Endereço não cadastrado'}
                            </span>
                        </div>
                    </div>
                </div>
                <span></span>
                <div className="ml-auto flex flex-row gap-8">
                    <div className="flex flex-row gap-2">
                        <AnimatedThemeToggler />
                        {session ? (
                            <ProfileMenuDropDown currentUser={session.user as User} />
                        ) : (
                            <AuthButtons />
                        )}
                    </div>
                </div>
            </div>
        </header >
    )
}
