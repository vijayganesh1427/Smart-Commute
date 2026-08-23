import type { Bus } from "../../types/bus";
export default function DisplayBusDetails({bus}:{bus: Bus}){
    return(
        <div>
            Bus: {bus.id} <br/>
            Latitude: {bus.latitude} <br/>
            Longitude: {bus.longitude}
        </div>
    )
}