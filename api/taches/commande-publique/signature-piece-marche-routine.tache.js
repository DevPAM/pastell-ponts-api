const PontBDD = require('./../../services/bdds/ponts.bdd.js');
const PastellService = require('./../../services/sws/pastell/pastell.service.js');
const Tache = require('./../../../systeme/utilitaires/taches/tache.utilitaire.js');
const AlfrescoService = require('./../../services/sws/alfresco/alfresco.service.js');
const Chaine = require('./../../../systeme/utilitaires/chaines/chaine.utilitaire.js');
const Traceur = require('./../../../systeme/utilitaires/traceur/traceur.utilitaire.js');

const administration = require('./../../../systeme/administration.systeme.js');
const parametres = administration.flux.commande_publique.piece_signee_marche;
const etats = administration.etat_pastell;

/** Classe permettant de gérer les pièces marché enregistrer en base. */
class SignaturePieceMarcheRoutine extends Tache {
  /** Initialise une nouvelle instance de la classe 'Tache'.
    * La requête cliente.
    * Le port de réponse client. */
  constructor(requete, reponse) {
    super(requete, reponse);
  }
  /** Vérifie les preconditions pour executer la tache. */
  verifierPreconditions() {
    var message = "";
    var donnees = super.obtenirCorpsRequete();
    if( !('id_entite' in donnees) || donnees['id_entite'] == null ) message += "Veuillez indiquer l'identifiant de l'entité du document pastell.\n";
    if( !('id_document' in donnees) || donnees['id_document'] == null ) message += "Veuillez indiquer l'identifiant du document pastell.";

    if( Chaine.estNullOuVide(message) ) return { respect : true, donnees : donnees };
    return { respect : false, message : message };
  }
  /** Execute la tache. */
  executer() {
    // Initialisation des éléments necessaires à l'execution de la tache.
    var tache = this;
    var donnees = null;
    var fichiers = { } ;
    var pont_bdd = new PontBDD();
    var swp = new PastellService();
    var swa = new AlfrescoService();
    var traceur = new Traceur(parametres.SERVICE+'-routine', super.obtenirCorpsRequete().body);

    // Vérification des préconditions.
    traceur.debuterAction('Vérification des préconditions.');
    var preconditions = this.verifierPreconditions();
    // Si les préconditions ne sont pas respecté arret de la routine.
    if(!preconditions.respect){
      // Trace du résultat de la préconditions.
      traceur.finirAction(false);
      traceur.log(preconditions);
      // Envoie de la réponse
      super.envoiReponse(500, traceur.JSON(preconditions.message));
      // Fin
      return;
    } else {
      // Indication que l'action précédente est OK.
      traceur.finirAction(true);
      // Récupérationd es données de la requête.
      donnees = preconditions.donnees;
    }

    // Récupération des informations inérent au dossier Pastell.
    traceur.debuterAction('Récupération des informations inérentes au dossier Pastell (entité : '+donnees.id_entite+', document: '+donnees.id_document+').');
    swp.obtenirDetailDocument(donnees.id_entite, donnees.id_document)
    .then(function(document) {

      // La récupération du document est ok.
      traceur.finirAction(true);

      // Récupération de l'identifiant Alfresco en base de données.
      traceur.debuterAction("Récupération de l'identifiant Alfresco du fichier à signer en base de données.")
      pont_bdd.obtenirIdFichiersAlfresco(donnees.id_entite, donnees.id_document, parametres.PIECE_SIGNEE)
      .then(function( id_alfresco_fichier_piece_signee) {

        // Indication de la fin de l'action avec succès.
        traceur.finirAction(true);

        // Teste de l'existence de L'identifiant alfresco en base de données.
        if(id_alfresco_fichier_piece_signee.length == 0) {
          throw { erreur : "Le dossier n'existe pas dans la base de données de l'application." };
          return;
        }

        // Récupération des infomrations du noeud/fichier alfresco.
        traceur.debuterAction("Récupération des infomrations du noeud/fichier alfresco ("+id_alfresco_fichier_piece_signee+").");
        swa.detailNoeud(id_alfresco_fichier_piece_signee[0].id_alfresco)
        .then(function(noeud) {

          // Indication de la fin de l'action avec succès.
          traceur.finirAction(true);

          // Récupération des documents de la pièce signé marché.
          traceur.debuterAction('Récupération des documents de la pièce signé marché.');
          tache.obtenirFichiers(donnees.id_entite, donnees.id_document)
          .then(function(fichiers) {
            // Indication de la fin de l'action avec succès.
            traceur.finirAction(true);

            // Ajout des données du fichier de métadonnées.
            fichiers['metadonnees'] = tache.obtenirContenuFichierMetadonnees(document);
            // Récupération du noms de dossier de versement dans la GED.
            var nom_dossier = tache.obtenirNomDossier(noeud.entry.name);

            // Suppression du dossier à créer en GED.
            traceur.debuterAction("Suppression du dossier en GED")
            swa.supprimerNoeudEnfantParNom(noeud.entry.parentId, nom_dossier)
            .then(function(suppression) {
              // Indication de la fin de l'action avec succès.
              traceur.finirAction(true);

              // Création du dossier en GED.
              traceur.debuterAction("Création du dossier '"+nom_dossier+"' en GED")
              swa.creerNoeud(noeud.entry.parentId, nom_dossier, "cm:folder")
              .then(function(dossier) {
                // Indication de la fin de l'action avec succès.
                traceur.finirAction(true);

                // Dépôt des fichiers en GED.
                traceur.debuterAction("Dépôt des fichiers en GED.")
                tache.envoyerFichiersVersAfresco(dossier.entry.id, fichiers).then(function() {
                  // Indication de la fin de l'action avec succès.
                  traceur.finirAction(true);

                  // Envoie au client de la réponse.
                  tache.gererSucces(traceur);
                  // Dévérouillage du noeud (pièce à signée) en GED.
                  swa.deverouillerNoeud(id_alfresco_fichier_piece_signee[0].id_alfresco);
                  // Indication en base de données que la gestion du document est terminer.


                }) // FIN : Dépôt des fichiers en GED.
                // ERREUR : Dépôt des fichiers en GED.
                .catch(function(erreur) { tache.gererErreurNiveau2(traceur, erreur, dossier.entry.id) });

              }) // FIN : Création du dossier en GED.
              // ERREUR : Création du dossier en GED.
            .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur, dossier.entry.id) });

            }) // FIN : Suppression du dossier à créer en GED.
            // ERREUR : Suppression du dossier à créer en GED.
            .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur) });

          }) // FIN : 'Récupération des documents de la pièce signé marché.
          // ERREUR : Récupération des documents de la pièce signé marché.
          .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur) });

        }) // FIN : Récupération des infomrations du noeud/fichier alfresco.
        // ERREUR : Récupération des infomrations du noeud/fichier alfresco.
        .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur) });

      }) // FIN : Récupération de l'identifiant Alfresco en base de données.
      // ERREUR : // Récupération de l'identifiant Alfresco en base de données.
      .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur) });

    }) // FIN : Récupération des informations inérent au dossier Pastell.
    // ERREUR : Récupération des informations inérent au dossier Pastell.
    .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur); });
  }
  /** Gère le succès de la tache.
    * @param traceur Le traceur d'actions. */
  gererSucces(traceur) {
    // Fin e l'action de récupération des informations pastell.
    traceur.finirAction(true);;
    // Envoie de la réponse.
    this.envoiReponse(200, traceur.JSON(parametres.MESSAGE_SUCCES_ROUTINE));
  }
  /** Gère une erreur de niveau 2.
    * @param traceur Le traceur d'erreur.
    * @param erreur L'erreur levé. */
  gererErreurNiveau2(traceur, erreur, id_dossier_cree) {
    console.log(id_dossier_cree);
    // Suppression du dossier.
    var swa = new AlfrescoService();
    swa.supprimerNoeudAsync(id_dossier_cree);
    // Gestion de la suite de erreur
    this.gererErreurNiveau1(traceur, erreur);
  }
  /** Gère une erreur de niveau 1.
    * @param traceur Le traceur d'erreur.
    * @param erreur L'erreur lancer par le système. */
  gererErreurNiveau1(traceur, erreur){
    // Fin e l'action de récupération des informations pastell.
    traceur.finirAction(false);
    // Initialisation de l'erreur.
    traceur.log(erreur);
    // Envoie de la réponse.
    this.envoiReponse(500, traceur.JSON(parametres.MESSAGE_ERREUR_ROUTINE));
  }
  /** Méthode permettant d'obtenir le nom de dossier du fichier à signer.
    * @param nom_fichier Le nom du fichier. */
  obtenirNomDossier(nom_fichier) {
    // Retrait des caratères spéciaux.
    var resultat = nom_fichier.match(/(.*)\.[^\.]+$/)[1]
      .replace(/(é|ê|è)/g,'e')
      .replace(/(@|à)/g,'a')
      .replace(/(~|"|'|-|\[|\]|\(|\)|#|\$|\^|;|!|\?|\{|\}|\+)/g, '_')
      .replace(/_{2,}/g, '_');
      return resultat;
  }
  /** Méthode permettant de récupérer touts les fichiers fournis par la signature de la commande publique.
    * @param id_entite L'identifiant de l'entité.
    * @param id_documentL'identifiant du */
  async obtenirFichiers(id_entite, id_document) {
    var resultat = { };
    var swp = new PastellService();
    // Récupération du contenu des fichiers dans pastell.
    for(var i=0; i<parametres.FICHIERS.length; i++)
      resultat[parametres.FICHIERS[i].nom_pastell] = await swp.obtenirFichier(id_entite, id_document, parametres.FICHIERS[i].nom_pastell);
    // Retour du résultat.
    return resultat;
  }
  /** Envoie une liste de fichiers Pastell vers Alfresco.
    * @param id_noeud_parent L'identifiant du noeud parent dans lequel créer les fichiers.
    * @param fichiers Un objet JSON contenant tout les fichiers à transmettre. */
  async envoyerFichiersVersAfresco(id_noeud_parent, fichiers) {
    var swa = new AlfrescoService();
    for(var i = 0; i<parametres.FICHIERS.length; i++)
      if(fichiers[parametres.FICHIERS[i].nom_pastell] != null)
        await swa.creationFichier(id_noeud_parent, parametres.FICHIERS[i].nom, fichiers[parametres.FICHIERS[i].nom_pastell]);
    // Envoie du fichier de metadonnées.
    await swa.creationFichier(id_noeud_parent, "metadonnees.json", fichiers.metadonnees);
  }
  /** Permet d'obtenir le contenu JSON du fichier de metadonnées.
    * @param Le detail du document Pastell. */
 obtenirContenuFichierMetadonnees(detail_fichier) {
      var resultat = { };
      // Ajout de la date.
      var date = new Date();
      resultat.date = date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear()+' '+date.getHours()+'h '+date.getMinutes()+'min '+date.getSeconds()+'s '+date.getMilliseconds()+'ms';
      resultat.etat = etats[detail_fichier.last_action.action];
      resultat.iparapheur = { };
      resultat.sae = { };
      // Récupération du numéro du dossier i-parapheur.
      if('iparapheur_dossier_id' in detail_fichier.data) resultat.iparapheur.id_dossier = detail_fichier.data.iparapheur_dossier_id;
      // Récupération de l'identifiant de transfert SAE.
      if('sae_transfert_id' in detail_fichier.data) resultat.sae.id_transfert = detail_fichier.data.sae_transfert_id;
      // Récupération de l'identifiant de l'archive au sein du SAE.
      if('sae_archival_identifier' in detail_fichier.data) resultat.sae.id_archive = detail_fichier.data.sae_archival_identifier;
      // Récupération de l''adresse du l'archive du SAE.
      if('url_archive' in detail_fichier.data) resultat.sae.id_transfert = detail_fichier.data.sae_transfert_id;
      // Retour du résultat.
      return Buffer.from(JSON.stringify(resultat));
  }
}
// Export du module.
module.exports = SignaturePieceMarcheRoutine;
