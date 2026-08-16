import StatusChip from "../common/StatusChip";
import { UI_STYLES } from "../../styles/designSystem";
export default function FleetStatus(){
    return(
        <div className={`absolute top-20 ${UI_STYLES.glass} rounded-r-xl p-2`}>
            <StatusChip status="Live" count={15} />
            <StatusChip status="Updating" count={5} />
            <StatusChip status="Offline" count={2} />
        </div>
    )
}