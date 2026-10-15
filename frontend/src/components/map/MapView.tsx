import { MapContainer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl } from "maplibre-gl";
import maplibreWorker from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useState, useEffect } from "react";
import BusMarker from "./BusMarker";
//import { buses } from "../../data/buses";
import type { UserLocation, MapViewProps } from "../../types/mapsProps";
import UserMarker from "./UserMarker";
import DestinationMarker from "./DestinationMarker";
import DarkMapLayer from "./DarkMapLayer";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { getBusRoute } from "../../services/routeService";
import type { BusRouteResponse } from "../../services/routeService";
//import SourceMarker from "./SourceMarker";
setWorkerUrl(maplibreWorker);
export default function MapView({buses,selBus,filBus,onRouteDataChange,onBusSel}:MapViewProps) {
    const [userLoc,setUserLoc]=useState<UserLocation|null>(null);
    const [route, setRoute] = useState<LatLngExpression[]>([]);
    const [routeData, setRouteData] = useState<BusRouteResponse | null>(null);
    useEffect(()=>{
                const onSuccess=(position: GeolocationPosition)=>
                    setUserLoc({lat: position.coords.latitude,long: position.coords.longitude});
                const onFail=()=>
                    console.log("error");
                navigator.geolocation.getCurrentPosition(onSuccess,onFail);
            },
            []
    )
    useEffect(() => {
        let cancelled = false;

        if (!selBus) {
            setRoute([]);
            onRouteDataChange(null);
            return;
        }

        setRoute([]);

        const fetchRoute = async () => {
            try {
                const data = await getBusRoute(selBus.id);

                if (cancelled) return;

                setRoute(data.route);
                onRouteDataChange(data);
            } catch (error) {
                if (cancelled) return;

                console.error("Route fetching failed:", error);
                setRoute([]);
                onRouteDataChange(null);
            }
        };

        fetchRoute();

        return () => {
            cancelled = true;
        };
    }, [selBus?.id, onRouteDataChange]);
    
    let busesToDisplay = buses;
    if (filBus?.length > 0) {
        busesToDisplay = filBus;

        if (selBus && !filBus.some(bus => bus.id === selBus.id)) {
            busesToDisplay = [...filBus, selBus];
        }
    }
    const DestIcon=L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:4px;background:#22315c;border:2px solid #fff;box-shadow:0 2px 6px rgba(16,24,38,.4)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        });
    return (
        <MapContainer
            center={[12.9727, 80.1757]}
            zoom={11}
            minZoom={8}
            maxBounds={[[180, -Infinity], [-180, Infinity]]}
            maxZoom={20}
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
            {/*selBus && <SourceMarker position={routeWaypoints[selBus.id][0]} />*/}
            {route.length > 0 && (
                <Polyline
                    positions={route}
                    pathOptions={{
                        color: "#ff3700",
                        weight: 5,
                        opacity: 0.8,
                    }}
                />
            )}
            {selBus?<DestinationMarker position={[12.8405,80.153]}/>:<Marker position={[12.8405,80.153]} icon={DestIcon}/>}
        </MapContainer>
    );
}