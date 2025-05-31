import AirdropForm from "@/components/AirdropForm";

export default function AdminPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Admin Dashboard
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">
                        Bulk airdrop distribution for project administrators
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        🔒 Admin Only
                    </div>
                </div>

                <div className="max-w-2xl mx-auto">
                    <AirdropForm />
                </div>

                <div className="mt-12 max-w-2xl mx-auto">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-800 mb-2">
                            ⚠️ Important Notes:
                        </h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Ensure you have sufficient token balance before distribution</li>
                            <li>• Verify all recipient addresses are correct</li>
                            <li>• Total amount will be calculated automatically</li>
                            <li>• Approval transaction may be required if allowance is insufficient</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
} 