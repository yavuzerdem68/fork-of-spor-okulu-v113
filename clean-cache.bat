@echo off
echo ================================
echo Next.js Cache Temizleme
echo ================================
echo.

echo Cache dosyalari temizleniyor...

REM .next klasorunu sil
if exist ".next" (
    echo .next klasoru siliniyor...
    rmdir /s /q ".next"
    echo .next klasoru silindi.
) else (
    echo .next klasoru bulunamadi.
)

REM node_modules/.cache klasorunu sil
if exist "node_modules\.cache" (
    echo node_modules\.cache klasoru siliniyor...
    rmdir /s /q "node_modules\.cache"
    echo node_modules\.cache klasoru silindi.
) else (
    echo node_modules\.cache klasoru bulunamadi.
)

echo.
echo ================================
echo Cache temizleme tamamlandi!
echo ================================
echo.
echo Simdi asagidaki komutu calistirin:
echo npm run dev:local
echo.
echo veya start-local-safe.bat dosyasini calistirin
echo.

pause