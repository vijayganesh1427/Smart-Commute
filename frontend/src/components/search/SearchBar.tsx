import { Search } from "lucide-react";
import { UI_STYLES } from "../../styles/designSystem";
export default function SearchBar() {
    return (
        <div className={`
            absolute
            flex 
            items-center 
            right-5 
            z-20 
            top-5 
            bg-gray-900 
            rounded-full 
            ${UI_STYLES.glow.cyan}  
            px-4 
            py-2 
            w-96 
            duration-300
            hover:scale-103 `}>
            <Search size={20} className="text-gray-100 mr-2" />

            <input
                type="text"
                placeholder="Search by Bus No., Route or Area"
                className="flex-1 outline-none bg-transparent text-gray-100"
            />
        </div>
    );
}