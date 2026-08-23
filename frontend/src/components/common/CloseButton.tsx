import { X } from "lucide-react";
export default function CloseButton({onClose}:{onClose: ()=>void}){
    return(
        <button className={`absolute top-3 right-4 text-white rounded bg-white/30 cursor-pointer text-xl border border-white`} onClick={onClose}><X /></button>
    )
}