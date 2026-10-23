import StatusChip from "../common/StatusChip";

export default function FleetStatus() {
    return (
        <div 
            className="
                absolute
                top-[9rem] left-2
                sm:top-20 sm:left-2
                z-20
                flex flex-col items-center gap-1.5 sm:gap-3
                max-w-[calc(100vw-1.5rem)]
                overflow-x-auto
                rounded-lg border border-white/25
                bg-green-950
                p-1 sm:p-2
                shadow-lg
                pointer-events-auto
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