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
class SignaturePieceMarcheService extends Tache {
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
    if( !('nomDossier' in donnees) || Chaine.estNullOuVide(donnees['nomDossier']) ) message += 'Veuillez saisir le nom de dossier.\n';
    if( !('directionOperationnelle' in donnees) || Chaine.estNullOuVide(donnees['directionOperationnelle'])) message += 'Veuillez saisir la direction opérationnelle.\n';
    if( !('objetConsultation' in donnees) || Chaine.estNullOuVide(donnees['objetConsultation'])) "Veuillez saisir l'objet de la consulation.";
    if( !('numeroMarche' in donnees) || Chaine.estNullOuVide(donnees['numeroMarche'])) message += 'Veuillez saisir le numéro de marché.';
    if( !('numeroConsultation' in donnees) || Chaine.estNullOuVide(donnees['numeroConsultation'])) message += 'Veuillez saisir le numéro de consultation.';
    if( !('idDocumentASigner' in donnees) || Chaine.estNullOuVide(donnees['idDocumentASigner'])) message += 'Veuillez joindre un fichier à signer.';

    if( Chaine.estNullOuVide(message) ) return { respect : true, donnees : donnees };
    return { respect : false, message : message };
  }
  /** Execute la tache. */
  executer() {
    // Initialisation des éléments necessaires à l'execution de la tache.
    var tache = this;
    var donnees = null;
    var fichiers = { } ;
    var bdd = new PontBDD();
    var swp = new PastellService();
    var swa = new AlfrescoService();
    var traceur = new Traceur(parametres.SERVICE+'-service', super.obtenirCorpsRequete());
    // Insertion en base de données de l'appel service.
    traceur.debuterAction("Insertion en base de données de l'appel service : "+parametres.SERVICE)
    bdd.debuterAppelService(parametres.SERVICE)
    .then(function(id_appel) {
      // Fin de l'action.
      traceur.finirAction(true);
      // Vérification des préconditions.
      traceur.debuterAction("Vérification des préconditions.")
      var preconditions = tache.verifierPreconditions();
      // Si les préconditions ne sont pas respecté arret de la routine.
      if(!preconditions.respect){
        // Trace du résultat de la préconditions.
        tache.gererErreurNiveau4(traceur, preconditions, null, id_appel, null, null, preconditions.message);
        // Fin
        return;
      } else {
        // Indication que l'action précédente est OK.
        traceur.finirAction(true);
        // Récupérationd es données de la requête.
        donnees = preconditions.donnees;
      }
      // Vérouillage du noeud.
      traceur.debuterAction("Vérouillage du noeud Alfresco : '"+donnees.idDocumentASigner+"'.")
      swa.verouillerNoeud(donnees.idDocumentASigner)
      .then(function(verrouillage) {
        // Trace du résultat du vérouillage.
        traceur.finirAction(true);
        // Récupération du fichier à signer.
        traceur.debuterAction("Récupération du fichier à signer ("+donnees.idDocumentASigner+").")
        tache.obtenirNomContenuNoeud(donnees.idDocumentASigner)
        .then(function(fichier_a_signer) {
          // Trace du résultat de récupération du fichier à signer.
          traceur.finirAction(true);
          // Récupération des documents annexes.
          traceur.debuterAction("Récupération des documents annexes.");
          swa.obtenirNomsContenusNoeuds(donnees.idDocumentsAnnexes)
          .then(function(fichiers_annexes) {
            // Trace du résultat de récupération des fichiers annexes.
            traceur.finirAction(true);
            // Récupération de l'identifiant de l'entité du fichier.
            traceur.debuterAction("Récupération de l'identifiant de l'entité du fichier.")
            swp.obtenirEntite(parametres.ENTITE)
            .then(function(id_entite) {
              // Trace du résultat de récupération des fichiers annexes.
              traceur.finirAction(true);
              // Création du document Pastell.
              traceur.debuterAction("Création du document Pastell.")
              swp.creerDocument(id_entite, parametres.DOCUMENT)
              .then(function(document) {
                // Trace du résultat de la création du document.
                traceur.finirAction(true);
                // Modification des données du document.
                traceur.debuterAction("Modification du dossier créer (entite : "+id_entite+", document : "+document.id_d+ ").")
                tache.modifierDocumentCommandePublique(id_entite, document.id_d, donnees.nomDossier, donnees.directionOperationnelle, donnees.numeroConsultation, donnees.objetConsultation, donnees.numeroMarche)
                .then(function(document_modifier) {
                  // Trace du résultat de modification du document.
                  traceur.finirAction(true);
                  // Ajout du fichier à signer au document.
                  traceur.debuterAction("Ajout du fichier à signer au document.")
                  swp.atacherFichierDocument(id_entite, document.id_d, "document_a_signer", null, fichier_a_signer)
                  .then(function(ajout_fichier_a_signer){
                    // Trace du résultat de modification du document.
                    traceur.finirAction(true);
                    // Ajout des fichiers annexes au document.
                    traceur.debuterAction("Ajout du fichier à signer au document.");
                    tache.ajouterFichierAnnexes(id_entite, document.id_d, fichiers_annexes)
                    .then(function(ajouter_fichiers_annexes) {
                      // Trace de l'ajout des fichiers annexes au document.
                      traceur.finirAction(true);
                      // Vérification que le document est prêt pour lson orientation.
                      traceur.debuterAction("Vérification que le document est prêt pour son orientation.");
                      var verification = ajouter_fichiers_annexes == null ? ajout_fichier_a_signer : ajouter_fichiers_annexes;
                      if(verification.formulaire_ok == 0) {
                        tache.gererErreurNiveau4(traceur, { message : verification.message }, donnees.idDocumentASigner, id_entite, document, verification.message);
                        return;
                      }
                      // Trace la vérification deu l'erreur.
                      traceur.finirAction(true);
                      // Envoi du document vers son orientation.
                      traceur.debuterAction("Envoi du document vers son orientation.");
                      swp.lancerActionDocument(id_entite, document.id_d, "orientation")
                      .then(function(lancement_action) {
                        traceur.finirAction(true);
                        // Ajout des métadonnées liées à l'envoie vers Pastell.
                        traceur.debuterAction(" Ajout des métadonnées liées à l'envoie vers Pastell.");
                        var metadonnees = {
                          aspectNames: ["pastcm:pastellDoc","pastcm:documentPrincipal"],
                          properties : {
                            "pastcm:pastellNomDossier": donnees.nomDossier,
                            "pastcm:pastellStatut": "Envoyé en signature",
                            "pastcm:pastellDateStatut": new Date(),
                            "pastcm:pastellDateSignature": null,
                            "pastcm:pastellDirSignataire": donnees.directionOperationnelle,
                            "pastcm:pastellTypedoc": "Pièce principale",
                            "pastcm:pastellFlux": "com-pub-pieces-signees",
                            "pastcm:pastellIdEntite": id_entite,
                            "pastcm:pastellIdDossier": document.id_d }
                        };
                        swa.modifierNoeud(donnees.idDocumentASigner, metadonnees).then(function(){
                          traceur.finirAction(true);
                          // Reverouillage du document à signer.
                          traceur.debuterAction("Reverouillage du document à signer.");
                          swa.verouillerNoeud(donnees.idDocumentASigner)
                          .then(function(){
                            traceur.finirAction(true);
                            // Envoie de la réponse au client.
                            //tache.gererSucces(traceur, id_appel, id_entite, document, donnees.idDocumentASigner);
                            tache.gererSucces(traceur, id_appel, id_entite, document, donnees.idDocumentASigner);
                            return;
                          }) // FIN: du véroullage du fichier de signature.
                          .catch(function(erreur) { tache.gererErreurNiveau3(traceur, erreur, id_appel, donnees.idDocumentASigner, id_entite, document) })
                        }) // FIN : Ajout des métadonnées liées à l'envoie vers Pastell.
                        // ERREUR : Ajout des métadonnées liées à l'envoie vers Pastell.
                        .catch(function(erreur) { tache.gererErreurNiveau3(traceur, erreur, id_appel, donnees.idDocumentASigner, id_entite, document) })
                      }) // FIN : Envoi du document vers son orientation.
                      // ERREUR : Envoi du document vers son orientation.
                      .catch( function(erreur) { tache.gererErreurNiveau3(traceur, erreur, id_appel, donnees.idDocumentASigner, id_entite, document) } )
                    }) // FIN : Ajout des fichiers annexes au document.
                    // ERREUR : Ajout des fichiers annexes au document.
                    .catch(function(erreur) { tache.gererErreurNiveau3(traceur, erreur, id_appel, donnees.idDocumentASigner, id_entite, document) })
                  }) // FIN : Ajout du fichier à signer au document.
                  // ERREUR : Ajout du fichier à signer au document.
                  .catch(function(erreur) { tache.gererErreurNiveau3(traceur, erreur, id_appel, donnees.idDocumentASigner, id_entite, document) })
                }) // FIN : Modification des données du document.
                // ERREUR : Modification des données du document.
                .catch(function(erreur) { tache.gererErreurNiveau3(traceur, erreur, id_appel, donnees.idDocumentASigner, id_entite, document) })
              }) // FIN : Création du document Pastell.
              // ERREUR : Création du document Pastell.
              .catch(function(erreur) { tache.gererErreurNiveau2(traceur, erreur, id_appel, donnees.idDocumentASigner) })
            }) // FIN : Récupération de l'identifiant de l'entité du fichier.
            // ERREUR : Récupération de l'identifiant de l'entité du fichier.
            .catch(function(erreur) { tache.gererErreurNiveau2(traceur, erreur, id_appel, donnees.idDocumentASigner) })
          }) // FIN : Récupération des documents annexes.
          // ERREUR : Récupération des documents annexes.
          .catch(function(erreur) { tache.gererErreurNiveau2(traceur, erreur, id_appel, donnees.idDocumentASigner) });
        }) // FIN : Récupération du fichier à signer.
        // ERREUR : Récupération du fichier à signer
        .catch(function(erreur) { tache.gererErreurNiveau2(traceur, erreur, id_appel, donnees.idDocumentASigner) })
      }) // FIN : Vérouillage du noeud.
      // FIN ERREUR : Vérouillage du noeud.
      .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur, id_appel) })
    }) // FIN : Insertion en base de données de l'appel service.
    // ERREUR : Insertion en base de données de l'appel service.
    .catch(function(erreur) { tache.gererErreurNiveau0(traceur, erreur) });
  }
  /** Méthode peremttant de gérer le succes de l'appel du service.
    * @param id_appel L'identifiant d'un appel service.
    * @param document Le document Pastell. */
  gererSucces(traceur, id_appel, id_entite, document, id_fichier/*, nom, direction*/) {
    var swa = new AlfrescoService();
    var swp = new PastellService();
    var bdd = new PontBDD();
    var tache = this;
    // Fin de l'appel.
    bdd.finirAppel(id_appel, 1);
    // Ajout des documents au dossier en base de données.
    bdd.insererDocumentFichier(id_appel, id_entite, document.id_d, "Envoyé en signature", parametres.PIECE_SIGNEE, id_fichier);
    // Ajout des métaonnées sur le document.
    // swa.modifierNoeud(id_fichier,  { properties : { "statut" : "Envoyé en signature", entite_pastell: id_entite_pastell, id_document_pastell : document.id_d } });
    /*swa.modifierNoeud(id_fichier,  {
      aspectNames: ["pastcm:pastellDoc","pastcm:documentPrincipal"],
      properties : {
        "pastcm:pastellNomDossier": nom,
        "pastcm:pastellStatut": "Envoyé en signature",
        "pastcm:pastellDateSignature": new Date(),
        "pastcm:pastellDirSignataire": direction,
        "pastcm:pastellTypedoc": "Pièce principale",
        "pastcm:pastellFlux": "com-pub-pieces-signees",
        "pastcm:pastellIdEntite": id_entite,
        "pastcm:pastellIdDossier": document.id_d }
    });*/
      // Ajout des données.
    traceur.ajouterDonnees("id_entite_pastell", id_entite);
    traceur.ajouterDonnees("id_document_pastell", document.id_d);
    // Trace de la fin du service.
    traceur.finirTrace(true, parametres.MESSAGE_SUCCES_SERVICE);
    // Envoie de la réponse au client.
    tache.envoiReponse(200, traceur);
  }
  /** Gère une erreur de niveau 4.
    * @param traceur Le traceur d'erreur.
    * @param erreur L'erreur lancer par le système.
    * @param id_appel L'identifiant de l'appel.
    * @param id_noeud L'identifiant d'un noeud. */
  gererErreurNiveau4(traceur, erreur, id_noeud, id_appel, id_entite, document, message) {
    var swa = new AlfrescoService();
    var swp = new PastellService();
    var bdd = new PontBDD();
    // Dévérouillage du noued.
    if(id_noeud != null) swa.deverouillerNoeud(id_noeud);
    // Suppression du document su Pastell.
    if(document != null) swp.lancerActionDocumentAsync(id_entite, document.id_d, "suppression");
    // Fin de l'appel.
    bdd.finirAppel(id_appel, 0);
    // Initialisation de l'erreur.
    traceur.log(erreur);
    // Fin de l'appel.
    traceur.finirTrace(false, message)
    // Envoie de la réponse.
    this.envoiReponse(500, traceur);
  }
  /** Gère une erreur de niveau 3.
    * @param traceur Le traceur d'erreur.
    * @param erreur L'erreur lancer par le système.
    * @param id_appel L'identifiant de l'appel.
    * @param id_noeud L'identifiant d'un noeud. */
  gererErreurNiveau3(traceur, erreur, id_appel, id_noeud, id_entite, document) {
    var swp = new PastellService();
    // Suppression du document su Pastell.
    swp.lancerActionDocumentAsync(id_entite, document.id_d, "supression");
    // Suite de la gestion d'erreur.
    this.gererErreurNiveau2(traceur,erreur,id_appel,id_noeud);
  }
  /** Gère une erreur de niveau 2.
    * @param traceur Le traceur d'erreur.
    * @param erreur L'erreur lancer par le système.
    * @param id_appel L'identifiant de l'appel.
    * @param id_noeud L'identifiant d'un noeud. */
  gererErreurNiveau2(traceur, erreur, id_appel, id_noeud) {
    var swa = new AlfrescoService();
    // Dévérouillage du noued.
    swa.deverouillerNoeud(id_noeud);
    // Gestion de la suite de erreur
    this.gererErreurNiveau1(traceur, erreur, id_appel);
  }
  /** Gère une erreur de niveau 1.
    * @param traceur Le traceur d'erreur.
    * @param erreur L'erreur lancer par le système.
    * @param id_appel L'identifiant de l'appel. */
  gererErreurNiveau1(traceur, erreur, id_appel){
    var bdd = new PontBDD();
    // Find e l'appel.
    bdd.finirAppel(id_appel, 0);
    // Dévérouillage du noued
    this.gererErreurNiveau0(traceur, erreur);
  }
  /** Gere les erreur de niveau zéro.
    * @param traceur Le traceur d'erreur.
    * @param erreur L'erreur lancer par le système.
    * @param id_noeud L'identifiant d'un noeud. */
  gererErreurNiveau0(traceur, erreur) {
    // Fin e l'action de récupération des informations pastell.
    traceur.finirAction(false);
    // Initialisation de l'erreur.
    traceur.log(erreur);
    // Fin de l'appel service.
    traceur.finirTrace(false, parametres.MESSAGE_ERREUR_SERVICE);
    // Envoie de la réponse.
    this.envoiReponse(500, traceur);
  }
  /** Permet de récupérer le contenu d'un noeud et son nom de fichier.
    * @param id_noeud L'identifiant du noeud. */
  async obtenirNomContenuNoeud(id_noeud) {
    var swa = new AlfrescoService();
    var detail = await swa.detailNoeud(id_noeud);
    var contenu = await swa.obtenirContenuNoeud(id_noeud);
    return { nom : detail.entry.name, id_parent : detail.parentId, contenu : contenu };
  }
  /** Méthode permettant de modifier un document de la commmande publique.
    * @param id_entite L'identifiant de l'entite.
    * @param id_document L'identifiant du document.
    * @param nom_dossier Le nom du dossier.
    * @param direction_operationnelle La direction opérationnelle.
    * @param numero_consultation Le numero de la consultation.
    * @param objet_consultation L'objet de la consultation.
    * @param numero_marche Le numéro du marché. */
  async modifierDocumentCommandePublique(id_entite, id_document, nom_dossier, direction_operationnelle, numero_consultation, objet_consultation, numero_marche) {
    var swp = new PastellService();
    // Initialisation des données.
    var donnees = { nom_dossier: nom_dossier, direction_operationnelle: direction_operationnelle, numero_consultation: numero_consultation, objet_consultation : objet_consultation, numero_marche : numero_marche, iparapheur_sous_type : 'SS_Type_signatures_marchés', iparapheur_type : 'Type_signature_marchés' };
    // Appel du service.
    return await swp.modifierDocument(id_entite, id_document, donnees);
  }
  /** Méthode permettant d'ajouter des fichiers annexes au document.
    * @param id_entite Le nom de l'entité.
    * @param id_document L'identifiant du document.
    * @param fichiers_annexes Les fichiers annexes. */
  async ajouterFichierAnnexes(id_entite, id_document, fichiers_annexes) {
    var resultat = null;
    var swp = new PastellService();
    // Ajoute des fichier au sein du documents.
    for(var i=0; i<fichiers_annexes.length; i++)
      resultat = await swp.atacherFichierDocument(id_entite, id_document, 'documents_annexes', i, fichiers_annexes[i]);
    // Retour du résultat.
    return resultat;
  }
}
// Export du module.
module.exports = SignaturePieceMarcheService;
