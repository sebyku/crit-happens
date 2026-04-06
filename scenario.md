# Scénario de CRIT Happens

Ce document décrit le déroulé complet de l'aventure. Les éléments entre `[crochets]` sont des mécaniques de jeu (flags cachés, conditions, stats).

---

# 1. Le Village

## 1.1. Place du Village

Sur la place du village, une fontaine coule doucement au centre. C'est le point de départ et le hub central de l'aventure. Depuis la place, le joueur peut se rendre :
- À la taverne
- Chez l'armurier
- À l'église
- Sortir du village (vers la forêt)

## 1.2. La Taverne

La taverne est un lieu chaleureux et bruyant, plein de monde.

### 1.2.1. Le barman

Il est possible de discuter avec le barman. Il vend des bières et à manger sur place. Un repas coûte 2 pièces d'or et restaure 20 HP. Il est aussi possible de dormir à l'auberge pour récupérer tous ses HP (coûte 5 pièces d'or).

Le barman connaît beaucoup de choses sur le monde :
- Il parle de la forêt et de ses dangers
- Il mentionne la sorcière qui vit dans les bois ("elle est bizarre, mais ses potions sont efficaces")
- Il évoque des rumeurs sur un souterrain fermé à clé
- Si on lui demande, il parle d'une mine abandonnée où rôde un gobelin

### 1.2.2. L'étranger à la clé

Un étranger encapuchonné est assis dans un coin sombre de la taverne. En discutant avec lui :
- Il raconte l'existence d'un souterrain abritant un Loup des Ombres ("pas aussi méchant qu'il en a l'air") et un mimic gardant un trésor
- Il mentionne que le souterrain est fermé à clé
- Il conseille de s'équiper avant d'y aller : "Prends une épée chez le forgeron et une torche. On n'y voit goutte dans ces souterrains."
- Si on lui parle de la clé, il la donne au joueur

`[flag: cle_donnee]` Une fois la clé obtenue, l'étranger disparaît de la taverne (son step n'est plus accessible quand le flag est actif). À sa place, la table dans le coin est vide.

## 1.3. L'Armurier

L'échoppe de l'armurier est petite mais bien rangée. Le forgeron est un homme bourru mais amical.

**Articles en vente :**

| Article | Prix | Stats | Emplacement |
|---------|------|-------|-------------|
| Épée en fer | 8 or | +6 ATK | Main droite |
| Bouclier en bois | 6 or | +2 CA | Main gauche |
| Casque en fer | 5 or | +1 CA | Tête |
| Torche | 1 or | — | Main gauche |

La torche n'a pas de bonus de combat mais est nécessaire dans le souterrain pour voir le Loup des Ombres correctement. Elle occupe la main gauche (incompatible avec le bouclier).

Si on lui demande de meilleures armes ou armures, il fait mention d'un gobelin dans une mine abandonnée :
- "J'ai entendu dire qu'un gobelin a volé des armes de grande qualité dans la mine au nord"
- "Si tu me rapportes l'acier de la mine, je pourrai te forger quelque chose de mieux"

`[condition: flag acier_qualite]` Si le joueur rapporte l'acier, l'armurier est impressionné. Il propose de forger une armure en acier (+4 CA, torse) `[confirm: true, gold: -15]`. La forge prend un moment. L'armurier remercie chaleureusement le joueur.

## 1.4. L'Église

L'église est calme et fraîche. La lumière filtre à travers les vitraux.

### 1.4.1. Le prêtre

`[condition: requires_not pretre_mort]`

Le prêtre est un homme bienveillant et religieux. Il peut :
- Donner des conseils spirituels
- Bénir le joueur (+5 HP temporaire)
- Vendre de l'eau bénite contre un don de 3 pièces d'or `[max: 5, combat_damage: 10]`

L'eau bénite est particulièrement efficace contre les créatures démoniaques et les morts-vivants.

### 1.4.2. La nonne

`[condition: requires pretre_mort]`

Quand le prêtre est mort (tué par les orques, voir section 2.5.1), il est remplacé par une nonne en deuil. Elle :
- Explique que le prêtre a été enlevé et tué par des orques lors d'un pèlerinage
- Peut donner des conseils sur la foi et soigner le joueur (+10 HP, gratuit)
- Propose une quête : aller récupérer la dépouille du prêtre
- Fournit une carte indiquant l'emplacement du camp des orques `[item: carte_orques]`

---

# 2. La Forêt

## 2.1. Le sentier de la forêt

Le sentier traverse une forêt dense et sombre. Les arbres sont immenses, leurs branches se touchent et bloquent la lumière. Des bruits étranges proviennent des profondeurs. Ce sentier est le carrefour qui relie les différents lieux de la forêt.

Depuis le sentier, trois chemins s'offrent au joueur :
- **Le chemin de gauche** — mène à la clairière de la sorcière
- **Le chemin de droite** — mène à l'entrée du souterrain
- **Le chemin tout droit** — s'enfonce dans la forêt profonde (vers la mine)

Il est toujours possible de retourner au village.

## 2.2. Le chemin de gauche — La Sorcière

Le chemin s'enfonce dans une partie marécageuse de la forêt. L'air devient lourd, une brume verdâtre flotte au ras du sol.

### 2.2.1. La clairière de la sorcière

Une cabane tordue se dresse au milieu d'une clairière. De la fumée verte s'échappe de la cheminée.

La sorcière est un personnage hostile et acariâtre. Elle parle très mal et insulte le joueur. Si le joueur répond poliment, elle finit par proposer ses services. Si le joueur l'insulte en retour, elle s'énerve de plus en plus et finit par infliger des dégâts magiques.

`[Mécanique ELIZA : compteur d'insultes. Au bout de 3 insultes, elle inflige 15 dégâts. Au bout de 5, elle éjecte le joueur de la clairière avec 30 dégâts.]`

**Potions en vente :** `[confirm: true]`

| Potion | Prix | Effet |
|--------|------|-------|
| Potion de soin | 5 or | Restaure 30 HP |
| Potion de force | 8 or | +3 ATK pendant le prochain combat |
| Potion de protection | 8 or | +3 CA pendant le prochain combat |

## 2.3. Le chemin de droite — Le Souterrain

On aperçoit au fond du chemin une grande porte en pierre couverte de lierre.

### 2.3.1. Entrée du souterrain

Le souterrain est fermé à clé.

- `[requires: rusted_key]` Si le joueur a la clé, il peut ouvrir la porte et entrer. La clé est consommée mais la porte reste ouverte `[items_take: rusted_key, items_give: dungeon_open]`.
- `[requires: dungeon_open]` Si la porte a déjà été ouverte, le joueur peut entrer librement.
- `[requires_not: dungeon_open]` Sans la clé et porte jamais ouverte, le joueur peut tenter de forcer la porte (échec). Il doit retourner en arrière.

## 2.4. Le chemin tout droit — La Forêt Profonde

### 2.4.1. L'orée de la forêt profonde

La forêt devient de plus en plus sombre et dense. Les arbres sont si serrés qu'il est difficile de passer. Le joueur peut entendre des craquements inquiétants.

### 2.4.2. Le mur de végétation

`[requires: legendary_sword, requires_not: forest_cleared]`

Le passage est complètement bloqué par un mur de ronces et de branches épaisses. Il faut l'épée légendaire pour se frayer un chemin.

- Avec l'épée légendaire : le joueur taille dans la végétation et progresse `[hp: -5, les ronces griffent]`
- Sans épée légendaire : le choix n'apparaît pas, il faut retourner en arrière

`[flag: forest_cleared quand traversé]`

Après avoir coupé le mur, le joueur arrive directement face au voleur (2.4.3) s'il est vivant, ou au cœur de la forêt (2.4.4) sinon.

### 2.4.3. Le voleur

`[condition: requires forest_cleared, requires_not thief_killed]`

À l'endroit où se trouvait le mur de végétation, un voleur bloque le passage. La conversation est obligatoire — le joueur ne peut que lui parler ou le pousser pour passer.

Le voleur est bavard et connaît beaucoup de choses sur la forêt profonde et ses dangers (la mine, le gobelin, les orques). Mais il vole discrètement 1 pièce d'or à chaque échange `[gold: -1, pas de confirm]`.

Le seul choix visible est "Le pousser et passer" → `2_4_4_forest_heart`.

Si le joueur l'insulte dans la conversation (dire "voleur", "menteur", "voler", etc.), cela déclenche immédiatement un combat via un exit ELIZA vers le step de combat `[exit keywords: steal/thief/liar/voleur/menteur → 2_4_3b_thief_fight]`.

**Stats du Voleur :**
- HP : 30, CA : 11, ATK : 5

Mort, il donne 30 pièces d'or. `[flag: thief_killed, gold: +30]`

Si le joueur ne l'insulte pas et le pousse simplement, il le retrouvera au prochain passage (tant que `thief_killed` n'est pas actif).

### 2.4.4. Le cœur de la forêt

`[requires: forest_cleared]`

Un carrefour dans la forêt profonde. Deux chemins s'offrent au joueur :
- **Tout droit** — mène à la mine abandonnée (section 4)
- **À gauche** — un chemin lugubre et verdâtre (section 2.5)

Il est possible de faire demi-tour et de retourner à l'orée de la forêt (2.4.1).

## 2.5. Le chemin lugubre — Les Orques

### 2.5.1. L'embuscade

`[condition: requires_not pretre_mort]`

Le joueur s'engage sur le chemin lugubre. L'air est chargé d'une odeur de pourriture. Il remarque des traces de pas lourdes dans la boue et des ossements éparpillés.

Soudain, il entend des cris derrière lui : des orques viennent d'attaquer un pèlerin sur le sentier principal. Le joueur ne peut pas intervenir, il est trop tard.

`[flag: pretre_mort]` Le prêtre a été tué par les orques. La nonne le remplacera à l'église.

Le chemin est trop dangereux pour continuer sans informations. Le joueur doit retourner en arrière.

### 2.5.2. Le chemin vers la tanière

`[condition: requires pretre_mort, requires carte_orques]`

Avec la carte fournie par la nonne, le joueur peut s'orienter sur le chemin lugubre et trouver la tanière des orques (section 5).

Sans la carte `[requires_not: carte_orques]` : le joueur se perd et doit retourner en arrière.

---

# 3. Le Souterrain

## 3.1. Descente dans le souterrain

`[requires: rusted_key, items_take: rusted_key, items_give: dungeon_open]`

La descente est de plus en plus sombre. L'air est humide et sent la pierre moussue. Les murs suintent.

## 3.2. Rencontre avec le Loup des Ombres

`[condition: requires_not shadow_wolf_killed]`

Deux yeux bleus brillent dans l'obscurité.

### 3.2.1. Sans torche équipée

`[requires_not_equipped: torch]`

Vous voyez deux yeux brillants dans le noir. Vous êtes pris de panique ! Le loup, effrayé par votre réaction, vous attaque par réflexe.

`[hp: -20, le joueur perd des HP automatiquement]`

Impossible de combattre ce qu'on ne voit pas ! Le joueur ne peut que fuir vers la sortie.

### 3.2.2. Avec torche équipée

`[requires_equipped: torch]`

La lumière de votre torche illumine la salle. Vous voyez un grand loup aux yeux bleus luminescents. Il vous regarde avec curiosité, pas avec agressivité.

Le joueur peut :
- **Calmer le loup** — tendre la main, le caresser. Le loup se pousse et révèle un passage caché.
- **Combattre le loup** — combat D20

**Stats du Loup des Ombres :**
- HP : 40, CA : 12, ATK : 8

`[flag: shadow_wolf_killed quand tué]`

## 3.3. Derrière le Loup des Ombres

Un couloir étroit mène à une grande salle. L'air devient chaud et sec. Une lueur dorée provient du fond.

## 3.4. La Salle au Trésor

Une petite salle scintille de pièces d'or éparpillées sur le sol. Au centre trône un coffre en bois... qui fredonne.

### 3.4.1. Le Mimic

`[condition: requires_not mimic_killed]`

Si le joueur ouvre le coffre, il se révèle être un mimic ! Combat D20 obligatoire.

**Stats du Mimic :**
- HP : 25, CA : 10, ATK : 6

`[flag: mimic_killed quand tué]`

**Récompenses après victoire :**
- Épée légendaire `[legendary_sword, +12 ATK, main droite]`
- Les pièces d'or au sol `[gold: +50]`

`[flag: treasure_looted quand les pièces sont ramassées]`

### 3.4.2. Salle vidée

`[condition: requires treasure_looted]`

Si le joueur revient après avoir pillé la salle, elle est vide. Il ne reste que de la poussière.

---

# 4. La Mine

`[requires_equipped: torch]` Il faut équiper la torche pour explorer la mine. Sans torche, l'obscurité est totale et le joueur ne peut pas avancer.

**Objectif :** Vaincre le gobelin et récupérer l'acier de qualité.

## 4.1. L'entrée de la mine

Des rails rouillés s'enfoncent dans l'obscurité. L'air est froid et humide. On entend un lointain bruit de métal qui résonne dans les profondeurs. Un chariot de mine renversé bloque partiellement le passage.

Le joueur peut :
- Avancer dans la mine (→ 4.2)
- Rebrousser chemin (→ 2.4.4)

## 4.2. La galerie principale

Un long couloir soutenu par des poutres en bois vermoulues. Des outils de mineur rouillés jonchent le sol : pioches, pelles, lampes à huile éteintes. Les rails continuent tout droit.

Au bout de la galerie, le chemin se divise en trois :
- **À gauche** — un couloir étroit d'où provient un courant d'air froid (→ 4.3)
- **Tout droit** — la galerie continue, les rails s'enfoncent plus profondément (→ 4.5)
- **À droite** — une porte en bois à moitié arrachée de ses gonds (→ 4.4)

## 4.3. La salle de repos des mineurs

Une petite salle aménagée comme un lieu de repos. Des couchettes en bois pourries s'alignent le long des murs. Une table renversée, des bouteilles cassées. Sur l'une des couchettes, le squelette d'un mineur, encore vêtu de ses habits déchirés.

En fouillant la salle :
- On trouve 5 pièces d'or dans la poche du squelette `[gold: +5]`
- Un vieux journal de mineur mentionne "le gobelin qui a pris le tunnel du fond" et "l'éboulement qui a piégé l'équipe de nuit"
- Une potion de soin oubliée derrière une couchette `[items_give: potion_soin, condition: requires_not mine_repos_fouille, flag: mine_repos_fouille]`

Retour vers la galerie principale (→ 4.2).

## 4.4. Le bureau du contremaître

Une pièce relativement bien conservée. Un bureau massif couvert de poussière, des étagères avec des registres rongés par l'humidité. Une carte de la mine est affichée au mur, mais elle est trop abîmée pour être lue.

Un coffre fermé se trouve sous le bureau.
- Essayer de forcer le coffre : réussite, le cadenas est rouillé `[gold: +10]`
- `[condition: requires_not mine_coffre_ouvert, flag: mine_coffre_ouvert]`

En examinant le bureau, on trouve une note : "Si tu lis ça, fuis. Le gobelin ne dort jamais. Il entend tout. Il voit dans le noir."

Retour vers la galerie principale (→ 4.2).

## 4.5. Le tunnel profond

Les rails descendent en pente douce. L'air devient chaud et chargé de poussière. Les parois brillent par endroits — des veines de minerai.

### 4.5.1. L'éboulement

`[condition: requires_not mine_eboulement_degage]`

Un amas de rochers bloque le passage. On peut voir une lueur de l'autre côté.

- **Dégager les rochers** — c'est long et épuisant `[hp: -10]`, mais le passage s'ouvre. `[flag: mine_eboulement_degage]`
- **Utiliser de l'eau bénite** — l'eau consacrée fait réagir les rochers (imprégnés d'énergie sombre), ils se fissurent et s'effondrent `[items_take: holy_water]`. `[flag: mine_eboulement_degage]`
- Retourner en arrière (→ 4.2)

### 4.5.2. Au-delà de l'éboulement

`[condition: requires mine_eboulement_degage]`

Le tunnel débouche sur une vaste caverne naturelle. Des stalactites pendent du plafond. Au fond, une forge improvisée crache des étincelles : c'est le repaire du gobelin.

Le joueur peut :
- S'approcher discrètement (→ 4.6)
- Foncer tête baissée (→ 4.7)
- Retourner en arrière (→ 4.2)

## 4.6. Approche discrète

Le joueur se faufile entre les stalagmites. Il aperçoit le gobelin de dos, occupé à marteler une lame sur son enclume. Des armes et des pièces d'armure sont empilées autour de lui — c'est un véritable trésor d'acier.

Le joueur peut :
- **Attaquer par surprise** — le premier coup est automatiquement un critique `[premier tour : dégâts doublés]` puis combat D20 normal (→ 4.8)
- **Essayer de voler l'acier** — jet de chance... le gobelin se retourne et attaque ! Combat D20 sans avantage (→ 4.8)

## 4.7. Attaque frontale

Le joueur charge en criant. Le gobelin l'a entendu venir de loin (comme disait la note). Il est prêt et en position de combat. Pas d'avantage.

Combat D20 (→ 4.8).

## 4.8. Combat contre le gobelin

**Stats du Gobelin :**
- HP : 50, CA : 14, ATK : 10

Le gobelin est un adversaire redoutable. Il se bat avec un marteau de forge massif.

En cas de victoire :
- `[gold: +100]`
- `[items_give: acier_qualite]`
- Le joueur peut fouiller le repaire et trouver des pièces d'armure brisées mais un lingot d'acier de qualité exceptionnelle
- `[flag: gobelin_killed]`

En cas de fuite :
- Le joueur s'enfuit vers l'éboulement (→ 4.5.2)
- Le gobelin ne poursuit pas

---

# 5. La Tanière des Orques

`[requires: carte_orques]`

TBD — camp des orques, 2-3 combats, récupérer la dépouille du prêtre, retour à la nonne.

**Récompense :** Bénédiction permanente (+5 HP max)

---

# 6. Quêtes secondaires

## 6.1. La quête du prêtre

**Déclencheur :** Parler à la nonne après la mort du prêtre `[flag: pretre_mort, activé en 2.5.1]`

**Objectif :** Retrouver la dépouille du prêtre dans le camp des orques.

**Déroulement :**
1. La nonne donne la carte des orques `[item: carte_orques]`
2. Le chemin lugubre (2.5.2) devient accessible
3. La tanière des orques contient 2-3 combats (section 5)
4. Récupérer le corps du prêtre
5. Retour à l'église — récompense : bénédiction permanente (+5 HP max)

## 6.2. Le secret de la sorcière

**Déclencheur :** Atteindre un niveau de confiance avec la sorcière (ne pas l'insulter, acheter plusieurs potions).

**Objectif :** Découvrir l'histoire de la sorcière.

**Déroulement :**
1. Après 3 achats, elle devient moins hostile
2. Elle révèle qu'elle était autrefois une guérisseuse du village, bannie pour sorcellerie
3. Quête optionnelle : retrouver son grimoire volé dans la mine
4. Récompense : potion spéciale unique (restaure 100% HP + boost temporaire)

---

# 7. Notes de conception

## 7.1. Économie

| Source de revenus | Or |
|---|---|
| Trésor du mimic | 50 |
| Pièces de la salle au trésor | 15 |
| Voleur (si tué) | 30 |
| Mine — squelette du mineur | 5 |
| Mine — coffre du contremaître | 10 |
| Gobelin de la mine (si tué) | 100 |
| **Total possible** | **210** |

| Dépense | Or |
|---|---|
| Repas à la taverne | 2 |
| Nuit à l'auberge | 5 |
| Épée en fer | 8 |
| Bouclier en bois | 6 |
| Casque en fer | 5 |
| Torche | 1 |
| Eau bénite (×5) | 15 |
| Potion de soin | 5 |
| Potion de force | 8 |
| Potion de protection | 8 |
| Armure en acier | 15 |

Le joueur commence avec 10 pièces d'or, ce qui lui permet d'acheter une épée (8) et une torche (1) avant de partir à l'aventure, avec 1 pièce d'or restante.

## 7.2. Progression suggérée

1. Explorer le village, parler aux PNJ
2. Acheter une épée et une torche chez l'armurier (9 or, reste 1 or)
3. Obtenir la clé de l'étranger à la taverne
4. Aller au souterrain avec la torche équipée, calmer ou combattre le loup
5. Battre le mimic, obtenir l'épée légendaire (+50 or)
6. Revenir au village, s'équiper davantage (eau bénite, casque, bouclier, potions)
7. Traverser la forêt profonde avec l'épée légendaire
8. Explorer la mine, vaincre le gobelin, forger l'armure en acier
9. Déclencher la quête du prêtre, affronter les orques

## 7.3. Flags cachés

| Flag | Déclenché par | Effet |
|---|---|---|
| `cle_donnee` | L'étranger donne la clé | L'étranger disparaît de la taverne |
| `dungeon_open` | Ouvrir la porte du souterrain | La porte reste ouverte (retour possible après fuite) |
| `shadow_wolf_killed` | Tuer le loup | Couloir sombre alternatif, pas de re-combat |
| `mimic_killed` | Tuer le mimic | Coffre ne peut plus être ouvert |
| `treasure_looted` | Ramasser les pièces | Salle vide au retour |
| `forest_cleared` | Traverser le mur de végétation | Accès au cœur de la forêt |
| `thief_killed` | Tuer le voleur | Le voleur ne réapparaît plus |
| `pretre_mort` | Embuscade des orques (2.5.1) | Nonne remplace le prêtre à l'église |
| `carte_orques` | Donnée par la nonne | Accès à la tanière des orques |
| `mine_repos_fouille` | Fouiller la salle de repos | Potion de soin déjà récupérée |
| `mine_coffre_ouvert` | Ouvrir le coffre du contremaître | Or déjà récupéré |
| `mine_eboulement_degage` | Dégager l'éboulement | Passage vers le repaire du gobelin |
| `gobelin_killed` | Tuer le gobelin | Le repaire est vide au retour |
| `acier_qualite` | Récupéré dans la mine | L'armurier forge l'armure en acier |