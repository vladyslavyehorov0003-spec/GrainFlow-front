"use client";

import { VehicleResponse, VehicleStatus, STATUS_LABEL } from "@/lib/vehicle";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  vehicles: VehicleResponse[];
}

const STATUS_COLOR: Record<VehicleStatus, string> = {
  ARRIVED:        "#94a3b8",
  IN_PROCESS:     "#f59e0b",
  PENDING_REVIEW: "#8b5cf6",
  ACCEPTED:       "#22c55e",
  REJECTED:       "#ef4444",
};

export function VehicleStatusChart({ vehicles }: Props) {
  const counts = vehicles.reduce<Record<string, number>>((acc, v) => {
    acc[v.status] = (acc[v.status] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([status, count]) => ({
    name:  STATUS_LABEL[status as VehicleStatus] ?? status,
    value: count,
    color: STATUS_COLOR[status as VehicleStatus] ?? "#94a3b8",
  }));

  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <p className="text-sm font-semibold">Vehicles by status</p>
      {vehicles.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No vehicles</p>
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
            <Tooltip formatter={(v) => { const n = Number(v); return [`${n} vehicle${n !== 1 ? "s" : ""}`, ""] as [string, string]; }} />
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
