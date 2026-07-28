alter table public.hazard_certificates
  add column certificate_number text;

update public.hazard_certificates
   set certificate_number = 'SQ-RISK-' || to_char(created_at at time zone 'Asia/Seoul', 'YYYYMMDD') || '-' || upper(substr(replace(id::text, '-', ''), 1, 10))
 where certificate_number is null;

alter table public.hazard_certificates
  alter column certificate_number set not null,
  add constraint hazard_certificates_certificate_number_key unique (certificate_number),
  add constraint hazard_certificates_certificate_number_format
    check (certificate_number ~ '^SQ-RISK-[0-9]{8}-[A-Z0-9]{10}$');

create index hazard_certificates_certificate_number_idx
  on public.hazard_certificates(certificate_number);
