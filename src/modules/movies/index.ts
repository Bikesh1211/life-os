export {
  moviesMedia, moviesPeople,
  movieFavorites, movieRatings, movieWatchlist,
  movieMemories, movieQuotes,
  movieCollections, movieCollectionItems,
} from "./schema";

export {
  syncMediaFromTmdb, toggleFavorite, addToWatchlist,
  createMemory, searchMedia, searchPeople,
  createMemorySchema, updateMemorySchema,
  addFavoriteSchema, ratingSchema, watchlistSchema, quoteSchema, collectionSchema,
} from "./service";

// Using named service exports above — repo barrel removed for tree-shaking
