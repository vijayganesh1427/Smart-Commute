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
                z-50

                flex
                items-center

                px-6
                py-4

                bg-white/80
                backdrop-blur-md
                border-b
                border-gray-200
                shadow-sm
            "
        >
            <div className="flex items-center gap-3">
                <BusFront
                    size={30}
                    className="text-red-700"
                />

                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        {APP_NAME}
                    </h1>

                    <p className="text-xs text-gray-500">
                        {APP_TAGLINE}
                    </p>
                </div>
            </div>
        </header>
    );
}