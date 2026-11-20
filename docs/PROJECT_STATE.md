# Stan projektu — audyt 2026-11-20

## Źródła audytu
- Repozytorium GitHub: `Okropeczny80/swiat-mroku-warszawa`, gałąź `main`.
- Supabase: projekt `bbcgkzaqkzkcerltfizq`.
- Biblia Projektu v1.0 pozostaje dokumentem nadrzędnym w bibliotece projektu.
- Audyt nie zmieniał danych, użytkownika, ustawień Auth ani schematu bazy.

## Kod aplikacji
Zaimplementowane w `app/page.tsx` i `components/MapView.tsx`:
- logowanie e-mail/hasło przez `signInWithPassword`;
- mapa MapLibre z kafelkami OpenStreetMap;
- lista i filtrowanie lokalizacji oraz kategorii;
- wybór znacznika i karta lokalizacji;
- dodawanie lokalizacji przez kliknięcie mapy lub formularz;
- edycja i soft-delete lokalizacji;
- notatki MG;
- wyznaczanie tras samochodem/pieszo przez usługę routingu OSM.

Nieukończone:
- moduły postaci, organizacji, relacji i archiwum (zakładki wyłączone);
- galerie i upload zdjęć;
- zarządzanie kategoriami;
- kosz i przywracanie w UI;
- globalna wyszukiwarka.

## Baza danych
Stan potwierdzony 2026-11-20:
- Supabase `ACTIVE_HEALTHY`, PostgreSQL 17;
- 20 tabel publicznych, wszystkie z RLS;
- 33 polityki w sprawdzonych schematach public/private/storage;
- 1 użytkownik Auth, 1 aktywny użytkownik MG;
- 8 kategorii lokalizacji i 2 nieusunięte lokalizacje;
- 0 postaci, 0 organizacji, 0 relacji, 0 materiałów archiwalnych;
- bucket `world-assets` istnieje, 0 obiektów.

Zarejestrowane w Supabase migracje:
- `20261115154700` — `world_entities_relationships_and_media`
- `20261115191257` — `fresh_world_mood_archive_v1`
- `20261115191629` — `private_media_bucket_and_gm_access`

Plików SQL tych migracji nie znaleziono w repozytorium. Nie należy ich fabrykować ani twierdzić, że są już wersjonowane. Przed następną zmianą DDL trzeba przygotować i zweryfikować baseline z rzeczywistego schematu.

## Diagnostyka logowania — 2026-11-20
Supabase Auth logs zawierają serię żądań z kanonicznej domeny aplikacji do endpointu `/token` z:
- `grant_type=password`;
- HTTP 400;
- `error_code=invalid_credentials`;
- komunikatem `Invalid login credentials`.

Konto Auth istnieje, ma potwierdzony adres e-mail, nie jest zbanowane ani usunięte. Ostatnie udane logowanie zapisane w Auth przypada na 2026-11-15.

Wniosek: przeglądarka dociera do właściwego Supabase i wywołuje właściwy endpoint logowania. Odrzucane są poświadczenia (adres e-mail i/lub hasło), a nie połączenie aplikacji z bazą ani brak konta. Logi nie pozwalają odróżnić błędnego hasła od innego adresu wpisanego w formularzu. Nie wykonano resetu hasła ani zmiany konta.

## Ostrzeżenia audytu
- Supabase Security Advisor: ochrona przed hasłami ujawnionymi w wyciekach jest wyłączona.
- Supabase Performance Advisor: 78 nieużywanych indeksów; na tym etapie nie usuwać, bo część modułów nie jest jeszcze używana.
- Supabase Health Advisor: brak zgłoszonych problemów.
- Dostęp administracyjny do Vercel API podczas audytu zwracał 403; bieżącego stanu deploymentu nie udało się niezależnie potwierdzić.

## Następne kroki
1. Rozwiązać problem poświadczeń MG bez resetowania konta bez zgody właściciela.
2. Zweryfikować produkcyjne wdrożenie, gdy dostęp do Vercel będzie możliwy.
3. Przygotować audytowalny baseline migracyjny z rzeczywistego schematu.
4. Kontynuować rozwój od dokończenia modułu mapy zgodnie z Biblią v1.0.
