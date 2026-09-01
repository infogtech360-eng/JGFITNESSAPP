import OnboardingTutorForm from "@/components/OnboardingTutorForm";

export default function OnboardingTutorPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-gray-900">
            Acompañamiento de <span className="text-blue-600">tutor</span>
          </h1>
          <p className="mt-2 text-gray-500">
            Completa tus datos y vincula al atleta que acompañarás.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <OnboardingTutorForm />
        </div>
      </div>
    </main>
  );
}
