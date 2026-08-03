import { PageHeader } from "@/components/app/page-header";
import { DSARevision } from "@/components/features/dsa-revision";

export default function DSAPage() {
    return (
        <>
            <PageHeader
                title="DSA Revision"
                description="154 must-know problems across 17 topics — tricks, patterns, clean code. Track your progress."
            />
            <DSARevision />
        </>
    );
}
