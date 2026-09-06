import { MapContainer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl } from "maplibre-gl";
import maplibreWorker from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useState, useEffect } from "react";
import BusMarker from "./BusMarker";
import { buses } from "../../data/buses";
import { routes } from "../../data/routes";
import type { UserLocation, MapViewProps } from "../../types/mapsProps";
import UserMarker from "./UserMarker";
import DestinationMarker from "./DestinationMarker";
import DarkMapLayer from "./DarkMapLayer";
setWorkerUrl(maplibreWorker);
export default function MapView({selBus,filBus,onBusSel}:MapViewProps) {
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
    let busesToDisplay = buses;
    if (filBus?.length > 0) {
        busesToDisplay = filBus;

        if (selBus && !filBus.some(bus => bus.id === selBus.id)) {
            busesToDisplay = [...filBus, selBus];
        }
    }
    return (
        <MapContainer
            center={[12.9827, 80.2007]}
            zoom={12}
            minZoom={1}
            maxBounds={[[180, -Infinity], [-180, Infinity]]}
            maxBoundsViscosity={1}
            className="h-full w-full"
        >
            <DarkMapLayer />
            {userLoc && <UserMarker position={[userLoc.lat,userLoc.long]}/>}
            {busesToDisplay.map(bus => (
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
            {selBus && <DestinationMarker position={[12.8405,80.153]}/>}
        </MapContainer>
    );
}