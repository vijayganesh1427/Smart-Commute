interface BottomSheetProps{
    children: React.ReactNode;
};
export default function BottomSheet({children}:BottomSheetProps){
    return(
        <div className="absolute h-30 bottom-0 right-0 left-0 pt-2 rounded-t-3xl border-t
                border-cyan-200 flex flex-col items-center bg-blue-950 text-white overflow-hidden">
            <div className="absolute w-12 h-1.5 rounded-full bg-gray-400 cursor-grab" />
            <div className="overflow-y-auto flex-1 pl-5 w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {children}
            </div>
        </div>
    )
}