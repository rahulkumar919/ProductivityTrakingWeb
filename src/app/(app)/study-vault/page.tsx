import { PageHeader } from "@/components/app/page-header";
import { StudyVault } from "@/components/features/study-vault";

export default function StudyVaultPage() {
    return (
        <>
            <PageHeader
                title="Study Vault"
                description="Upload PDFs, study page by page, add notes, and revise anytime."
            />
            <StudyVault />
        </>
    );
}
