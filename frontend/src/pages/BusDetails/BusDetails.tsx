import { useParams, useNavigate } from "react-router-dom";
import { buses } from "../../data/buses";
import { BusFront, ArrowLeft } from "lucide-react";
import { routes } from "../../data/routes";
import type { LatLngTuple } from "leaflet";
export default function BusDetails() {

const { id } = useParams();
const navigate = useNavigate();
const bus = buses.find(
	x => x.id === Number(id)
);
const route:LatLngTuple[]|null = bus?routes[bus.id]:null;
// Invalid bus ID
if (!bus) {
	return (
		<div className="
			min-h-screen
			bg-black
			text-white
			flex
			flex-col
			items-center
			justify-center
			gap-4
		">
			<h1 className="text-xl font-bold">
				Bus not found
			</h1>

			<button
				type="button"
				onClick={() => navigate("/my-fleet")}
				className="
					flex
					items-center
					gap-2
					rounded-lg
					border
					border-cyan-500
					bg-cyan-950
					px-3
					py-2
					text-sm
				"
			>
				<ArrowLeft size={16} />
				Back to My Fleet
			</button>
			<button
				type="button"
				onClick={() => navigate("/")}
				className="
					mb-6
					flex
					items-center
					gap-2
					rounded-lg
					border
					border-cyan-500
					bg-cyan-950
					px-3
					py-2
					text-sm
					text-slate-200
				"
			>
				<ArrowLeft size={16} />
				Back to Map
			</button>
		</div>
	);
}

return (
	<div className="
		min-h-screen
		bg-black
		text-white
		px-4
		pt-24
		pb-8
	">

		<button
			type="button"
			onClick={() => navigate("/my-fleet")}
			className="
				mb-6
				flex
				items-center
				gap-2
				rounded-lg
				border
				border-cyan-500
				bg-cyan-950
				px-3
				py-2
				text-sm
				text-slate-200
			"
		>
			<ArrowLeft size={16} />
			Back
		</button>

		<button
			type="button"
			onClick={() => navigate("/")}
			className="
				mb-6
				flex
				items-center
				gap-2
				rounded-lg
				border
				border-cyan-500
				bg-cyan-950
				px-3
				py-2
				text-sm
				text-slate-200
			"
		>
			<ArrowLeft size={16} />
			Back to Map
		</button>

		<div className="mx-auto max-w-3xl">

			{/* Bus Header */}
			<div className="
				flex
				items-center
				gap-3
				rounded-2xl
				border
				border-cyan-900/60
				bg-[#021f18]
				px-4
				py-4
			">

				<BusFront
					className="h-7 w-7 text-purple-300"
				/>

				<div>
					<h1 className="text-xl font-bold">
						Bus {bus.id}
					</h1>

					<p className="text-sm text-zinc-400">
						{bus.routeName}
					</p>
				</div>

			</div>

			{/* Temporary Details */}
			<div className="
				mt-4
				rounded-2xl
				border
				border-zinc-800
				bg-zinc-900/60
				p-5
			">

				<p>
					Current Area:{" "}
					<span className="text-zinc-400">
						{bus.currentArea}
					</span>
				</p>

				<p className="mt-2">
					Status:{" "}
					<span className="text-zinc-400">
						{bus.status}
					</span>
				</p>

				<p className="mt-2">
					Speed:{" "}
					<span className="text-zinc-400">
						{bus.speed} km/h
					</span>
				</p>

			</div>
			<div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
				<h2 className="text-lg font-semibold">
					Route
				</h2>

				{route && <div className="mt-3 space-y-2">
					{route?.map((point, index) => (
						<div
							key={index}
							className="flex items-center gap-3 text-sm text-zinc-300"
						>
							<span className="text-cyan-400">
								{index + 1}.
							</span>

							<span>
								{point[0]}, {point[1]}
							</span>
						</div>
					))}
				</div>}
			</div>
			<button
				type="button"
				onClick={() => navigate(`/?bus=${bus.id}`)}
				className="
					mt-4
					w-full
					rounded-xl
					border
					border-cyan-500
					bg-cyan-950
					px-4
					py-3
					text-sm
					font-semibold
					text-cyan-300
					transition
					hover:bg-cyan-900
				"
			>
				View Route on Map
			</button>
		</div>
	</div>
);
}