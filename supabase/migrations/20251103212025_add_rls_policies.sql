ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read" 
ON articles
FOR SELECT 
USING (true);

create policy "Allow read access for all"
on subscriptions
for select
using (true);

-- allow public inserts
create policy "Allow insert for all"
on subscriptions
for insert
with check (true);

-- allow public updates
create policy "Allow update for all"
on subscriptions
for update
using (true)
with check (true);

