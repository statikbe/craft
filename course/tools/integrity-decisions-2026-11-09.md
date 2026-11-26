# Integrity check decisions (2026-11-09)

Two read-only checks (text, pictures) ran over all 55 pages. Decisions by the user:

## Demo content (local demo DB; no Mac re-records needed for these)
1. support@statik.be: rename the account to a demo editor (e.g. "Redactie De Heidestappers", example.com address).
2. Contact_NL: rebuild as a clean Dutch form (Voornaam, Naam, E-mail, Bericht, privacy), delete Test Form + its submissions, add realistic Dutch demo submissions (example.com addresses; no koreilly@gmail.com).
3. Footer: site name "De Heidestappers" instead of "Craft Demo", remove the "Gemaakt met ♥ door Statik" credit, translate FR footer links (demo only).
4. Neutral host heidestappers.ddev.site for recordings (extra DDEV hostname; site base URL comes from .env, which only the user may change).
5. Delete "Content rows demo" and "Testpagina afbeeldingen"; 02-05 creates its duplicate Wandelroutes itself and removes it after the take.
6. Delete the 139 dummy redirects, clear the 404 list, add a few realistic Dutch demo redirects/404s.
7. Kinderwandelingen broken links only during 03-06 (added at start, removed after).
8. Navigation renamed "Hoofdnavigatie"; remove the Craft News widget for the demo user; make GENERAL / DYNAMIC DATA show in Dutch (code fix). Cookie banner key: leave.
9. Headings Checker plugin: "Kaarten: {type}" -> "Kaartjes: {type}", new patch release (user pushes the tag).
- Fictional names (Joris, Stijn, Femke) are fine.
- 12-02 starts where 12-01 ends: French title, rest still to copy.

## Text
- Voice: 02-05 "Spaties worden streepjes, hoofdletters kleine letters, en leestekens verdwijnen."; 02-01 "In Overzicht…".
- 04-06 caption "Alleen tekst, of drie teksten naast elkaar"; 04-07 FAQ Bestand + Geavanceerd > Openen in nieuw tabblad; 07-01 "…overzicht en kaartje"; 04-08 "Lay-out kaartjes", "fallbackafbeelding".
- 11-01 sentence; 01-01 "één tot drie"; "helpsite"; 12-01/12-02 "de andere talen"; 04-04 draft sentence.
- 13-02 "2025" written out; walkthrough H1s equal to INDEX (08-03, 08-04, 11-02, 13-02); 02-02 duration; drop "[label?]" column in INDEX.
- 09-01: several categories allowed.
- Remove the Formie course references (10-01 voice + walkthrough + Zie ook, 10-02 voice).
- "Focuspunt en afbeelding bewerken" everywhere.
- 04-12 scene 9: change the action (status off for all sites), keep the voice.
- "kan" everywhere instead of "kun/kunt" (part 4).
- 03-02/03-06: "Staat de widget niet op je dashboard? Voeg hem toe via …".
- Text 8 ("paper", 06-01 full title): no answer, so unchanged.
- Formie/Craft labels: check each in the CP and match the screen.

## Recording
- Fix broken scenes (04-10, 04-02, 04-06, 02-01, 12-02, 08-01, 10-02 warning) and go straight to the final ElevenLabs takes (no Mac re-records).
- Polish: no session leftovers (no probes during takes, reset state), real H2 titles on demo rows, fitting images (05-03, 05-04, 04-09 order), wait for re-render after "Maak invoer aan".
- Screenshots: after cleanup, retake all affected ones plus the ~15 mismatches, with markings.
- Delete the stale failed-scene-*.png files.
