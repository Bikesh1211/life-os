CREATE TABLE "travel_helper_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"origin" jsonb NOT NULL,
	"destination" jsonb NOT NULL,
	"waypoints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"polyline" text,
	"total_distance_km" numeric(10, 2),
	"total_duration_minutes" integer,
	"transport_mode" text DEFAULT 'driving' NOT NULL,
	"route_date" date,
	"is_archived" boolean DEFAULT false NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"notes" text,
	"elevation_min" numeric(8, 2),
	"elevation_max" numeric(8, 2),
	"elevation_gain" numeric(8, 2),
	"elevation_loss" numeric(8, 2),
	"geometries" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "idx_th_routes_user" ON "travel_helper_routes" ("user_id", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX "idx_th_routes_active" ON "travel_helper_routes" ("user_id", "deleted_at", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX "idx_th_routes_date" ON "travel_helper_routes" ("user_id", "route_date");
