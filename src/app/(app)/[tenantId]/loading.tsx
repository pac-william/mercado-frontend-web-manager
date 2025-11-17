import { Loader } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center">
            <Loader size={40} className="animate-spin" />
        </div>
    )
}