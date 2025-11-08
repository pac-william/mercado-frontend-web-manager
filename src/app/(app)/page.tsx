import { ScrollArea } from "@/components/ui/scroll-area";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Smart Market - Manager',
    description: 'Gerencie seu mercado de forma fácil e eficiente',
}

export default async function Home() {

    return (
        <ScrollArea className="flex flex-col flex-grow h-0">
            
        </ScrollArea >
    )
}