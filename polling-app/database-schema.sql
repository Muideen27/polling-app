-- Polls table schema for the polling application
-- This should be created in your Supabase database

-- Main polls table
CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll options table (normalized structure)
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  idx INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on polls table
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security (RLS) on poll_options table
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

-- Create policies for the polls table
-- Users can view all polls
CREATE POLICY "Users can view all polls" ON polls
  FOR SELECT USING (true);

-- Users can create polls
CREATE POLICY "Users can create polls" ON polls
  FOR INSERT WITH CHECK (true);

-- Users can update their own polls
CREATE POLICY "Users can update their own polls" ON polls
  FOR UPDATE USING (true);

-- Users can delete their own polls
CREATE POLICY "Users can delete their own polls" ON polls
  FOR DELETE USING (true);

-- Create policies for the poll_options table
-- Users can view all poll options
CREATE POLICY "Users can view all poll options" ON poll_options
  FOR SELECT USING (true);

-- Users can create poll options
CREATE POLICY "Users can create poll options" ON poll_options
  FOR INSERT WITH CHECK (true);

-- Users can update poll options
CREATE POLICY "Users can update poll options" ON poll_options
  FOR UPDATE USING (true);

-- Users can delete poll options
CREATE POLICY "Users can delete poll options" ON poll_options
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_idx ON poll_options(idx);

-- Add unique constraint to prevent duplicate options for the same poll
CREATE UNIQUE INDEX IF NOT EXISTS idx_poll_options_unique ON poll_options(poll_id, idx);
