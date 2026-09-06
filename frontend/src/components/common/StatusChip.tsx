import { STATUS_CONFIG } from "../../constants/statusConfig";
import type { CustomStatusChipProps } from "../../types/status";

export default function StatusChip({
    type,
    label,
    status,
    isAC,
}: CustomStatusChipProps) {

    if (type === "status" && status) {
        const config = STATUS_CONFIG[status];

        return (
            <div className="
                relative
                flex items-center justify-center
                bg-slate-900/80
                border border-slate-700
                rounded
                px-1 sm:px-2
                py-0.5
                min-w-[38px] sm:min-w-[48px]
            ">
                <div
                    className={`
                        absolute
                        -top-0.5
                        -right-0.5
                        w-1.5
                        h-1.5
                        rounded-full
                        border border-slate-950
                        ${config.bg}
                    `}
                />

                <span className="
                    text-[8px] sm:text-[9px]
                    font-bold
                    text-slate-400
                    tracking-tight
                    lowercase
                    first-letter:uppercase
                ">
                    {label}
                </span>
            </div>
        );
    }

    const bgStyle = isAC
        ? "bg-[#4c1d95] border-purple-500"
        : "bg-[#1f2937] border-slate-500";

    return (
        <div className="
            flex items-center
            gap-1 sm:gap-1.5
            px-0.5 sm:px-1
            py-0.5
        ">
            <div
                className={`
                    w-2.5 h-2.5 sm:w-3 sm:h-3
                    rounded
                    border
                    ${bgStyle}
                `}
            />

            <span className="
                text-[9px] sm:text-[10px]
                font-medium
                text-slate-300
                tracking-tight
            ">
                {label}
            </span>
        </div>
    );
}