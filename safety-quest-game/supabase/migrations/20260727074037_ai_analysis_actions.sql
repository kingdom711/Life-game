-- Allow only the analysis owner to record a follow-up action.
create policy "ai analysis: user updates own action" on public.ai_analysis_history
for update to authenticated
using ((select auth.uid())=user_id)
with check ((select auth.uid())=user_id);
grant update (action_taken, action_status, updated_at) on public.ai_analysis_history to authenticated;
