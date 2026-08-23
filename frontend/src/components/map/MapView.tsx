import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState,useEffect } from "react";
import BusMarker from "./BusMarker";
import type { Bus } from "../../types/bus";
import { buses } from "../../data/buses";
import { routes } from "../../data/routes";
interface UserLocation{
    lat: number;
    long: number;
}
interface MapViewProps {
    selBus: Bus | null;
    onBusSel: (b: Bus) => void;
}
export default function MapView({selBus,onBusSel}:MapViewProps) {
    const [userLoc,setUserLoc]=useState<UserLocation|null>(null);
    useEffect(()=>{
                const onSuccess=(position: GeolocationPosition)=>
                    setUserLoc({lat: position.coords.latitude,long: position.coords.longitude});
                const onFail=()=>
                    console.log("error");
                navigator.geolocation.getCurrentPosition(onSuccess,onFail);
            },
            []
    )
    return (
        <MapContainer
            center={[13.0827, 80.2707]}
            zoom={13}
            className="h-full w-full"
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userLoc && <Marker position={[userLoc.lat,userLoc.long]}/>}
            {buses.map(bus=>(
                <BusMarker
                    key={bus.id}
                    bus={bus}
                    isSelected={selBus?.id === bus.id}
                    onSelect={onBusSel}
                />
            ))}
            {selBus && routes[selBus.id] && (
                <Polyline
                    positions={routes[selBus.id]}
                    pathOptions={{
                        color: "#ff3700",
                        weight: 5,
                        opacity: 0.8
                    }}
                />
            )}
            {selBus && <Marker position={[12.8406,80.1534]}/>}
        </MapContainer>
    );
}