-- =========================================================
-- IGCA PLATFORM — ROW LEVEL SECURITY
-- =========================================================

alter table industries enable row level security;
alter table countries enable row level security;
alter table topics enable row level security;
alter table profiles enable row level security;
alter table research_categories enable row level security;
alter table research_items enable row level security;
alter table research_highlights enable row level security;
alter table research_snapshots enable row level security;
alter table learning_videos enable row level security;
alter table courses enable row level security;
alter table course_modules enable row level security;
alter table course_enrollments enable row level security;
alter table learning_progress enable row level security;
alter table certifications enable row level security;
alter table connection_requests enable row level security;
alter table connections enable row level security;
alter table conversations enable row level security;
alter table conversation_members enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table notification_preferences enable row level security;
alter table whatsapp_preferences enable row level security;
alter table whatsapp_messages enable row level security;
alter table whatsapp_delivery_logs enable row level security;
alter table share_events enable row level security;

-- ---------------------------------------------------------
-- PUBLIC REFERENCE / CONTENT DATA — readable by any authenticated user
-- ---------------------------------------------------------
create policy "reference readable" on industries for select using (auth.role() = 'authenticated');
create policy "reference readable" on countries for select using (auth.role() = 'authenticated');
create policy "reference readable" on topics for select using (auth.role() = 'authenticated');
create policy "reference readable" on research_categories for select using (auth.role() = 'authenticated');

create policy "published research readable" on research_items
  for select using (published = true and auth.role() = 'authenticated');

create policy "highlights follow research" on research_highlights
  for select using (
    auth.role() = 'authenticated' and exists (
      select 1 from research_items r where r.id = research_id and r.published = true
    )
  );

create policy "snapshots follow research" on research_snapshots
  for select using (
    auth.role() = 'authenticated' and exists (
      select 1 from research_items r where r.id = research_id and r.published = true
    )
  );

create policy "videos readable" on learning_videos for select using (auth.role() = 'authenticated');
create policy "courses readable" on courses for select using (auth.role() = 'authenticated');
create policy "modules readable" on course_modules for select using (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------
create policy "profiles publicly viewable to members" on profiles
  for select using (auth.role() = 'authenticated');

create policy "users update own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "users insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- ---------------------------------------------------------
-- LEARNING PROGRESS / ENROLLMENTS / CERTIFICATIONS — owner only
-- ---------------------------------------------------------
create policy "own enrollments" on course_enrollments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own progress" on learning_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own certifications select" on certifications
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- CONNECTIONS
-- ---------------------------------------------------------
create policy "see requests involving me" on connection_requests
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "create requests as sender" on connection_requests
  for insert with check (auth.uid() = sender_id);

create policy "receiver responds to request" on connection_requests
  for update using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

create policy "see my connections" on connections
  for select using (auth.uid() = user_a or auth.uid() = user_b);

-- ---------------------------------------------------------
-- MESSAGING — only conversation members
-- ---------------------------------------------------------
create policy "members see their conversations" on conversations
  for select using (
    exists (select 1 from conversation_members m where m.conversation_id = id and m.user_id = auth.uid())
  );

create policy "members see membership rows" on conversation_members
  for select using (
    exists (select 1 from conversation_members m2 where m2.conversation_id = conversation_id and m2.user_id = auth.uid())
  );

create policy "user joins as self" on conversation_members
  for insert with check (auth.uid() = user_id);

create policy "members read messages" on messages
  for select using (
    exists (select 1 from conversation_members m where m.conversation_id = conversation_id and m.user_id = auth.uid())
  );

create policy "members send messages" on messages
  for insert with check (
    auth.uid() = sender_id and exists (
      select 1 from conversation_members m where m.conversation_id = conversation_id and m.user_id = auth.uid()
    )
  );

create policy "sender updates own message seen state" on messages
  for update using (
    exists (select 1 from conversation_members m where m.conversation_id = conversation_id and m.user_id = auth.uid())
  );

-- ---------------------------------------------------------
-- NOTIFICATIONS — owner only
-- ---------------------------------------------------------
create policy "own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "own notifications update" on notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own notification prefs" on notification_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- WHATSAPP — strictly owner-only, never cross-user
-- ---------------------------------------------------------
create policy "own whatsapp prefs" on whatsapp_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own whatsapp messages read" on whatsapp_messages
  for select using (auth.uid() = user_id);
-- Inserts/updates to whatsapp_messages happen ONLY via service-role in Edge Functions.

create policy "own whatsapp logs read" on whatsapp_delivery_logs
  for select using (
    exists (select 1 from whatsapp_messages w where w.id = whatsapp_message_id and w.user_id = auth.uid())
  );

-- ---------------------------------------------------------
-- SHARE EVENTS — owner only
-- ---------------------------------------------------------
create policy "own share events" on share_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
