module.exports = {
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
};
