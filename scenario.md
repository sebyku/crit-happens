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
- Il conseille de s'équiper avant d'y aller : "Prends une épée chez le forgeron et une torche. On n'y voit goute dans ces souterains."
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

## 1.4. L'Église

L'église est calme et fraîche. La lumière filtre à travers les vitraux.

### 1.4.1. Le prêtre

Le prêtre est un homme bienveillant et religieux. Il peut :
- Donner des conseils spirituels
- Bénir le joueur (+5 HP temporaire)
- Vendre de l'eau bénite contre un don de 3 pièces d'or `[max: 5, combat_damage: 10]`

L'eau bénite est particulièrement efficace contre les créatures démoniaques et les morts-vivants.

### 1.4.2. La nonne

`[condition: flag pretre_mort]`

Quand le prêtre est mort (tué par les orques, voir section 4), il est remplacé par une nonne en deuil. Elle :
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

- `[requires: rusted_key]` Si le joueur a la clé, il peut ouvrir la porte et entrer.
- `[requires_not: rusted_key]` Sans la clé, le joueur peut tenter d'ouvrir la porte mais elle ne bouge pas. Il peut essayer de la forcer (échec), de la crocheter (échec), ou de chercher une autre entrée (échec). Il doit retourner en arrière.

## 2.4. Le chemin tout droit — La Forêt Profonde

### 2.4.1. Partie 1 — L'orée de la forêt profonde

La forêt devient de plus en plus sombre et dense. Les arbres sont si serrés qu'il est difficile de passer. Des yeux brillent dans l'obscurité. Le joueur peut entendre des craquements inquiétants.

### 2.4.2. Partie 2 — Le mur de végétation

`[requires: épée (n'importe laquelle équipée en main droite)]`

Le passage est complètement bloqué par un mur de ronces et de branches épaisses. Il faut une épée pour se frayer un chemin.

- Avec une épée : le joueur taille dans la végétation et progresse `[-5 HP, les ronces griffent]`
- Sans épée : impossible d'avancer, il faut retourner en arrière

### 2.4.3. La mine abandonnée

Au bout du chemin, une entrée de mine s'ouvre dans la roche. Des rails rouillés disparaissent dans l'obscurité.

`[flag: gobelin_mine — voir section 4]`

---

# 3. Le Souterrain

## 3.1. Descente dans le souterrain

`[requires: rusted_key, items_take: rusted_key]`

La descente est de plus en plus sombre. L'air est humide et sent la pierre moussue. Les murs suintent.

## 3.2. Rencontre avec le Loup des Ombres

`[condition: requires_not shadow_wolf_killed]`

Deux yeux bleus brillent dans l'obscurité.

### 3.2.1. Sans torche équipée

`[requires_not: torch (équipée)]`

Vous voyez deux yeux brillants dans le noir. Vous êtes pris de panique ! Le loup, effrayé par votre réaction, vous attaque par réflexe.

`[hp: -20, le joueur perd des HP automatiquement avant le choix]`

Le joueur peut ensuite :
- Combattre le loup (combat D20)
- Fuir vers la sortie

### 3.2.2. Avec torche équipée

`[requires: torch (équipée)]`

La lumière de votre torche illumine la salle. Vous voyez un grand loup aux yeux bleus luminescents. Il vous regarde avec curiosité, pas avec agressivité.

Le joueur peut :
- **Calmer le loup** — tendre la main, le caresser. Le loup se pousse et révèle un passage caché.
- **Combattre le loup** — combat D20 (le loup est plus facile à battre quand on le voit)

**Stats du Loup des Ombres :**
- HP : 40, CA : 12, ATK : 8

`[flag: shadow_wolf_killed quand tué]`
`[gold: 80 quand tué]`

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

# 4. Quêtes secondaires (à implémenter)

## 4.1. La quête du prêtre

**Déclencheur :** Parler à la nonne après la mort du prêtre `[flag: pretre_mort, activé par un événement scriptable ou un timer après la première visite au souterrain]`

**Objectif :** Retrouver la dépouille du prêtre dans le camp des orques.

**Déroulement :**
1. La nonne donne la carte des orques `[item: carte_orques]`
2. Un nouveau chemin apparaît dans la forêt `[requires: carte_orques]`
3. Le camp des orques contient 2-3 combats
4. Récupérer le corps du prêtre
5. Retour à l'église — récompense : bénédiction permanente (+5 HP max)

## 4.2. La mine du gobelin

**Déclencheur :** L'armurier mentionne le gobelin, ou le joueur découvre la mine en explorant la forêt profonde.

**Objectif :** Vaincre le gobelin et récupérer l'acier de qualité.

**Déroulement :**
1. Traverser la forêt profonde `[requires: épée]`
2. Explorer la mine (plusieurs salles, pièges)
3. Combattre le gobelin (boss)
4. Récupérer l'acier `[item: acier_qualite]`
5. Retour chez l'armurier — il forge une épée en acier (+9 ATK) ou une armure en acier (+4 CA)

## 4.3. Le secret de la sorcière

**Déclencheur :** Atteindre un niveau de confiance avec la sorcière (ne pas l'insulter, acheter plusieurs potions).

**Objectif :** Découvrir l'histoire de la sorcière.

**Déroulement :**
1. Après 3 achats, elle devient moins hostile
2. Elle révèle qu'elle était autrefois une guérisseuse du village, bannie pour sorcellerie
3. Quête optionnelle : retrouver son grimoire volé dans la mine
4. Récompense : potion spéciale unique (restaure 100% HP + boost temporaire)

---

# 5. Notes de conception

## 5.1. Économie

| Source de revenus | Or |
|---|---|
| Loup des Ombres (premier kill) | 80 |
| Trésor du mimic | 50 |
| Pièces de la salle au trésor | 15 |
| Gobelin de la mine | 100 |
| **Total possible** | **245** |

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

Le joueur commence avec 10 pièces d'or, ce qui lui permet d'acheter une arme de base ou quelques potions avant de partir à l'aventure.

## 5.2. Progression suggérée

1. Explorer le village, parler aux PNJ
2. Acheter un équipement de base chez l'armurier (épée + casque)
3. Obtenir la clé de l'étranger
4. Acheter de l'eau bénite à l'église
5. Aller au souterrain, affronter ou calmer le loup
6. Battre le mimic, obtenir l'épée légendaire
7. Explorer la forêt profonde vers la mine
8. Quêtes secondaires (prêtre, gobelin, sorcière)

## 5.3. Flags cachés

| Flag | Déclenché par | Effet |
|---|---|---|
| `cle_donnee` | L'étranger donne la clé | L'étranger disparaît de la taverne |
| `shadow_wolf_killed` | Tuer le loup | Couloir sombre alternatif, pas de re-combat |
| `mimic_killed` | Tuer le mimic | Coffre ne peut plus être ouvert |
| `treasure_looted` | Ramasser les pièces | Salle vide au retour |
| `pretre_mort` | Événement scripté | Nonne remplace le prêtre |
| `carte_orques` | Donnée par la nonne | Nouveau chemin dans la forêt |
| `acier_qualite` | Récupéré dans la mine | L'armurier forge de meilleures armes |