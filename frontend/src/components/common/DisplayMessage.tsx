import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function DisplayMessage({
    msg,
}: {
    msg: string | null;
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!msg) {
            setVisible(false);
            return;
        }

        setVisible(true);

        const timer = setTimeout(() => {
            setVisible(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, [msg]);

    if (!msg || !visible) {
        return null;
    }

    return (
        <div
            className="
                absolute
                z-20
                left-2
                bottom-45

                flex
                items-center
                gap-2

                rounded-lg
                border
                border-red-400/50

                bg-zinc-900/80
                backdrop-blur-md

                px-3
                py-2

                text-sm
                text-white
            "
        >
            <p>
                {msg}
            </p>

            <button
                type="button"
                onClick={() => setVisible(false)}
                className="
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center

                    rounded-md

                    text-zinc-400

                    transition
                    hover:bg-white/10
                    hover:text-white
                "
                aria-label="Close message"
            >
                <X size={15} />
            </button>
        </div>
    );
}