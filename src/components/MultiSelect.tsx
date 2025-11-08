"use client"

import MultipleSelector, { Option } from "@/components/ui/multiselect";
import { useRouter } from "next/navigation";

interface MultiSelectProps {
  options: Option[];
  label: string;
  placeholder: string;
  emptyIndicator: string;
}

export default function MultiSelect({ options, label, placeholder, emptyIndicator = "Nenhum resultado encontrado" }: MultiSelectProps) {
  const router = useRouter();

  const handleSelect = (options: Option[]) => {
    const searchParams = new URLSearchParams(window.location.search);

    searchParams.delete("categoryId");

    options.forEach((option) => {
      searchParams.append("categoryId", String(option.value));
    });

    const queryString = searchParams.toString();
    const destination = queryString ? `/products?${queryString}` : "/products";

    router.push(destination);
  }

  return (
    <div className="*:not-first:mt-2">
      <MultipleSelector
        commandProps={{
          label: label,
        }}
        defaultOptions={options}
        placeholder={placeholder}
        hideClearAllButton
        hidePlaceholderWhenSelected
        emptyIndicator={<p className="text-center text-sm">{emptyIndicator}</p>}
        onChange={handleSelect}
      />
    </div>
  )
}
