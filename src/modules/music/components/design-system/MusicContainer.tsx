"use client";

type MusicContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function MusicContainer({ children, className = "" }: MusicContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
