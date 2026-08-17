import type { TablerIcon } from "@tabler/icons-react";
import {
  IconBeach,
  IconBuildingBank,
  IconBuildingChurch,
  IconBuildingSkyscraper,
  IconMountain,
  IconToolsKitchen2,
  IconTrees,
  IconBackpack,
} from "@tabler/icons-react";
import type { TravelCategory } from "./expedition";

/**
 * The eight kinds of outing the archive recognises.
 *
 * This is the single place a category is described: the URL segment, the label,
 * the noun, the icon and the blurb all come from here, so `/travel/explore/beaches`
 * and `/travel/explore/mountains` are two lines of configuration rather than two
 * route files with their own copy.
 *
 * The enum itself is `wishlist_category` on the database, because a trip, a
 * visited place and a wishlist entry all carry one and the three have to mean
 * the same thing. Reusing the wishlist's own vocabulary rather than inventing a
 * second one is the whole reason the archive can be browsed by kind on day one:
 * every destination already on the wishlist arrives pre-filed.
 */

export interface ExploreCategory {
  key: TravelCategory;
  /** URL segment under `/travel/explore/`. Plural, because it lists many. */
  segment: string;
  label: string;
  /** What one of these is called, for counts and empty states. */
  noun: string;
  nounPlural: string;
  blurb: string;
  icon: TablerIcon;
  empty: string;
}

export const CATEGORIES: ExploreCategory[] = [
  {
    key: "mountains",
    segment: "mountains",
    label: "Mountains",
    noun: "ascent",
    nounPlural: "ascents",
    blurb: "High trails and multi-day walks — the ones done on foot.",
    icon: IconMountain,
    empty: "No mountain trips logged yet.",
  },
  {
    key: "adventure",
    segment: "adventures",
    label: "Adventure",
    noun: "expedition",
    nounPlural: "expeditions",
    blurb: "Rides, paddles and long hauls — where the journey is the point.",
    icon: IconBackpack,
    empty: "No adventures logged yet.",
  },
  {
    key: "beach",
    segment: "beaches",
    label: "Beaches",
    noun: "coast",
    nounPlural: "coasts",
    blurb: "Coastlines, islands and the water at the end of the road.",
    icon: IconBeach,
    empty: "No coastal trips logged yet.",
  },
  {
    key: "spiritual",
    segment: "spiritual",
    label: "Spiritual",
    noun: "site",
    nounPlural: "sites",
    blurb: "Temples, monasteries and quiet ground — the places kept apart.",
    icon: IconBuildingChurch,
    empty: "No sites logged yet.",
  },
  {
    key: "city",
    segment: "cities",
    label: "Cities",
    noun: "city",
    nounPlural: "cities",
    blurb: "Urban exploration — streets, markets, and the places between them.",
    icon: IconBuildingSkyscraper,
    empty: "No cities logged yet.",
  },
  {
    key: "historical",
    segment: "historical",
    label: "Historical",
    noun: "landmark",
    nounPlural: "landmarks",
    blurb: "Ruins, old towns and everything that was here first.",
    icon: IconBuildingBank,
    empty: "No landmarks logged yet.",
  },
  {
    key: "nature",
    segment: "nature",
    label: "Nature",
    noun: "wild place",
    nounPlural: "wild places",
    blurb: "Forests, parks, lakes and falls — ground nobody built.",
    icon: IconTrees,
    empty: "No wild places logged yet.",
  },
  {
    key: "food",
    segment: "food",
    label: "Food",
    noun: "food trip",
    nounPlural: "food trips",
    blurb: "Journeys measured in meals rather than kilometres.",
    icon: IconToolsKitchen2,
    empty: "No food trips logged yet.",
  },
];

const BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]));
const BY_SEGMENT = new Map(CATEGORIES.map((c) => [c.segment, c]));

export function categoryFor(key: TravelCategory): ExploreCategory | undefined {
  return BY_KEY.get(key);
}

export function categoryForSegment(segment: string): ExploreCategory | undefined {
  return BY_SEGMENT.get(segment);
}
