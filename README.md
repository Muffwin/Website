# Epicare

## MVP

    Système de communication entre le médecin et patient en post opératoire -> Plus ou moins Skype
    Système d'ordonnance en ligne pouvant être délivré directement

    -> A présenter en Février 2019

## Forward

### Java

    Système d'ordonnance:
        -> Upload image de tampon
        -> Signature

    3 types de comptes:
        -> Médecin
        -> Pharmacien
        -> Patient
        -> db SQL

    Back-end en Node ( SQL )

### Communication

    Powerpoint de presentation
    Proto Sketch

    Retours utilisateurs:
        -> Tek1 random en SM25
        -> Pharmaciens / médecins

    Retours d'expérience:
        -> Voir des médecins (parents de JB)
        -> Patients en post opé

    Si possible récupérer des adresses mail

## Assignations

### Front UX & UA

    Hugo Chollet
    Alexandre Gueguen
    Kentin Pratelli
    Marc Perez

### Collecte de retours

    Tout le monde
    Marc Perez

### Back Serveur / SQL

    -> SQL / Serveur / Appli
    Killian Gardaut
    Maxence Fourrier
    Philippe De Sousa Violante
    Tanguy d'Auria


# Présentation du gitlab
Présentation du fonctionnement du gitlab et de la procédure de push

## Présentation

### Master
La master est la branch qui correspondra à la production. Personne ne peut push dessus, seules sont autorisés les merges requests depuis la préprod.

### Preprod
Comme son nom l'indique, la preprod est la branche avant la prod (master).
Cette branch sera là pour fusionner toutes les branchs avant de push sur la production.
Seule les chef de pôle pourra faire une merge request dessus, cependant, votre MR (merge request) sera accepté seulement si le code est propre (pas forcément parfait, mais pas inbuvable).

### Back / Front

Une branch back / front, à l'image de la préprod et la master, ces branchs sont là pour faire le lien entre toutes les branch back / front. Chaque chef de pôle devra assurer le suivi de sa branch. Les chefs de pôle pourront faire des MR entre leur branch respective (back / front) et la preprod.

### Everything else

Chaque utilisateur pourra créer autant de branch qu'il veut, l'utilisateur qui créer une branch est seule responsable de sa branch, code dégeu, push de fichier trash etc.. Faites comme vous voulez, mais la branch ne sera pas merge tant qu'elle ne sera pas propre (donc nettoyer avant de MR)

## Procédures de push

<a href="https://ibb.co/C9Hxtbx"><img src="https://i.ibb.co/kDSYy4Y/index.png" alt="index" border="0"></a>

