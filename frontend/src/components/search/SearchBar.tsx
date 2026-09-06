import { Search } from "lucide-react";
import { UI_STYLES } from "../../styles/designSystem";
import type { SearchBarProps } from "../../types/searchBarProps";
export default function SearchBar({onSearch}:SearchBarProps) {
    return (
        <div className={`
                absolute
                z-20

                top-12
                left-4
                right-4

                sm:top-5
                sm:left-auto
                sm:right-5

                flex
                items-center

                bg-gray-900
                rounded-full

                ${UI_STYLES.glow.cyan}

                px-4
                py-2

                w-auto
                sm:w-96

                duration-300
                hover:scale-103
            `}>
            <Search size={20} className="text-gray-100 mr-2 shrink-0" />

            <input
                type="text"
                placeholder="Search by Bus No., Route or Area"
                className="flex-1 min-w-0 outline-none bg-transparent text-gray-100"
                onChange={(e)=>onSearch(e.target.value)}
            />
        </div>
    );
}