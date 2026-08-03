"use client";

/** Skeleton loader for the profile form layout */
export function ProfileFormSkeleton() {
    return (
        <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading profile">
            {/* Row 1: two fields */}
            <div className="grid gap-4 sm:grid-cols-2">
                <SkeletonField />
                <SkeletonField />
            </div>
            {/* Row 2: one full-width field */}
            <SkeletonField />
            {/* Row 3: three fields */}
            <div className="grid gap-4 sm:grid-cols-3">
                <SkeletonField />
                <SkeletonField />
                <SkeletonField />
            </div>
            {/* Row 4: save button */}
            <div className="h-11 w-32 rounded-lg bg-muted" />
        </div>
    );
}

function SkeletonField() {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-11 rounded-lg bg-muted" />
        </div>
    );
}
