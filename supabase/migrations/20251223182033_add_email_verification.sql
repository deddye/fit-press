ALTER TABLE subscriptions
ADD COLUMN verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN verification_token TEXT,
ADD COLUMN verification_sent_at TIMESTAMPTZ default now(),
ADD COLUMN verified_at TIMESTAMPTZ;

CREATE UNIQUE INDEX subscriptions_verification_token_idx
ON subscriptions (verification_token)
WHERE verification_token IS NOT NULL;

CREATE INDEX subscriptions_verified_idx
ON subscriptions (verified)
WHERE verified = true;
