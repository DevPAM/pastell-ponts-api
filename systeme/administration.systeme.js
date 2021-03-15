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
                    { nom: 'bordereau_signature.pdf', nom_pastell: 'bordereau_signature' }
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
      DEV : { hote: 'https://gaia-siap.intranet.cg59.fr/alfresco/api/-default-/public/alfresco/versions/1/', type_aut: 'basic', login: 'XXXXXX', mdp: 'XXXXXX' },
      REC : { hote: '', type_aut: '', login: '', mdp: '' },
      PRO : { hote: '', type_aut: '', login: '', mdp: '' }
    }
  },
  logs : {
    DEV : { chemin : __dirname+'/../logs', nom_fichier : '%DATE%-pastell-ponts.log' },
    REC : { chemin : null , nom_fichier : null },
    PRO : { chemin : null, nom_fichier : null }
  }
};
