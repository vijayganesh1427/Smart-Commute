import { useState } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import type { BusNotification } from "../../hooks/useBusNotifications";

interface NotificationCenterProps {
    notifications: BusNotification[];
    permission: NotificationPermission;
    onRequestPermission: () => Promise<boolean>;
    onClear: () => void;
}

export default function NotificationCenter({
    notifications,
    permission,
    onRequestPermission,
    onClear,
}: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);

    const enableNotifications = async () => {
        setIsRequesting(true);
        try {
            await onRequestPermission();
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label="Toggle notifications"
                aria-expanded={isOpen}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/95 text-zinc-200 shadow-lg backdrop-blur-xl transition hover:border-cyan-500 hover:text-cyan-300"
            >
                <Bell size={20} />

                {notifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {notifications.length > 99
                            ? "99+"
                            : notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-14 z-[1000] w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950/95 text-white shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                        <div className="flex items-center gap-2 font-semibold">
                            <Bell size={18} className="text-cyan-400" />
                            Notifications
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close notifications"
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {permission !== "granted" && (
                        <div className="border-b border-zinc-800 p-4">
                            <p className="text-sm text-zinc-300">
                                Get browser alerts when your favourite buses
                                change status.
                            </p>

                            {permission === "denied" ? (
                                <p className="mt-2 text-xs text-amber-300">
                                    Notifications are blocked by your browser.
                                    Enable them in your site settings.
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    disabled={isRequesting}
                                    onClick={enableNotifications}
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:opacity-60"
                                >
                                    <Bell size={16} />
                                    {isRequesting
                                        ? "Requesting..."
                                        : "Enable notifications"}
                                </button>
                            )}
                        </div>
                    )}

                    {notifications.length > 0 && (
                        <div className="flex items-center justify-between px-4 pt-3">
                            <span className="text-xs text-zinc-400">
                                Recent activity
                            </span>

                            <button
                                type="button"
                                onClick={onClear}
                                className="flex p-1 items-center gap-1 text-xs transition text-red-300 hover:rounded-lg hover:bg-zinc-600"
                            >
                                <Trash2 size={13} />
                                Clear all
                            </button>
                        </div>
                    )}

                    <div className="max-h-[360px] overflow-y-auto p-3">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center px-5 py-8 text-center">
                                <div className="mb-3 rounded-full bg-zinc-800 p-3">
                                    <Check
                                        size={22}
                                        className="text-cyan-400"
                                    />
                                </div>
                                <p className="font-medium text-zinc-200">
                                    You're all caught up
                                </p>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Bus updates will appear here when
                                    available.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400" />

                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold">
                                                    Bus {notification.busId}
                                                </p>
                                                <p className="mt-1 break-words text-sm text-zinc-300">
                                                    {notification.message}
                                                </p>
                                                <p className="mt-2 text-xs text-zinc-500">
                                                    {notification.createdAt.toLocaleTimeString(
                                                        [],
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}