import { Marker } from "react-leaflet";
import L from "leaflet";
import type { GeneralMarkerProps } from "../../types/mapsProps";

export default function DestinationMarker({
  position,
}: GeneralMarkerProps) {
  const markerIcon = L.divIcon({
    className: "",
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 10%;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        background: #06b6d4;
        box-shadow: 0 2px 7px rgba(0,0,0,0.45);
      ">
        <div style="
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #022c22;
        "></div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });

  return <Marker position={position} icon={markerIcon} />;
}