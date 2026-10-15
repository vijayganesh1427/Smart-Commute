
import { useCallback, useEffect, useState } from "react";
import { Users, CheckCircle2 } from "lucide-react";
import {
    getLatestCrowdReport,
    submitCrowdReport,
} from "../../services/crowdReportService";
import type { CrowdLevel, CrowdReport } from "../../types/crowdReport";

interface CrowdReportPanelProps {
    busId: number;
}

const levels: {
    value: CrowdLevel;
    label: string;
    description: string;
    activeClass: string;
}[] = [
    {
        value: "Low",
        label: "Low",
        description: "Plenty of space",
        activeClass: "border-emerald-500 bg-emerald-500/15 text-emerald-300",
    },
    {
        value: "Moderate",
        label: "Moderate",
        description: "Some seats occupied",
        activeClass: "border-yellow-500 bg-yellow-500/15 text-yellow-300",
    },
    {
        value: "High",
        label: "High",
        description: "Very crowded",
        activeClass: "border-red-500 bg-red-500/15 text-red-300",
    },
];

function formatTime(date: string): string {
    return new Date(date).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function CrowdReportPanel({
    busId,
}: CrowdReportPanelProps) {
    const [selectedLevel, setSelectedLevel] =
        useState<CrowdLevel | null>(null);

    const [latestReport, setLatestReport] =
        useState<CrowdReport | undefined>();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadLatestReport = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const report = await getLatestCrowdReport(busId);
            setLatestReport(report);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load crowd reports."
            );
        } finally {
            setLoading(false);
        }
    }, [busId]);

    useEffect(() => {
        void loadLatestReport();
    }, [loadLatestReport]);

    const handleSubmit = async () => {
        if (!selectedLevel || submitting) return;

        setSubmitting(true);
        setError(null);
        setSubmitted(false);

        try {
            const report = await submitCrowdReport(
                busId,
                selectedLevel
            );

            setLatestReport(report);
            setSelectedLevel(null);
            setSubmitted(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to submit the crowd report."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mt-5 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
            <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                <h3 className="font-semibold text-white">
                    Crowd Report
                </h3>
            </div>

            <p className="mt-1 text-sm text-zinc-400">
                How crowded is this bus right now?
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2">
                {levels.map((level) => (
                    <button
                        key={level.value}
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                            setSelectedLevel(level.value);
                            setSubmitted(false);
                            setError(null);
                        }}
                        aria-pressed={selectedLevel === level.value}
                        className={`rounded-lg border p-2 text-left transition ${
                            selectedLevel === level.value
                                ? level.activeClass
                                : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                        <span className="block text-sm font-semibold">
                            {level.label}
                        </span>
                        <span className="mt-1 block text-[10px] leading-tight text-zinc-400">
                            {level.description}
                        </span>
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!selectedLevel || submitting}
                className="mt-3 w-full rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {submitting ? "Submitting..." : "Submit Report"}
            </button>

            {submitted && (
                <p className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Report submitted successfully.
                </p>
            )}

            {error && (
                <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <p className="text-sm text-red-300">{error}</p>
                    <button
                        type="button"
                        onClick={() => void loadLatestReport()}
                        className="mt-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                    >
                        Retry loading
                    </button>
                </div>
            )}

            <div className="mt-4 border-t border-zinc-800 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Latest report
                </p>

                {loading ? (
                    <p className="mt-2 text-sm text-zinc-500">
                        Loading crowd report...
                    </p>
                ) : latestReport ? (
                    <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-sm text-zinc-200">
                            Crowd level:{" "}
                            <strong>{latestReport.level}</strong>
                        </span>
                        <span className="text-right text-xs text-zinc-500">
                            {formatTime(latestReport.createdAt)}
                        </span>
                    </div>
                ) : !error ? (
                    <p className="mt-2 text-sm text-zinc-500">
                        No reports yet. Be the first to report.
                    </p>
                ) : null}
            </div>

            <p className="mt-3 text-[11px] text-zinc-500">
                Reports are shared through the Smart Commute backend.
            </p>
        </section>
    );
}
