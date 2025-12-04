"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface SelectFilterProps {
    options: {
        label: string;
        value: string;
    }[];
    value: string;
    label: string;
    placeholder: string;
    filterKey: string;
    basePath?: string;
}

export function SelectFilter({ options, value, label, placeholder, filterKey, basePath }: SelectFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (newValue: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (newValue && newValue !== "__all__" && newValue !== "ALL" && newValue !== "") {
            params.set(filterKey, newValue);
        } else {
            params.delete(filterKey);
        }
        
        params.delete("page");
        
        const path = basePath || "";
        router.push(`${path}?${params.toString()}`);
    }

    const validOptions = options.filter(opt => opt.value !== "");
    const hasAllOption = options.some(opt => opt.value === "" && opt.label.toLowerCase().includes("todos"));
    const selectValue = value && value !== "" ? value : (hasAllOption ? "__all__" : undefined);
    
    return (
        <div className="w-full space-y-2">
            <Label>{label}</Label>
            <Select
                value={selectValue}
                onValueChange={handleChange}
            >
                <SelectTrigger>
                    <SelectValue placeholder={placeholder}/>
                </SelectTrigger>
                <SelectContent>
                    {hasAllOption && (
                        <SelectItem key="__all__" value="__all__">Todos</SelectItem>
                    )}
                    {validOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}