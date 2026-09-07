"use client";

import { useEffect, useState } from "react";

type Props = {
  message: string;
  onDone: () => void;
};

export function Toast({ message, onDone }: Props) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (leaving) {
      const t = setTimeout(onDone, 250);
      return () => clearTimeout(t);
    }
  }, [leaving, onDone]);

  return (
    <div className={`toast ${leaving ? "is-leaving" : ""}`} role="status">
      {message}
    </div>
  );
}
