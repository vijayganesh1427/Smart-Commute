
import { useState } from "react";
import { LocateFixed, Star } from "lucide-react";
import FloatingActionButton from "../common/FloatingActionButton";
interface FloatingControlsProps {
    favoritesOnly: boolean;
}
export default function FloatingControls({
    favoritesOnly,
}: FloatingControlsProps) {
    const [locating, setLocating] = useState(false);

    const handleLocate = () => {
        if (locating) return;

        setLocating(true);
        window.dispatchEvent(new Event("smart-commute:locate-user"));

        // Prevent rapid repeated clicks.
        window.setTimeout(() => setLocating(false), 5000);
    };

    const handleFavorites = () => {
        window.dispatchEvent(
            new Event("smart-commute:toggle-favorites")
        );
    };

    return (
        <>
            <div className="
                absolute right-3 top-[9.3rem]
                z-20
                sm:right-2 sm:top-20
                text-yellow-300"
            >
                <FloatingActionButton
                    icon={
                        <Star
                            size={20}
                            fill={favoritesOnly ? "currentColor" : "none"}
                        />
                    }
                    className={
                        favoritesOnly
                            ? "text-yellow-300"
                            : "text-yellow-300"
                    }
                    onClick={handleFavorites}
                />
            </div>

            <FloatingActionButton
                icon={<LocateFixed size={20} />}
                className={`absolute right-2 bottom-53 z-20 text-blue-300 ${
                    locating ? "animate-pulse" : ""
                }`}
                onClick={handleLocate}
            />
        </>
    );
}
