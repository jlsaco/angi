"use client";

import { useState } from "react";
import { useAngiComponent } from "@/angi";
import type { AngiAction } from "@/angi";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    selection: "",
  });

  // ─── Angi Actions ──────────────────────────────────────────────
  const fillField: AngiAction = {
    description: "Fill a single field in the form",
    schema: { field: "string", value: "string" },
    execute: ({ field, value }) => {
      setFormData((prev) => ({
        ...prev,
        [field as string]: value as string,
      }));
    },
  };

  const resetForm: AngiAction = {
    description: "Clear all form fields",
    schema: {},
    execute: () => {
      setFormData({ name: "", email: "", selection: "" });
    },
  };

  // Register this component with the nearest <Angi.Form> wrapper
  useAngiComponent({
    description: "Contact form with name, email and department fields",
    getState: () => ({ ...formData }),
    actions: { fillField, resetForm },
  });
  // ───────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Submitted:\nName: ${formData.name}\nEmail: ${formData.email}\nDepartment: ${formData.selection}`);
  };

  const inputClass =
    "flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-card p-8 rounded-xl space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Get in Touch</h2>
          <p className="text-gray-400 text-sm">
            Fill it yourself — or just ask the{" "}
            <span className="text-primary font-medium">AI assistant</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your Name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="selection" className="text-sm font-medium text-gray-300">
              Department
            </label>
            <select
              id="selection"
              name="selection"
              required
              value={formData.selection}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  selection: e.target.value,
                }))
              }
              className={`${inputClass} appearance-none`}
            >
              <option value="" disabled className="bg-slate-900">
                Select a department
              </option>
              <option value="sales" className="bg-slate-900">Sales</option>
              <option value="support" className="bg-slate-900">Support</option>
              <option value="marketing" className="bg-slate-900">Marketing</option>
              <option value="other" className="bg-slate-900">Other</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2 mt-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] active:scale-[0.98] transition-all duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
