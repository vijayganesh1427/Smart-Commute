interface FloatingActionButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    className?: string;
}

export default function FloatingActionButton({
    icon,
    onClick,
    className = "",
    }: FloatingActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className={"h-12 w-12 rounded-full bg-gray-900 shadow-[0_0_8px_1px_rgba(0,255,255,0.6)] flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer "+className}>
            {icon}
        </button>
    );
}