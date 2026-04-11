Run in Supabase SQL Editor:

```sql
alter table tones add column if not exists amp_style text default 'modern-black';
```

Valid values: `modern-black` | `vintage-cream` | `british-gold` | `custom-dark`
