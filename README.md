# Świat Mroku — Warszawa 1997

Prywatna aplikacja Mistrza Gry do prowadzenia kampanii Świata Mroku osadzonej w Warszawie w 1997 roku.

## Zasady pracy

- Główna i jedyna aktywna gałąź robocza: `main`.
- Jeden projekt Vercel i jeden kanoniczny adres produkcyjny: https://swiat-mroku-warszawa.vercel.app
- Nie tworzymy Preview deployments ani dodatkowych projektów/URL-i.
- Zmiany kodu są commitowane w GitHub przed wdrożeniem.
- Produkcja, konto MG, projekt Supabase, bucket Storage i dane nie mogą być usuwane ani resetowane.
- Nie wykonujemy destrukcyjnych zmian w bazie ani resetu hasła MG bez wyraźnej zgody.
- Sekrety i pliki środowiskowe nie trafiają do repozytorium.
- Zmiany schematu bazy wymagają wersjonowanej migracji i weryfikacji; nie wolno traktować ręcznej zmiany w dashboardzie jako wersjonowanej.
- Przed zmianą produkcyjnej bazy należy sprawdzić aktualny schemat, polityki, kopię bezpieczeństwa i wpływ migracji.

## Wdrożenia

Ze względu na świadomą decyzję o wyłączeniu Preview deployments:
1. sprawdź zmianę lokalnie lub przez dostępne kontrole statyczne/testy;
2. przejrzyj diff i upewnij się, że nie narusza danych ani istniejącego interfejsu;
3. commituj na `main`;
4. wdrażaj wyłącznie do istniejącego środowiska Production;
5. sprawdź status wdrożenia i kanoniczny adres produkcyjny.

Nie włączaj Preview deployments bez wyraźnej zgody właściciela projektu.

## Stack

- Next.js 15.5.29 / React 19
- Supabase Auth + PostgreSQL 17
- MapLibre GL
- OpenStreetMap tiles
- OpenStreetMap routing service

## Aktualny zakres aplikacji

Zaimplementowane: logowanie e-mail/hasło, ekran mapy Warszawy, lokalizacje i kategorie, dodawanie/edycja/soft-delete lokalizacji, notatki MG, wyznaczanie tras pieszych i samochodowych.

Nieukończone moduły: pełne karty postaci, organizacje, powiązania, archiwum, globalna wyszukiwarka i interfejs kosza/przywracania. Obsługa fotografii lokalizacji została dodana do kodu, ale wymaga jeszcze pełnego testu produkcyjnego (upload, signed URL, wybór zdjęcia głównego, ponowne otwarcie karty i usuwanie). Galerie postaci i organizacji nie są jeszcze zaimplementowane.

## Dokumentacja

- [Decyzje projektu](docs/DECISIONS.md)
- [Stan projektu](docs/PROJECT_STATE.md)
- [Supabase i migracje](supabase/README.md)
- Biblia Projektu — Świat Mroku, Warszawa 1997, v1.0 — nadrzędny dokument referencyjny przechowywany w bibliotece projektu.
