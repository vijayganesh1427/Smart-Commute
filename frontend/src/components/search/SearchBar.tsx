
import { Search } from "lucide-react";
import { UI_STYLES } from "../../styles/designSystem";
import type { SearchBarProps } from "../../types/searchBarProps";
import { useEffect, useRef } from "react";

export default function SearchBar({ onSearch }: SearchBarProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const focusSearch = () => searchInputRef.current?.focus();

        window.addEventListener(
            "smart-commute:focus-search",
            focusSearch
        );

        return () => {
            window.removeEventListener(
                "smart-commute:focus-search",
                focusSearch
            );
        };
    }, []);

    return (
        <div
            className={`
                absolute z-20
                sm:z-40
                top-[6.5rem] left-3 right-3
                sm:top-5 sm:left-auto sm:right-auto
                lg:right-[35rem]
                flex items-center
                rounded-full
                bg-gray-900
                ${UI_STYLES.glow.cyan}
                px-4 py-1.5
                transition duration-300
                w-auto
                sm:w-80
                lg:w-150
            `}
        >
            <Search
                size={20}
                className="mr-2 shrink-0 text-gray-100"
            />

            <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by Bus No., Route or Area"
                aria-label="Search buses"
                className="min-w-0 flex-1 bg-transparent text-gray-100 outline-none"
                onChange={(event) => onSearch(event.target.value)}
            />
        </div>
    );
}
