-- D1データベースのスキーマ定義

-- ショッピングノートテーブル
CREATE TABLE IF NOT EXISTS shopping_notes (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- マップノートテーブル
CREATE TABLE IF NOT EXISTS map_notes (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- カレンダーノートテーブル
CREATE TABLE IF NOT EXISTS calendar_notes (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- 既存のテーブルにpersonカラムを追加（既存のレコードはデフォルト値1を設定）
ALTER TABLE calendar_notes ADD COLUMN person INTEGER NOT NULL DEFAULT 1;

-- 単語帳テーブル（英語・日本語・中国語の対応表）
CREATE TABLE IF NOT EXISTS words (
  id TEXT PRIMARY KEY,
  english TEXT NOT NULL,
  japanese TEXT NOT NULL,
  chinese TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- 単語帳に絵文字カラムを追加（単語のイメージ絵文字、任意）
ALTER TABLE words ADD COLUMN emoji TEXT NOT NULL DEFAULT '';

-- 四字熟語クイズテーブル（絵文字→四字熟語）
CREATE TABLE IF NOT EXISTS idioms (
  id TEXT PRIMARY KEY,
  emoji TEXT NOT NULL,
  chinese TEXT NOT NULL,
  japanese TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);
