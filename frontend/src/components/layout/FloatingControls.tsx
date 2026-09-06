import FloatingActionButton from "../common/FloatingActionButton";
import { LocateFixed, Star, Menu } from "lucide-react";
export default function FloatingControls(){
    return(
        <div>
            <div className="absolute right-2 top-25 z-20 flex gap-3">
                <FloatingActionButton
                    icon={<Star size={20} />}
                    className="text-yellow-200"
                    onClick={() => console.log("working")}
                />

                <FloatingActionButton
                    icon={<Menu size={18} />}
                    className="text-white"
                    onClick={() => console.log("working")}
                />
            </div>

            <FloatingActionButton
                icon={<LocateFixed size={20} />}
                className="absolute right-2 bottom-45 z-20 text-blue-300"
                onClick={() => console.log("working")}
            />        
        </div>
    )
}