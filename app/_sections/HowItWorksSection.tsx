import React from "react";

const STEPS = [
  "Company Registration",
  "Adding a Contract",
  "Vehicle Weighing",
  "Lab Analysis",
  "Silo Placement",
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="mx-auto max-w-3xl text-center space-y-4">
        <h2 className="text-3xl font-bold">How it works</h2>
        <p className="text-muted-foreground">
          Vehicle entry → Weighing → Lab analysis → Silo placement → Audit. The
          entire chain is tracked in real-time.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm font-medium"
            >
              <span className="text-primary font-bold">{i + 1}.</span> {step}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
