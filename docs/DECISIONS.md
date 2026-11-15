# Decyzje projektu

1. Produkcyjna wersja pozostaje zachowana jako rollback.
2. Odtworzony kod historyczny jest archiwum, nie bazą nowej aplikacji.
3. Nowy kod ma być wersjonowany w Git od pierwszego commita.
4. Dane Supabase nie są kasowane w ramach czyszczenia kodu.
5. Zmiany schematu bazy wyłącznie przez wersjonowane migracje.
6. Każde wdrożenie najpierw na Preview, potem testy, na końcu produkcja.
