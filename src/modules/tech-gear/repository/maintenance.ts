import { db } from "@/core/database";
import { techMaintenanceLog } from "../schema/maintenance";
import { eq, desc } from "drizzle-orm";

export type MaintenanceEntry = typeof techMaintenanceLog.$inferSelect;
export type CreateMaintenanceInput = typeof techMaintenanceLog.$inferInsert;

export async function createMaintenance(input: CreateMaintenanceInput) {
  const [entry] = await db.insert(techMaintenanceLog).values(input).returning();
  return entry;
}

export async function getMaintenanceForItem(itemId: string) {
  return db
    .select()
    .from(techMaintenanceLog)
    .where(eq(techMaintenanceLog.itemId, itemId))
    .orderBy(desc(techMaintenanceLog.date));
}
