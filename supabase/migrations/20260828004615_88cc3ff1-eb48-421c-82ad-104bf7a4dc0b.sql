SELECT cron.schedule(
  'weekly-recruiters-refresh',
  '0 5 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://project--8c395d12-4049-4e07-bf0a-9ce2caa6857e.lovable.app/api/public/hooks/refresh-recruiters',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'LOVABLE_CRON_SECRET' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);