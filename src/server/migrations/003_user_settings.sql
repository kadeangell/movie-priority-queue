-- Create theme enum and user_settings composite type

CREATE TYPE pixel_theme AS ENUM ('overworld', 'dungeon', 'town', 'battle');

CREATE TYPE user_settings AS (
  theme pixel_theme
);

ALTER TABLE users
  ADD COLUMN settings user_settings NOT NULL DEFAULT ROW('overworld')::user_settings;
