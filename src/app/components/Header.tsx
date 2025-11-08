import { getCart } from "@/actions/cart.actions";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Separator } from "@/components/ui/separator";
import { CartItemResponseDTO } from "@/dtos/cartDTO";
import { auth0 } from "@/lib/auth0";
import { SessionData, User } from "@auth0/nextjs-auth0/types";
import Link from "next/link";
import SearchField from "../(app)/components/SeachField";
import AuthButtons from "./AuthButtons";
import CartSheet from "./CartSheet";
import { ProfileMenuDropDown } from "./ProfileMenuDropDown";

export default async function Header() {
    const session = await auth0.getSession() as SessionData;

    let items: CartItemResponseDTO[] = [];
    try {
        const cart = await getCart();
        items = cart.items || [];
    } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
    }
    return (
        <header className="flex w-full justify-between items-center p-4 bg-background border-b border-border">
            <div className="grid grid-cols-3 gap-4 container mx-auto">
                <h1 className="text-2xl font-bold text-foreground items-center flex">
                    <Link href="/" className="text-foreground hover:text-primary">
                        Smart Market - Admin
                    </Link>
                </h1>
                <SearchField paramName="name" />
                <div className="ml-auto flex flex-row gap-8">
                    <div className="flex flex-row gap-2">
                        {session ? <><CartSheet cartItems={items} /> <Separator orientation="vertical" /></> : null}
                    </div>

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
