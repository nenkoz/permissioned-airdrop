import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Permissioned Airdrop
          </h2>
          <p className="text-lg text-gray-600">
            Connect your wallet to get started with the airdrop process.
          </p>
        </div>
      </main>
    </div>
  );
}
