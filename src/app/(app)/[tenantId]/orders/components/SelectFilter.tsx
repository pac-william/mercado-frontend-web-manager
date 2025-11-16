"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface SelectFilterProps {
    options: {
        label: string;
        value: string;
    }[];
    value: string;
    label: string;
    placeholder: string;
}

export function SelectFilter({ options, value, label, placeholder }: SelectFilterProps) {
    const router = useRouter();

    const handleChange = (value: string) => {
        router.push(`/orders?status=${value}`);
    }

    return (
        <div className="w-full space-y-2">
            <Label>{label}</Label>
            <Select
                value={value}
                onValueChange={handleChange}
            >
                <SelectTrigger>
                    <SelectValue placeholder={placeholder}/>
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}