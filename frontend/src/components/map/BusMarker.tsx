import { Marker,CircleMarker } from "react-leaflet";
import type { Bus } from "../../types/bus";
interface BusMarkerProps {
    bus: Bus;
    isSelected: boolean;
    onSelect: (b: Bus)=>void;
}
export default function BusMarker({bus,isSelected,onSelect}:BusMarkerProps){
    return(
        <>
        {isSelected?
            <CircleMarker center={[bus.latitude,bus.longitude]} eventHandlers={{click: ()=>{onSelect(bus)}}}/>:
            <Marker position={[bus.latitude,bus.longitude]} eventHandlers={{click: ()=>{onSelect(bus)}}}/>
        }
        </>
    )
}