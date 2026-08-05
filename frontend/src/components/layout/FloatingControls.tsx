import FloatingActionButton from "../common/FloatingActionButton";
import { LocateFixed, BusFront, Menu } from "lucide-react";
export default function FloatingControls(){
    return(
        <div>
            <FloatingActionButton icon={<LocateFixed size={20} />} className="absolute right-6 bottom-40 z-20 text-white" onClick={()=>console.log("working")} />
            <FloatingActionButton icon={<BusFront size={20} />} className="absolute right-6 bottom-25 z-20 text-yellow-200" onClick={()=>console.log("working")} />
            <FloatingActionButton icon={<Menu size={18} />} className="absolute right-6 bottom-10 z-20 text-blue-300" onClick={()=>console.log("working")} />
        </div>
    )
}