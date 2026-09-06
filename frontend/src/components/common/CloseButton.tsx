import { X } from "lucide-react";
export default function CloseButton({onClose}:{onClose: ()=>void}){
    return(
        <button className={`absolute top-2 right-3 z-50 flex items-center justify-center w-8 h-8 rounded-lg backdrop-blur-md border border-white/40 text-zinc-300 hover:bg-white/10 hover:text-white transition-all`} onClick={onClose}><X /></button>
    )
}