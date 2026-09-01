import OnboardingAthleteForm from "@/components/OnboardingAthleteForm";

export default function OnboardingAthletePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-gray-900">
            Completemos tu <span className="text-blue-600">perfil de atleta</span>
          </h1>
          <p className="mt-2 text-gray-500">
            Cuéntanos sobre ti para diseñar tu acompañamiento personalizado.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <OnboardingAthleteForm />
        </div>
      </div>
    </main>
  );
}
