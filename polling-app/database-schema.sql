-- Polls table schema for the polling application
-- This should be created in your Supabase database

-- Enable uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main polls table
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL, -- Array of text for poll options
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Votes table (instead of poll_options)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  option_index INTEGER NOT NULL, -- Index of the chosen option
  voter_fingerprint TEXT, -- Browser fingerprint for anonymous voting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable Row Level Security (RLS) on polls table
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security (RLS) on votes table
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

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

-- Create policies for the votes table
-- Users can view all votes
CREATE POLICY "Users can view all votes" ON votes
  FOR SELECT USING (true);

-- Users can create votes
CREATE POLICY "Users can create votes" ON votes
  FOR INSERT WITH CHECK (true);

-- Users can update their own votes
CREATE POLICY "Users can update their own votes" ON votes
  FOR UPDATE USING (true);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes" ON votes
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_user_id ON polls(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- Optional: Prevent duplicate votes per user per poll (if desired)
CREATE UNIQUE INDEX IF NOT EXISTS unique_vote_per_user_per_poll ON votes(poll_id, user_id);

-- Prevent duplicate votes per fingerprint per poll (for anonymous voting)
CREATE UNIQUE INDEX IF NOT EXISTS unique_vote_per_fingerprint_per_poll ON votes(poll_id, voter_fingerprint) 
WHERE voter_fingerprint IS NOT NULL;
