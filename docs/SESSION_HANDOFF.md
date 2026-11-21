# HANDOFF — Świat Mroku, Warszawa 1997
**Data:** 21.11.2026  
**Cel:** szybkie wznowienie pracy po zmianie czatu.  
**Źródło nadrzędne:** Biblia Projektu v1.1 w Library oraz pierwotna Biblia v1.0.

## Zasady, których nie wolno zgubić
- Wszystkie zmiany bezpośrednio na GitHub `main`; bez dodatkowych branchy, PR i Preview.
- Nie używać Work ani przekierowywać tam użytkownika.
- Istniejące projekty Vercel, GitHub i Supabase zachować. Produkcja: https://swiat-mroku-warszawa.vercel.app.
- Nie zmieniać zatwierdzonego wyglądu mapy ani działających funkcji bez uzgodnienia.
- Nie wykonywać nieuzgodnionych zmian w bazie, danych, Auth, RLS ani Storage.
- Prowadzić użytkownika krok po kroku, gdy musi coś kliknąć w panelu.
- Rozróżniać commit, status deploymentu, wdrożenie i test funkcjonalny. Nie mówić „działa”, dopóki nie zostało sprawdzone w aplikacji.

## Infrastruktura
- GitHub: `Okropeczny80/swiat-mroku-warszawa`, branch `main`.
- Vercel project ID: `prj_NJlQXdMmdYjekOtKYfufwJNslV0J`.
- Supabase ref: `bbcgkzaqkzkcerltfizq`, region `eu-central-1`.
- Prywatny Storage bucket: `world-assets`.
- Przed każdą pracą z Supabase przeczytać skill `skills://plugins/supabase/supabase/skill.md`.
- Ostatni potwierdzony HEAD main: `30d19045f2b13c39f922e00a85b893be10370152`; późniejsze commity dokumentacyjne: `9a6e617840a890734044cab96a52080ff9f6cf3d` i `e1bea47903f8f6a4052c743b0a5167f9bb14eb5f`.

## Stan funkcjonalny
### Mapa
- Next.js/React/TypeScript, Supabase Auth/PostgreSQL, MapLibre, OpenFreeMap Dark, routing OSM.
- Mapa jest centralnym ekranem. Lewy panel: kategorie/lokalizacje i trasy. Środek: mapa. Prawy panel: karta wybranej lokalizacji.
- Lokalizacje: dodawanie, edycja, soft-delete; notatki MG; trasy piesze i samochodowe.
- Zatwierdzony styl Gothic Noir: `#101114`, `#191B20`, `#252830`, `#E5E1D8`, burgund `#913E46`; EB Garamond, IBM Plex Sans, IBM Plex Mono.
- Znaczniki: okrągłe, jasna ikona, kolorowy obrys kategorii, burgundowe podświetlenie zaznaczenia. Ikona jest niezależna od kategorii; NULL = automatyczna.
- Siedem ikon SVG: instytucja/sąd, policja, mieszkalny budynek, przestępstwo, pentagram, klub, most. Pentagram został uproszczony i ma selektywne 25×25 px. Użytkownik zaakceptował aktualny wygląd — nie zmieniać.

### Fotografie lokalizacji
- Uzgodniony UX: jedno zdjęcie główne w panelu bocznym; pełna galeria w karcie lokalizacji.
- Kod dodany na main: upload zdjęcia głównego/galerii, podgląd, signed URLs, wybór zdjęcia głównego, miękkie usuwanie; podpis, źródło/autor, prawa/licencja.
- Używa istniejącej tabeli `location_photos` i prywatnego bucketa `world-assets`; JPEG/PNG/WebP/AVIF, limit 10 MB.
- Nowa lokalizacja musi być najpierw zapisana, dopiero potem można dodać zdjęcia.
- UWAGA: brak potwierdzonego testu end-to-end na produkcji. Nie uznawać za zakończone, dopóki nie przetestowano uploadu, signed URL, odświeżenia, zmiany zdjęcia głównego i usunięcia.
- Soft-delete rekordu nie usuwa fizycznie pliku ze Storage. Nie wdrażać czyszczenia bez planu retencji.
- Edycja metadanych już dodanego zdjęcia i ręczne sortowanie galerii nie są jeszcze gotowe.
- Sprawdzić istniejące polityki Storage/RLS; nie poszerzać ich w ciemno.

## Kolejność najbliższych prac
1. Test produkcyjny galerii lokalizacji: dodać jedno zdjęcie główne i dwa galeryjne do zapisanej lokalizacji.
2. Odświeżyć stronę, ponownie otworzyć kartę, sprawdzić signed URLs i trwałość.
3. Zmienić zdjęcie główne, sprawdzić miękkie usunięcie.
4. Naprawić wykryte błędy, dopiero potem uznać moduł fotografii lokalizacji za gotowy.
5. Następnie rozpocząć pełne karty postaci (portret główny w panelu bocznym, galeria w karcie), potem organizacje, powiązania, archiwum MG i wyszukiwarkę.

## Moduły nieukończone
Pełne karty postaci, organizacje/członkostwa, relacje/graf, archiwum MG, globalna wyszukiwarka, kosz/przywracanie UI, zarządzanie kategoriami, galerie postaci i organizacji.

## Uwaga historyczna
W trakcie poprzedniej sesji utworzono dodatkową gałąź `feature/location-marker-icons` i PR #2, a następnie scalono je do main. Było to sprzeczne z preferencją właściciela. Nie powtarzać tego. Nie usuwać automatycznie istniejących gałęzi; używać wyłącznie main.

## Dokumentacja
- Biblia v1.0 — pierwotna koncepcja.
- Biblia v1.1 — `/Biblia_Projektu_Swiat_Mroku_Warszawa_1997_v1.1.txt` w Library.
- `docs/PROJECT_STATE.md` — szczegółowy stan i handoff.
- `docs/DECISIONS.md` — trwałe decyzje.
- Ten plik — skrót startowy dla kolejnej sesji.


## Najnowsza sesja — moduł POSTACIE (2026-11-21)

### Stan
- Zakładka POSTACIE jest aktywna w menu głównym.
- Produkcyjny deployment na main: commit bd1174d60725a4a5849770d70c54b27a7a562324, Vercel deployment dpl_AqpKdYebifAwqQNcbqj2eRcLEna4, status READY.
- Produkcja: https://swiat-mroku-warszawa.vercel.app
- Użytkownik obejrzał wdrożony ekran: po lewej rejestr, po prawej karta Jan Kowalski / pseudonim Oko. Ogólny wygląd Gothic Noir i układ zostały zaakceptowane jako kierunek; nie przebudowywać.

### Zaimplementowane
- components/CharacterModule.tsx; integracja w app/page.tsx; style w app/globals.css.
- Lista postaci z wyszukiwaniem i filtrem typów; tworzenie i edycja danych osobowych, typ/status, biografia, notatki MG.
- Widok przynależności organizacyjnych z istniejących organization_memberships i organizations.
- Prywatny upload portretów do world-assets, signed URLs, ustawianie głównego zdjęcia, galeria.
- Miękkie usuwanie postaci z potwierdzeniem.
- Bez zmian schematu bazy, danych istniejących, Auth i RLS.

### Ograniczenia / testy
- Build Next.js przeszedł; deployment produkcyjny READY; sprawdzenie runtime nie wykazało błędów w badanym oknie.
- Nie wykonano pełnego testu zalogowanego zapisu/edycji/usuwania ani uploadu zdjęć. Przetestować przed uznaniem tych funkcji za w pełni gotowe.
- Statusy w interfejsie wymagają polskich etykiet (np. active → Aktywna).
- Użytkownik zwrócił uwagę na brak współczynników: obecna karta jest tylko kartą ewidencyjną, nie pełną kartą mechaniczną.

### Najważniejszy następny krok
Zaprojektować i wdrożyć brakującą kartę mechaniczną ze współczynnikami zgodnie z oryginalnym arkuszem/systemem użytkownika. W rozmowie padła propozycja osobnej zakładki KARTA MECHANICZNA wewnątrz karty postaci — wymaga potwierdzenia. Nie wymyślać listy atrybutów/umiejętności na podstawie domysłów. Najpierw odzyskać/obejrzeć oryginalną kartę źródłową, uzgodnić dokładne pola i dopiero potem audytować model bazy oraz implementować zapis. Karta ma być uniwersalna, bez odrębnych sztywnych szablonów dla gatunków nadnaturalnych.

Drobne ulepszenia do rozważenia po mechanice: polskie etykiety statusów, pseudonim wyraźniej wyróżniony, powiększanie zdjęć, możliwość dodawania przynależności z karty; relacje zostawić modułowi Powiązania.
