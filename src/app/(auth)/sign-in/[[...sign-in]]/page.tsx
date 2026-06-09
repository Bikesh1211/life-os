import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import {
  IconChecklist,
  IconBrain,
  IconCoin,
  IconHeart,
} from "@tabler/icons-react";

const features = [
  {
    icon: IconChecklist,
    title: "Daily Operations",
    description: "Tasks, journaling, notes & calendar",
  },
  {
    icon: IconBrain,
    title: "Knowledge & Learning",
    description: "Brain, courses, creative studio & library",
  },
  {
    icon: IconCoin,
    title: "Finance & Assets",
    description: "Budgets, expenses, inventory & purchases",
  },
  {
    icon: IconHeart,
    title: "Wellness & Growth",
    description: "Habits, health, travel, timeline & goals",
  },
];

export default function SignInPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center w-full max-w-5xl px-4 py-8">
      <div className="flex-1 space-y-8 max-w-lg">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Life OS
          </h1>
          <p className="text-lg text-[#909296]">
            Your personal life management platform
          </p>
          <p className="text-sm text-[#5C5F66] leading-relaxed">
            A unified command center for your life — bringing together daily
            operations, knowledge management, personal assets, wellness
            tracking, and long-term strategy in one extensible platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex items-start gap-3 p-3 rounded-lg border border-[#25262B] bg-[#1A1B1E]/50"
              >
                <div className="shrink-0 w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#C1C2C5]">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#5C5F66] mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-md shrink-0">
        <SignIn
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#3b82f6",
              colorBackground: "#141517",
              colorInputBackground: "#1A1B1E",
              colorText: "#C1C2C5",
              colorTextSecondary: "#909296",
              colorInputText: "#C1C2C5",
              colorNeutral: "#2C2E33",
              borderRadius: "0.5rem",
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: "0.875rem",
            },
            elements: {
              card: {
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
                border: "1px solid #25262B",
              },
              headerTitle: {
                fontSize: "1.25rem",
                fontWeight: "600",
              },
              formButtonPrimary: {
                fontSize: "0.875rem",
                fontWeight: "500",
                padding: "0.625rem 1rem",
                background: "#3b82f6",
                transition: "background 150ms ease",
              },
              formButtonPrimaryHover: {
                background: "#2563eb",
              },
              footerActionLink: {
                color: "#3b82f6",
                fontWeight: "500",
              },
              socialButtonsBlockButton: {
                fontSize: "0.875rem",
                fontWeight: "500",
                border: "1px solid #2C2E33",
                background: "#1A1B1E",
                color: "#FFFFFF",
                transition: "background 150ms ease",
              },
              socialButtonsBlockButtonHover: {
                background: "#25262B",
              },
              dividerLine: {
                background: "#2C2E33",
              },
              dividerText: {
                color: "#5C5F66",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
