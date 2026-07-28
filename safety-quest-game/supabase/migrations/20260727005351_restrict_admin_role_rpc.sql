-- Role changes are performed only by the future admin Edge Function using the
-- service-role key; browser clients must not invoke this privileged RPC.
revoke execute on function public.admin_set_role(uuid, public.app_role) from authenticated;
