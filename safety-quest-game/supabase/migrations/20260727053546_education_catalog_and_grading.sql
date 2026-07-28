create table public.education_courses (
  id text primary key check (char_length(id) between 1 and 100),
  title text not null check (char_length(title) between 1 and 255),
  course_type text not null check (course_type in ('GENERAL', 'SPECIALIZATION')),
  duration_sec integer not null check (duration_sec between 1 and 28800),
  required_watch_sec integer not null check (required_watch_sec > 0 and required_watch_sec <= duration_sec),
  required_score integer not null default 80 check (required_score between 0 and 100),
  legal_hours numeric(6,2) not null default 0 check (legal_hours >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.education_quiz_answers (
  education_id text not null references public.education_courses(id) on delete cascade,
  question_id text not null check (char_length(question_id) between 1 and 100),
  display_order integer not null check (display_order > 0),
  correct_option integer not null check (correct_option between 0 and 20),
  primary key (education_id, question_id)
);

insert into public.education_courses (id, title, course_type, duration_sec, required_watch_sec, required_score, legal_hours, is_active) values
  ('edu_001', 'edu_001', 'GENERAL', 600, 540, 80, 0.17, true),
  ('edu_002', 'edu_002', 'GENERAL', 600, 540, 80, 0.17, true),
  ('edu_003', 'edu_003', 'GENERAL', 480, 432, 80, 0.13, true),
  ('edu_004', 'edu_004', 'GENERAL', 600, 540, 80, 0.17, true),
  ('edu_005', 'edu_005', 'GENERAL', 600, 540, 80, 0.17, true),
  ('edu_006', 'edu_006', 'GENERAL', 480, 432, 80, 0.13, true),
  ('edu_007', 'edu_007', 'GENERAL', 600, 540, 80, 0.17, true),
  ('edu_008', 'edu_008', 'GENERAL', 480, 432, 80, 0.13, true),
  ('edu_009', 'edu_009', 'GENERAL', 600, 540, 80, 0.17, true),
  ('edu_010', 'edu_010', 'GENERAL', 600, 540, 80, 0.17, true),
  ('edu_ws_001', 'edu_ws_001', 'GENERAL', 600, 540, 80, 0.17, true),
  ('edu_ws_002', 'edu_ws_002', 'GENERAL', 600, 540, 80, 0.17, true),
  ('edu_ws_003', 'edu_ws_003', 'GENERAL', 600, 540, 80, 0.17, true),
  ('edu_sp_signal_01', 'edu_sp_signal_01', 'SPECIALIZATION', 900, 810, 90, 0.25, true),
  ('edu_sp_signal_02', 'edu_sp_signal_02', 'SPECIALIZATION', 900, 810, 90, 0.25, true),
  ('edu_sp_crane_01', 'edu_sp_crane_01', 'SPECIALIZATION', 900, 810, 90, 0.25, true),
  ('edu_sp_crane_02', 'edu_sp_crane_02', 'SPECIALIZATION', 900, 810, 90, 0.25, true),
  ('edu_sp_confined_01', 'edu_sp_confined_01', 'SPECIALIZATION', 900, 810, 90, 0.25, true),
  ('edu_sp_confined_02', 'edu_sp_confined_02', 'SPECIALIZATION', 900, 810, 90, 0.25, true),
  ('edu_sp_confined_03', 'edu_sp_confined_03', 'SPECIALIZATION', 900, 810, 90, 0.25, true),
  ('edu_sp_fire_01', 'edu_sp_fire_01', 'SPECIALIZATION', 900, 810, 90, 0.25, true),
  ('edu_sp_fire_02', 'edu_sp_fire_02', 'SPECIALIZATION', 900, 810, 90, 0.25, true),
  ('edu_sp_safety_01', 'edu_sp_safety_01', 'SPECIALIZATION', 900, 810, 90, 0.25, true),
  ('edu_sp_safety_02', 'edu_sp_safety_02', 'SPECIALIZATION', 900, 810, 90, 0.25, true),
  ('edu_sp_safety_03', 'edu_sp_safety_03', 'SPECIALIZATION', 900, 810, 90, 0.25, true);

insert into private.education_quiz_answers (education_id, question_id, display_order, correct_option) values
  ('edu_001', 'q1_001', 1, 3),
  ('edu_001', 'q1_002', 2, 0),
  ('edu_001', 'q1_003', 3, 2),
  ('edu_001', 'q1_004', 4, 2),
  ('edu_001', 'q1_005', 5, 1),
  ('edu_002', 'q2_001', 1, 3),
  ('edu_002', 'q2_002', 2, 3),
  ('edu_002', 'q2_003', 3, 2),
  ('edu_002', 'q2_004', 4, 1),
  ('edu_002', 'q2_005', 5, 3),
  ('edu_003', 'q3_001', 1, 0),
  ('edu_003', 'q3_002', 2, 4),
  ('edu_003', 'q3_003', 3, 2),
  ('edu_003', 'q3_004', 4, 1),
  ('edu_003', 'q3_005', 5, 3),
  ('edu_004', 'q4_001', 1, 1),
  ('edu_004', 'q4_002', 2, 0),
  ('edu_004', 'q4_003', 3, 2),
  ('edu_004', 'q4_004', 4, 3),
  ('edu_004', 'q4_005', 5, 2),
  ('edu_005', 'q5_001', 1, 0),
  ('edu_005', 'q5_002', 2, 1),
  ('edu_005', 'q5_003', 3, 4),
  ('edu_005', 'q5_004', 4, 2),
  ('edu_005', 'q5_005', 5, 0),
  ('edu_006', 'q6_001', 1, 1),
  ('edu_006', 'q6_002', 2, 0),
  ('edu_006', 'q6_003', 3, 2),
  ('edu_006', 'q6_004', 4, 2),
  ('edu_006', 'q6_005', 5, 0),
  ('edu_007', 'q7_001', 1, 1),
  ('edu_007', 'q7_002', 2, 0),
  ('edu_007', 'q7_003', 3, 4),
  ('edu_007', 'q7_004', 4, 2),
  ('edu_007', 'q7_005', 5, 1),
  ('edu_008', 'q8_001', 1, 0),
  ('edu_008', 'q8_002', 2, 2),
  ('edu_008', 'q8_003', 3, 1),
  ('edu_008', 'q8_004', 4, 0),
  ('edu_008', 'q8_005', 5, 4),
  ('edu_009', 'q9_001', 1, 1),
  ('edu_009', 'q9_002', 2, 0),
  ('edu_009', 'q9_003', 3, 3),
  ('edu_009', 'q9_004', 4, 2),
  ('edu_009', 'q9_005', 5, 1),
  ('edu_010', 'q10_001', 1, 0),
  ('edu_010', 'q10_002', 2, 2),
  ('edu_010', 'q10_003', 3, 1),
  ('edu_010', 'q10_004', 4, 0),
  ('edu_010', 'q10_005', 5, 3),
  ('edu_ws_001', 'qws_001', 1, 1),
  ('edu_ws_001', 'qws_002', 2, 2),
  ('edu_ws_001', 'qws_003', 3, 1),
  ('edu_ws_001', 'qws_004', 4, 1),
  ('edu_ws_001', 'qws_005', 5, 1),
  ('edu_ws_002', 'qws2_001', 1, 1),
  ('edu_ws_002', 'qws2_002', 2, 1),
  ('edu_ws_002', 'qws2_003', 3, 1),
  ('edu_ws_002', 'qws2_004', 4, 3),
  ('edu_ws_002', 'qws2_005', 5, 1),
  ('edu_ws_003', 'qws3_001', 1, 1),
  ('edu_ws_003', 'qws3_002', 2, 2),
  ('edu_ws_003', 'qws3_003', 3, 3),
  ('edu_ws_003', 'qws3_004', 4, 1),
  ('edu_ws_003', 'qws3_005', 5, 2),
  ('edu_sp_signal_01', 'qsp_s1_001', 1, 1),
  ('edu_sp_signal_01', 'qsp_s1_002', 2, 3),
  ('edu_sp_signal_01', 'qsp_s1_003', 3, 1),
  ('edu_sp_signal_01', 'qsp_s1_004', 4, 2),
  ('edu_sp_signal_01', 'qsp_s1_005', 5, 1),
  ('edu_sp_signal_01', 'qsp_s1_006', 6, 1),
  ('edu_sp_signal_01', 'qsp_s1_007', 7, 3),
  ('edu_sp_signal_02', 'qsp_s2_001', 1, 3),
  ('edu_sp_signal_02', 'qsp_s2_002', 2, 0),
  ('edu_sp_signal_02', 'qsp_s2_003', 3, 1),
  ('edu_sp_signal_02', 'qsp_s2_004', 4, 2),
  ('edu_sp_signal_02', 'qsp_s2_005', 5, 1),
  ('edu_sp_signal_02', 'qsp_s2_006', 6, 1),
  ('edu_sp_signal_02', 'qsp_s2_007', 7, 1),
  ('edu_sp_crane_01', 'qsp_c1_001', 1, 1),
  ('edu_sp_crane_01', 'qsp_c1_002', 2, 1),
  ('edu_sp_crane_01', 'qsp_c1_003', 3, 1),
  ('edu_sp_crane_01', 'qsp_c1_004', 4, 1),
  ('edu_sp_crane_01', 'qsp_c1_005', 5, 1),
  ('edu_sp_crane_01', 'qsp_c1_006', 6, 2),
  ('edu_sp_crane_01', 'qsp_c1_007', 7, 2),
  ('edu_sp_crane_02', 'qsp_c2_001', 1, 3),
  ('edu_sp_crane_02', 'qsp_c2_002', 2, 1),
  ('edu_sp_crane_02', 'qsp_c2_003', 3, 1),
  ('edu_sp_crane_02', 'qsp_c2_004', 4, 1),
  ('edu_sp_crane_02', 'qsp_c2_005', 5, 1),
  ('edu_sp_crane_02', 'qsp_c2_006', 6, 1),
  ('edu_sp_crane_02', 'qsp_c2_007', 7, 1),
  ('edu_sp_confined_01', 'qsp_cf1_001', 1, 1),
  ('edu_sp_confined_01', 'qsp_cf1_002', 2, 1),
  ('edu_sp_confined_01', 'qsp_cf1_003', 3, 4),
  ('edu_sp_confined_01', 'qsp_cf1_004', 4, 1),
  ('edu_sp_confined_01', 'qsp_cf1_005', 5, 1),
  ('edu_sp_confined_01', 'qsp_cf1_006', 6, 1),
  ('edu_sp_confined_01', 'qsp_cf1_007', 7, 1),
  ('edu_sp_confined_02', 'qsp_cf2_001', 1, 3),
  ('edu_sp_confined_02', 'qsp_cf2_002', 2, 2),
  ('edu_sp_confined_02', 'qsp_cf2_003', 3, 1),
  ('edu_sp_confined_02', 'qsp_cf2_004', 4, 2),
  ('edu_sp_confined_02', 'qsp_cf2_005', 5, 1),
  ('edu_sp_confined_02', 'qsp_cf2_006', 6, 1),
  ('edu_sp_confined_02', 'qsp_cf2_007', 7, 3),
  ('edu_sp_confined_03', 'qsp_cf3_001', 1, 1),
  ('edu_sp_confined_03', 'qsp_cf3_002', 2, 2),
  ('edu_sp_confined_03', 'qsp_cf3_003', 3, 0),
  ('edu_sp_confined_03', 'qsp_cf3_004', 4, 1),
  ('edu_sp_confined_03', 'qsp_cf3_005', 5, 1),
  ('edu_sp_confined_03', 'qsp_cf3_006', 6, 2),
  ('edu_sp_confined_03', 'qsp_cf3_007', 7, 1),
  ('edu_sp_fire_01', 'qsp_f1_001', 1, 1),
  ('edu_sp_fire_01', 'qsp_f1_002', 2, 1),
  ('edu_sp_fire_01', 'qsp_f1_003', 3, 1),
  ('edu_sp_fire_01', 'qsp_f1_004', 4, 1),
  ('edu_sp_fire_01', 'qsp_f1_005', 5, 1),
  ('edu_sp_fire_01', 'qsp_f1_006', 6, 1),
  ('edu_sp_fire_01', 'qsp_f1_007', 7, 1),
  ('edu_sp_fire_02', 'qsp_f2_001', 1, 1),
  ('edu_sp_fire_02', 'qsp_f2_002', 2, 1),
  ('edu_sp_fire_02', 'qsp_f2_003', 3, 1),
  ('edu_sp_fire_02', 'qsp_f2_004', 4, 2),
  ('edu_sp_fire_02', 'qsp_f2_005', 5, 1),
  ('edu_sp_fire_02', 'qsp_f2_006', 6, 1),
  ('edu_sp_fire_02', 'qsp_f2_007', 7, 1),
  ('edu_sp_safety_01', 'qsp_so1_001', 1, 1),
  ('edu_sp_safety_01', 'qsp_so1_002', 2, 1),
  ('edu_sp_safety_01', 'qsp_so1_003', 3, 3),
  ('edu_sp_safety_01', 'qsp_so1_004', 4, 1),
  ('edu_sp_safety_01', 'qsp_so1_005', 5, 1),
  ('edu_sp_safety_01', 'qsp_so1_006', 6, 2),
  ('edu_sp_safety_01', 'qsp_so1_007', 7, 2),
  ('edu_sp_safety_02', 'qsp_so2_001', 1, 3),
  ('edu_sp_safety_02', 'qsp_so2_002', 2, 1),
  ('edu_sp_safety_02', 'qsp_so2_003', 3, 1),
  ('edu_sp_safety_02', 'qsp_so2_004', 4, 3),
  ('edu_sp_safety_02', 'qsp_so2_005', 5, 1),
  ('edu_sp_safety_02', 'qsp_so2_006', 6, 1),
  ('edu_sp_safety_02', 'qsp_so2_007', 7, 3),
  ('edu_sp_safety_03', 'qsp_so3_001', 1, 1),
  ('edu_sp_safety_03', 'qsp_so3_002', 2, 1),
  ('edu_sp_safety_03', 'qsp_so3_003', 3, 1),
  ('edu_sp_safety_03', 'qsp_so3_004', 4, 1),
  ('edu_sp_safety_03', 'qsp_so3_005', 5, 3),
  ('edu_sp_safety_03', 'qsp_so3_006', 6, 2),
  ('edu_sp_safety_03', 'qsp_so3_007', 7, 3);

alter table public.education_courses enable row level security;
create policy "education courses: signed-in users read active catalog" on public.education_courses
  for select to authenticated using (is_active or (select private.is_manager()));
grant select on public.education_courses to authenticated;
grant all on public.education_courses, private.education_quiz_answers to service_role;
revoke all on private.education_quiz_answers from public, anon, authenticated;

create or replace function public.submit_and_grade_education_quiz(
  p_education_id text,
  p_attempt_number integer,
  p_answers jsonb
)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_expected_count integer;
  v_answer_count integer;
  v_correct_count integer;
  v_score integer;
  v_required_score integer;
begin
  if v_user_id is null then raise exception 'Authentication is required' using errcode = '28000'; end if;
  if p_attempt_number not between 1 and 20 or jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) not between 1 and 20 then
    raise exception 'Invalid quiz submission' using errcode = '22023';
  end if;
  select count(*), max(required_score) into v_expected_count, v_required_score
  from public.education_courses c join private.education_quiz_answers q on q.education_id = c.id
  where c.id = p_education_id and c.is_active;
  if v_expected_count = 0 then raise exception 'Education course was not found' using errcode = 'P0002'; end if;
  if jsonb_array_length(p_answers) <> v_expected_count then raise exception 'All quiz answers are required' using errcode = '22023'; end if;
  if (select count(distinct trim(a.question_id))
      from jsonb_to_recordset(p_answers) as a(question_id text, selected_option integer, time_spent_sec integer)) <> v_expected_count then
    raise exception 'Duplicate quiz answer item' using errcode = '22023';
  end if;
  insert into public.education_quiz_answer_logs (user_id, education_id, attempt_number, question_id, selected_option, time_spent_sec)
  select v_user_id, p_education_id, p_attempt_number, trim(a.question_id), a.selected_option, a.time_spent_sec
  from jsonb_to_recordset(p_answers) as a(question_id text, selected_option integer, time_spent_sec integer)
  join private.education_quiz_answers q on q.education_id = p_education_id and q.question_id = trim(a.question_id)
  where a.selected_option between 0 and 20 and (a.time_spent_sec is null or a.time_spent_sec between 0 and 3600);
  get diagnostics v_answer_count = row_count;
  if v_answer_count <> v_expected_count then raise exception 'Invalid or duplicate quiz answer item' using errcode = '22023'; end if;
  select count(*) into v_correct_count
  from jsonb_to_recordset(p_answers) as a(question_id text, selected_option integer, time_spent_sec integer)
  join private.education_quiz_answers q on q.education_id = p_education_id and q.question_id = trim(a.question_id)
  where a.selected_option = q.correct_option;
  v_score := round(100.0 * v_correct_count / v_expected_count);
  return jsonb_build_object('savedCount', v_answer_count, 'attemptNumber', p_attempt_number, 'score', v_score, 'passed', v_score >= v_required_score, 'requiredScore', v_required_score, 'savedAt', now());
end;
$$;
revoke all on function public.submit_and_grade_education_quiz(text, integer, jsonb) from public, anon;
grant execute on function public.submit_and_grade_education_quiz(text, integer, jsonb) to authenticated;
