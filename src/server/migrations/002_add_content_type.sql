-- Add content_type to support movie and TV show queues per group

ALTER TABLE queue_items
  ADD COLUMN content_type TEXT NOT NULL DEFAULT 'movie';

ALTER TABLE queue_items
  DROP CONSTRAINT queue_items_group_id_tmdb_id_key;

ALTER TABLE queue_items
  ADD CONSTRAINT queue_items_group_id_tmdb_id_content_type_key
  UNIQUE (group_id, tmdb_id, content_type);

DROP INDEX idx_queue_items_group_position;

CREATE INDEX idx_queue_items_group_position
  ON queue_items(group_id, content_type, is_watched, position);
