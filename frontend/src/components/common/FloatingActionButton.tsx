import type { FloatingActionButtonProps } from "../../types/floatingAction";
import { UI_STYLES } from "../../styles/designSystem";
export default function FloatingActionButton({
    icon,
    onClick,
    className = "",
    }: FloatingActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`${UI_STYLES.button} h-12 w-12 bg-gray-900 hover:scale-110 cursor-pointer ${className}`}>
            {icon}
        </button>
    );
}