import { Marker } from "react-leaflet";
import L from "leaflet";
import type { BusMarkerProps } from "../../types/busMarkerProps";

export default function BusMarker({
    bus,
    isSelected,
    onSelect,
}: BusMarkerProps) {

    const statusColor = {
        Live: "#22c55e",
        Stale: "#eab308",
        Offline: "#ef4444",
    }[bus.status];

    const busColor = bus.isAC
        ? "#4c1d95"
        : "#1f2937";

    const markerIcon = L.divIcon({
        className: "",
        html: `<div style="
                    position:relative;
                    width:30px;
                    height:24px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    border-radius:8px;
                    background: ${busColor};
                    opacity: ${statusColor=="#ef4444" && "60%"};
                    border: ${isSelected?"3px solid cyan":"2px solid #cbd5e1"};
                    box-shadow:0 2px 7px rgba(0,0,0,0.55);
                    color: #cbd5e1;
                    font-size:10px;
                    font-weight:800;
                    letter-spacing:0.3px;
                    ">
                    ${bus.id}
                    <span style="
                        position:absolute;
                        top:-5px;
                        right:-5px;
                        width:10px;
                        height:10px;
                        border-radius:50%;
                        background: ${statusColor};
                        border:2px solid #111827;
                    "></span>
                    </div>        
                `,
        iconSize: [30, 24],
        iconAnchor: [15, 12],
    });

    return (
        <Marker
            position={[bus.latitude, bus.longitude]}
            icon={markerIcon}
            eventHandlers={{
                click: () => onSelect(bus),
            }}
        />
    );
}