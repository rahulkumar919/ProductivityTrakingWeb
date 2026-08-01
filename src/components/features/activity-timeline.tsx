"use client";

import { Activity, BookOpen, CheckCircle2, Dumbbell, Flame, ListTodo, Target, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import type { ActivityLog } from "@/types";

const ACTIVITY_KEY = "devtrack_activities";

function loadActivities(): ActivityLog[] {
    try {
        const raw = localStorage.getItem(ACTIVITY_KEY);
        return raw ? (JSON.parse(raw) as ActivityLog[]) : [];
    } catch {
        return [];
    }
}

const TYPE_ICONS: Record<string, React.ElementType> = {
    "Task Created": ListTodo,
    "Task Completed": CheckCircle2,
    "Task Deleted": ListTodo,
    "Habit Completed": Flame,
    "Routine Completed": Activity,
    "Goal Created": Target,
    "Focus Session Completed": Timer,
    "Coding Session": Timer,
    "Study Session": Timer,
    "Pomodoro": Timer,
    "Deep Work": Timer,
    "Gym Session Completed": Dumbbell,
    "Learning Entry Added": BookOpen,
};

const TYPE_COLORS: Record<string, string> = {
    "Task Completed": "#22c55e",
    "Habit Completed": "#f59e0b",
    "Goal Created": "#6366f1",
    "Focus Session Completed": "#3b82f6",
    "Gym Session Completed": "#ec4899",
    "Learning Entry Added": "#14b8a6",
    "Routine Completed": "#8b5cf6",
};

function getIcon(type: string) {
    for (const key of Object.keys(TYPE_ICONS)) {
        if (type.toLowerCase().includes(key.toLowerCase())) return TYPE_ICONS[key];
    }
    return Activity;
}

function getColor(type: string) {
    for (const key of Object.keys(TYPE_COLORS)) {
        if (type.toLowerCase().includes(key.toLowerCase())) return TYPE_COLORS[key];
    }
    return "var(--primary)";
}

export function ActivityTimeline() {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setActivities(loadActivities());
        setHydrated(true);
    }, []);

    if (!hydrated) return null;

    return (
        <Card>
            {activities.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <Activity size={36} className="text-muted-foreground" />
                    <p className="font-semibold">No activity yet</p>
                    <p className="text-sm text-muted-foreground">
                        Activity will appear here as you create tasks, log learning entries, complete habits, and more.
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {activities.map((activity) => {
                        const Icon = getIcon(activity.type);
                        const color = getColor(activity.type);
                        return (
                            <div key={activity.id} className="relative flex gap-4">
                                {/* timeline line */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className="flex size-8 items-center justify-center rounded-full flex-shrink-0"
                                        style={{ background: `${color}20`, color }}
                                    >
                                        <Icon size={15} />
                                    </div>
                                    <div className="mt-1 flex-1 w-px bg-border" style={{ minHeight: "20px" }} />
                                </div>
                                <div className="pb-4 flex-1 min-w-0">
                                    <p className="font-semibold text-sm">{activity.type}</p>
                                    <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {new Date(activity.createdAt).toLocaleString("en-IN", {
                                            weekday: "short", day: "numeric", month: "short",
                                            year: "numeric", hour: "2-digit", minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
