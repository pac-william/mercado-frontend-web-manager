import bh_supermercados from "@/../public/markets/bh_supermercados.png";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { auth0 } from "@/lib/auth0";
import { SessionData, User } from "@auth0/nextjs-auth0/types";
import Image from "next/image";
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
                    <Image src={bh_supermercados} alt="Product" width={100} height={100} className="object-cover rounded-full aspect-square w-12 h-12 shadow-md border" />
                    <div className="rounded-full flex flex-col gap-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-card-foreground">{market.name}</span>
                            <span className="text-sm text-muted-foreground">{market.address}</span>
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
