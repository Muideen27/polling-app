-- Polls table schema for the polling application
-- This should be created in your Supabase database

CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of objects: [{"text": "Option 1", "votes": 0}, {"text": "Option 2", "votes": 0}]
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- Create policies for the polls table
-- Users can view all polls
CREATE POLICY "Users can view all polls" ON polls
  FOR SELECT USING (true);

-- Users can create polls
CREATE POLICY "Users can create polls" ON polls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own polls
CREATE POLICY "Users can update their own polls" ON polls
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own polls
CREATE POLICY "Users can delete their own polls" ON polls
  FOR DELETE USING (auth.uid() = user_id);

-- Create an index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_polls_user_id ON polls(user_id);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
