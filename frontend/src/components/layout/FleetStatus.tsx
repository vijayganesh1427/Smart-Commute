import StatusChip from "../common/StatusChip";

export default function FleetStatus() {
    return (
        <div
            className="
                absolute
                top-25
                left-2

                bg-green-950
                rounded-lg
                border border-white/25

                p-1 sm:p-2
                shadow-lg

                flex items-center
                gap-1.5 sm:gap-3

                z-50
                pointer-events-auto
                max-h-9
            "
        >

            {/* Fleet Types Group */}
            <div className="flex items-center gap-0.5 sm:gap-2">
                <StatusChip
                    type="fleet"
                    label="AC"
                    isAC={true}
                />

                <StatusChip
                    type="fleet"
                    label="Non-AC"
                    isAC={false}
                />
            </div>

            {/* Divider */}
            <div className="w-[1px] h-3 sm:h-4 bg-white/30" />

            {/* Status Tags */}
            <div className="flex items-center gap-0.5 sm:gap-1.5">
                <StatusChip
                    type="status"
                    label="Live"
                    status="Live"
                />

                <StatusChip
                    type="status"
                    label="Stale"
                    status="Stale"
                />

                <StatusChip
                    type="status"
                    label="Offline"
                    status="Offline"
                />
            </div>

        </div>
    );
}