
import {
    Activity,
    BusFront,
    GraduationCap,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "../../constants/app";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
    { label: "My Fleet", path: "/my-fleet", icon: BusFront },
    { label: "Analytics", path: "/analytics", icon: Activity },
    { label: "Freshers", path: "/freshers", icon: GraduationCap },
    { label: "Fleet Admin", path: "/admin/fleet", icon: ShieldCheck },
];

export default function TopBar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <header
            className="
                absolute inset-x-0 top-0 z-30
                border-b border-cyan-400/50
                bg-gradient-to-r from-[#16001f]/95
                via-[#190525]/95 to-[#071b25]/95
                px-3 py-2 backdrop-blur-xl
                sm:px-5 sm:py-3
            "
        >
            <div className="
                flex flex-col gap-2
                sm:flex-row sm:items-center sm:justify-between sm:gap-4
            ">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    aria-label="Go to Smart Commute map"
                    className="flex min-w-0 items-center gap-2 text-left sm:gap-3"
                >
                    <div className="
                        flex h-9 w-9 shrink-0 items-center justify-center
                        rounded-xl border border-red-400/20 bg-red-500/10
                        sm:h-11 sm:w-11
                    ">
                        <BusFront className="h-6 w-6 text-red-400 sm:h-7 sm:w-7" />
                    </div>

                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-extrabold tracking-tight text-cyan-300 sm:text-2xl">
                            {APP_NAME}
                        </h1>
                        <p className="hidden text-xs text-slate-300 sm:block">
                            {APP_TAGLINE}
                        </p>
                    </div>
                </button>

                <nav
                    aria-label="Main navigation"
                    className="
                        flex max-w-full gap-2 overflow-x-auto pb-0.5
                        sm:justify-end
                    "
                >
                    {navItems.map(({ label, path, icon: Icon }) => {
                        const active = location.pathname === path ||
                            location.pathname.startsWith(`${path}/`);

                        return (
                            <button
                                key={path}
                                type="button"
                                onClick={() => navigate(path)}
                                aria-current={active ? "page" : undefined}
                                className={`
                                    inline-flex shrink-0 items-center gap-1.5
                                    rounded-xl border px-3 py-2 text-xs
                                    font-semibold transition sm:gap-2 sm:px-3.5 sm:py-2.5 sm:text-sm
                                    ${
                                        active
                                            ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
                                            : "border-white/20 bg-white/[0.035] text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-400/[0.08]"
                                    }
                                `}
                            >
                                <Icon size={16} />
                                <span>{label}</span>
                                {active && <ChevronRight size={13} />}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
