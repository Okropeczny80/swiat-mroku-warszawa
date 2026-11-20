alter table public.locations
  add column if not exists marker_icon text null;

comment on column public.locations.marker_icon is
  'Optional per-location SVG marker asset key stored in the application icon library; null uses the category/default marker.';
