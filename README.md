# Pastell-Ponts
Ce projet a pour objectif d\'envoyer des dossiers vers leurs flux documentaires grâce à l\'application [Pastell](https://www.libriciel.fr/pastell/ "Pastell") (logiciel de chez Libriciel).

Ce projet est un web service (en Nodejs en utilisant [Express-Js](http://expressjs.com/ "ExpressJs")) qui permet à une application tierce d\'interagir (pour le moment) avec une instance [Pastell](https://www.libriciel.fr/pastell/ "Pastell") et une [GED](https://fr.wikipedia.org/wiki/Gestion_%C3%A9lectronique_des_documents "GED") [Alfresco](https://www.alfresco.com/fr/ "Alfresco").

## Contexte
Dans le cadre de la dématérialisation de sa gestion documentaire, le [département du Nord](http://www.cdg59.fr/ "département du Nord") a fait l\'acquisition (surement comme d\'autres) du logiciel [Pastell](https://www.libriciel.fr/pastell/ "Pastell") (de [Libriciel](https://www.libriciel.fr/ "Libriciel")) pour gérer ses flux documentaires entre ses différents logiciels (GED, signature electronique, archivage electronique, ...).

Son premier objectif est de mettre en place le flux de la pièce signée: la mise en signature des documents des marchés publique du département, avec un volet archivage.
