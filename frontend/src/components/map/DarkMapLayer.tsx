import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import "maplibre-gl/dist/maplibre-gl.css";

export default function DarkMapLayer() {
    const map = useMap();

    useEffect(() => {
        const layer = maplibreGL({
            style: "https://tiles.openfreemap.org/styles/dark",
        });

        layer.addTo(map);

        return () => {
            map.removeLayer(layer);
        };
    }, [map]);

    return null;
}