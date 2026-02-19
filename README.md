# Sverre Wintersport Slideshow

Kindvriendelijke fullscreen slideshow voor foto's en video's van de wintersport in Hirschegg (Der Berghof), 23 t/m 28 februari 2026.

## Inhoud van dit project

- `index.html` - pagina met wachtwoord en slideshow.
- `styles.css` - vormgeving, inclusief `Foto's en Filmpjes/Achtergrond.jpg` als achtergrond.
- `script.js` - logica voor slideshow, toetsen, swipe en video.
- `media.json` - lijst met foto-/videobestanden en captions.
- `generate-media-json.mjs` - maakt automatisch een nieuwe `media.json` op basis van bestanden in de map.
- `sync-from-icloud.mjs` - kopieert foto's/video's uit de iCloud Drive-map **Sverre_Vakantie** naar `Foto's en Filmpjes` en vernieuwt `media.json`.
- `server.mjs` - lokale server met **Sync iCloud**-knop (bereikbaar vanaf telefoon/iPad op hetzelfde wifi).
- `sverre-sync-hourly.plist` - optionele uurlijkse automatische sync (zie hieronder).

## Sync vanaf telefoon/iPad (iCloud-map)

1. Maak op je iPhone/iPad in **Bestanden** → **iCloud Drive** een map **Sverre_Vakantie** (of pas de naam in `sync-from-icloud.mjs` aan).
2. Zet daar tijdens de vakantie foto's en filmpjes in.

**Optie A – Sync-knop (handmatig vanaf telefoon/iPad)**

- Start op je Mac in de projectmap: `node server.mjs`
- Open op telefoon of iPad (zelfde wifi): **http://[Mac-IP]:3333** (vind je Mac-IP in Systeeminstellingen → Netwerk).
- Log in met de familiecode en tik op **Sync iCloud**. Nieuwe foto's uit de iCloud-map worden dan naar de slideshow gekopieerd.

**Optie B – Elk uur automatisch**

- Zet de Mac aan en laat hem aan staan (of in ieder geval wanneer je wilt dat er gesynchroniseerd wordt).
- Installeer de uurlijkse sync (eenmalig):

```bash
cp sverre-sync-hourly.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/sverre-sync-hourly.plist
```

- Als je project in een andere map staat, pas dan in `sverre-sync-hourly.plist` de regel `WorkingDirectory` aan naar jouw projectpad.
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
- **Sync iCloud** – haalt nieuwe foto's uit de iCloud-map (werkt alleen als je de site via `node server.mjs` opent, bijv. op telefoon via http://[Mac-IP]:3333).
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
