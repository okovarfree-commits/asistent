/*
 * Databáze akupunkturních bodů.
 *
 * Souřadnice (pos) jsou v lokálním prostoru jedné postavy 300 × 720:
 *   v: 'f' = pohled zepředu, 'b' = pohled zezadu
 *   x, y = poloha bodu na levé polovině obrázku; párové body (bi: true)
 *          se automaticky zrcadlí na druhou stranu (x' = 300 − x).
 * Postava stojí v anatomické poloze (dlaně dopředu, palce ven).
 */
window.AKU = (() => {
  const ELEMENTS = {
    drevo: { name: 'Dřevo', hint: 'Játra a žlučník' },
    ohen: { name: 'Oheň', hint: 'Srdce, tenké střevo, osrdečník, trojitý zářič' },
    zeme: { name: 'Země', hint: 'Žaludek a slezina' },
    kov: { name: 'Kov', hint: 'Plíce a tlusté střevo' },
    voda: { name: 'Voda', hint: 'Ledviny a močový měchýř' },
    cevy: { name: 'Mimořádné dráhy', hint: 'Řídící céva a céva početí' },
    extra: { name: 'Mimodrážní body', hint: 'Body mimo hlavní dráhy' },
  };

  const MERIDIANS = {
    LU: { name: 'Plíce', el: 'kov' },
    LI: { name: 'Tlusté střevo', el: 'kov' },
    ST: { name: 'Žaludek', el: 'zeme' },
    SP: { name: 'Slezina', el: 'zeme' },
    HT: { name: 'Srdce', el: 'ohen' },
    SI: { name: 'Tenké střevo', el: 'ohen' },
    BL: { name: 'Močový měchýř', el: 'voda' },
    KI: { name: 'Ledviny', el: 'voda' },
    PC: { name: 'Osrdečník', el: 'ohen' },
    TE: { name: 'Trojitý zářič', el: 'ohen' },
    GB: { name: 'Žlučník', el: 'drevo' },
    LR: { name: 'Játra', el: 'drevo' },
    GV: { name: 'Řídící céva (Du Mai)', el: 'cevy' },
    CV: { name: 'Céva početí (Ren Mai)', el: 'cevy' },
    EX: { name: 'Mimodrážní body', el: 'extra' },
  };

  const PREG = 'Nepoužívejte v těhotenství – bod může vyvolat stahy dělohy.';

  const POINTS = [
    // ───────── Plíce
    {
      id: 'LU1', pin: 'Zhongfu', cz: 'Centrální palác', mer: 'LU', bi: true,
      pos: [{ v: 'f', x: 106, y: 152 }],
      loc: 'Na hrudníku 6 cun od střední čáry, v 1. mezižebří – asi 1 cun pod jamkou pod zevním koncem klíční kosti.',
      eff: 'Uvolňuje hrudník a plíce, tiší kašel.',
      ind: ['kašel', 'astma', 'dušnost', 'tíseň na hrudi', 'bolest ramene a hrudníku'],
      warn: 'Akupunkturně se nepíchá hluboko (blízkost plic). Pro akupresuru je bezpečný.',
    },
    {
      id: 'LU5', pin: 'Chize', cz: 'Loketní močál', mer: 'LU', bi: true,
      pos: [{ v: 'f', x: 77, y: 281 }],
      loc: 'V loketní rýze, na palcové straně šlachy bicepsu (šlachu nahmatáte při pokrčení lokte).',
      eff: 'Ochlazuje plíce, uvolňuje hlen a tiší kašel.',
      ind: ['kašel s hlenem', 'astma', 'bolest v krku', 'horečka', 'bolest a křeč lokte'],
    },
    {
      id: 'LU7', pin: 'Lieque', cz: 'Rozštěp řady', mer: 'LU', bi: true,
      pos: [{ v: 'f', x: 65, y: 372 }],
      loc: 'Na palcové hraně předloktí, 1,5 cun nad zápěstní rýhou, v drobné rýze nad výběžkem vřetenní kosti. Najdete ho, když do sebe zaklesnete ruce mezi palcem a ukazováčkem – špička ukazováčku na něj ukáže.',
      eff: 'Klasický „velitel hlavy a šíje“. Otevírá plíce a pomáhá při nachlazení.',
      ind: ['bolest hlavy', 'ztuhlá šíje', 'nachlazení', 'kašel', 'rýma', 'bolest v krku', 'astma'],
    },
    {
      id: 'LU9', pin: 'Taiyuan', cz: 'Velká propast', mer: 'LU', bi: true,
      pos: [{ v: 'f', x: 65, y: 386 }],
      loc: 'Na zápěstní rýze na palcové straně, v jamce vedle hmatného pulzu (vřetenní tepny).',
      eff: 'Posiluje plíce a krevní oběh.',
      ind: ['chronický kašel', 'astma', 'slabý hlas', 'dušnost', 'bolest zápěstí'],
      warn: 'Tlačte vedle tepny, ne přímo na pulz.',
    },

    // ───────── Tlusté střevo
    {
      id: 'LI4', pin: 'Hegu', cz: 'Spojené údolí', mer: 'LI', bi: true,
      pos: [{ v: 'b', x: 66, y: 410 }],
      loc: 'Na hřbetu ruky mezi 1. a 2. záprstní kostí, v nejvyšším bodě svalového valu, když palec přitisknete k ukazováčku.',
      eff: 'Hlavní bod pro hlavu a obličej, silně tlumí bolest. Spolu s LR3 tvoří „čtyři brány“ proti stresu.',
      ind: ['bolest hlavy', 'bolest zubů', 'rýma', 'ucpaný nos', 'bolest v krku', 'nachlazení', 'horečka', 'menstruační bolesti', 'bolest obličeje', 'stres', 'alergie', 'zácpa'],
      warn: PREG,
    },
    {
      id: 'LI10', pin: 'Shousanli', cz: 'Tři míle na paži', mer: 'LI', bi: true,
      pos: [{ v: 'b', x: 69, y: 297 }],
      loc: 'Na palcové straně předloktí, 2 cun pod bodem LI11 (pod vnějším koncem loketní rýhy).',
      eff: 'Uvolňuje paži a posiluje trávení.',
      ind: ['tenisový loket', 'bolest a ochablost paže', 'bolest ramene', 'bolest břicha', 'průjem', 'bolest zubů'],
    },
    {
      id: 'LI11', pin: 'Quchi', cz: 'Zahnutý rybník', mer: 'LI', bi: true,
      pos: [{ v: 'b', x: 69, y: 280 }],
      loc: 'Při pokrčeném lokti na vnějším (palcovém) konci loketní rýhy, uprostřed mezi koncem rýhy a kostním hrbolem na vnější straně lokte.',
      eff: 'Ochlazuje horko, tiší svědění, podporuje obranyschopnost.',
      ind: ['horečka', 'vysoký krevní tlak', 'svědění', 'ekzém', 'kopřivka', 'alergie', 'akné', 'bolest v krku', 'bolest lokte', 'zácpa', 'imunita'],
    },
    {
      id: 'LI15', pin: 'Jianyu', cz: 'Ramenní kost', mer: 'LI', bi: true,
      pos: [{ v: 'f', x: 82, y: 152 }],
      loc: 'Na rameni v přední jamce pod nadpažkem (akromionem), která se objeví, když upažíte.',
      eff: 'Hlavní místní bod ramene.',
      ind: ['bolest ramene', 'ztuhlé („zmrzlé“) rameno', 'omezená hybnost paže', 'bolest paže'],
    },
    {
      id: 'LI20', pin: 'Yingxiang', cz: 'Vítání vůně', mer: 'LI', bi: true,
      pos: [{ v: 'f', x: 141, y: 72 }],
      loc: 'V rýze vedle středu nosního křídla.',
      eff: 'Otevírá nos.',
      ind: ['ucpaný nos', 'rýma', 'zánět dutin', 'alergická rýma', 'ztráta čichu', 'krvácení z nosu', 'obrna lícního nervu'],
    },

    // ───────── Žaludek
    {
      id: 'ST6', pin: 'Jiache', cz: 'Čelistní kost', mer: 'ST', bi: true,
      pos: [{ v: 'f', x: 129, y: 87 }],
      loc: 'Asi na šířku prstu před a nad úhlem dolní čelisti, na nejvyšším bodě žvýkacího svalu při skousnutí.',
      eff: 'Uvolňuje čelist a tiší bolest zubů.',
      ind: ['bolest zubů (dolních)', 'skřípání zubů', 'bolest čelisti', 'obrna lícního nervu', 'otok tváře'],
    },
    {
      id: 'ST7', pin: 'Xiaguan', cz: 'Dolní brána', mer: 'ST', bi: true,
      pos: [{ v: 'f', x: 127, y: 71 }],
      loc: 'Před uchem v jamce pod lícním obloukem. Při otevření úst jamka zmizí.',
      eff: 'Místní bod čelistního kloubu a ucha.',
      ind: ['bolest zubů (horních)', 'bolest čelistního kloubu', 'cvakání v čelisti', 'hučení v uších', 'obrna lícního nervu'],
    },
    {
      id: 'ST25', pin: 'Tianshu', cz: 'Nebeský čep', mer: 'ST', bi: true,
      pos: [{ v: 'f', x: 136, y: 290 }],
      loc: '2 cun (asi tři prsty) do strany od pupku.',
      eff: 'Hlavní bod střev – reguluje vyprazdňování v obou směrech.',
      ind: ['zácpa', 'průjem', 'nadýmání', 'bolest břicha', 'nepravidelná menstruace'],
      warn: 'V těhotenství na břicho netlačte.',
    },
    {
      id: 'ST34', pin: 'Liangqiu', cz: 'Hřbet hory', mer: 'ST', bi: true,
      pos: [{ v: 'f', x: 109, y: 496 }],
      loc: '2 cun nad horním vnějším okrajem čéšky.',
      eff: 'Rychle tiší akutní bolest žaludku.',
      ind: ['akutní bolest žaludku', 'křeč žaludku', 'bolest a otok kolene'],
    },
    {
      id: 'ST35', pin: 'Dubi', cz: 'Telecí nos', mer: 'ST', bi: true,
      pos: [{ v: 'f', x: 113, y: 536 }],
      loc: 'Při pokrčeném koleni v jamce pod čéškou, na vnější straně čéškové šlachy („vnější oko kolene“).',
      eff: 'Místní bod kolene.',
      ind: ['bolest kolene', 'otok kolene', 'ztuhlost kolene', 'artróza kolene'],
    },
    {
      id: 'ST36', pin: 'Zusanli', cz: 'Tři míle na noze', mer: 'ST', bi: true,
      pos: [{ v: 'f', x: 115, y: 563 }],
      loc: '3 cun (šířka čtyř prstů) pod bodem ST35, na šířku prstu do strany od přední hrany holenní kosti.',
      eff: 'Nejznámější posilující bod celého těla – dodává energii a posiluje trávení i imunitu.',
      ind: ['únava', 'slabé trávení', 'nevolnost', 'nadýmání', 'průjem', 'zácpa', 'oslabená imunita', 'bolest kolene', 'závrať', 'nechutenství'],
      tip: 'Vhodný k pravidelné každodenní masáži, 2–3 minuty na každé noze.',
    },
    {
      id: 'ST40', pin: 'Fenglong', cz: 'Hojný výběžek', mer: 'ST', bi: true,
      pos: [{ v: 'f', x: 108, y: 597 }],
      loc: 'Uprostřed mezi kolenem a vnějším kotníkem, na šířku dvou prstů do strany od přední hrany holenní kosti.',
      eff: 'Hlavní bod proti hlenu – „rozpouští hlen“ v plicích i v hlavě.',
      ind: ['hlen', 'kašel s hlenem', 'astma', 'závrať', 'bolest hlavy', 'pocit těžkosti', 'vysoký krevní tlak'],
    },
    {
      id: 'ST44', pin: 'Neiting', cz: 'Vnitřní dvůr', mer: 'ST', bi: true,
      pos: [{ v: 'f', x: 123, y: 697 }],
      loc: 'Na hřbetu nohy, na okraji kožní řasy mezi 2. a 3. prstem.',
      eff: 'Ochlazuje horko v žaludku a obličeji.',
      ind: ['bolest zubů', 'krvácení dásní', 'bolest v krku', 'krvácení z nosu', 'pálení žáhy', 'horečka', 'bolest nohy'],
    },

    // ───────── Slezina
    {
      id: 'SP4', pin: 'Gongsun', cz: 'Vévodův vnuk', mer: 'SP', bi: true,
      pos: [{ v: 'f', x: 137, y: 681 }],
      loc: 'Na vnitřní hraně nohy, v jamce před a pod spodinou 1. nártní kosti, na hranici kůže chodidla a nártu.',
      eff: 'Uklidňuje žaludek a střeva.',
      ind: ['bolest žaludku', 'nevolnost', 'zvracení', 'nadýmání', 'průjem', 'menstruační potíže'],
    },
    {
      id: 'SP6', pin: 'Sanyinjiao', cz: 'Křižovatka tří jin', mer: 'SP', bi: true,
      pos: [{ v: 'f', x: 131, y: 629 }],
      loc: '3 cun (šířka čtyř prstů) nad vrcholem vnitřního kotníku, těsně za zadní hranou holenní kosti.',
      eff: 'Hlavní ženský bod – reguluje menstruaci, zklidňuje a pomáhá spánku.',
      ind: ['menstruační bolesti', 'nepravidelný cyklus', 'PMS', 'nespavost', 'špatné trávení', 'otoky', 'potíže s močením', 'menopauza', 'návaly horka'],
      warn: PREG,
    },
    {
      id: 'SP9', pin: 'Yinlingquan', cz: 'Pramen jinového kopce', mer: 'SP', bi: true,
      pos: [{ v: 'f', x: 133, y: 550 }],
      loc: 'Na vnitřní straně bérce v jamce pod spodním okrajem vnitřního hrbolu holenní kosti. Sjeďte prstem po holenní kosti nahoru, až se zastaví pod kolenem.',
      eff: 'Odvádí nadbytečnou vodu a vlhkost.',
      ind: ['otoky', 'zadržování vody', 'průjem', 'potíže s močením', 'bolest kolene', 'pocit těžkosti'],
    },
    {
      id: 'SP10', pin: 'Xuehai', cz: 'Moře krve', mer: 'SP', bi: true,
      pos: [{ v: 'f', x: 134, y: 496 }],
      loc: 'Při pokrčeném koleni 2 cun nad horním vnitřním okrajem čéšky, na vyklenutí vnitřní hlavy čtyřhlavého svalu.',
      eff: 'Hlavní bod krve – reguluje menstruaci a tiší kožní potíže.',
      ind: ['bolestivá menstruace', 'nepravidelná menstruace', 'ekzém', 'kopřivka', 'svědění', 'akné', 'bolest kolene'],
      warn: 'V těhotenství raději nepoužívejte.',
    },

    // ───────── Srdce
    {
      id: 'HT3', pin: 'Shaohai', cz: 'Malé moře', mer: 'HT', bi: true,
      pos: [{ v: 'f', x: 92, y: 283 }],
      loc: 'Při pokrčeném lokti na vnitřním (malíkovém) konci loketní rýhy.',
      eff: 'Zklidňuje a uvolňuje loket.',
      ind: ['golfový loket', 'bolest a necitlivost paže', 'třes ruky', 'bušení srdce', 'úzkost'],
    },
    {
      id: 'HT7', pin: 'Shenmen', cz: 'Brána ducha', mer: 'HT', bi: true,
      pos: [{ v: 'f', x: 83, y: 386 }],
      loc: 'Na zápěstní rýze na malíkové straně, v jamce na palcové straně šlachy, kterou nahmatáte při ohnutí zápěstí.',
      eff: 'Hlavní zklidňující bod – uvolňuje mysl a pomáhá spánku.',
      ind: ['nespavost', 'úzkost', 'neklid', 'stres', 'bušení srdce', 'zapomnětlivost', 'smutek', 'tréma'],
    },

    // ───────── Tenké střevo
    {
      id: 'SI3', pin: 'Houxi', cz: 'Zadní potok', mer: 'SI', bi: true,
      pos: [{ v: 'b', x: 85, y: 430 }],
      loc: 'Na malíkové hraně ruky za kloubem malíku, na konci rýhy dlaně, která vznikne při sevření ruky v pěst.',
      eff: 'Uvolňuje šíji a celou páteř.',
      ind: ['ztuhlá šíje', 'bolest krku', 'bolest zad podél páteře', 'bolest hlavy v týle', 'bolest ruky', 'hučení v uších'],
    },
    {
      id: 'SI11', pin: 'Tianzong', cz: 'Nebeský úctyhodný', mer: 'SI', bi: true,
      pos: [{ v: 'b', x: 117, y: 186 }],
      loc: 'Uprostřed lopatky, v jamce v jedné třetině vzdálenosti od hřebene lopatky k jejímu dolnímu úhlu. Bývá výrazně citlivý.',
      eff: 'Uvolňuje lopatku a rameno.',
      ind: ['bolest lopatky', 'bolest ramene', 'bolest mezi lopatkami', 'napětí v prsou', 'zánět prsu'],
    },
    {
      id: 'SI19', pin: 'Tinggong', cz: 'Palác sluchu', mer: 'SI', bi: true,
      pos: [{ v: 'f', x: 123, y: 63 }],
      loc: 'Před tragem (chrupavčitým výběžkem před zvukovodem), v jamce, která se objeví při otevření úst.',
      eff: 'Hlavní místní bod ucha.',
      ind: ['hučení v uších', 'nedoslýchavost', 'bolest ucha', 'bolest čelistního kloubu'],
    },

    // ───────── Močový měchýř
    {
      id: 'BL2', pin: 'Zanzhu', cz: 'Shromážděný bambus', mer: 'BL', bi: true,
      pos: [{ v: 'f', x: 141, y: 47 }],
      loc: 'Na vnitřním konci obočí, v drobném zářezu kosti nad vnitřním koutkem oka.',
      eff: 'Projasňuje oči a uvolňuje čelo.',
      ind: ['bolest hlavy v čele', 'únava očí', 'pálení a slzení očí', 'ucpaný nos', 'zánět dutin', 'alergická rýma'],
    },
    {
      id: 'BL10', pin: 'Tianzhu', cz: 'Nebeský sloup', mer: 'BL', bi: true,
      pos: [{ v: 'b', x: 143, y: 104 }],
      loc: 'Na zátylku na hranici vlasů, 1,3 cun od střední čáry, na vnějším okraji silného svalu podél páteře (trapézu).',
      eff: 'Uvolňuje šíji a týl.',
      ind: ['bolest týlu', 'ztuhlá šíje', 'závrať', 'ucpaný nos', 'únava očí'],
    },
    {
      id: 'BL13', pin: 'Feishu', cz: 'Souhlasný bod plic', mer: 'BL', bi: true,
      pos: [{ v: 'b', x: 139, y: 162 }],
      loc: '1,5 cun do strany od dolního okraje trnu 3. hrudního obratle (v úrovni hřebene lopatky).',
      eff: 'Posiluje plíce.',
      ind: ['kašel', 'astma', 'nachlazení', 'dušnost', 'alergická rýma'],
    },
    {
      id: 'BL15', pin: 'Xinshu', cz: 'Souhlasný bod srdce', mer: 'BL', bi: true,
      pos: [{ v: 'b', x: 139, y: 185 }],
      loc: '1,5 cun do strany od dolního okraje trnu 5. hrudního obratle.',
      eff: 'Zklidňuje srdce a mysl.',
      ind: ['bušení srdce', 'úzkost', 'nespavost', 'zapomnětlivost', 'bolest na hrudi'],
    },
    {
      id: 'BL17', pin: 'Geshu', cz: 'Souhlasný bod bránice', mer: 'BL', bi: true,
      pos: [{ v: 'b', x: 139, y: 208 }],
      loc: '1,5 cun do strany od dolního okraje trnu 7. hrudního obratle (v úrovni dolního úhlu lopatek).',
      eff: 'Uvolňuje bránici a vyživuje krev.',
      ind: ['škytavka', 'pálení žáhy', 'říhání', 'chudokrevnost', 'kožní potíže', 'bolest na hrudi'],
    },
    {
      id: 'BL18', pin: 'Ganshu', cz: 'Souhlasný bod jater', mer: 'BL', bi: true,
      pos: [{ v: 'b', x: 139, y: 231 }],
      loc: '1,5 cun do strany od dolního okraje trnu 9. hrudního obratle.',
      eff: 'Uvolňuje játra, projasňuje oči.',
      ind: ['podrážděnost', 'únava očí', 'rozmazané vidění', 'bolest pod žebry', 'špatné trávení tuků'],
    },
    {
      id: 'BL20', pin: 'Pishu', cz: 'Souhlasný bod sleziny', mer: 'BL', bi: true,
      pos: [{ v: 'b', x: 139, y: 254 }],
      loc: '1,5 cun do strany od dolního okraje trnu 11. hrudního obratle.',
      eff: 'Posiluje trávení a energii.',
      ind: ['slabé trávení', 'nadýmání', 'průjem', 'únava', 'otoky', 'nechutenství'],
    },
    {
      id: 'BL21', pin: 'Weishu', cz: 'Souhlasný bod žaludku', mer: 'BL', bi: true,
      pos: [{ v: 'b', x: 139, y: 266 }],
      loc: '1,5 cun do strany od dolního okraje trnu 12. hrudního obratle.',
      eff: 'Harmonizuje žaludek.',
      ind: ['bolest žaludku', 'nevolnost', 'nechutenství', 'nadýmání'],
    },
    {
      id: 'BL23', pin: 'Shenshu', cz: 'Souhlasný bod ledvin', mer: 'BL', bi: true,
      pos: [{ v: 'b', x: 139, y: 289 }],
      loc: '1,5 cun do strany od dolního okraje trnu 2. bederního obratle (přibližně v úrovni pupku).',
      eff: 'Posiluje ledviny, bedra a celkovou vitalitu.',
      ind: ['bolest beder', 'únava', 'vyčerpání', 'hučení v uších', 'časté močení', 'chlad v zádech', 'bolest kolen'],
      tip: 'Dobře působí i teplo – třete bedra dlaněmi, dokud nezačnou hřát.',
    },
    {
      id: 'BL25', pin: 'Dachangshu', cz: 'Souhlasný bod tlustého střeva', mer: 'BL', bi: true,
      pos: [{ v: 'b', x: 139, y: 312 }],
      loc: '1,5 cun do strany od dolního okraje trnu 4. bederního obratle (v úrovni horních okrajů pánevních kostí).',
      eff: 'Uvolňuje kříž a reguluje střeva.',
      ind: ['bolest kříže', 'zácpa', 'průjem', 'nadýmání', 'ischias'],
    },
    {
      id: 'BL40', pin: 'Weizhong', cz: 'Středová podpora', mer: 'BL', bi: true,
      pos: [{ v: 'b', x: 121, y: 524 }],
      loc: 'Uprostřed zákolenní rýhy.',
      eff: 'Klasika říká: „Na záda hledej Weizhong.“ Hlavní vzdálený bod pro bolest zad.',
      ind: ['bolest dolní části zad', 'ischias', 'bolest kolene', 'křeče lýtek', 'kožní potíže'],
      warn: 'Tlačte jemně; při křečových žilách v zákolenní jamce bod vynechte.',
    },
    {
      id: 'BL57', pin: 'Chengshan', cz: 'Podpora hory', mer: 'BL', bi: true,
      pos: [{ v: 'b', x: 121, y: 588 }],
      loc: 'Na zadní straně bérce v jamce pod bříšky lýtkového svalu, která se objeví, když se postavíte na špičky.',
      eff: 'Uvolňuje lýtko a záda.',
      ind: ['křeče lýtek', 'bolest zad', 'ischias', 'hemoroidy', 'zácpa'],
    },
    {
      id: 'BL60', pin: 'Kunlun', cz: 'Pohoří Kunlun', mer: 'BL', bi: true,
      pos: [{ v: 'b', x: 112, y: 657 }],
      loc: 'V jamce mezi vrcholem vnějšího kotníku a Achillovou šlachou.',
      eff: 'Uvolňuje celou zadní stranu těla od hlavy po patu.',
      ind: ['bolest hlavy', 'ztuhlá šíje', 'bolest zad', 'bolest kotníku', 'bolest paty'],
      warn: PREG,
    },
    {
      id: 'BL67', pin: 'Zhiyin', cz: 'Dosažení jinu', mer: 'BL', bi: true,
      pos: [{ v: 'f', x: 106, y: 699 }],
      loc: 'Na vnější straně malíčku nohy, asi 2 mm od kořene nehtu.',
      eff: 'Koncový bod dráhy močového měchýře.',
      ind: ['bolest hlavy v týle', 'ucpaný nos', 'bolest oka', 'poloha plodu koncem pánevním (jen moxa pod vedením odborníka)'],
      warn: 'V těhotenství pouze pod dohledem porodní asistentky nebo lékaře.',
    },

    // ───────── Ledviny
    {
      id: 'KI1', pin: 'Yongquan', cz: 'Bublající pramen', mer: 'KI', bi: true,
      pos: [{ v: 'b', x: 122, y: 696 }],
      loc: 'Na chodidle, v jamce v přední třetině chodidla, která vznikne při pokrčení prstů. (Na obrázku zezadu u paty – bod leží na spodní straně chodidla.)',
      eff: 'Nejníže položený bod těla – „uzemňuje“, stahuje energii z hlavy dolů.',
      ind: ['nespavost', 'neklid', 'závrať', 'bolest hlavy na temeni', 'horko v chodidlech', 'vysoký krevní tlak', 'mdloba'],
      tip: 'Večer před spaním masírujte chodidla 2–3 minuty.',
    },
    {
      id: 'KI3', pin: 'Taixi', cz: 'Velký potok', mer: 'KI', bi: true,
      pos: [{ v: 'b', x: 132, y: 657 }],
      loc: 'V jamce mezi vrcholem vnitřního kotníku a Achillovou šlachou.',
      eff: 'Hlavní bod posilující ledviny – jin i jang.',
      ind: ['bolest beder', 'únava', 'hučení v uších', 'nespavost', 'návaly horka', 'časté močení', 'chronická bolest v krku', 'bolest paty', 'menopauza'],
    },
    {
      id: 'KI6', pin: 'Zhaohai', cz: 'Zářící moře', mer: 'KI', bi: true,
      pos: [{ v: 'f', x: 132, y: 667 }],
      loc: '1 cun pod vrcholem vnitřního kotníku, v jamce.',
      eff: 'Zvlhčuje, ochlazuje a zklidňuje.',
      ind: ['nespavost', 'suché hrdlo', 'návaly horka', 'noční pocení', 'nepravidelná menstruace', 'zácpa', 'menopauza'],
    },

    // ───────── Osrdečník
    {
      id: 'PC6', pin: 'Neiguan', cz: 'Vnitřní brána', mer: 'PC', bi: true,
      pos: [{ v: 'f', x: 74, y: 368 }],
      loc: '2 cun (šířka tří prstů) nad zápěstní rýhou, mezi dvěma šlachami uprostřed vnitřní strany předloktí.',
      eff: 'Nejznámější bod proti nevolnosti. Na tomto bodě působí i náramky proti kinetóze.',
      ind: ['nevolnost', 'zvracení', 'nevolnost v autě a na lodi', 'těhotenská nevolnost', 'bušení srdce', 'úzkost', 'tíseň na hrudi', 'nespavost', 'pálení žáhy', 'karpální tunel'],
      tip: 'Při nevolnosti tlačte vytrvale 2–3 minuty a pomalu dýchejte.',
    },
    {
      id: 'PC8', pin: 'Laogong', cz: 'Palác práce', mer: 'PC', bi: true,
      pos: [{ v: 'f', x: 74, y: 426 }],
      loc: 'Uprostřed dlaně, kde se při sevření pěsti dotkne špička prostředníčku.',
      eff: 'Ochlazuje horko a zklidňuje mysl.',
      ind: ['stres', 'úzkost', 'pocení dlaní', 'afty', 'zápach z úst', 'mdloba'],
    },

    // ───────── Trojitý zářič
    {
      id: 'TE5', pin: 'Waiguan', cz: 'Vnější brána', mer: 'TE', bi: true,
      pos: [{ v: 'b', x: 74, y: 368 }],
      loc: '2 cun nad zápěstní rýhou na hřbetní straně předloktí, mezi vřetenní a loketní kostí – přesně naproti PC6.',
      eff: 'Uvolňuje povrch těla při nachlazení, působí na spánky a uši.',
      ind: ['nachlazení', 'horečka', 'bolest hlavy na spáncích', 'migréna', 'hučení v uších', 'bolest ucha', 'bolest zápěstí a paže', 'bolest žeber'],
    },
    {
      id: 'TE6', pin: 'Zhigou', cz: 'Větvený příkop', mer: 'TE', bi: true,
      pos: [{ v: 'b', x: 74, y: 359 }],
      loc: '3 cun nad zápěstní rýhou na hřbetní straně předloktí, mezi vřetenní a loketní kostí.',
      eff: 'Klasický bod na zácpu.',
      ind: ['zácpa', 'bolest pod žebry', 'chrapot', 'hučení v uších'],
    },

    // ───────── Žlučník
    {
      id: 'GB14', pin: 'Yangbai', cz: 'Jangová bělost', mer: 'GB', bi: true,
      pos: [{ v: 'f', x: 137, y: 37 }],
      loc: 'Na čele, 1 cun nad středem obočí – v linii zornice při pohledu dopředu.',
      eff: 'Místní bod čela a očí.',
      ind: ['bolest hlavy v čele', 'bolest očí', 'cukání víček', 'obrna lícního nervu', 'zánět dutin'],
    },
    {
      id: 'GB20', pin: 'Fengchi', cz: 'Jezírko větru', mer: 'GB', bi: true,
      pos: [{ v: 'b', x: 134, y: 95 }],
      loc: 'Pod spodinou lební, v jamce mezi kývačem a trapézovým svalem – zhruba v úrovni ušních lalůčků.',
      eff: 'Hlavní bod hlavy a šíje, „vyhání vítr“.',
      ind: ['bolest hlavy', 'migréna', 'ztuhlá šíje', 'nachlazení', 'závrať', 'vysoký krevní tlak', 'únava očí', 'nespavost', 'hučení v uších'],
      tip: 'Obejměte hlavu dlaněmi a palci tlačte šikmo nahoru pod lebku.',
    },
    {
      id: 'GB21', pin: 'Jianjing', cz: 'Ramenní studna', mer: 'GB', bi: true,
      pos: [{ v: 'b', x: 114, y: 131 }],
      loc: 'Na vrcholu ramene, v polovině vzdálenosti mezi nejvystouplejším krčním obratlem (C7) a koncem ramene.',
      eff: 'Uvolňuje napětí v ramenou a šíji, které se hromadí při stresu.',
      ind: ['ztuhlá šíje', 'napětí v ramenou', 'bolest ramene', 'bolest hlavy', 'stres', 'zánět prsu'],
      warn: PREG + ' Akupunkturně se nepíchá hluboko.',
    },
    {
      id: 'GB30', pin: 'Huantiao', cz: 'Skákající kruh', mer: 'GB', bi: true,
      pos: [{ v: 'b', x: 109, y: 362 }],
      loc: 'Na hýždi, v jedné třetině vzdálenosti od kostního hrbolu na boku stehna (velkého chocholíku) ke kosti křížové. Nejlépe se hledá vleže na boku.',
      eff: 'Hlavní bod kyčle a sedacího nervu.',
      ind: ['ischias', 'bolest kyčle', 'bolest dolní části zad', 'slabost nohou'],
    },
    {
      id: 'GB34', pin: 'Yanglingquan', cz: 'Pramen jangového kopce', mer: 'GB', bi: true,
      pos: [{ v: 'f', x: 107, y: 553 }],
      loc: 'Na vnější straně bérce, v jamce před a pod hlavičkou lýtkové kosti (kostěný hrbolek pod kolenem z boku).',
      eff: 'Vlivný bod šlach a svalů – uvolňuje křeče a ztuhlost kdekoli v těle.',
      ind: ['křeče svalů', 'ztuhlost', 'bolest kolene', 'bolest pod žebry', 'potíže se žlučníkem', 'hořko v ústech', 'ischias'],
    },
    {
      id: 'GB39', pin: 'Xuanzhong', cz: 'Zavěšený zvon', mer: 'GB', bi: true,
      pos: [{ v: 'f', x: 109, y: 628 }],
      loc: '3 cun nad vrcholem vnějšího kotníku, na přední hraně lýtkové kosti.',
      eff: 'Vlivný bod kostní dřeně, uvolňuje šíji.',
      ind: ['ztuhlá šíje', 'bolest nohy', 'bolest kotníku', 'slabost nohou'],
    },
    {
      id: 'GB41', pin: 'Zulinqi', cz: 'Slzy na noze', mer: 'GB', bi: true,
      pos: [{ v: 'f', x: 112, y: 686 }],
      loc: 'Na hřbetu nohy, v jamce před spojením 4. a 5. nártní kosti, vně od šlachy malíčku.',
      eff: 'Působí na spánky, oči a boky těla.',
      ind: ['migréna', 'bolest hlavy na spáncích', 'bolest oka', 'napětí prsou', 'bolest nohy'],
    },

    // ───────── Játra
    {
      id: 'LR3', pin: 'Taichong', cz: 'Velký nápor', mer: 'LR', bi: true,
      pos: [{ v: 'f', x: 129, y: 684 }],
      loc: 'Na hřbetu nohy v jamce mezi 1. a 2. nártní kostí, kde se kosti sbíhají. Sjeďte prstem od mezery mezi palcem a 2. prstem nahoru, až narazíte na kost.',
      eff: 'Uvolňuje napětí a stres, stahuje energii z hlavy. S LI4 tvoří „čtyři brány“.',
      ind: ['bolest hlavy', 'migréna', 'podrážděnost', 'stres', 'vysoký krevní tlak', 'závrať', 'menstruační bolesti', 'PMS', 'únava očí', 'křeče', 'deprese'],
      warn: 'V těhotenství raději nepoužívejte.',
    },
    {
      id: 'LR13', pin: 'Zhangmen', cz: 'Brána odznaku', mer: 'LR', bi: true,
      pos: [{ v: 'f', x: 114, y: 263 }],
      loc: 'Na boku břicha pod volným koncem 11. žebra. Při připažení loktem leží zhruba v místě, kam dosáhne špička lokte.',
      eff: 'Harmonizuje játra a trávení.',
      ind: ['nadýmání', 'špatné trávení', 'bolest pod žebry', 'průjem'],
    },
    {
      id: 'LR14', pin: 'Qimen', cz: 'Brána cyklu', mer: 'LR', bi: true,
      pos: [{ v: 'f', x: 122, y: 227 }],
      loc: 'Přímo pod bradavkou, v 6. mezižebří (dvě mezižebří pod bradavkou).',
      eff: 'Uvolňuje sevřenou energii jater, ulevuje žaludku.',
      ind: ['bolest pod žebry', 'říhání', 'pálení žáhy', 'napětí prsou', 'stres', 'deprese'],
      warn: 'Akupunkturně se nepíchá hluboko. Pro akupresuru jemný tlak.',
    },

    // ───────── Řídící céva
    {
      id: 'GV4', pin: 'Mingmen', cz: 'Brána života', mer: 'GV', bi: false,
      pos: [{ v: 'b', x: 150, y: 290 }],
      loc: 'Na střední čáře zad pod trnem 2. bederního obratle, zhruba naproti pupku.',
      eff: 'Zahřívá a posiluje životní energii.',
      ind: ['bolest beder', 'chlad v zádech', 'únava', 'časté močení', 'nedostatek energie'],
    },
    {
      id: 'GV14', pin: 'Dazhui', cz: 'Velký obratel', mer: 'GV', bi: false,
      pos: [{ v: 'b', x: 150, y: 127 }],
      loc: 'Na střední čáře pod trnem 7. krčního obratle – nejvíce vystouplého obratle na spodině krku (při předklonu hlavy).',
      eff: 'Snižuje horečku a posiluje obranyschopnost.',
      ind: ['horečka', 'nachlazení', 'ztuhlá šíje', 'kašel', 'astma', 'oslabená imunita'],
    },
    {
      id: 'GV16', pin: 'Fengfu', cz: 'Palác větru', mer: 'GV', bi: false,
      pos: [{ v: 'b', x: 150, y: 93 }],
      loc: 'Na střední čáře zátylku, 1 cun nad hranicí vlasů, v jamce přímo pod týlním hrbolem.',
      eff: 'Vyhání vítr z hlavy.',
      ind: ['bolest hlavy', 'ztuhlá šíje', 'závrať', 'nachlazení'],
      warn: 'Pouze jemný tlak, nikdy hluboké napichování.',
    },
    {
      id: 'GV20', pin: 'Baihui', cz: 'Sto setkání', mer: 'GV', bi: false,
      pos: [{ v: 'f', x: 150, y: 22 }, { v: 'b', x: 150, y: 22 }],
      loc: 'Na temeni hlavy na střední čáře, v místě, kde ji protíná spojnice vrcholů obou uší.',
      eff: 'Zvedá energii a zároveň zklidňuje mysl.',
      ind: ['bolest hlavy na temeni', 'závrať', 'nespavost', 'špatná paměť', 'únava', 'smutek', 'hemoroidy'],
    },
    {
      id: 'GV26', pin: 'Shuigou', cz: 'Vodní příkop', mer: 'GV', bi: false,
      pos: [{ v: 'f', x: 150, y: 79 }],
      loc: 'Na horním rtu, v horní třetině rýhy pod nosem. Známý také jako Renzhong.',
      eff: 'Bod první pomoci při mdlobě.',
      ind: ['mdloba', 'ztráta vědomí', 'akutní bolest zad', 'otok obličeje'],
      warn: 'Při bezvědomí vždy nejdřív volejte 155 nebo 112. Bod je jen doplněk první pomoci.',
      tip: 'Při mdlobě silně tlačte nehtem palce.',
    },

    // ───────── Céva početí
    {
      id: 'CV4', pin: 'Guanyuan', cz: 'Brána prvotní energie', mer: 'CV', bi: false,
      pos: [{ v: 'f', x: 150, y: 326 }],
      loc: 'Na střední čáře břicha, 3 cun (šířka čtyř prstů) pod pupkem.',
      eff: 'Hluboce posiluje a zahřívá podbřišek.',
      ind: ['únava', 'vyčerpání', 'menstruační bolesti', 'nepravidelný cyklus', 'časté močení', 'bolest podbřišku'],
      warn: 'V těhotenství netlačte. Před tlakem vyprázdněte močový měchýř.',
    },
    {
      id: 'CV6', pin: 'Qihai', cz: 'Moře čchi', mer: 'CV', bi: false,
      pos: [{ v: 'f', x: 150, y: 308 }],
      loc: 'Na střední čáře břicha, 1,5 cun (šířka dvou prstů) pod pupkem.',
      eff: '„Moře energie“ – doplňuje sílu.',
      ind: ['únava', 'slabost', 'nadýmání', 'bolest podbřišku', 'menstruační bolesti', 'průjem'],
      warn: 'V těhotenství netlačte.',
    },
    {
      id: 'CV12', pin: 'Zhongwan', cz: 'Střed žaludku', mer: 'CV', bi: false,
      pos: [{ v: 'f', x: 150, y: 256 }],
      loc: 'Na střední čáře břicha, 4 cun nad pupkem – uprostřed mezi pupkem a dolním koncem hrudní kosti.',
      eff: 'Hlavní bod žaludku a trávení.',
      ind: ['bolest žaludku', 'nadýmání', 'nevolnost', 'zvracení', 'pálení žáhy', 'nechutenství', 'průjem', 'škytavka'],
      warn: 'Nemasírujte hned po jídle.',
    },
    {
      id: 'CV17', pin: 'Danzhong', cz: 'Střed hrudi', mer: 'CV', bi: false,
      pos: [{ v: 'f', x: 150, y: 200 }],
      loc: 'Na hrudní kosti mezi bradavkami, v úrovni 4. mezižebří.',
      eff: 'Uvolňuje hrudník, dech a emoce.',
      ind: ['tíseň na hrudi', 'dušnost', 'astma', 'kašel', 'úzkost', 'bušení srdce', 'škytavka', 'nedostatek mléka při kojení'],
    },
    {
      id: 'CV22', pin: 'Tiantu', cz: 'Nebeský komín', mer: 'CV', bi: false,
      pos: [{ v: 'f', x: 150, y: 128 }],
      loc: 'Uprostřed jamky nad horním okrajem hrudní kosti (mezi klíčními kostmi).',
      eff: 'Uvolňuje hrdlo a průdušky.',
      ind: ['kašel', 'astma', 'bolest v krku', 'chrapot', 'škytavka', 'pocit knedlíku v krku'],
      warn: 'Pouze jemný tlak směrem dolů za hrudní kost, nikdy dozadu do krku.',
    },
    {
      id: 'CV24', pin: 'Chengjiang', cz: 'Přijímání sliny', mer: 'CV', bi: false,
      pos: [{ v: 'f', x: 150, y: 93 }],
      loc: 'Uprostřed rýhy pod dolním rtem, nad bradou.',
      eff: 'Místní bod úst a dolní čelisti.',
      ind: ['bolest dolních zubů', 'slinění', 'obrna lícního nervu', 'otok obličeje'],
    },

    // ───────── Mimodrážní body
    {
      id: 'Yintang', code: 'EX-HN3', pin: 'Yintang', cz: 'Pečetní síň', mer: 'EX', bi: false,
      pos: [{ v: 'f', x: 150, y: 48 }],
      loc: 'Uprostřed mezi vnitřními konci obočí (tzv. „třetí oko“).',
      eff: 'Silně zklidňuje mysl, otevírá nos.',
      ind: ['nespavost', 'úzkost', 'stres', 'bolest hlavy v čele', 'ucpaný nos', 'zánět dutin', 'závrať'],
      tip: 'Jemně krouživě 1–2 minuty se zavřenýma očima.',
    },
    {
      id: 'Taiyang', code: 'EX-HN5', pin: 'Taiyang', cz: 'Nejvyšší jang (spánek)', mer: 'EX', bi: true,
      pos: [{ v: 'f', x: 125, y: 51 }],
      loc: 'Na spánku, v jamce asi 1 cun za místem mezi zevním koutkem oka a koncem obočí.',
      eff: 'Hlavní bod pro bolest hlavy na spáncích.',
      ind: ['bolest hlavy na spáncích', 'migréna', 'únava očí', 'zarudlé oči', 'bolest zubů', 'obrna lícního nervu'],
    },
    {
      id: 'Anmian', code: 'EX', pin: 'Anmian', cz: 'Klidný spánek', mer: 'EX', bi: true,
      pos: [{ v: 'b', x: 125, y: 84 }],
      loc: 'Za uchem, uprostřed mezi jamkou za ušním lalůčkem a bodem GB20 pod lebkou.',
      eff: 'Jak napovídá název – pomáhá usnout.',
      ind: ['nespavost', 'neklid', 'bušení srdce', 'závrať', 'vysoký krevní tlak'],
    },
    {
      id: 'Dingchuan', code: 'EX-B1', pin: 'Dingchuan', cz: 'Utišení dechu', mer: 'EX', bi: true,
      pos: [{ v: 'b', x: 144, y: 127 }],
      loc: '0,5 cun do strany od bodu GV14, tedy vedle trnu 7. krčního obratle.',
      eff: 'Specifický bod pro úlevu při dušnosti.',
      ind: ['astma', 'dušnost', 'kašel', 'ztuhlá šíje'],
    },
  ];

  /*
   * Potíže a přání → body.
   * keys: kmeny slov bez diakritiky; slovo z dotazu pasuje, když kmenem začíná.
   *       Klíč s mezerou se hledá jako fráze. [klíč, váha] snižuje váhu nejednoznačných slov.
   * pts:  bod → důležitost (3 = hlavní bod, 2 = velmi vhodný, 1 = doplňkový).
   */
  const CONCEPTS = [
    { label: 'bolest hlavy', keys: ['hlav', 'cefal', 'hlavobol'], pts: { LI4: 3, GB20: 3, Taiyang: 2, Yintang: 2, LR3: 2, LU7: 2, GV20: 1, GB21: 1, BL2: 1, BL60: 1, GV16: 1 } },
    { label: 'migréna', keys: ['migren', 'spank'], pts: { GB20: 3, Taiyang: 3, LR3: 3, TE5: 2, GB41: 2, LI4: 2 } },
    { label: 'nespavost', keys: ['nespav', 'spat', 'spanek', 'spani', 'usn', 'probouz', 'insomn', 'spim', 'vstavan'], pts: { HT7: 3, Anmian: 3, SP6: 2, Yintang: 2, PC6: 2, KI1: 2, KI6: 1, BL15: 1, GV20: 1 } },
    { label: 'stres a úzkost', keys: ['stres', 'uzkost', 'nervoz', 'napet', 'panik', 'strach', 'neklid', 'treme', 'trema', 'zklidn', 'uklidn', 'relax', 'uvoln'], pts: { HT7: 3, PC6: 3, Yintang: 3, LR3: 2, LI4: 2, GV20: 1, CV17: 1, PC8: 1 } },
    { label: 'smutek a deprese', keys: ['smut', 'depres', 'plac', 'nalad', 'skles'], pts: { HT7: 3, LR3: 2, PC6: 2, GV20: 2, Yintang: 2, LR14: 1, CV17: 1 } },
    { label: 'podrážděnost a vztek', keys: ['podrazd', 'vztek', 'zlost', 'naštv', 'nastv', 'vybus', 'agres'], pts: { LR3: 3, LI4: 2, GB20: 1, HT7: 1 } },
    { label: 'nevolnost a zvracení', keys: ['nevoln', 'je mi zle', 'je mi blbe', 'zle od zalud', 'zvrac', 'zvedá', 'zveda', 'kineto', 'mořsk', 'morsk', 'autem', 'v aute', 'na lodi', 'lod', 'nauze', 'blinka'], pts: { PC6: 3, ST36: 2, CV12: 2, SP4: 2 } },
    { label: 'bolest žaludku a trávení', keys: ['zalud', 'traven', 'travic', 'gastr', 'jidl', 'prejed'], pts: { CV12: 3, ST36: 3, PC6: 2, SP4: 2, ST34: 2, BL21: 1, BL20: 1 } },
    { label: 'pálení žáhy', keys: ['zah', 'reflux', 'kysel'], pts: { PC6: 3, CV12: 3, ST36: 2, LR14: 2, ST44: 1, BL17: 1 } },
    { label: 'nadýmání', keys: ['nadym', 'plyn', 'prd', 'nafouk', 'kruc'], pts: { ST25: 3, CV12: 2, ST36: 2, SP4: 2, CV6: 1, LR13: 1 } },
    { label: 'zácpa', keys: ['zacp', 'stolic', 'vyprazd', 'obstip'], pts: { ST25: 3, TE6: 3, BL25: 2, ST36: 1, LI4: 1, LI11: 1, KI6: 1 } },
    { label: 'průjem', keys: ['pruj', 'rides stolic'], pts: { ST25: 3, ST36: 3, SP9: 2, BL25: 2, CV6: 1, BL20: 1 } },
    { label: 'nechutenství', keys: ['nechut', 'chut k jid', 'apetit'], pts: { ST36: 3, CV12: 2, BL20: 2, BL21: 2 } },
    { label: 'škytavka', keys: ['skytav', 'skyt'], pts: { BL17: 3, PC6: 3, CV12: 2, CV22: 1, CV17: 1 } },
    { label: 'nachlazení a chřipka', keys: ['nachlaz', 'chrip', 'viroz', 'nastyd', 'prochlad', 'vir'], pts: { LI4: 3, LU7: 3, GB20: 2, TE5: 2, GV14: 2, BL13: 1, LI11: 1 } },
    { label: 'horečka', keys: ['horec', 'teplot', 'zimnic'], pts: { GV14: 3, LI11: 3, LI4: 2, TE5: 1 } },
    { label: 'rýma a ucpaný nos', keys: ['ryma', 'rym', 'nos', 'dutin', 'sinus', 'smrk', 'cich'], pts: { LI20: 3, Yintang: 3, LI4: 2, BL2: 1, LU7: 1 } },
    { label: 'kašel', keys: ['kasl', 'kasel', 'odkasl'], pts: { LU7: 3, LU5: 2, BL13: 2, CV22: 2, CV17: 1, LU1: 1, LU9: 1 } },
    { label: 'astma a dušnost', keys: ['astm', 'dusn', 'dech', 'dych', 'zadus', 'lapa'], pts: { Dingchuan: 3, CV17: 3, LU1: 2, BL13: 2, LU7: 1, LU9: 1, CV22: 1 } },
    { label: 'hlen', keys: ['hlen', 'chrchl', 'zahlen'], pts: { ST40: 3, LU5: 2, CV12: 1 } },
    { label: 'bolest v krku', keys: ['v krku', 'hrdl', 'angin', 'polyk', 'skrab', 'chrapot', 'hlas', ['krk', 0.5]], pts: { LI4: 3, CV22: 2, LU5: 2, LI11: 2, LU7: 1, ST44: 1, KI3: 1 } },
    { label: 'imunita', keys: ['imunit', 'obranyschop', 'odolnost', 'casto nemoc'], pts: { ST36: 3, LI11: 2, GV14: 2, LI4: 1, BL13: 1 } },
    { label: 'únava a nedostatek energie', keys: ['unav', 'vycerp', 'energi', 'bez sil', 'slabo', 'vitalit', 'vyhore', 'ospal', 'malatn'], pts: { ST36: 3, CV6: 3, CV4: 2, KI3: 2, BL23: 2, GV20: 1, BL20: 1 } },
    { label: 'paměť a soustředění', keys: ['pamet', 'soustred', 'koncentr', 'zapomin', 'zapomn', 'mysl', 'uceni', 'studi', 'zkousk'], pts: { GV20: 3, HT7: 3, Yintang: 2, BL15: 1, ST36: 1 } },
    { label: 'bolest zad a beder', keys: ['zad', 'beder', 'bedra', 'kriz', 'lumb', 'pater', 'housek', 'abych se narovn'], pts: { BL40: 3, BL23: 3, GV4: 2, BL25: 2, SI3: 2, BL60: 2, BL57: 1, GV26: 1 } },
    { label: 'ztuhlá šíje a krk', keys: ['sij', 'za krk', 'krcn', 'zatyl', 'ztuhl', 'krkem', 'zatuh', ['krk', 0.5]], pts: { GB20: 3, GB21: 3, SI3: 3, BL10: 2, LU7: 2, GB39: 1, GV14: 1, TE5: 1, GV16: 1 } },
    { label: 'bolest ramene', keys: ['ramen', 'rameno'], pts: { LI15: 3, SI11: 2, GB21: 2, LI11: 1, LI10: 1 } },
    { label: 'bolest mezi lopatkami', keys: ['lopat'], pts: { SI11: 3, BL17: 2, BL15: 1, GB21: 1 } },
    { label: 'bolest lokte', keys: ['loket', 'lokt', 'tenis', 'golf'], pts: { LI11: 3, LI10: 3, LU5: 2, HT3: 2 } },
    { label: 'zápěstí a ruka', keys: ['zapest', 'karpal', 'prst', 'ruk', 'dlan'], pts: { PC6: 2, TE5: 2, LI4: 2, LU9: 1, HT7: 1, SI3: 1 } },
    { label: 'bolest kolene', keys: ['kolen', 'koleno', 'cesk', 'menisk'], pts: { ST35: 3, SP9: 2, GB34: 2, ST34: 2, SP10: 1, BL40: 1, ST36: 1 } },
    { label: 'ischias a kyčel', keys: ['ischi', 'sedac', 'kycl', 'kycel', 'hyzd', 'zadek'], pts: { GB30: 3, BL40: 2, GB34: 2, BL57: 1, BL60: 1, BL25: 1 } },
    { label: 'křeče svalů', keys: ['krec', 'svaly', 'sval', 'lytk'], pts: { GB34: 3, BL57: 3, LR3: 2 } },
    { label: 'kotník a pata', keys: ['kotnik', 'pata', 'paty', 'patu', 'achil', 'chodidl', 'nohy'], pts: { BL60: 3, KI3: 3, GB39: 1, KI1: 1 } },
    { label: 'bolest zubů a čelisti', keys: ['zub', 'zuby', 'dasn', 'celist', 'skrip'], pts: { LI4: 3, ST6: 3, ST7: 3, ST44: 2, CV24: 1, Taiyang: 1 } },
    { label: 'oči', keys: ['oci', 'oko', 'ocni', 'zrak', 'videni', 'monitor', 'obrazovk', 'slzen'], pts: { BL2: 3, Taiyang: 2, GB20: 2, LR3: 2, GB14: 1, BL18: 1 } },
    { label: 'uši a hučení v uších', keys: ['ucho', 'usi', 'usni', 'tinit', 'hucen', 'piskan', 'slych', 'nedoslych'], pts: { SI19: 3, TE5: 2, KI3: 2, GB20: 1, SI3: 1, BL23: 1 } },
    { label: 'obličej a lícní nerv', keys: ['oblicej', 'licni', 'obrn', 'tvar', 'mimik'], pts: { LI4: 3, ST6: 2, ST7: 2, GB14: 2, LI20: 1, Taiyang: 1 } },
    { label: 'vysoký krevní tlak', keys: ['tlak', 'hyperten'], pts: { LR3: 3, LI11: 3, GB20: 2, ST40: 1, KI1: 1, GV20: 1, Anmian: 1 } },
    { label: 'závrať', keys: ['toci se mi hlava', 'hlava se mi toci', 'mota se mi hlava', 'hlava se mi mota', 'zavrat', 'toci', 'tocen', 'motan', 'vertig', 'rovnovah'], pts: { GB20: 3, GV20: 2, PC6: 2, ST40: 2, LR3: 1, BL10: 1 } },
    { label: 'bušení srdce', keys: ['buseni', 'srdc', 'palpit', 'tachyk'], pts: { PC6: 3, HT7: 3, CV17: 2, BL15: 2 } },
    { label: 'tíseň na hrudi', keys: ['hrud', 'hrudnik', 'tisen', 'sevren'], pts: { CV17: 3, PC6: 3, LR14: 1, LU1: 1 } },
    { label: 'menstruační bolesti', keys: ['menstruacni krec', 'krece pri menstru', 'krece behem menstru', 'menstru', 'mesicni', 'mens', 'perioda', 'periodu', 'krvacen', 'cyklus', 'cyklu'], pts: { SP6: 3, SP10: 2, LI4: 2, LR3: 2, CV4: 2, CV6: 1, ST25: 1 } },
    { label: 'PMS a napětí prsou', keys: ['pms', 'premenstru', 'prsa', 'prsou'], pts: { LR3: 3, PC6: 2, SP6: 2, LR14: 2, GB41: 1 } },
    { label: 'menopauza a návaly horka', keys: ['menopauz', 'klimakter', 'pechod', 'navaly', 'naval', 'poceni', 'potim', 'poti'], pts: { KI6: 3, KI3: 3, SP6: 2, HT7: 2, KI1: 1 } },
    { label: 'otoky a zadržování vody', keys: ['otok', 'otekl', 'zadrzov', 'voda v'], pts: { SP9: 3, SP6: 2, ST36: 1, BL20: 1 } },
    { label: 'potíže s močením', keys: ['mocen', 'mocov', 'cural', 'cura'], pts: { CV4: 3, SP6: 2, SP9: 2, BL23: 2, KI3: 1 } },
    { label: 'kůže, svědění a alergie', keys: ['svede', 'svedi', 'ekzem', 'koprivk', 'vyrazk', 'alerg', 'kuze', 'akne', 'plet', 'pupin'], pts: { LI11: 3, SP10: 3, LI4: 2, BL17: 1, SP6: 1 } },
    { label: 'hemoroidy', keys: ['hemoro', 'hemeroid', 'konecn'], pts: { BL57: 3, GV20: 2, BL25: 1 } },
    { label: 'bolest pod žebry a žlučník', keys: ['zebr', 'zluc', 'jater', 'jatra', 'horko v ust'], pts: { GB34: 3, LR14: 2, TE6: 2, LR3: 1, LR13: 1, BL18: 1 } },
    { label: 'mdloba a první pomoc', keys: ['mdlob', 'omdl', 'bezvedom', 'kolaps', 'prvni pomoc'], pts: { GV26: 3, KI1: 2, PC8: 1 } },
    { label: 'kojení', keys: ['kojen', 'mleko', 'mlek'], pts: { CV17: 3, SI11: 1 } },
  ];

  return { ELEMENTS, MERIDIANS, POINTS, CONCEPTS, PREG };
})();
