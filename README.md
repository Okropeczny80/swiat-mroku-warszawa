# Świat Mroku — Warszawa 1997

Nowy, czysty projekt aplikacji. Obecna produkcja pozostaje osobnym, nietkniętym punktem powrotu.

## Zasady pracy
- Wszystkie zmiany trafiają najpierw do Preview.
- Każda wersja jest commitowana w Git.
- Nie zapisujemy sekretów w repozytorium.
- Schemat i dane Supabase są utrzymywane oddzielnie od kodu.
- Produkcja jest promowana dopiero po testach.

## Stack
- Next.js 15.5.29 / React 19
- Supabase Auth + Postgres
- MapLibre GL

## Stan początkowy
- Minimalny szkielet Next.js.
- Formularz logowania e-mail + hasło.
- Klient Supabase czyta wyłącznie zmienne publiczne.
- Brak destrukcyjnych zmian w bazie.
