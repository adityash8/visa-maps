import { VISA_LABELS, VISA_COLORS, type VisaCategory, type VisaRule } from "@/lib/constants";

interface VisaSummaryTableProps {
  rules: Record<string, VisaRule>;
  category: VisaCategory;
}

export function VisaSummaryTable({ rules, category }: VisaSummaryTableProps) {
  const entries = Object.entries(rules)
    .filter(([, r]) => r.category === category)
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ backgroundColor: VISA_COLORS[category] }}
        />
        {VISA_LABELS[category]} ({entries.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4 font-medium">Country</th>
              <th className="py-2 pr-4 font-medium">Duration</th>
              <th className="py-2 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([code, rule]) => (
              <tr key={code} className="border-b border-gray-100">
                <td className="py-1.5 pr-4 font-mono">{code}</td>
                <td className="py-1.5 pr-4">
                  {rule.duration ? `${rule.duration} days` : "—"}
                </td>
                <td className="py-1.5 text-gray-600">{rule.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
