import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { auth0 } from "@/lib/auth0";
import { SessionData, User } from "@auth0/nextjs-auth0/types";
import Link from "next/link";
import AuthButtons from "./AuthButtons";
import { ProfileMenuDropDown } from "./ProfileMenuDropDown";

export default async function Header() {
    const session = await auth0.getSession() as SessionData;

    return (
        <header className="flex w-full justify-between items-center p-4 bg-background border-b border-border">
            <div className="grid grid-cols-3 gap-4 container mx-auto">
                <h1 className="text-2xl font-bold text-foreground items-center flex">
                    <Link href="/" className="text-foreground hover:text-primary">
                        Smart Market - Admin
                    </Link>
                </h1>
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
