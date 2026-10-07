-- Community histogram: how many people landed in each ratio bucket, per layout.
CREATE TABLE IF NOT EXISTS hist (
  layout TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (layout, bucket)
) WITHOUT ROWID;
