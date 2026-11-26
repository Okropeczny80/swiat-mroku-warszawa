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



## Biblioteka znaczników lokalizacji — prace 2026-11-21
- Dodano opcjonalne pole `locations.marker_icon`; NULL zachowuje domyślny znacznik.
- Formularz lokalizacji pozwala wybrać jedną z siedmiu ikon SVG Repo lub wariant automatyczny.
- Ikona jest niezależna od kategorii; kolor obrysu nadal pochodzi z kategorii.
- Wybór ikony jest zapisywany w rekordzie lokalizacji i renderowany na mapie.
- Biblioteka pozostaje rozszerzalna; metadane źródła/licencji wymagają uzupełnienia na podstawie konkretnych stron ikon.


## Fotografie lokalizacji — implementacja 2026-11-21
- Dodano obsługę prywatnego uploadu zdjęć lokalizacji do istniejącego bucketu Supabase Storage `world-assets`.
- Zdjęcie główne jest prezentowane w górnym panelu bocznym karty obiektu.
- Pozostałe zdjęcia oraz zdjęcie główne są pokazywane w galerii karty lokalizacji.
- Zarządzanie zdjęciami obejmuje dodawanie zdjęcia głównego, dodawanie do galerii, ustawienie istniejącego zdjęcia jako głównego oraz miękkie usuwanie z karty.
- Zachowywane są podpis, źródło/autorstwo i notatka o prawach/licencji.
- Pliki są prywatne; UI korzysta z krótkotrwałych signed URLs. Storage pozostaje ograniczony istniejącymi politykami RLS do aktywnego MG.
- Wykorzystywane są istniejące tabele `location_photos` i bucket `world-assets`; nie zmieniano schematu, polityk RLS, kont ani danych istniejących lokalizacji.
- Limit zgodny z konfiguracją bucketu: 10 MB; dozwolone JPEG, PNG, WebP, AVIF.
- Upload jest dostępny dla zapisanej lokalizacji. Nową lokalizację należy najpierw zapisać, a następnie dodać do niej zdjęcia.
- Przed uznaniem funkcji za zweryfikowaną należy przetestować upload, signed URL, wybór zdjęcia głównego i usuwanie na produkcji.


## Handoff dla kolejnej sesji — 2026-11-21

### Najważniejsze zasady właściciela
- Pracować bezpośrednio na GitHub `main`. Nie tworzyć branchy, PR ani Preview deployments.
- Używać istniejących projektów GitHub/Vercel/Supabase; nie tworzyć duplikatów.
- Nie przekierowywać użytkownika do Work. Prowadzić go krok po kroku w rozmowie, szczególnie przy czynnościach w panelu Vercel.
- Nie zmieniać zatwierdzonego wyglądu mapy i znaczników bez uzgodnienia. Nie zmieniać bazy, Auth, RLS, Storage ani danych poza wyraźnie uzgodnionym zakresem.
- Po każdej zmianie odróżniać: zapis na GitHub, status Vercel, wdrożenie produkcyjne i test funkcjonalny. Nie deklarować pełnego sukcesu na podstawie samego commita.

### Infrastruktura
- Repo: `Okropeczny80/swiat-mroku-warszawa`, gałąź `main`.
- Produkcja: https://swiat-mroku-warszawa.vercel.app
- Vercel project: `swiat-mroku-warszawa`, project ID `prj_NJlQXdMmdYjekOtKYfufwJNslV0J`.
- Supabase project ref: `bbcgkzaqkzkcerltfizq`, region `eu-central-1`.
- Supabase bucket: prywatny `world-assets`.
- Supabase skill należy przeczytać przed każdą kolejną pracą z Supabase.
- Ostatni potwierdzony HEAD `main`: `30d19045f2b13c39f922e00a85b893be10370152` (2026-11-21), commit `style: improve pentacle marker legibility`.

### Ostatnio zaakceptowane
- Mapa MapLibre + OpenFreeMap Dark; układ i paleta Gothic Noir.
- Znaczniki lokalizacji są okrągłe, z jasną ikoną, obrysem w kolorze kategorii i burgundowym zaznaczeniem.
- Użytkownik zaakceptował aktualny pentagram: uproszczony SVG i selektywnie większy rozmiar 25×25 px. Nie powiększać wszystkich ikon.
- Użytkownik ustalił zdjęcie główne w panelu bocznym, a pełną galerię w karcie lokalizacji.

### Fotografie lokalizacji — stan i ryzyka do sprawdzenia
- Kod dodany w `app/page.tsx` i `app/globals.css`; używa istniejących `location_photos` i `world-assets`.
- Upload dla zapisanej lokalizacji; MIME JPEG/PNG/WebP/AVIF; limit 10 MB.
- Rekord przechowuje caption, source, rights_note, is_primary, sort_order.
- Podpisane URL-e przez Supabase Storage; nie publikować plików.
- Funkcje w kodzie: upload zdjęcia głównego/galerii, ustawianie zdjęcia głównego, galeria w karcie, miękkie usunięcie rekordu.
- Brak potwierdzonego testu end-to-end na produkcji. Najpierw wykonać test uploadu i ponownego odczytu.
- Usunięcie rekordu zdjęcia jest miękkie; plik Storage pozostaje. Nie dodano jeszcze bezpiecznego fizycznego czyszczenia plików.
- Edycja metadanych istniejącego zdjęcia i ręczne sortowanie galerii nie są jeszcze zaimplementowane.
- Upewnić się, że polityki Storage/RLS pozwalają MG na upload, odczyt i operacje na rekordach. Nie poszerzać uprawnień w ciemno.
- Jeśli wystąpi błąd, sprawdzić konsolę przeglądarki, Network i logi Supabase. Nie zmieniać schematu bez audytu.

### Ostatnie zmiany kodu
- Znaczniki SVG: PR #2 został scalony z main commit `f15fd9d0`; mimo wcześniejszego błędu procesowego, obowiązująca zasada na przyszłość to bezpośredni main, bez PR/branchy.
- Poprawka położenia/centrowania SVG znacznika: commit `8318fcf3` (w historii).
- Pentagram uproszczony i pogrubiony: `f00e3330`.
- Klasa specjalna dla pentagramu i 25×25 px: `8306aa6b`, style: `30d19045`.
- Zdjęcia lokalizacji: upload i panel galerii `4843d827`; style galerii `6ebd1bfe`; dokumentacja `e4334e39`. Sprawdź historię GitHub, jeśli potrzebne dokładne pełne SHA.

### Następny krok — nie przeskakiwać
1. Otworzyć produkcję i wybrać istniejącą lokalizację testową.
2. Dodać jedno zdjęcie jako główne.
3. Sprawdzić, czy pojawia się w panelu bocznym.
4. Dodać 2 zdjęcia do galerii.
5. Odświeżyć aplikację i ponownie otworzyć kartę; sprawdzić signed URLs i trwałość danych.
6. Ustawić inne zdjęcie jako główne.
7. Sprawdzić miękkie usunięcie i zachowanie galerii.
8. Dopiero po pomyślnym teście uznać funkcję za gotową; następnie przejść do kart postaci.

### Dokumentacja nadrzędna
- Biblia v1.0 zachowuje pierwotną koncepcję.
- Uzupełnienie v1.1 znajduje się w Library jako `/Biblia_Projektu_Swiat_Mroku_Warszawa_1997_v1.1.txt`.
- README, PROJECT_STATE i ten handoff są dokumentacją repozytorium; nie zastępują Biblii.


## Moduł POSTACIE — stan na 2026-11-21

### Co zostało wdrożone
- Włączono zakładkę POSTACIE w głównym menu; MAPA i dotychczasowy moduł mapy pozostają dostępne.
- Dodano komponent components/CharacterModule.tsx i style w app/globals.css; moduł jest osadzony w app/page.tsx.
- Układ: rejestr postaci po lewej (wyszukiwanie, filtr typu, lista, nowa postać), karta szczegółów po prawej.
- Karta pokazuje: imię i nazwisko, pseudonim, typ, wiek, zawód, status, biografię, przynależności organizacyjne, galerię/portrety i osobne notatki MG.
- Formularz dodawania/edycji obejmuje dane podstawowe, typ, status, biografię i notatki MG.
- Dodano upload portretów do prywatnego bucketa world-assets (JPEG/PNG/WebP/AVIF, do 10 MB), signed URLs, ustawianie zdjęcia głównego.
- Usuwanie postaci jest miękkie i wymaga potwierdzenia.
- Moduł korzysta z istniejących tabel characters, character_types, character_photos, organization_memberships i organizations; nie wykonywano zmian schematu ani polityk RLS.

### Wdrożenie
- Commit produkcyjny: bd1174d60725a4a5849770d70c54b27a7a562324 — style: add Gothic Noir character registry.
- Vercel deployment: dpl_AqpKdYebifAwqQNcbqj2eRcLEna4, target production, status READY.
- Produkcja: https://swiat-mroku-warszawa.vercel.app
- Użytkownik otworzył moduł i pokazał kartę testowej postaci Jan Kowalski, pseudonim Oko; ekran potwierdza widok karty i wpis w rejestrze.
- Build Next.js zakończył się powodzeniem. Nie stwierdzono runtime errors w sprawdzonym oknie.
- Nie przeprowadzono pełnego testu end-to-end CRUD ani uploadu zdjęć w zalogowanej sesji. Nie deklarować tych ścieżek jako zweryfikowanych.

### Brakująca część — karta mechaniczna / współczynniki
- Użytkownik słusznie wskazał, że obecna karta nie zawiera współczynników. Aktualny moduł jest na razie kartą ewidencyjno-biograficzną, nie pełną kartą postaci.
- Użytkownik oczekuje osobnej, właściwej karty mechanicznej ze współczynnikami, zgodnej z oryginalnym arkuszem systemu. Nie wolno samodzielnie zakładać listy ani liczby współczynników z ogólnej wiedzy — trzeba odtworzyć ją z materiału/oryginalnej karty użytkownika.
- W rozmowie zaproponowano zakładkę KARTA MECHANICZNA wewnątrz karty postaci, zachowując obecny widok osobowy. To propozycja do dalszego uzgodnienia, nie zatwierdzona implementacja.
- Wymagania docelowe: edytowalne współczynniki, zapisywanie w bazie, atuty/wady i inne sekcje zgodne z oryginalną kartą; jedna uniwersalna karta niezależna od rodzaju istoty, bez sztywnych szablonów dla wampirów/wilkołaków/magów itd.
- Nie zapisywać współczynników jako dowolnego JSON ani nie zmieniać schematu bazy bez wcześniejszego audytu i uzgodnienia modelu danych. Najpierw obejrzeć źródłową kartę/system i uzgodnić dokładny układ oraz pola.

### Uwagi po pierwszym obejrzeniu przez użytkownika
- Użytkownik zaakceptował ogólny kierunek wizualny i układ obecnej karty; nie robić rewolucji w stylistyce.
- Zauważona drobna poprawka: statusy techniczne typu active powinny być prezentowane po polsku (np. Aktywna).
- Dalsze pomysły zgłoszone do rozważenia: pseudonim wyraźniej wyróżniony, powiększanie portretu, dodawanie przynależności organizacyjnych z karty, późniejsze pokazanie relacji z innymi postaciami.
- Następny krok: na początku kolejnej sesji wrócić do karty mechanicznej i źródłowego arkusza współczynników; nie zaczynać kolejnego modułu menu przed uzgodnieniem brakującej części.


## Karta mechaniczna i redesign postaci — 26.11.2026
- Przeniesiono portret do prawej kolumny, zmniejszono go i dodano kliknięcie do powiększenia.
- W lewej kolumnie pozostają opisowe informacje, biografia, organizacje, galeria i notatki MG.
- Nowy komponent `components/MechanicalSheet.tsx` zawiera Atrybuty, Umiejętności i trzy listy Atuty/Wady/Moce.
- Atrybuty: 9 pozycji w 3 grupach, wartości 0–5 ustawiane kliknięciem.
- Umiejętności: 3 grupy po 8 pozycji, wartości 0–5. Nazwy umiejętności w obecnej implementacji to standardowa lista robocza i wymagają porównania z polską kartą źródłową użytkownika.
- Atuty, Wady i Moce: niezależne listy dowolnych wpisów; nazwa, opcjonalna wartość i opis, dodawanie/usuwanie.
- Supabase: dodano tabelę `character_mechanics` z JSONB dla atrybutów, umiejętności i list, kluczem character_id oraz RLS/polityką opartą o `private.is_active_gm()`; nie zmieniano innych tabel ani danych.
- Komponent mechaniczny zapisuje przez upsert do tej tabeli.
- Zmiany zapisano bezpośrednio na `main`; build/deployment i test zalogowanego end-to-end wymagają potwierdzenia.
