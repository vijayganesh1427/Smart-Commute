
import { MapContainer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl } from "maplibre-gl";
import maplibreWorker from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useState, useEffect } from "react";
import BusMarker from "./BusMarker";
import type { UserLocation, MapViewProps } from "../../types/mapsProps";
import UserMarker from "./UserMarker";
import DestinationMarker from "./DestinationMarker";
import DarkMapLayer from "./DarkMapLayer";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import type { BusRouteResponse } from "../../services/routeService";

setWorkerUrl(maplibreWorker);

function MapInteractions() {
    const map = useMap();

    useEffect(() => {
        const locateUser = () => {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by this browser.");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    map.flyTo([latitude, longitude], 12, {
                        animate: true,
                        duration: 1.2,
                    });
                },
                (error) => {
                    console.error("Unable to get user location:", error);

                    if (error.code === error.PERMISSION_DENIED) {
                        alert("Please allow location access in your browser.");
                    } else {
                        alert("Unable to get your location. Please try again.");
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        };

        window.addEventListener("smart-commute:locate-user", locateUser);

        return () => {
            window.removeEventListener("smart-commute:locate-user", locateUser);
        };
    }, [map]);

    return null;
}

type SharedMapViewProps = Omit<MapViewProps, "onRouteDataChange"> & {
    routeData: BusRouteResponse | null;
};

export default function MapView({
    buses,
    selBus,
    filBus,
    onBusSel,
    favoriteBuses = [],
    favoritesOnly = false,
    routeData,
}: SharedMapViewProps) {
    const [userLoc, setUserLoc] = useState<UserLocation | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLoc({
                    lat: position.coords.latitude,
                    long: position.coords.longitude,
                });
            },
            (error) => {
                console.warn("Unable to retrieve initial user location:", error);
            },
            { maximumAge: 60_000, timeout: 10_000 }
        );
    }, []);

    let busesToDisplay = buses;

    if (favoritesOnly) {
        busesToDisplay = buses.filter((bus) =>
            favoriteBuses.includes(bus.id)
        );
    } else if (filBus.length > 0) {
        busesToDisplay = filBus;
    }

    if (
        selBus &&
        !busesToDisplay.some((bus) => bus.id === selBus.id) &&
        !favoritesOnly
    ) {
        busesToDisplay = [...busesToDisplay, selBus];
    }

    const DestIcon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:4px;background:#22315c;border:2px solid #fff;box-shadow:0 2px 6px rgba(16,24,38,.4)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });

    const route: LatLngExpression[] =
        routeData && routeData.busId === selBus?.id
            ? routeData.route
            : [];

    return (
        <MapContainer
            center={[12.9427, 80.1757]}
            zoom={11}
            minZoom={9}
            maxBounds={[[180, -Infinity], [-180, Infinity]]}
            maxZoom={20}
            maxBoundsViscosity={1}
            className="h-full w-full"
        >
            <MapInteractions />
            <DarkMapLayer />

            {userLoc && (
                <UserMarker position={[userLoc.lat, userLoc.long]} />
            )}

            {busesToDisplay.map((bus) => (
                <BusMarker
                    key={bus.id}
                    bus={bus}
                    isSelected={selBus?.id === bus.id}
                    onSelect={onBusSel}
                />
            ))}

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

            {selBus ? (
                <DestinationMarker position={[12.8405, 80.153]} />
            ) : (
                <Marker position={[12.8405, 80.153]} icon={DestIcon} />
            )}
        </MapContainer>
    );
}
