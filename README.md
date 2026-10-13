# Akupunkturní atlas

Česká webová aplikace s interaktivní postavou a akupunkturními body. Funguje v prohlížeči na počítači i na mobilu a po prvním načtení i offline (lze ji „přidat na plochu“ jako aplikaci).

## Co umí

- **Co potřebuji** – napíšete potíž vlastními slovy („bolí mě hlava a nemůžu spát“, „je mi zle v autě“) a aplikace doporučí vhodné body, seřazené podle důležitosti, a ukáže je na těle. Pozná i fráze a hlídá těhotenství: body, které se v těhotenství nepoužívají, z výsledků vyřadí.
- **Hledat bod** – vyhledávání podle kódu (`ST36`), čínského názvu (`Zusanli`), českého překladu, dráhy nebo účinku. Bez dotazu se zobrazí přehled všech bodů podle drah.
- **Interaktivní tělo** – pohled zepředu i zezadu, přiblížení kolečkem myši nebo dvěma prsty, posun tažením, klepnutím na bod otevřete jeho detail. Při přiblížení se ukážou kódy bodů. Legenda dole filtruje body podle prvků (pět prvků, mimořádné dráhy, mimodrážní body).
- **Detail bodu** – kde bod najít (včetně převodu jednotek *cun* na šířku prstů), na co pomáhá, tipy, upozornění a ostatní body stejné dráhy.
- Odkaz přímo na bod: `index.html#LI4`.

V databázi je 72 nejpoužívanějších bodů (68 na 14 drahách a 4 mimodrážní) a 52 okruhů potíží s téměř 300 klíčovými slovy.

## Spuštění

Aplikace nepotřebuje build ani instalaci závislostí. Stačí libovolný statický server:

```bash
npx http-server -p 8080
# nebo
python3 -m http.server 8080
```

a otevřít <http://localhost:8080>. Soubor `index.html` jde otevřít i přímo z disku (bez offline režimu).

Pro zveřejnění stačí nahrát složku na libovolný statický hosting, např. GitHub Pages (Settings → Pages → větev a kořenová složka).

## Struktura

| Soubor | Obsah |
| --- | --- |
| `index.html` | Kostra stránky |
| `css/style.css` | Vzhled, světlý i tmavý režim |
| `js/data.js` | Databáze bodů (`POINTS`) a slovník potíží (`CONCEPTS`) |
| `js/app.js` | Kreslení postavy, zoom, vyhledávání a doporučování |
| `sw.js`, `manifest.webmanifest`, `icon.svg` | Offline režim a instalace na plochu |

### Jak přidat bod

Do pole `POINTS` v `js/data.js` přidejte objekt:

```js
{
  id: 'ST37', pin: 'Shangjuxu', cz: 'Horní velká prázdnota', mer: 'ST', bi: true,
  pos: [{ v: 'f', x: 113, y: 590 }], // v: 'f' zepředu / 'b' zezadu, souřadnice levé poloviny postavy 300 × 720
  loc: 'Kde bod najít…',
  eff: 'Jedna věta o hlavním účinku.',
  ind: ['průjem', 'bolest břicha'],
  warn: 'Volitelné upozornění.',
  tip: 'Volitelný tip.',
}
```

Párové body (`bi: true`) se na druhou stranu těla zrcadlí automaticky. Aby se bod doporučoval, přidejte ho do `pts` příslušné potíže v `CONCEPTS`.

### Jak funguje doporučování

Dotaz se převede na malá písmena bez diakritiky. Nejdřív se hledají celé fráze („v krku“, „točí se mi hlava“), pak kmeny slov („nespav“ zachytí *nespavost* i *nespavý*). Každá rozpoznaná potíž přidá svým bodům body podle váhy (3 = hlavní bod, 2 = velmi vhodný, 1 = doplňkový). Slova, která nepatří k žádné potíži, se ještě dohledají v indikacích bodů.

## Upozornění

Obsah slouží ke vzdělávání a svépomocné akupresuře, nenahrazuje lékaře. Polohy bodů na obrázku jsou orientační, přesné místo se hledá pohmatem podle popisu.
