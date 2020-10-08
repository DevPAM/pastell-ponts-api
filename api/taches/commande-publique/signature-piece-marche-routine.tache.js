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
          // Mise à jour des métadonnées du document à signer.
          traceur.debuterAction("Mise à jour des métadonnées du document à signer.");
          swa.modifierNoeud(id_alfresco_fichier_piece_signee[0].id_alfresco,
            //{ properties: { date_mise_a_jour: tache.obtenirDate(), etat : etats[document.last_action.action], message_pastell : document.last_action.message, date_etat_pastell: document.last_action.date } }
            { properties : { "cm:title" : "essai" } }
          )
          .then(function(noeud_modifier) {
            // Indication de la fin de l'action avec succès.
            traceur.finirAction(true);
            // Vérification que le dossier pastell est à l'état terminé avant de l'envoyer.
            traceur.debuterAction("Vérification que le dossier pastell est à l'état terminer avant de l'envoyer.");
            if( document.last_action.action != "termine" ) {
              this.gererSucces1(traceur, id_alfresco_fichier_piece_signee[0].id_alfresco, donnees.id_entite, donnees.id_document);
              return;
            }else traceur.finirAction(true);
            // Création du dossier de reception des documents dans alfresco.
            traceur.debuterAction("Création du dossier de reception des documents dans alfresco.");
            swa.creerNoeud(noeud.entry.parentId, tache.obtenirNomDossier(noeud.entry.name), "cm:folder")
            .then(function(nouveau_noeud) {
              // Indication de la fin de l'action avec succes.
              traceur.finirAction(true);
              // Récupération des documents (dans Pastell) pour envoie dans Alfresco.
              traceur.debuterAction("Récupération des documents (dans Pastell) pour envoie dans Alfresco.")
              tache.obtenirFichiers(donnees.id_entite, donnees.id_document)
              .then(function(fichiers) {
                // Indication de la fin de l'action avec succes.
                traceur.finirAction(true);
                // Envoie des documents vers Alfresco.
                tache.envoyerFichiersVersAfresco(nouveau_noeud.entry.id, fichiers)
                .then(function() {
                  // Indication de la fin de l'action avec succes.
                  traceur.finirAction(true);
                  tache.gererSucces2(traceur, id_alfresco_fichier_piece_signee, donnees.id_entite, donnees.id_document, nouveau_noeud);
                }) // Envoie des documents vers Alfresco.
                // ERREUR : Envoie des documents vers Alfresco.
                .catch(function(erreur) { tache.gererErreurNiveau2(traceur, erreur, nouveau_noeud.entry.id) })
              })// FIN : Récupération des documents (dans Pastell) pour envoie dans Alfresco.
              // ERREUR : Récupération des documents (dans Pastell) pour envoie dans Alfresco.
              .catch(function(erreur) { tache.gererErreurNiveau2(traceur, erreur, nouveau_noeud.entry.id) })
            }) // FIN : Création du dossier de reception des documents dans alfresco.
            // ERREUR : Création du dossier de reception des documents dans alfresco.
            .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur) })
          }) // FIN : Mise à jour des métadonnées du document à signer.
          // ERREUR : Mise à jour des métadonnées du document à signer.
          .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur) })
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
  /** Méthode permttant d'obtenir la date actuelle au format français. */
  obtenirDate() {
    var date = new Date();
    return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds();
  }
  /** Gère le succès de la tache de niveau 1.
    * @param traceur Le traceur d'actions. */
  gererSucces2(traceur, id_alfresco_fichier_piece_signee, id_entite, id_document, nouveau_noeud) {
    traceur.ajouterDonnees("id_noeud_document", nouveau_noeud.entry.id);
    this.gererSucces1(traceur, id_alfresco_fichier_piece_signee, id_entite, id_document);
  }
  /** Gère le succès de la tache de niveau 1.
    * @param traceur Le traceur d'actions. */
  gererSucces1(traceur, id_alfresco_fichier_piece_signee, id_entite, id_document) {
    // Ajout des données.
    traceur.ajouterDonnees("id_alfresco", id_alfresco_fichier_piece_signee);
    traceur.ajouterDonnees("id_entite_pastell", id_entite);
    traceur.ajouterDonnees("id_document_pastell", id_document);
    // Fin e l'action de récupération des informations pastell.
    traceur.finirAction(true);
    // Fin de l'appel.
    traceur.finirTrace(true, parametres.MESSAGE_SUCCES_ROUTINE);
    // Envoie de la réponse.
    this.envoiReponse(200, traceur);
  }
  /** Gère une erreur de niveau 2.
    * @param traceur Le traceur d'erreur.
    * @param erreur L'erreur levé. */
  gererErreurNiveau2(traceur, erreur, id_dossier_cree) {
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
    // Fin de l'appel de la tache.
    traceur.finirTrace(false, parametres.MESSAGE_ERREUR_ROUTINE);
    // Envoie de la réponse.
    this.envoiReponse(500, traceur);
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
    for(var i=0; i<parametres.FICHIERS.length; i++){
      console.log(parametres.FICHIERS[i].nom_pastell);
      resultat[parametres.FICHIERS[i].nom_pastell] = await swp.obtenirFichier(id_entite, id_document, parametres.FICHIERS[i].nom_pastell);
      console.log(resultat[parametres.FICHIERS[i].nom_pastell]);
    }
    // Retour du résultat.
    return resultat;
  }
  /** Envoie une liste de fichiers Pastell vers Alfresco.
    * @param id_noeud_parent L'identifiant du noeud parent dans lequel créer les fichiers.
    * @param fichiers Un objet JSON contenant tout les fichiers à transmettre. */
  async envoyerFichiersVersAfresco(id_noeud_parent, fichiers) {
    var swa = new AlfrescoService();
    var resultat = null;
    for(var i = 0; i<parametres.FICHIERS.length; i++)
      if(fichiers[parametres.FICHIERS[i].nom_pastell] != null)
        resultat = await swa.creationFichier(id_noeud_parent, parametres.FICHIERS[i].nom, fichiers[parametres.FICHIERS[i].nom_pastell]);
    return resultat;
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
