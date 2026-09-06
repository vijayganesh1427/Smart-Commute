import type { BottomSheetProps } from "../../types/bottomSheetProps";
import { useRef, useState, useEffect } from "react";

export default function BottomSheet({
    children1,
    children2,
}: BottomSheetProps) {

    const COLLAPSED_HEIGHT = 120;
    const EXPANDED_HEIGHT = window.innerHeight * 0.35;

    const [sheetHeight, setSheetHeight] = useState(COLLAPSED_HEIGHT);
    useEffect(() => {
        if (!children1) {
            setSheetHeight(COLLAPSED_HEIGHT);
        }
    }, [children1]);
    const canDrag = Boolean(children1);
    const startY = useRef(0);
    const startHeight = useRef(COLLAPSED_HEIGHT);
    const isDragging = useRef(false);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!canDrag) return;
        startY.current = e.clientY;
        startHeight.current = sheetHeight;
        isDragging.current = true;

        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging.current) return;

        const delta = startY.current - e.clientY;

        let newHeight = startHeight.current + delta;

        newHeight = Math.max(
            COLLAPSED_HEIGHT,
            Math.min(EXPANDED_HEIGHT, newHeight)
        );

        setSheetHeight(newHeight);
    };

    const handlePointerUp = () => {
        isDragging.current = false;

        const midpoint =
            COLLAPSED_HEIGHT +
            (EXPANDED_HEIGHT - COLLAPSED_HEIGHT) / 2;

        if (sheetHeight > midpoint) {
            setSheetHeight(EXPANDED_HEIGHT);
        } else {
            setSheetHeight(COLLAPSED_HEIGHT);
        }
    };

    return (
        <div
            className="
                absolute
                bottom-0
                left-0
                right-0
                z-20
            "
        >

            {/* Floating Bus Header */}
            {children1 && <div
                className="
                    absolute
                    bottom-full
                    left-1
                    right-1
                    mb-2

                    h-10

                    flex
                    items-center

                    rounded-2xl

                    bg-[#021f18]
                    text-white

                    border
                    border-cyan-900
                "
            >
                {children1}
            </div>}


            {/* Bottom Sheet */}
            <div
                className="
                    relative
                    w-full

                    rounded-t-3xl
                    border-t
                    border-t-cyan-900
                    flex
                    flex-col
                    items-center

                    bg-[#021f18]
                    text-white
                    overflow-hidden
                "
                style={{
                    height: `${sheetHeight}px`,
                }}
            >

                {/* Drag Handle */}
                <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className={`
                        absolute
                        top-0
                        left-0
                        right-0
                        z-30

                        flex
                        justify-center

                        h-8
                        pt-2

                        ${canDrag ? "cursor-grab touch-none" : "cursor-default"}
                    `}
                >
                    <div
                        className="
                            w-12
                            h-1.5
                            rounded-full
                            bg-gray-400
                        "
                    />
                </div>


                {/* Scrollable Content */}
                <div
                    className="
                        h-full
                        w-full

                        overflow-y-auto
                        scrollbar-hide

                        px-3
                        pt-8
                        pb-5
                    "
                >
                    {children2}
                </div>

            </div>

        </div>
    );
}