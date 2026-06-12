-- Drop foreign key constraints on music_memories
ALTER TABLE "music_memories" DROP CONSTRAINT IF EXISTS "music_memories_track_id_music_tracks_id_fkey";
ALTER TABLE "music_memories" DROP CONSTRAINT IF EXISTS "music_memories_album_id_music_albums_id_fkey";
ALTER TABLE "music_memories" DROP CONSTRAINT IF EXISTS "music_memories_artist_id_music_artists_id_fkey";
ALTER TABLE "music_memories" DROP CONSTRAINT IF EXISTS "music_memories_track_id_fkey";
ALTER TABLE "music_memories" DROP CONSTRAINT IF EXISTS "music_memories_album_id_fkey";
ALTER TABLE "music_memories" DROP CONSTRAINT IF EXISTS "music_memories_artist_id_fkey";

-- Change column types from uuid to text
ALTER TABLE "music_memories" ALTER COLUMN "track_id" SET DATA TYPE text;
ALTER TABLE "music_memories" ALTER COLUMN "album_id" SET DATA TYPE text;
ALTER TABLE "music_memories" ALTER COLUMN "artist_id" SET DATA TYPE text;
