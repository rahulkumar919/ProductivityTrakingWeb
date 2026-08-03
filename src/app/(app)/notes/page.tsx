import { PageHeader } from "@/components/app/page-header";
import { NotesVault } from "@/components/features/notes-vault";

export default function NotesPage() {
    return (
        <>
            <PageHeader
                title="Notes Vault"
                description="Create notebooks for every topic — Tree, Graph, DP, Sliding Window. Upload your handwritten notes and revise anytime."
            />
            <NotesVault />
        </>
    );
}
