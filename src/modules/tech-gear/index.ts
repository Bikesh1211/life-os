export {
  createTechItem,
  getTechItems,
  getTechItem,
  updateTechItem,
  deleteTechItem,
  getDashboardStats,
  createSetup,
  getSetups,
  getSetup,
  updateSetup,
  deleteSetup,
  createMaintenance,
  getMaintenance,
} from "./service";

export type { CreateItemParams, UpdateItemParams, CreateSetupParams, UpdateSetupParams, CreateMaintenanceParams } from "./service/validators";
export type { TechItem, ItemFilters } from "./repository/items";
export type { Setup } from "./repository/setups";
export type { MaintenanceEntry } from "./repository/maintenance";

export { createItemSchema, updateItemSchema, createSetupSchema, updateSetupSchema, createMaintenanceSchema } from "./service/validators";
export { TECH_CATEGORIES, OWNERSHIP_STATUSES, CONDITIONS } from "./constants";
