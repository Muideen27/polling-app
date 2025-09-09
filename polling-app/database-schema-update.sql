-- Database schema update to add voter_fingerprint column and constraints
-- Run this in your Supabase SQL editor to update the existing database

-- Add voter_fingerprint column to votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS voter_fingerprint TEXT;

-- Add unique constraint for fingerprint-based voting
CREATE UNIQUE INDEX IF NOT EXISTS unique_vote_per_fingerprint_per_poll ON votes(poll_id, voter_fingerprint) 
WHERE voter_fingerprint IS NOT NULL;

-- Update the existing unique constraint to handle both user_id and voter_fingerprint
-- First drop the old constraint if it exists
DROP INDEX IF EXISTS unique_vote_per_user_per_poll;

-- Create a new constraint that handles both authenticated and anonymous voting
CREATE UNIQUE INDEX IF NOT EXISTS unique_vote_per_user_per_poll ON votes(poll_id, user_id) 
WHERE user_id IS NOT NULL;

-- Add a check constraint to ensure either user_id or voter_fingerprint is provided
ALTER TABLE votes ADD CONSTRAINT check_voter_identity 
CHECK (user_id IS NOT NULL OR voter_fingerprint IS NOT NULL);