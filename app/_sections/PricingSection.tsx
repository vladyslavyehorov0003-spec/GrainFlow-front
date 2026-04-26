import Link from "next/link";
import React from "react";

const PRICING_FEATURES = [
  "Unlimited batches",
  "Silo and transport accounting",
  "Laboratory analyses",
  "User management",
  "Audit log",
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-bold">Transparent pricing</h2>
          <p className="text-muted-foreground">
            Free first month. No hidden charges.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free trial */}
          <div className="rounded-2xl border p-8 flex flex-col gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Trial period
              </p>
              <p className="text-4xl font-bold">€0</p>
              <p className="text-sm text-muted-foreground">First month</p>
            </div>
            <ul className="space-y-2 text-sm">
              {PRICING_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block mt-auto">
              <button className="w-full rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                Start free trial
              </button>
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-primary bg-primary text-primary-foreground p-8 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium opacity-70 uppercase tracking-wide">
                After trial
              </p>
              <p className="text-4xl font-bold">€20</p>
              <p className="text-sm opacity-70">for month</p>
            </div>
            <ul className="space-y-2 text-sm">
              {PRICING_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="opacity-90">✓</span> {f}
                </li>
              ))}
              <li className="flex items-center gap-2">
                <span className="opacity-90">✓</span> Priority support
              </li>
            </ul>
            <Link href="/register" className="block">
              <button className="w-full rounded-lg bg-primary-foreground text-primary px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
                Start now
              </button>
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Cancel anytime. No penalties.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
