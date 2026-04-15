import React from "react";

const FEATURES = [
  {
    icon: "🚛",
    title: "Transport Control",
    desc: "Entry/exit registration, net/gross weight monitoring.",
  },
  {
    icon: "🧪",
    title: "Lab Analysis",
    desc: "Moisture, protein, gluten — tracked for every batch.",
  },
  {
    icon: "🏗️",
    title: "Silo Management",
    desc: "Current occupancy, grain movement between silos.",
  },
  {
    icon: "📋",
    title: "Contracts",
    desc: "Linking every batch to the supplier's contract.",
  },
  {
    icon: "👷",
    title: "User Management",
    desc: "Roles: Manager, Lab Technician, Security.",
  },
  {
    icon: "📜",
    title: "Audit Log",
    desc: "Full history of all actions within the system.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-muted/40 py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-background rounded-xl border p-6 space-y-2"
            >
              <div className="text-2xl">{f.icon}</div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
