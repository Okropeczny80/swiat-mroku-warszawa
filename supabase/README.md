# Supabase — projekt Warszawa 1997

## Zachowany projekt

- Project ref: `bbcgkzaqkzkcerltfizq`
- Project name: `1997`
- Region: `eu-central-1`
- PostgreSQL: 17
- Status podczas audytu 2026-11-20: `ACTIVE_HEALTHY`
- Bucket Storage: `world-assets` (zachowany)
- Konto MG: jedno konto użytkownika, jedno aktywne członkostwo MG

Nie resetować projektu, użytkownika MG, danych ani Storage.

## Aktualna struktura

Schemat `public` zawiera 20 tabel:
- `location_categories`, `locations`, `location_photos`
- `character_types`, `characters`, `character_photos`
- `organization_types`, `organizations`, `organization_memberships`, `organization_locations`, `organization_hierarchy`
- `relationship_types`, `relationships`
- `archive_folders`, `archive_categories`, `archive_tags`, `archive_items`, `archive_item_tags`, `archive_item_links`
- `audit_log`

Dodatkowo istnieje `private.gm_users`.

Podczas audytu wszystkie 20 tabel publicznych miały włączone RLS. Polityki obejmowały 33 wpisy w schematach public/private/storage. Dostęp domenowy jest przeznaczony dla aktywnego MG.

## Dane podczas audytu 2026-11-20

| Obszar | Liczba |
|---|---:|
| Konta Auth | 1 |
| Aktywne członkostwa MG | 1 |
| Kategorie lokalizacji | 8 |
| Lokalizacje nieusunięte | 2 |
| Typy postaci | 7 |
| Postacie | 0 |
| Typy organizacji | 7 |
| Organizacje | 0 |
| Typy relacji | 6 |
| Relacje | 0 |
| Foldery archiwum | 1 |
| Kategorie archiwum | 6 |
| Materiały archiwalne | 0 |
| Obiekty w bucket `world-assets` | 0 |

Liczby są migawką z audytu, a nie wartościami stałymi.

## Historia migracji zarejestrowana w Supabase

Podczas audytu baza zwróciła trzy zastosowane migracje:

1. `20261115154700_world_entities_relationships_and_media`
2. `20261115191257_fresh_world_mood_archive_v1`
3. `20261115191629_private_media_bucket_and_gm_access`

**Ważna luka:** w repozytorium nie odnaleziono odpowiadających im plików SQL w `supabase/migrations`. Rejestr migracji w bazie nie zastępuje plików źródłowych w Git. Nie należy tworzyć fikcyjnych plików migracji ani oznaczać ręcznie odtworzonego SQL jako oryginalnego źródła.

Przed kolejną zmianą DDL należy:
1. wykonać kopię/eksport aktualnego schematu;
2. odczytać definicje tabel, indeksów, funkcji, triggerów, polityk i Storage;
3. odtworzyć kontrolowany, audytowalny baseline migracyjny z aktualnego schematu;
4. zweryfikować baseline na odizolowanej bazie/branchu, jeśli będzie dostępny;
5. dopiero potem wykonywać kolejne zmiany przez nowe migracje.

## Bezpieczeństwo

- Nigdy nie umieszczać klucza `service_role` ani sekretnego klucza w kodzie przeglądarkowym.
- Frontend używa wyłącznie `NEXT_PUBLIC_SUPABASE_URL` i klucza publishable (ewentualnie legacy anon).
- Wszystkie tabele w eksponowanym schemacie publicznym muszą mieć RLS i odpowiednie polityki.
- Funkcje `SECURITY DEFINER`, widoki i polityki Storage wymagają osobnego przeglądu bezpieczeństwa.
- Ostrzeżenie audytu 2026-11-20: ochrona Supabase Auth przed hasłami ujawnionymi w wyciekach była wyłączona. Nie była włączana w ramach audytu.
- Nie resetować hasła MG w ramach diagnostyki bez zgody właściciela.

## Klient aplikacji

Plik `lib/supabase.ts` tworzy klienta z:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` lub `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Pliki środowiskowe i wartości sekretów pozostają poza repozytorium.
