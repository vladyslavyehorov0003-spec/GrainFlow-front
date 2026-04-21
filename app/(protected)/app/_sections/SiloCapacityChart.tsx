"use client";

import { SiloResponse } from "@/lib/silo";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CULTURE_LABEL } from "@/lib/batch";

interface Props {
  silos: SiloResponse[];
}

export function SiloCapacityChart({ silos }: Props) {
  const data = silos.map((s) => ({
    name:    s.name,
    current: Number(s.currentAmount),
    free:    Math.max(0, Number(s.maxAmount) - Number(s.currentAmount)),
    max:     Number(s.maxAmount),
    culture: s.culture ? CULTURE_LABEL[s.culture] : "Empty",
    pct:     s.maxAmount > 0 ? Math.round((Number(s.currentAmount) / Number(s.maxAmount)) * 100) : 0,
  }));

  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <p className="text-sm font-semibold">Silo capacity</p>
      {silos.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No silos</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(180, silos.length * 44)}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${v} t`} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
            <Tooltip
              formatter={(value, name) =>
                (name === "current" ? [`${Number(value)} t`, "Filled"] : [`${Number(value)} t`, "Free"]) as [string, string]
              }
              labelFormatter={(label, payload) => {
                const d = payload?.[0]?.payload;
                return d ? `${label} — ${d.culture} (${d.pct}%)` : label;
              }}
            />
            <Bar dataKey="current" stackId="a" fill="hsl(var(--primary))" radius={[0,0,0,0]}>
              {data.map((_, i) => <Cell key={i} fill="hsl(var(--primary))" />)}
            </Bar>
            <Bar dataKey="free" stackId="a" fill="hsl(var(--muted))" radius={[4,4,4,4]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
