import { getCurrentUserId } from "@/core/auth";
import { getMedicineReminders, getMedicineLogs } from "@/modules/wellness";
import { MedicinesContent } from "./MedicinesContent";

export const dynamic = "force-dynamic";

export default async function MedicinesPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [reminders, logs] = await Promise.all([
    getMedicineReminders(userId),
    getMedicineLogs(userId, { dateFrom: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10) }),
  ]);

  return <MedicinesContent reminders={reminders} logs={logs} />;
}
