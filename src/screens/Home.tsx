import React from "react";

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)]">
      <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-4">
        Welcome to the Home Page
      </h1>
      <p className="text-lg text-[var(--color-foreground)]">
        This is a simple home page built with React and Tailwind CSS.
      </p>
    </div>
  );
}