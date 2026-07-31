import SearchBar from "../search/SearchBar";

export default function TopBar() {
    return (
        <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">

            <h1 className="text-3xl font-bold text-red-700">
                Smart Commute
            </h1>

            <SearchBar />

        </header>
    );
}