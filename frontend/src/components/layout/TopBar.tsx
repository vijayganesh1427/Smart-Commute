import { BusFront } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "../../constants/app";

export default function TopBar() {
    return (
        <header
            className="
                absolute
                top-0
                left-0
                right-0
                z-10
                h-40 sm:h-20
                flex
                flex-col
                items-start

                px-4 sm:px-6
                py-2 sm:py-4

                bg-[linear-gradient(to_bottom,rgb(22,0,31)_0%,rgba(22,0,31,0.95)_25%,rgba(22,0,31,0.85)_50%,rgba(22,0,31,0.6)_75%,transparent_100%)]
                sm:bg-[rgb(22,0,31)]                 
                sm:backdrop-blur-md                 
                sm:border-b                 
                sm:border-cyan-200                 
                sm:shadow-sm
            "
        >
            <div className="flex items-center gap-2 sm:gap-3">
                <BusFront
                    size={28}
                    className="text-red-500 sm:w-[30px] sm:h-[30px]"
                />

                <div>
                    <h1 className="pb-1 text-xl font-bold text-cyan-400">
                        {APP_NAME}
                    </h1>

                    <p className="hidden sm:block text-xs text-gray-100">
                        {APP_TAGLINE}
                    </p>
                </div>
            </div>
        </header>
    );
}