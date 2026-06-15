ALTER TABLE "music_memory_songs" DROP CONSTRAINT "music_memory_songs_track_id_fkey";
ALTER TABLE "music_memory_songs" ALTER COLUMN "track_id" SET DATA TYPE text;
