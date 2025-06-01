import Image from "next/image";
import ClaimAirdropForm from "@/components/ClaimAirdropForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <ClaimAirdropForm />
          <h2 className="text-3xl font-bold text-gray-900 mb-4 mt-8">
            Welcome to Permissioned Airdrop
          </h2>
          <p className="text-lg text-gray-600">
            Follow the steps above to claim your airdrop tokens.
          </p>
        </div>
      </main>
    </div>
  );
}
