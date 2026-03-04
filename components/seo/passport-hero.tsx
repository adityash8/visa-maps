import type { Passport, VisaCategory } from "@/lib/constants";

interface PassportHeroProps {
  passport: Passport;
  counts: Record<VisaCategory, number>;
}

export function PassportHero({ passport, counts }: PassportHeroProps) {
  const total =
    counts.visa_free + counts.evisa + counts.visa_on_arrival + counts.visa_required;
  const easyAccess = counts.visa_free + counts.visa_on_arrival;

  return (
    <div className="max-w-3xl mx-auto text-center py-12 px-4">
      <div className="text-6xl mb-4">{passport.flag}</div>
      <h1 className="text-3xl font-bold mb-2">
        {passport.name} Passport Visa Requirements
      </h1>
      <p className="text-gray-600 mb-6">
        Holders of a {passport.name} passport can access {easyAccess} of {total}{" "}
        countries without a pre-arranged visa. Ranked #{passport.rank} in the
        Henley Passport Index.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Visa Free" value={counts.visa_free} color="text-green-600" />
        <Stat label="eVisa" value={counts.evisa} color="text-blue-600" />
        <Stat label="Visa on Arrival" value={counts.visa_on_arrival} color="text-amber-600" />
        <Stat label="Visa Required" value={counts.visa_required} color="text-red-600" />
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
