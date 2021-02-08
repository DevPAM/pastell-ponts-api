const PontBDD = require('./../../services/bdds/ponts.bdd.js');
const PastellService = require('./../../services/sws/pastell/pastell.service.js');
const Tache = require('./../../../systeme/utilitaires/taches/tache.utilitaire.js');
const AlfrescoService = require('./../../services/sws/alfresco/alfresco.service.js');
const Chaine = require('./../../../systeme/utilitaires/chaines/chaine.utilitaire.js');
const Traceur = require('./../../../systeme/utilitaires/traceur/traceur.utilitaire.js');
const Logueur = require('./../../../systeme/utilitaires/loggueur/loggueur.utilitaire.js');

const administration = require('./../../../systeme/administration.systeme.js');
const parametres = administration.flux.commande_publique.piece_signee_marche;
const etats = administration.etat_pastell;

const xml2js = require('xml2js');
var util = require('util');

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
    var traceur = new Traceur(parametres.SERVICE+'-routine', super.obtenirCorpsRequete());
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
        traceur.debuterAction("Récupération des infomrations du noeud/fichier alfresco ("+id_alfresco_fichier_piece_signee[0].id_alfresco+").");
        swa.detailNoeud(id_alfresco_fichier_piece_signee[0].id_alfresco)
        .then(function(noeud) {
          // Indication de la fin de l'action avec succès.
          traceur.finirAction(true);
          // Vérification que le document Pastell est en état final.
          traceur.debuterAction("Vérification que le document Pastell est en état final (entite : '"+ donnees.id_entite +"', document : '"+donnees.id_document+"').");
          var etat_document = tache.obtenirEtat(document.last_action.action);
          // Si l'état est null pas d'opérations : FIN.
          if(etat_document == null) {
            tache.gererSucces1(traceur, id_alfresco_fichier_piece_signee[0].id_alfresco, donnees.id_entite, donnees.id_document);
          }else {
            traceur.finirAction(true);
            // Vérification de l'état Pastell.
            if(etat_document == 'Demande de signature rejetée' || etat_document == 'Archivage refusé' || etat_document == 'Signé et archivé') {
              // Récupération des métadonnées parapheur.
              traceur.debuterAction("Récupération des métadonnées pour modification du noeud Alfresco ('"+id_alfresco_fichier_piece_signee[0].id_alfresco+"').");
              tache.obtenirMetadonnees(donnees.id_entite, document)
              //tache.obtenirMetadonneesParapheur(donnees.id_entite, document.info.id_d)
              .then(function(metadonnees) {
                // La récupération des métaonnées s'est déroulé avec succes.
                traceur.finirAction(true);
                // Modification du noeud Alfresco.
                traceur.debuterAction("Mise à jour de l'état du noeud alfresco selon son état (etat : '"+etat_document+"', '"+id_alfresco_fichier_piece_signee[0].id_alfresco+"').");
                swa.modifierNoeud(id_alfresco_fichier_piece_signee[0].id_alfresco, metadonnees)
                .then(function(noeud_modifie){
                  // Indiciation que le noeud a été modifié avec succès.
                  traceur.finirAction(true);
                  // Indication en base de données que document a finit avec succès.
                  pont_bdd.finirDocumentPastell(donnees.id_entite, donnees.id_document, metadonnees.properties['pastcm:pastellStatut'], ((etat_document == 'Signé et archivé') ? 1 : 0))
                  .then(function(vide){
                    // L'action s'est finit avec succès.
                    traceur.finirAction(true);
                    // Envoie des fichiers vers alfresco.
                    if(etat_document == 'Signé et archivé') {
                      // Récupération des documents (dans Pastell) pour envoie dans Alfresco.
                      traceur.debuterAction("Récupération des documents (dans Pastell) pour envoie dans Alfresco.");
                      tache.obtenirFichiers(donnees.id_entite, donnees.id_document)
                      .then(function(fichiers) {
                        traceur.finirAction(true);
                        traceur.debuterAction("Envoie des documents vers Alfresco.");
                        tache.envoyerFichiersVersAfresco(noeud.entry.name, noeud.entry.parentId, fichiers)
                        .then(function(envoi){
                          tache.gererSucces2(traceur, id_alfresco_fichier_piece_signee[0].id_alfresco, donnees.id_entite, donnees.id_document);
                        }) // FIN : Envoie des fichiers vers alfresco.
                        // ERREUR : Envoie des fichiers vers alfresco.
                        .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur); })
                      }) // FIN :
                      // ERREUR :
                      .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur); });
                    } else  tache.gererSucces2(traceur, id_alfresco_fichier_piece_signee[0].id_alfresco, donnees.id_entite, donnees.id_document);
                  }) // FIN : Indication en base de données que document a finit avec succès.
                  // ERREUR : Indication en base de données que document a finit avec succès.
                  .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur); })
                }) // FIN : Modification du noeud Alfresco.
                // ERREUR : Modification du noeud Alfresco.
                .catch(function(erreur){ tache.gererErreurNiveau1(traceur, erreur); })
              }) // FIN : Récupération des métadonnées parapheur.
              // ERREUR : Récupération des métadonnées parapheur.
              .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur); })
            }else {
              var metadonnees = { properties : { "pastcm:pastellStatut": "En erreur", "pastcm:pastellDateStatut": new Date() } };
              // Modification du noeud Alfresco.
              traceur.debuterAction("Mise à jour de l'état du noeud alfresco selon son état (etat : '"+etat_document+"', '"+id_alfresco_fichier_piece_signee[0].id_alfresco+"').");
              swa.modifierNoeud(id_alfresco_fichier_piece_signee[0].id_alfresco, metadonnees)
              .then(function(noeud_modifie){
                // Indiciation que le noeud a été modifié avec succès.
                traceur.finirAction(true);
                // Indication en base de données que document a finit avec succès.
                pont_bdd.finirDocumentPastell(donnees.id_entite, donnees.id_document, metadonnees.properties['pastcm:pastellStatut'], 0)
                .then(function(vide){
                  tache.gererSucces1(traceur, id_alfresco_fichier_piece_signee[0].id_alfresco, donnees.id_entite, donnees.id_document);
                }) // FIN : Indication en base de données que document a finit avec succès.
                // ERREUR : Indication en base de données que document a finit avec succès.
                .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur); })
              }) // FIN : Modification du noeud Alfresco.
              // ERREUR : Modification du noeud Alfresco.
              .catch(function(erreur){ tache.gererErreurNiveau1(traceur, erreur); })
            }
          }
        }) // FIN : Récupération des infomrations du noeud/fichier alfresco.
        // ERREUR : Récupération des infomrations du noeud/fichier alfresco.
        .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur); });
      }) // FIN : Récupération de l'identifiant Alfresco en base de données.
      // ERREUR : // Récupération de l'identifiant Alfresco en base de données.
      .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur); });
    }) // FIN : Récupération des informations inérent au dossier Pastell.
    // ERREUR : Récupération des informations inérent au dossier Pastell.
    .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur); });
  }
  /** Gère le succès de la tache de niveau 1.
    * @param traceur Le traceur d'actions. */
  gererSucces2(traceur, id_alfresco_fichier_piece_signee, id_entite, id_document) {
    var swa = new AlfrescoService();
    // Dévérouillage du document: pièce signé.
    swa.deverouillerNoeud(id_alfresco_fichier_piece_signee);
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
  /** Méthode permettant d'obtenir la base du nom de de fichier.
    * @param nom_fichier Le nom du fichier. */
  obtenirBaseFichier(nom_fichier) {
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
      resultat[parametres.FICHIERS[i].nom_pastell] = await swp.obtenirFichier(id_entite, id_document, parametres.FICHIERS[i].nom_pastell);
    }// Retour du résultat.
    return resultat;
  }
  /** Envoie une liste de fichiers Pastell vers Alfresco.
    * @param nom_fichier Le nom du fichier.
    * @param id_noeud_parent L'identifiant du noeud parent dans lequel créer les fichiers.
    * @param fichiers Un objet JSON contenant tout les fichiers à transmettre. */
  async envoyerFichiersVersAfresco(nom_fichier, id_noeud_parent, fichiers) {
    var swa = new AlfrescoService();
    var resultat = null;
    var nom = this.obtenirBaseFichier(nom_fichier);
    for(var i = 0; i<parametres.FICHIERS.length; i++)
      if(fichiers[parametres.FICHIERS[i].nom_pastell] != null)
        resultat = await swa.creationFichier(id_noeud_parent, nom + '_' +parametres.FICHIERS[i].nom, fichiers[parametres.FICHIERS[i].nom_pastell]);
    return resultat;
  }
  /** Méthode permettant de récupérer les métadonnées d'un fichier.
    * @param id_entite L'identifiant de l'
    * @param document Le document Pastell. */
  async obtenirMetadonnees(id_entite, document){
    var etat = this.obtenirEtat(document.last_action.action);
    var resultat = await this.obtenirMetadonneesParapheur(id_entite, document.info.id_d, etat);
    if(etat == 'Signé et archivé') {
      resultat['properties']['pastcm:pastellArchivageDate'] = await this.obtenirMetadonneesArchivage(id_entite, document.info.id_d);
      resultat['properties']['pastcm:pastellArchivageId'] = document.data.sae_archival_identifier;
    }
    // Retour du résultat.
    return resultat;
  }
  /** Permet d'obtenir les métadonnées du parapheur via son histirique.
    * @param id_entite L'identifiant de l'entité Pastell auquel est rattaché le document.
    * @param id_document L'identifiant du document Pastell. */
  async obtenirMetadonneesParapheur(id_entite, id_document, etat){
    // Récupération du fichier d'historique du parapheur.
    var swp = new PastellService();
    var fichier = await swp.obtenirFichier(id_entite, id_document, "iparapheur_historique", null);
    // Parsage du fichier d'historique: XML -> JSON.
    var parseur = new xml2js.Parser({ attrkey: "ATTR" });
    var parseString = util.promisify(parseur.parseString);
    var historique = await parseString(fichier.toString());
    // Récupération des éléments de signature.
    var index = 0;
    while(index < historique.iparapheur_historique.LogDossier[0].LogDossier.length &&
          (historique.iparapheur_historique.LogDossier[0].LogDossier[index].status[0] != 'Signe' &&
           historique.iparapheur_historique.LogDossier[0].LogDossier[index].status[0] != 'RejetSignataire' )){
      index++;
    }
    if(index >=  historique.iparapheur_historique.LogDossier[0].LogDossier.length) return null;
    var resultat = {
      "properties": {
        "pastcm:pastellStatut": etat,
        "pastcm:pastellDateStatut": new Date(),
        "pastcm:pastellDateSignature": (historique.iparapheur_historique.LogDossier[0].LogDossier[index].status[0] == 'Signe' ? historique.iparapheur_historique.LogDossier[0].LogDossier[index].timestamp[0] : null),
        "pastcm:pastellSignataire": historique.iparapheur_historique.LogDossier[0].LogDossier[index].nom[0],
        "pastcm:pastellAnnotation": historique.iparapheur_historique.LogDossier[0].LogDossier[index].annotation[0]
      }
    };
    return resultat;
  }
  /** Permet d'obtenir les métadonnées d'archivage d'un document.
    * @param id_entite L'identifiant de l'entité du document pastell.
    * @param document Le JSON du document pastell. */
  async obtenirMetadonneesArchivage(id_entite, id_document) {
    var swp = new PastellService();
    var fichier = await swp.obtenirFichier(id_entite, id_document, "reply_sae", null);
    // Parsage du fichier d'historique: XML -> JSON.
    var parseur = new xml2js.Parser({ attrkey: "ATTR" });
    var parseString = util.promisify(parseur.parseString);
    var reponse = await parseString(fichier.toString());
    return reponse.ArchiveTransferReply.GrantDate[0];
  }
  /** Méthode permettant de canaliser le nom des états Pastell.
    * @param etat_pastell Le nom de l'état pastell. */
  obtenirEtat(etat_pastell) {
    // Cas optimales
    if( etat_pastell == "rejet-iparapheur") return "Demande de signature rejetée";
    else if( etat_pastell == "rejet-sae") return "Archivage refusé";
    else if( etat_pastell == "termine") return "Signé et archivé";
    // Cas d'erreur
    else if(
      etat_pastell == "verif-sae-erreur" || etat_pastell == "erreur-envoie-sae" || etat_pastell == "erreur-verif-iparapheur" ||
      etat_pastell == "validation-sae-erreur" || etat_pastell == "verif-sae-erreur" || etat_pastell == "fatal-error")
      return "En erreur";
    // Fin.
    return null;
  }
}
// Export du module.
module.exports = SignaturePieceMarcheRoutine;
