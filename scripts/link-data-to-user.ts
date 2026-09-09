#!/usr/bin/env tsx
/**
 * Link all migrated data to a single user.
 *
 * Finds the user by email in the `users` collection, then rewrites the
 * `userId` field on every document in every other collection to the user's
 * _id (as string). The previous value is preserved in `prevUserId` so the
 * operation is reversible.
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://.../life-os" npx tsx scripts/link-data-to-user.ts user@example.com
 *   MONGODB_URI=".../life-os" npx tsx scripts/link-data-to-user.ts user@example.com --dry-run
 */

import mongoose from "mongoose";
import { connectToDatabase } from "../src/lib/mongodb";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const email = args.find((a) => !a.startsWith("--"));

if (!email) {
  console.error('Usage: npx tsx scripts/link-data-to-user.ts <email> [--dry-run]');
  process.exit(1);
}

async function main() {
  const conn = await connectToDatabase();
  const db = conn.connection.db;
  if (!db) throw new Error("No DB handle");
  console.log(`Connected → db: "${conn.connection.name}"\n`);

  const user = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    console.error(`User not found: ${email}`);
    const all = await db.collection("users").find({}).project({ email: 1 }).toArray();
    console.log("Existing users:", all.map((u) => u.email).join(", ") || "(none)");
    process.exit(1);
  }
  const newId = String(user._id);
  console.log(`User: ${user.email}  _id: ${newId}\n`);
  if (DRY_RUN) console.log("DRY RUN — no writes\n");

  const cols = (await db.listCollections().toArray()).map((c) => c.name).sort();
  let totalMatched = 0;
  let totalModified = 0;

  for (const name of cols) {
    if (name === "users") continue;
    const col = db.collection(name);
    const filter = { userId: { $exists: true, $ne: newId } };
    const matched = await col.countDocuments(filter);
    if (matched === 0) continue;
    const olds = await col.distinct("userId", filter);
    console.log(`${name}: ${matched} docs  old userIds: ${olds.join(", ").slice(0, 160)}`);
    totalMatched += matched;
    if (!DRY_RUN) {
      try {
        const res = await col.updateMany(filter, [
          { $set: { prevUserId: "$userId", userId: newId } },
        ] as any);
        totalModified += res.modifiedCount ?? 0;
      } catch (e: any) {
        if (e?.code !== 11000) throw e;
        // Unique index collision: repoint docs one by one. When the
        // conflicting new-user row is a fresh auto-created default
        // (≤7 days old) it is replaced by the real history doc.
        const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
        const docs = await col.find(filter).project({ _id: 1, userId: 1 }).toArray();
        let done = 0;
        for (const d of docs) {
          try {
            const r = await col.updateOne({ _id: d._id }, [
              { $set: { prevUserId: "$userId", userId: newId } },
            ] as any);
            done += r.modifiedCount ?? 0;
          } catch (e2: any) {
            if (e2?.code !== 11000) throw e2;
            const fresh = await col.findOne({ userId: newId });
            const freshOk = fresh && (fresh as any).createdAt >= weekAgo;
            if (fresh && freshOk) {
              await col.deleteOne({ _id: (fresh as any)._id });
              console.log(`  ↳ replaced fresh default row in ${name}`);
              const r = await col.updateOne({ _id: d._id }, [
                { $set: { prevUserId: "$userId", userId: newId } },
              ] as any);
              done += r.modifiedCount ?? 0;
            } else {
              console.log(`  ↳ skipped ${name} doc ${d._id} (old owner ${d.userId}): live row already exists for new user`);
            }
          }
        }
        totalModified += done;
      }
    }
  }

  console.log(`\n${DRY_RUN ? "Would update" : "Updated"}: ${DRY_RUN ? totalMatched : totalModified} docs`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
