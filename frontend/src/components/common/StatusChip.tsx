import { STATUS_CONFIG } from "../../constants/statusConfig";
import type { StatusChipProp } from "../../types/status";
export default function StatusChip({status,count}:StatusChipProp){
    const config=STATUS_CONFIG[status];
    return(
        <div className="flex items-center gap-2 py-1 text-white">
            <div className={`w-5 h-5 rounded-full ring-1 ring-black ${config.color}`} />
            <span>{count}</span>
            <span>{status}</span>
        </div>
    )
}