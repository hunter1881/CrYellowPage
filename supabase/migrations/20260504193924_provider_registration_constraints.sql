alter table public.provider_registrations
add constraint provider_registrations_category_count_check
check (cardinality(category_ids) between 1 and 4);

alter table public.provider_registrations
add constraint provider_registrations_business_name_trim_check
check (business_name = btrim(business_name) and length(business_name) between 3 and 120);

alter table public.provider_registrations
add constraint provider_registrations_contact_name_trim_check
check (contact_name = btrim(contact_name) and length(contact_name) between 3 and 120);

alter table public.provider_registrations
add constraint provider_registrations_description_length_check
check (length(description) between 30 and 500);
