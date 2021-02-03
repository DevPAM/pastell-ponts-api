module.exports = {
  env : 'DEV', // ('ENV'|'REC'|'PRO')
  port: 8080,
  flux : {
    commande_publique : {
      piece_signee_marche  : {
        ENTITE : 'commande publique',
        PIECE_SIGNEE : 'piece signee marche',
        SERVICE : 'signature-piece-marche',
        DOCUMENT : 'com-pub-signature-piece-marche',
        MESSAGE_SUCCES_SERVICE : "Votre dossier est partie pour signature à l'iparapheur.",
        MESSAGE_ERREUR_SERVICE : "Une erreur est survenue lors de la mise en signature de votre document.",
        MESSAGE_SUCCES_ROUTINE : "La vérification de votre dossier s'est effectuer avec succès.",
        MESSAGE_ERREUR_ROUTINE : "Une erreur est survenue lors de la routine de vérification du dossier.",
        FICHIERS : [
                    // Signature du document.
                    { nom: 'signature.zip', nom_pastell: 'signature' },
                    // Le bordereau de signature du document.
                    { nom: 'bordereau_signature.pdf', nom_pastell: 'bordereau_signature' }/*,
                    // L'historique du iparapheur.
                    { nom: 'iparapheur_historique.xml', nom_pastell: 'iparapheur_historique' },
                    // Accusé de reception du SAE
                    { nom: 'ar_sae.xml', nom_pastell: 'ar_sae' },
                    // Le bordereau d'envoie au SAE
                    { nom: 'sae_bordereau.xml', nom_pastell: 'sae_bordereau' }*/
        ]
      }
    },
    administration : {
      executer_routine : {
        SERVICE : "executer-routine",
        CHEMIN : __dirname + "/../api/taches"
      }
    }
  },
  bdds : {
    ponts :{
      DEV : { hote: 'localhost', login: 'root', mdp: 'root', bdd: 'pontapi' },
      REC : { hote: '', login: '', mdp: '', bdd: '' },
      PRO : { hote: '', login: '', mdp: '', bdd: '' },
    }
  },
  services : {
    pastell : {
      DEV : { hote: 'https://pastell-tst.intranet.cg59.fr/api/v2/', type_aut: 'basic', login: 'admin', mdp: 'admin' },
      REC : { hote: '', type_aut: '', login: '', mdp: '' },
      PRO : { hote: '', type_aut: '', login: '', mdp: '' }
    },
    alfresco : {
      DEV : { hote: 'https://gaia-siap.intranet.cg59.fr/alfresco/api/-default-/public/alfresco/versions/1/', type_aut: 'basic', login: 'admin', mdp: 'admin' },
      REC : { hote: '', type_aut: '', login: '', mdp: '' },
      PRO : { hote: '', type_aut: '', login: '', mdp: '' }
    }
  },
  logs : {
    DEV : { chemin : __dirname+'/../logs', nom_fichier : '%DATE%-pastell-ponts.log' },
    REC : { chemin : null , nom_fichier : null },
    PRO : { chemin : null, nom_fichier : null }
  },
  etat_pastell : {
    "accepter-sae" :	"Acceptée par le SAE",
    "ar-recu-sae" :	"Accusé de réception du SAE reçu.",
    "cheminement-change" : "???????",
    "creation" :	"Créé dans Pastell.",
    "erreur-envoie-sae" :	"Erreur lors de l'envoi de l'achive au SAE.",
    "erreur-verif-iparapheur" :	"Erreur lors de la vérification du statut de signature sur l'i-parapheur.",
    "error-ged" :	"Erreur lors du dépôt en GED.",
    "importation" :	"?????????",
    "iparapheur-sous-type" :	"???????",
    "modification" : "Le dossier pastell est en cours d'édition.",
    "orientation" :	"Le document a été lancé dans son flux PAstell.",
    "preparation-send-ged" : "Préparation pour envoie en GED des documents",
    "preparation-send-iparapheur" :	"Préparation de l'envoi au parapheur des documents pour signature.",
    "preparation-send-sae" : "Préparation de l'envoi au SAE des documents à archiver.",
    "send-archive" : "Les documents ont été envoyé au SAE.",
    "recu-iparapheur"	: "Le document a été signé. La signature	a été récuperée.",
    "rejet-iparapheur" : "Le signataire a refusé de signer le document.",
    "rejet-sae" :	"Le dossier à été refusé par le SAE.",
    "send-archive" : "Le dossier a été versé au SAE.",
    "verif-sae" :"Pastell vérifie en ce mmoment l'état du dossier sur le SAE.",
    "send-ged" : "Le dossier a été versé à la GED.",
    "send-iparapheur" : "Le dossier a été transmis au parapheur.",
    "verif-iparapheur" : "Pastell vérifie en ce moment est l'état du dossier sur le parapheur",
    "supression" : 	"Le dossier pastell est en cours de suppression",
    "termine" : "Le dossier Pastell est arrivé au bout de son cheminement; Il est terminé.",
    "validation-sae" :	"Le dossier a été valider par le SAE.",
    "validation-sae-erreur"	: "Une erreur est survenue lors de la vérification de la validité du transfert sur SAE.",
    "verif-sae" :	"Pastell récupére l'accusé de Réception du document sur le SAE",
    "verif-sae-erreur" :	"Une erreur est survenue lors de la récupération de l'accusé dee réception."
  }
};
