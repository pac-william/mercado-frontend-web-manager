"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrderTabsProps {
    activeTab: "active" | "completed";
    onTabChange: (tab: "active" | "completed") => void;
}

export function OrderTabs({ activeTab, onTabChange }: OrderTabsProps) {
    return (
        <div className="flex gap-2 border-b">
            <Button
                variant="ghost"
                onClick={() => onTabChange("active")}
                className={cn(
                    "rounded-none border-b-2 border-transparent",
                    activeTab === "active" && "border-primary text-primary"
                )}
            >
                Em Andamento
            </Button>
            <Button
                variant="ghost"
                onClick={() => onTabChange("completed")}
                className={cn(
                    "rounded-none border-b-2 border-transparent",
                    activeTab === "completed" && "border-primary text-primary"
                )}
            >
                Concluídos
            </Button>
        </div>
    );
}

