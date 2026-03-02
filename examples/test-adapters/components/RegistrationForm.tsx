"use client";

import { useState } from "react";
import { useAngiComponent } from "@angi-ai/angi/client";
import type { AngiAction } from "@angi-ai/angi/client";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    experience: "",
    dietary: "",
  });

  const fillField: AngiAction = {
    description: "Fill a single field in the registration form",
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
      setFormData({
        fullName: "",
        email: "",
        age: "",
        experience: "",
        dietary: "",
      });
    },
  };

  useAngiComponent({
    description:
      "Event registration form with fields: fullName, email, age, experience (beginner/intermediate/advanced), dietary (none/vegetarian/vegan/gluten-free)",
    getState: () => ({ ...formData }),
    actions: { fillField, resetForm },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Registered!\nName: ${formData.fullName}\nEmail: ${formData.email}\nAge: ${formData.age}\nExperience: ${formData.experience}\nDietary: ${formData.dietary}`
    );
  };

  const inputClass =
    "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Workshop Registration
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Fill it yourself or ask the AI to do it.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Jane Smith"
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, fullName: e.target.value }))
            }
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="jane@example.com"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Age
          </label>
          <input
            id="age"
            type="text"
            placeholder="25"
            value={formData.age}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, age: e.target.value }))
            }
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="experience"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Experience Level
          </label>
          <select
            id="experience"
            required
            value={formData.experience}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, experience: e.target.value }))
            }
            className={inputClass}
          >
            <option value="" disabled>
              Select level
            </option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="dietary"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Dietary Preference
          </label>
          <select
            id="dietary"
            value={formData.dietary}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dietary: e.target.value }))
            }
            className={inputClass}
          >
            <option value="" disabled>
              Select preference
            </option>
            <option value="none">None</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten-free">Gluten-Free</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Register
        </button>
      </form>
    </div>
  );
}
