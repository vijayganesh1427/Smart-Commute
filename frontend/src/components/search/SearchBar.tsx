import { Search } from "lucide-react";

export default function SearchBar() {
    return (
        <div className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-96">
            <Search size={20} className="text-gray-500 mr-2" />

            <input
                type="text"
                placeholder="Search by Bus No., Route or Area"
                className="flex-1 outline-none bg-transparent"
            />
        </div>
    );
}