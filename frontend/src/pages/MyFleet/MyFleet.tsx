import { buses } from "../../data/buses";
import { Star, BusFront, MapPin, Clock, ArrowLeft } from "lucide-react";
import type { Bus } from "../../types/bus";
import { STATUS_CONFIG } from "../../constants/statusConfig";
import { useNavigate } from "react-router-dom";
import type { MyFleetProps } from "../../types/myFleetProps";

export default function MyFleet({
    favoriteBuses,
    toggleFavorite,
}: MyFleetProps) {

    const myFleet = buses.filter(bus =>
        favoriteBuses.includes(bus.id)
    );
    const navigate=useNavigate();
    return (
        <div className="
            min-h-screen
            bg-black
            text-white
            px-4
            pt-24
            pb-8
        ">
            <button type="button" className="border border-cyan-500 rounded-lg px-3 py-2 text-sm flex gap-2 items-center text-[#cbd5e1] bg-cyan-950" onClick={()=>navigate("/")}>
                <ArrowLeft size={16} />
                Back
            </button>
            <div className="mx-auto max-w-3xl">

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />

                        <h1 className="text-2xl font-bold">
                            My Fleet
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-zinc-400">
                        Your saved buses
                    </p>
                </div>


                {/* Empty State */}
                {myFleet.length === 0 && (
                    <div className="
                        flex
                        flex-col
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-zinc-900/60
                        px-6
                        py-16
                        text-center
                    ">
                        <Star className="
                            mb-4
                            h-10
                            w-10
                            text-yellow-400
                        " />

                        <h2 className="text-lg font-semibold">
                            No buses in your fleet yet
                        </h2>

                        <p className="
                            mt-2
                            max-w-sm
                            text-sm
                            text-zinc-400
                        ">
                            Search for a bus and tap the star
                            to add it to your fleet.
                        </p>
                    </div>
                )}


                {/* Fleet */}
                <div className="space-y-3">
                    {myFleet.map(bus => (
                        <FleetCard
                            key={bus.id}
                            bus={bus}
                            onRemove={toggleFavorite}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}


function FleetCard({
    bus,
    onRemove,
}: {
    bus: Bus;
    onRemove: (busId: number) => void;
}) {
    const navigate=useNavigate();
    const statusColor = STATUS_CONFIG[bus.status].text;

    return (
        <div className="
            flex
            items-center
            justify-between
            gap-3
            rounded-2xl
            border
            border-cyan-900/60
            bg-[#021f18]
            px-4
            py-4
            shadow-lg
        "
        onClick={() => navigate(`/bus/${bus.id}`)}
        >

            {/* Bus information */}
            <div className="
                flex
                min-w-0
                items-center
                gap-3
            ">

                <div className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-purple-900/70
                    border
                    border-purple-700
                ">
                    <BusFront
                        className="h-5 w-5 text-purple-300"
                    />
                </div>


                <div className="min-w-0">

                    <div className="
                        flex
                        items-center
                        gap-2
                    ">
                        <span className="
                            font-bold
                            text-white
                        ">
                            Bus {bus.id}
                        </span>

                        <span className="text-zinc-600">
                            |
                        </span>

                        <span className="
                            truncate
                            text-sm
                            font-medium
                            text-zinc-300
                        ">
                            {bus.routeName}
                        </span>
                    </div>


                    <div className="
                        mt-1
                        flex
                        flex-wrap
                        items-center
                        gap-x-3
                        gap-y-1
                        text-xs
                        text-zinc-400
                    ">

                        <span className={statusColor}>
                            {bus.status}
                        </span>

                        <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {bus.currentArea}
                        </span>

                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {bus.estimatedArrival} min
                        </span>

                    </div>

                </div>

            </div>


            {/* Favourite */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(bus.id);
                }}
                className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-yellow-500/70
                    bg-zinc-900
                    transition
                    hover:scale-105
                "
                aria-label={`Remove Bus ${bus.id} from fleet`}
            >
                <Star
                    className="
                        h-5
                        w-5
                        fill-yellow-400
                        text-yellow-400
                    "
                />
            </button>

        </div>
    );
}