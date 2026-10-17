import { Activity, BusFront } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "../../constants/app";
import { useNavigate, useLocation } from "react-router-dom";

export default function TopBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const isAnalyticsPage = location.pathname === "/analytics";
    const isMyFleetPage = location.pathname === "/my-fleet";

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
            <div className="flex flex-wrap items-center gap-2 text-white sm:gap-3">
                <BusFront
                    size={28}
                    className="shrink-0 text-red-500 sm:h-[30px] sm:w-[30px]"
                />

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mr-auto text-left"
                    aria-label="Go to Smart Commute map"
                >
                    <h1 className="pb-1 text-xl font-bold text-cyan-400">
                        {APP_NAME}
                    </h1>
                    <p className="hidden text-xs text-gray-100 sm:block">
                        {APP_TAGLINE}
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/my-fleet")}
                    aria-current={isMyFleetPage ? "page" : undefined}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        isMyFleetPage
                            ? "border-cyan-400 bg-cyan-900/70 text-cyan-100"
                            : "border-cyan-500 bg-cyan-950 text-[#cbd5e1] hover:bg-cyan-900"
                    }`}
                >
                    <BusFront size={16} />
                    My Fleet
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/analytics")}
                    aria-current={isAnalyticsPage ? "page" : undefined}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        isAnalyticsPage
                            ? "border-cyan-400 bg-cyan-900/70 text-cyan-100"
                            : "border-cyan-500 bg-cyan-950 text-[#cbd5e1] hover:bg-cyan-900"
                    }`}
                >
                    <Activity size={16} />
                    Analytics
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/freshers")}
                    className="border border-cyan-500 rounded-lg p-2 text-[#cbd5e1] bg-cyan-950"
                    >
                    Freshers
                </button>
                
                <button
                    type="button"
                    onClick={() => navigate("/admin/fleet")}
                    className="border border-cyan-500 rounded-lg p-2 text-[#cbd5e1] bg-cyan-950"
                    >
                    Fleet Admin
                </button>

            </div>
        </header>
    );
}
