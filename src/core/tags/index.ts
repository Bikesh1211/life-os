export { CoreTagModel, CoreTaggingModel } from "@/lib/models/core";
export type { ICoreTag, ICoreTagging } from "@/lib/models/core";

export { createTag, getTagsForUser, deleteTag, setEntityTags, getEntityTagIds } from "./service";
export type { Tag, CreateTagInput } from "./repository";
