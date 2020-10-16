# Pastell-Ponts
Ce projet a pour objectif d\'envoyer des dossiers vers leurs flux documentaires grâce à l\'application [Pastell](https://www.libriciel.fr/pastell/ "Pastell") (logiciel de chez Libriciel). Il permet à une application tierce de lancer des dossiers vers un flux documentaire gérer par [Pastell](https://www.libriciel.fr/pastell/ "Pastell") mais aussi gérer l\'état du dossier dans le temps.

Ce projet est un web service qui permet à une application tierce d\'interagir (pour le moment) avec une instance [Pastell](https://www.libriciel.fr/pastell/ "Pastell") et une [GED](https://fr.wikipedia.org/wiki/Gestion_%C3%A9lectronique_des_documents "GED") [Alfresco](https://www.alfresco.com/fr/ "Alfresco").

## Contexte
Dans le cadre de la dématérialisation de sa gestion documentaire, le [département du Nord](http://www.cdg59.fr/ "département du Nord") a fait l\'acquisition (surement comme d\'autres) du logiciel [Pastell](https://www.libriciel.fr/pastell/ "Pastell") (de [Libriciel](https://www.libriciel.fr/ "Libriciel")) pour gérer ses flux documentaires entre ses différents logiciels (GED, signature electronique, archivage electronique, ...).

Son premier objectif est de mettre en place le flux de la pièce signée: la mise en signature des documents des marchés publique du département, avec un volet archivage.

## Technologies
Cette application n\'utilise que des technologies libres d\'accès tel que:
* [Nodejs](https://nodejs.org/fr/ "Nodejs") pour le développement, avec pour objectif notemment l\'utilisation de librairies utilisées et maintenues tes que (expressJs).
* [MySQL](https://www.mysql.com/fr/ "MySQL") pour la base de données.

### Pourquoi Nodejs ?
Parce qu\'il fait parti aujourd\'hui d'un des environnement d\'éxecution les plus utilisés. De ce fait il y a une communauté assez importante et son utilisation. Il ne demande pas l\'apprentissage ni d\'un nouveau langage (il utilise le langage javascript qui normalement est à la connaissance de tout dévelopeur même sortant d\'école) ni de paradigme de développement compliqué (tout se faisant par évènements), ou de formation accru que demanderait un framework (tel que [Symphony](https://symfony.com/ "Symphony") pour le PHP, [.Net Framework](https://dotnet.microsoft.com/ ".Net Framework") pour Microsoft, au d\'autres encore).

Ensuite, pour les services de maintenances des application en production cette technologie ne demande pas de  compétences spécifiques comme pour [Windows Server](https://www.microsoft.com/en-us/windows-server/ "Windows Server") ou [Tomcat](http://tomcat.apache.org/ "Tomcat").

Enfin, pour faire passer (de mon point de vue personnel) les développements du secteur publique en 2.0 technologiquement en se démarquant des développements avec des langages historiques tels que le [PHP](https://fr.wikipedia.org/wiki/PHP "PHP") ou le [JSP](https://fr.wikipedia.org/wiki/JavaServer_Pages "JSP") ou bien encore le .Net.

### Pourquoi du libre ?
Tout d\'abord pour sa communauté: le fait que se soit libre fait que le nombre d\'utilisateurs ne devrait normalement jamais se tarir ce qui en fait une communauté active.

Enfin, personnelement, parce que dans le secteur publique nous sommes différentes entités avec une mission commune : le service publique, mais pas avec les même moyens (selon si l\'on est un conseil général, une mairie, une communauté de commune, ou encore un service d\'état)... et utiliser du libre c\'est donné la possibilité à des entités publiques plus ou moins riches de mettre en place des solutions technologiques sans qu\'il y est forcément un coup exhorbitant.

### Pourquoi partager ?
Premièrement comme expliqué précédement, même si les entités du service publique peuvent avoir des activités différentes elles ont les même obligations et mutualiser nos développement sur ce dernier point permettrait à la communauté du publique de mutualiser ses développeurs sur des applications nécessaires à la garantie du service publique.

Dernièrement, celà nous permettrait d\'être un peu plus indépendant vis-à-vis de nos prestataires, tout d'abord en terme de temps de prise en compte de la demande (qui est aujourd\'hui selon leurs priorités), de temps de développement, et surtout de coût (un coût temps en interne coute toujours moins chère que le coût d'un développeur externe à la journée).
