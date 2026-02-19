# Sverre Wintersport Slideshow

Kindvriendelijke fullscreen slideshow voor foto's en video's van de wintersport in Hirschegg (Der Berghof), 23 t/m 28 februari 2026.

## Inhoud van dit project

- `index.html` - pagina met wachtwoord en slideshow.
- `styles.css` - vormgeving, inclusief `Foto's en Filmpjes/Achtergrond.jpg` als achtergrond.
- `script.js` - logica voor slideshow, toetsen, swipe en video.
- `media.json` - lijst met foto-/videobestanden en captions.
- `generate-media-json.mjs` - maakt automatisch een nieuwe `media.json` op basis van bestanden in de map.
- `sync-from-icloud.mjs` - kopieert foto's/video's uit de iCloud Drive-map **Sverre_Vakantie** naar `Foto's en Filmpjes` en vernieuwt `media.json`.
- `server.mjs` - lokale server (nodig voor upload vanaf telefoon; zie hieronder).
- `Upload.html` - bestand dat je **in de iCloud-map Sverre_Vakantie** zet; open op je telefoon en tik op "Upload nu".
- `sverre-sync-hourly.plist` - optionele uurlijkse automatische sync (zie hieronder).

## Sync vanaf telefoon/iPad (iCloud-map)

1. Maak op je iPhone/iPad in **Bestanden** → **iCloud Drive** een map **Sverre_Vakantie** (of pas de naam in `sync-from-icloud.mjs` aan).
2. Zet daar tijdens de vakantie foto's en filmpjes in.

**Upload vanaf telefoon (knop in de map)**

- Op je **Mac**: kopieer het bestand **Upload.html** uit dit project naar de map **Sverre_Vakantie** in iCloud Drive (bijv. via Finder → iCloud Drive → Sverre_Vakantie). Dan staat hetzelfde bestand ook in die map op je iPhone.
- Start op je Mac in de projectmap: `node server.mjs` (Mac en telefoon op hetzelfde wifi).
- Op je **iPhone/iPad**: open **Bestanden** → iCloud Drive → Sverre_Vakantie → tik op **Upload.html** (opent in Safari). Vul eenmalig het Mac-adres in (bijv. `192.168.1.5` of `MacBook.local`; Mac-IP vind je in Systeeminstellingen → Netwerk). Tik daarna op **Upload nu** – nieuwe foto's uit de map gaan naar de slideshow.

**Elk uur automatisch (Mac moet aan staan)**

- Installeer de uurlijkse sync (eenmalig):

```bash
cp sverre-sync-hourly.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/sverre-sync-hourly.plist
```

- Als je project in een andere map staat, pas dan in `sverre-sync-hourly.plist` de regel `WorkingDirectory` aan.
- Uitschakelen: `launchctl unload ~/Library/LaunchAgents/sverre-sync-hourly.plist`

**Alleen op de Mac (zonder server)**

- In de projectmap: `node sync-from-icloud.mjs` – kopieert in één keer van iCloud-map naar de slideshow.

## Browsers en apparaten

De site is getest en werkt op **iPad**, **iPhone**, **Chrome**, **Safari**, **Firefox** en **Edge**. Swipe werkt op aanraakschermen; fullscreen gebruikt de juiste API per browser (inclusief Safari). Op iPad/iPhone starten video’s standaard zonder geluid (vanwege browserregels); tik op **Geluid aan** om geluid te horen.

## Lichte wachtwoordbeveiliging

Deze site gebruikt een simpele client-side code (makkelijk voor familiegebruik, niet waterdicht).

1. Open `script.js`.
2. Pas bovenaan deze regel aan:

```js
const ACCESS_CODE = "sverre";
```

## Media beheren (toevoegen/verwijderen)

Je kunt het op 2 manieren doen.

### Makkelijkste manier (aanrader)

1. Zet nieuwe foto's/video's in deze map.
2. Verwijder bestanden die je niet meer wilt tonen.
3. Draai dit commando in deze map:

```bash
node generate-media-json.mjs
```

Klaar: `media.json` wordt automatisch opnieuw opgebouwd.

Let op:
- Gebruik de map `Foto's en Filmpjes` voor alle media.
- `Achtergrond.jpg` wordt automatisch overgeslagen in de slideshow (blijft achtergrond).
- Bestandsnaam wordt automatisch de caption (bijv. `IMG_1234.jpeg` -> `IMG 1234`).

### Handmatig (optioneel)

Werk `media.json` zelf bij met de gewenste bestandsnamen/captions.

Voorbeeld van een item:

```json
{
  "type": "image",
  "src": "./mijn-foto.jpg",
  "caption": "Sverre op de piste"
}
```

Voor video:

```json
{
  "type": "video",
  "src": "./mijn-video.mp4",
  "caption": "Sneeuwactie!"
}
```

Tip: als `.MOV` niet goed afspeelt in een browser, zet de video om naar `.mp4`.

## Bediening slideshow

- `Vorige` / `Volgende` knoppen.
- `Play` / `Pauze`.
- `Geluid aan/uit` voor video's.
- `Fullscreen`.
- Toetsenbord:
  - Pijltjes links/rechts: vorige/volgende.
  - Spatie: play/pauze.
  - `M`: geluid aan/uit.
  - `F`: fullscreen.
- Op mobiel/tablet: swipe links/rechts op de media.

## Online zetten met GitHub Pages

Voer deze stappen uit in de projectmap:

```bash
git init
git add .
git commit -m "Add wintersport slideshow site"
git branch -M main
git remote add origin https://github.com/<jouw-gebruikersnaam>/<repo-naam>.git
git push -u origin main
```

Daarna op GitHub:

1. Open je repository.
2. Ga naar **Settings** -> **Pages**.
3. Kies bij Source: **Deploy from a branch**.
4. Kies branch `main` en map `/ (root)`.
5. Klik **Save**.

Na ongeveer 1 minuut staat je site live op:

`https://<jouw-gebruikersnaam>.github.io/<repo-naam>/`

### Nieuwe foto’s vanaf de telefoon (Working Copy) op de site krijgen

1. **In Working Copy (iPhone):** Zet foto’s/video’s in de map `Foto's en Filmpjes`. Open dan **Changes** (of Status), vink de *nieuwe* bestanden aan (stage), maak een **Commit** met een bericht (bijv. "Nieuwe foto’s"), en druk op **Push**. Zonder deze stap gaan de bestanden niet mee naar GitHub.
2. **Op de Mac:** Haal de laatste versie op (`git pull`), ga in de projectmap staan en voer uit: `node generate-media-json.mjs`. Daarmee wordt `media.json` bijgewerkt met alle bestanden in `Foto's en Filmpjes`. Commit en push de gewijzigde `media.json` (bijv. `git add media.json && git commit -m "media.json bijgewerkt" && git push`).

Pas na stap 2 verschijnen de nieuwe foto’s in de slideshow op de website; de site leest de lijst uit `media.json`.
