# Decyzje projektu — Świat Mroku, Warszawa 1997

1. Istniejący projekt produkcyjny Vercel pozostaje zachowany jako jedyny projekt aplikacji i punkt powrotu.
2. Kanoniczny adres produkcyjny to https://swiat-mroku-warszawa.vercel.app.
3. Aktywna praca odbywa się na gałęzi GitHub `main`. Nie tworzymy nowych gałęzi roboczych ani Preview deployments.
4. Preview deployments pozostają wyłączone. Nie włączamy ich bez wyraźnej zgody właściciela.
5. Istniejący projekt Supabase, konto MG, dane, polityki RLS i bucket Storage są zachowane. Nie resetujemy ich i nie usuwamy.
6. Wszystkie zmiany kodu są wersjonowane w Git od pierwszego commita.
7. Zmiany schematu bazy są wykonywane wyłącznie przez przeglądane, wersjonowane migracje. Ręczne zmiany w bazie muszą zostać udokumentowane i odtworzone w migracji, zanim uznamy je za część historii projektu.
8. Przed zmianą schematu należy sprawdzić aktualny stan bazy, polityki dostępu, wykonać/zweryfikować kopię bezpieczeństwa i ocenić wpływ zmiany.
9. Nie zmieniamy istniejącego wyglądu ani działających funkcji bez uzgodnienia.
10. Nie wykonujemy resetu hasła, usuwania użytkownika, zmiany uprawnień MG ani destrukcyjnych operacji na danych bez wyraźnej zgody.
11. Po każdym wdrożeniu produkcyjnym sprawdzamy status deploymentu, kanoniczny URL oraz krytyczne ścieżki aplikacji.
12. Biblia Projektu v1.0 jest źródłem wymagań funkcjonalnych i wizualnych. Zmiany wymagań wymagają świadomej decyzji właściciela projektu.

## Uwaga o gałęziach

W chwili ostatniego przeglądu GitHub zwracał `main` oraz dodatkową gałąź `feature/mapa-warszawy`. Zgodnie z decyzją roboczą używana jest wyłącznie `main`; gałąź dodatkowa nie jest wykorzystywana ani automatycznie usuwana przez tę dokumentacyjną aktualizację.
