import { Marker } from "react-leaflet";
import L from "leaflet";
import type { GeneralMarkerProps } from "../../types/mapsProps";

export default function UserMarker({ position }: GeneralMarkerProps) {
  const markerIcon = L.divIcon({
    className: "",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(34, 211, 238, 0.18);
        border: 1px solid rgba(34, 211, 238, 0.45);
        box-shadow: 0 0 0 5px rgba(34, 211, 238, 0.08);
      ">
        <div style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #22d3ee;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  return <Marker position={position} icon={markerIcon} />;
}