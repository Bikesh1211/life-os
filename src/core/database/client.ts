import { connectToDatabase } from "@/lib/mongodb";

// Re-export MongoDB connection for backward compatibility
export { connectToDatabase as db };

// Ensure all models are registered by importing the index
import "@/lib/models";

export type DB = typeof import("@/lib/mongodb").connectToDatabase;
