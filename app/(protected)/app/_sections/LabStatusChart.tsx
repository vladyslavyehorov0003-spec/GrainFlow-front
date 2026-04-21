"use client";

import { LabAnalysisResponse, LabStatus } from "@/lib/lab";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  analyses: LabAnalysisResponse[];
}

const STATUS_COLOR: Record<LabStatus, string> = {
  PENDING:       "#94a3b8",
  IN_PROGRESS:   "#3b82f6",
  ANALYSIS_DONE: "#f59e0b",
  DRYING:        "#f97316",
  DRYING_DONE:   "#22c55e",
  STORED:        "#10b981",
  CANCELED:      "#ef4444",
};

const STATUS_LABEL: Record<LabStatus, string> = {
  PENDING:       "Pending",
  IN_PROGRESS:   "In progress",
  ANALYSIS_DONE: "Analysis done",
  DRYING:        "Drying",
  DRYING_DONE:   "Drying done",
  STORED:        "Stored",
  CANCELED:      "Canceled",
};

export function LabStatusChart({ analyses }: Props) {
  const counts = analyses.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([status, count]) => ({
    name:  STATUS_LABEL[status as LabStatus] ?? status,
    value: count,
    color: STATUS_COLOR[status as LabStatus] ?? "#94a3b8",
  }));

  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <p className="text-sm font-semibold">Lab analyses by status</p>
      {analyses.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No analyses</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => { const n = Number(v); return [`${n} analysis${n !== 1 ? "es" : ""}`, ""] as [string, string]; }} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
