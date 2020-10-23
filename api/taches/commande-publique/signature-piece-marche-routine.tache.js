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
        traceur.debuterAction("Récupération des infomrations du noeud/fichier alfresco ("+id_alfresco_fichier_piece_signee[0].id_alfresco+").");
        swa.detailNoeud(id_alfresco_fichier_piece_signee[0].id_alfresco)
        .then(function(noeud) {
          // Indication de la fin de l'action avec succès.
          traceur.finirAction(true);
          // Récupération des métadonnées.
          traceur.debuterAction("Récupération des métadonnées du dossier Pastell (entite: "+donnees.id_entite+", document : "+donnees.id_document+").");
          tache.obtenirMetadonnees(donnees.id_entite, document)
          .then(function(metadonnees) {
            // Indication de la fin de récupération des métaonnées.
            traceur.finirAction(true);
            // Mise à jour des métadonnées du document à signer.
            traceur.debuterAction("Mise à jour des métadonnées du document à signer Alfresco ("+id_alfresco_fichier_piece_signee[0].id_alfresco+").");
            swa.modifierNoeud(id_alfresco_fichier_piece_signee[0].id_alfresco,
              // metadonnees
              { properties : { "cm:title" : metadonnees.properties.etat } }
            ).then(function(noeud_modifier) {
              // Indication de la fin de l'action avec succès.
              traceur.finirAction(true);
              console.log(noeud);
              // Vérification de l'état du document pastell avant de poursuivre.
              // Pas d'état == pas de changement = fin.
              if(!('etat' in metadonnees.properties)) {
                tache.gererSucces1(traceur, id_alfresco_fichier_piece_signee[0].id_alfresco, donnees.id_entite, donnees.id_document);
                return;
              }
              // Etat en erreur.
              else if(metadonnees.properties.etat == "En erreur" || metadonnees.properties.etat == "Demande de signature refusée." ||
                      metadonnees.properties.etat == "Archivage refusé.") {
                    // Indiquer que le document est fini.
                    traceur.debuterAction("Indication que le document est fini (entite: "+donnees.id_entite+", document : "+donnees.id_document+", etat : "+metadonnees.properties.etat+").");
                    pont_bdd.finirDocumentPastell(donnees.id_entite, donnees.id_document, metadonnees.properties.etat, 0)
                    .then(function(vide) {
                      tache.gererSucces1(traceur, id_alfresco_fichier_piece_signee[0].id_alfresco, donnees.id_entite, donnees.id_document);
                      return;
                    })// FIN : Indication que le document est fini.
                    // ERREUR : Indication que le document est fini
                    .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur) });
              }
              // Le document Pastell est dans un état final.
              else if( metadonnees.properties.etat == "Signé et archivé." ) {
                // Récupération des documents (dans Pastell) pour envoie dans Alfresco.
                traceur.debuterAction("Récupération des documents (dans Pastell) pour envoie dans Alfresco.");
                tache.obtenirFichiers(donnees.id_entite, donnees.id_document)
                .then(function(fichiers){
                  // Indication de la fin de l'action avec succes.
                  traceur.finirAction(true);
                  // Envoie des documents vers Alfresco.
                  tache.envoyerFichiersVersAfresco(noeud.entry.name, noeud.entry.parentId, fichiers)
                  .then(function(envoie) {
                    // Indiquer que le document est fini.
                    traceur.debuterAction("Indication que le document est fini (entite: "+donnees.id_entite+", document : "+donnees.id_document+", etat : "+metadonnees.properties.etat+").");
                    pont_bdd.finirDocumentPastell(donnees.id_entite, donnees.id_document, metadonnees.properties.etat, 1)
                    .then(function(vide) {
                      tache.gererSucces2(traceur, id_alfresco_fichier_piece_signee[0].id_alfresco, donnees.id_entite, donnees.id_document);
                      return;
                    })// FIN : Indication que le document est fini.
                  }) // Envoie des documents vers Alfresco.
                  // ERREUR : Envoie des documents vers Alfresco.
                  .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur) })
                })// FIN : Récupération des documents (dans Pastell) pour envoie dans Alfresco.
                // ERREUR : Récupération des documents (dans Pastell) pour envoie dans Alfresco.
                .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur) });
              }
            }) // FIN : Mise à jour des métadonnées du document à signer.
            // ERREUR : Mise à jour des métadonnées du document à signer.
            .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur) })
          }) // FIN : Récupération des métadonnées.
          // ERREUR : Récupération des métadonnées.
          .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur); });
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
  obtenirDate(valeur) {
    var date = null;
    if(valeur == undefined || valeur == null) date = new Date();
    else date = new Date(valeur);
    return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds();
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
    * @param document Les documents Pastell. */
  async obtenirMetadonnees(id_entite, document){
    // Mise à jour des élémnts basiques de la proprietes.
    var proprietes = { date_mise_a_jour_cron : this.obtenirDate(), date_mise_a_jour_pastell : document.last_action.date };
    // Récupération du l'URL de l'archive.
    if("data" in document && "url_archive" in document.data) proprietes["url_archive"] = document.data.url_archive;
    // Récupération des métadonnées de la signature.
    var metadonnee_signature = null ;
    try{ metadonnee_signature = await this.obtenirMetadonneesParapheur(id_entite, document.info.id_d);
    }catch(erreur){ Logueur.error(erreur); }
    // Récupération des métadonnées.
    if(metadonnee_signature != null)
      for (var cle in metadonnee_signature)
        proprietes[cle] = metadonnee_signature[cle];
    // Récupération de l'état du dossier Pastell.
    var etat = this.obtenirEtat(document.last_action.action);
    if(etat != null) proprietes["etat"] = etat;
    // Retour du résultat.
    return { properties: proprietes };
  }
  /** Permet d'obtenir les métadonnées du parapheur via son histirique.
    * @param id_entite L'identifiant de l'entité Pastell auquel est rattaché le document.
    * @param id_document L'identifiant du document Pastell. */
  async obtenirMetadonneesParapheur(id_entite, id_document){
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
          historique.iparapheur_historique.LogDossier[0].LogDossier[index].status[0] != 'Signe'){
      index++;
    }
    if(index >=  historique.iparapheur_historique.LogDossier[0].LogDossier.length) return null;
    return { date_signature : historique.iparapheur_historique.LogDossier[0].LogDossier[index].timestamp[0],
             signataire :  historique.iparapheur_historique.LogDossier[0].LogDossier[index].nom[0] };
  }
  /** Méthode permettant de canaliser le nom des états Pastell.
    * @param etat_pastell Le nom de l'état pastell. */
  obtenirEtat(etat_pastell) {
    // Cas optimales
    if( etat_pastell == "rejet-iparapheur") return "Demande de signature refusée.";
    else if( etat_pastell == "rejet-sae") return "Archivage refusé.";
    else if( etat_pastell == "termine") return "Signé et archivé.";
    // Cas d'erreur
    else if(
      etat_pastell == "verif-sae-erreur" || etat_pastell == "erreur-envoie-sae" || etat_pastell == "erreur-verif-iparapheur" ||
      etat_pastell == "validation-sae-erreur" || etat_pastell == "verif-sae-erreur")
      return "En erreur";
    // Fin.
    return null;
  }
}
// Export du module.
module.exports = SignaturePieceMarcheRoutine;
