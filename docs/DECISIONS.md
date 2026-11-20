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


## Zatwierdzony system wizualny — Gothic Noir

- Paleta: tło `#101114`, panele `#191B20`, powierzchnie `#252830`, tekst `#E5E1D8`, akcent burgundowy `#913E46`.
- Typografia: EB Garamond dla nagłówków i nazw; IBM Plex Sans dla interfejsu i treści; IBM Plex Mono dla identyfikatorów, dat i metadanych. Fonty muszą obsługiwać polskie znaki.
- Karty: minimalistyczne, cienkie obramowania, lekko zaokrąglone narożniki, bez ozdobnych ramek.
- Przyciski: minimalistyczne; burgundowe akcje główne, obrysowane drugorzędne, tekstowe anulowanie, czerwone akcje destrukcyjne.
- Formularze: ciemne pola, etykiety nad polami, burgundowy fokus i czytelne komunikaty walidacji.
- Mapa: rzeczywista mapa Warszawy w MapLibre, przyciemniona z czytelnymi ulicami; kolorowe punkty z obrysem; cienkie burgundowe trasy.
- Kolory kategorii: niebezpieczeństwo `#B94A50`; policja/instytucje `#6194C2`; pomoc/bezpieczeństwo `#78A17A`; nadnaturalne `#9A79B8`; tropy `#C49A55`; pozostałe `#92999D`.
- Nawigacja: stały górny pasek z ikoną i etykietą oraz kontekstowe panele boczne; panele niezależnie zwijane.
- Dostępność: wysoki, umiarkowany kontrast; standardowy tekst z możliwością powiększenia; pełna obsługa klawiaturą i wyraźny fokus; respektowanie `prefers-reduced-motion`.
- Ruch: dyskretne przejścia około 150–220 ms; bez pulsowania i migania.
- Logo pozostaje niezdecydowane. Oznaczenie roku jest tymczasowym elementem typograficznym, nie zatwierdzonym logo.

## Poufność i przyszły dostęp graczy

- Każdy typ rekordu (w tym znacznik i karta) ma docelowo niezależną flagę `Tylko MG`, która wyłącza cały rekord z widoku gracza.
- Każda karta ma osobną sekcję MG, ukrytą przed graczami również wtedy, gdy karta jest im udostępniona.
- Poufność musi być egzekwowana w bazie/API/RLS i Storage, a nie wyłącznie przez ukrycie elementu w interfejsie.
- Obecna aplikacja jest dostępna wyłącznie dla MG; model graczy nie jest jeszcze wdrożony. Nie dodawać pól ani polityk do Supabase bez audytu istniejącego schematu, uprawnień i historii migracji.

## Galerie i materiały wizualne

- Docelowo każda karta może mieć wiele zdjęć; wybór zdjęcia głównego, kolejność, podpis, źródło, autor i licencja.
- Filtry per zdjęcie: Original, Noir, Noir Soft; zawsze zachować oryginał i stosować filtr niedestrukcyjnie.
- Materiały World of Darkness mogą być użyte po sprawdzeniu praw do wykorzystania; logo pozostaje otwarte.
- To wymagania projektowe, nie deklaracja, że galerie są już zaimplementowane.


## Korekta interfejsu 0.2 — mapa i czytelność

- Mapa OSM pozostaje rzeczywistą mapą MapLibre; zwiększono monochromatyczność i obniżono jasność kafelków, aby uzyskać grafitowy widok z czytelnymi ulicami.
- Zwiększono typografię i odstępy w panelach bocznych oraz poszerzono je dla wygodniejszego przeglądania lokalizacji i przyszłych kart.
- Tymczasowy znak „97” zastąpiono samą nazwą projektu. Logo pozostaje decyzją otwartą.
- Rozróżniono akcje: „Wskaż punkt na mapie” uruchamia wskazywanie współrzędnych na mapie; „Nowa lokalizacja · formularz” otwiera formularz wpisu.
- Zachowano MapLibre, OSM, znaczniki, trasowanie, edycję i soft-delete. Nie zmieniano bazy Supabase ani polityk RLS.
