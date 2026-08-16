import FloatingActionButton from "../common/FloatingActionButton";
import { LocateFixed, BusFront, Menu } from "lucide-react";
export default function FloatingControls(){
    return(
        <div>
            <div className="absolute right-5 top-22 z-20 flex gap-3">
                <FloatingActionButton
                    icon={<BusFront size={20} />}
                    className="text-yellow-200"
                    onClick={() => console.log("working")}
                />

                <FloatingActionButton
                    icon={<Menu size={18} />}
                    className="text-blue-300"
                    onClick={() => console.log("working")}
                />
            </div>

            <FloatingActionButton
                icon={<LocateFixed size={20} />}
                className="absolute right-5 bottom-35 z-20 text-white"
                onClick={() => console.log("working")}
            />        
        </div>
    )
}