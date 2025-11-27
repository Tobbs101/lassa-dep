-- Email Subscriptions Table
-- This table stores email addresses of users who want to receive updates about the AI4Lassa system

CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  verification_token VARCHAR(255),
  verified_at TIMESTAMP WITH TIME ZONE,
  unsubscribe_token VARCHAR(255) DEFAULT gen_random_uuid()::text,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_active ON email_subscriptions(is_active);

-- Add RLS (Row Level Security) policies
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe)
CREATE POLICY "Anyone can subscribe"
  ON email_subscriptions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON email_subscriptions
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated users (admins) can update
CREATE POLICY "Only admins can update subscriptions"
  ON email_subscriptions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users (admins) can delete
CREATE POLICY "Only admins can delete subscriptions"
  ON email_subscriptions
  FOR DELETE
  TO authenticated
  USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_email_subscriptions_updated_at
  BEFORE UPDATE ON email_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_email_subscriptions_updated_at();

-- Add comment to table
COMMENT ON TABLE email_subscriptions IS 'Stores email addresses for users who want to receive update notifications about the AI4Lassa system';

