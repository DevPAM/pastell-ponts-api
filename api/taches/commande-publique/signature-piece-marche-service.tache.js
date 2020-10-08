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
    if( !('nomDossier' in donnees) || donnees['nomDossier'] == null ) message += 'Veuillez saisir le nom de dossier.\n';
    if( !('directionOperationnelle' in donnees) || donnees['directionOperationnelle'] == null ) message += 'Veuillez saisir la direction opérationnelle.\n';
    if( !('objetConsultation' in donnees) || donnees['objetConsultation'] == null ) "Veuillez saisir l'objet de la consulation.";
    if( !('numeroMarche' in donnees) || donnees['numeroMarche'] == null ) message += 'Veuillez saisir le numéro de marché.';
    if( !('numeroConsultation' in donnees) || donnees['numeroConsultation'] == null ) message += 'Veuillez saisir le numéro de consultation.';
    if( !('idDocumentASigner' in donnees) || donnees['idDocumentASigner'] == null ) message += 'Veuillez joindre un fichier à signer.';

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
    var traceur = new Traceur(parametres.SERVICE+'-service', super.obtenirCorpsRequete().body);
    // Insertion en base de données de l'appel service.
    traceur.debuterAction("Insertion en base de données de l'appel service : "+parametres.SERVICE)
    bdd.debuterAppelService(parametres.SERVICE)
    .then(function(id_appel) {
      // Fin de l'action.
      traceur.finirAction(true);
      // Vérification des préconditions.
      traceur.debuterAction("Vérification des préconditions.")
      var preconditions = this.verifierPreconditions();
      // Si les préconditions ne sont pas respecté arret de la routine.
      if(!preconditions.respect){
        // Trace du résultat de la préconditions.
        tache.gererErreurNiveau4(traceur, preconditions, null, id_appel, null, preconditions.message);
        // Fin
        return;
      } else {
        // Indication que l'action précédente est OK.
        traceur.finirAction(true);
        // Récupérationd es données de la requête.
        donnees = preconditions.donnees;
      }
      // Vérouillage du noeud.
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
          tache.obtenirNomsContenusNoeuds(donnees.idDocumentsAnnexes)
          .then(function(fichiers_annexes) {
            // Trace du résultat de récupération des fichiers annexes.
            traceur.finirAction(true);
            // Création du document Pastell.
            traceur.debuterAction("Création du document Pastell.")
            tache.creerDocument(parametres.ENTITE, parametres.DOCUMENT)
            .then(function(document) {
              // Trace du résultat de la création du document.
              traceur.finirAction(true);
              // Modification des données du document.
              tache.modifierDocumentCommandePublique(document.id_e, document.id_d, donnees.nomDossier, donnees.directionOperationnelle, donnees.numeroConsultation, donnees.objetConsultation, donnees.numeroMarche)
              .then(document_modifier) {
                // Trace du résultat de modification du document.
                traceur.finirAction(true);
                // Ajout du fichier à signer au document.
                traceur.debuterAction("Ajout du fichier à signer au document.")
                swp.atacherFichierDocument(document.id_e, document.id_d, "document_a_signer", null, fichier_a_signer)
                .then(function(ajout_fichier_a_signer){
                  // Trace du résultat de modification du document.
                  traceur.finirAction(true);
                  // Ajout des fichiers annexes au document.
                  traceur.debuterAction("Ajout du fichier à signer au document.");
                  tache.ajouterFichierAnnexes(document.id_e, document.id_d, fichiers_annexes)
                  .then(function(ajouter_fichiers_annexes) {
                    // Trace de l'ajout des fichiers annexes au document.
                    traceur.finirAction(true);
                    // Vérification que le document est prêt pour lson orientation.
                    traceur.debuterAction("Vérification que le document est prêt pour son orientation.");
                    var verification = ajouterFichierAnnexes == null ? ajout_fichier_a_signer : ajouter_fichiers_annexes;
                    if(verification.formulaire_ok == 0) {
                      tache.gererErreurNiveau4(traceur, { message : verification.message }, donnees.idDocumentASigner, document, verification.message);
                      return;
                    }
                    // Trace la vérification deu l'erreur.
                    traceur.finirAction(true);
                    // Envoi du document vers son orientation.
                    traceur.debuterAction("Envoi du document vers son orientation.");
                    swp.lancerActionDocument(document.id_e, document.id_d, "orientation")
                    .then(function(lancement_action) {
                      traceur.finirAction(true);
                      // Envoie de la réponse au client.
                      tache.gererSucces(traceur, id_appel);
                    }) // FIN : Envoi du document vers son orientation.
                    // ERREUR : Envoi du document vers son orientation.
                    .catch( function(erreur) { tache.gererErreurNiveau3(traceur, erreur, id_appel, donnees.idDocumentASigner, document); } )
                  }) // FIN : Ajout des fichiers annexes au document.
                  // ERREUR : Ajout des fichiers annexes au document.
                  .catch(function(erreur) { tache.gererErreurNiveau3(traceur, erreur, id_appel, donnees.idDocumentASigner, document); })
                }) // FIN : Ajout du fichier à signer au document.
                // ERREUR : Ajout du fichier à signer au document.
                .catch(function(erreur) { tache.gererErreurNiveau3(traceur, erreur, id_appel, donnees.idDocumentASigner, document); })
              } // FIN : Modification des données du document.
              // ERREUR : Modification des données du document.
              .catch(function(erreur) { tache.gererErreurNiveau3(traceur, erreur, id_appel, donnees.idDocumentASigner, document); })
            }) // FIN : Création du document Pastell.
            // ERREUR : Création du document Pastell.
            .catch(function(erreur) { gererErreurNiveau2(traceur, erreur, id_appel, donnees.idDocumentASigner); })
          }) // FIN : Récupération des documents annexes.
          // ERREUR : Récupération des documents annexes.
          .catch(function(erreur) { tache.gererErreurNiveau2(traceur, erreur, id_appel, donnees.idDocumentASigner); });
        }) // FIN : Récupération du fichier à signer.
        // ERREUR : Récupération du fichier à signer
        .catch(function(erreur) { tache.gererErreurNiveau2(traceur, erreur, id_appel, donnees.idDocumentASigner); })
      }) // FIN : Vérouillage du noeud.
      // FIN ERREUR : Vérouillage du noeud.
      .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur, id_appel); })
    }) // FIN : Insertion en base de données de l'appel service.
    // ERREUR : Insertion en base de données de l'appel service.
    .catch(function(erreur) { tache.gererErreurNiveau0(traceur, erreur); });
  }
  /** Méthode peremttant de gérer le succes de l'appel du service.
    * @param id_appel L'identifiant d'un appel service.
    * @param document Le document Pastell. */
  gererSucces(traceur, id_appel, document) {
    var bdd = new PontBDD();
    // Fin de l'appel.
    bdd.finirAppel(id_appel, 1);
    // Ajout des documents au dossier en base de données.
    bdd.insererDocumentFichier(id_appel, document.id_e, document.id_d, parametres.DOCUMENT, id_fichier);
    // Trace de la fin du service.
    traceur.finirTrace(true, parametres.MESSAGE_SUCCES_SERVICE);
    // Envoie de la réponse au client.
    this.envoiReponse(500, traceur);
  }
  /** Gère une erreur de niveau 4.
    * @param traceur Le traceur d'erreur.
    * @param erreur L'erreur lancer par le système.
    * @param id_appel L'identifiant de l'appel.
    * @param id_noeud L'identifiant d'un noeud. */
  gererErreurNiveau4(traceur, erreur, id_noeud, id_appel, document, message) {
    var swa = new AlfrescoService();
    var swp = new PastellService();
    var bdd = new PontBDD();
    // Suppression du document su Pastell.
    swp.lancerActionDocument(id_document);
    // Dévérouillage du noued.
    if(id_noeud != null) swa.deverouillerNoeud(id_noeud);
    // Suppression du document su Pastell.
    if(document != null) swp.lancerActionDocumentAsync(document.id_e, document.id_d, "suppression");
    // Fin de l'appel.
    bdd.finirAppel(id_appel, 0);
    // Fin e l'action de récupération des informations pastell.
    traceur.finirAction(false);
    // Initialisation de l'erreur.
    traceur.log(erreur);
    // Fin de l'appel.
    finirTrace(false, message)
    // Envoie de la réponse.
    this.envoiReponse(500, traceur);
  }
  /** Gère une erreur de niveau 3.
    * @param traceur Le traceur d'erreur.
    * @param erreur L'erreur lancer par le système.
    * @param id_appel L'identifiant de l'appel.
    * @param id_noeud L'identifiant d'un noeud. */
  gererErreurNiveau3(traceur, erreur, id_appel, id_noeud, document) {
    var swp = new PastellService();
    // Suppression du document su Pastell.
    swp.lancerActionDocumentAsync(document.id_e, document.id_d, "suppression");
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
    bdd.finirAppel(id_appel, id_noeud);
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
    traceur.finirTrace(false, parametres.MESSAGE_ERREUR_ROUTINE)
    // Envoie de la réponse.
    this.envoiReponse(500, traceur);
  }
  /** Permet de récupérer le contenu d'un noeud et son nom de fichier.
    * @param id_noeud L'identifiant du noeud. */
  obtenirNomContenuNoeud(id_noeud) {
    var swa = new AlfrescoService();
    var detail = await swa.detailNoeud(id_noeud);
    return { nom : detail.entry.name, id_parent : detail.parentId, contenu : await swa.obtenirListeNoeudsEnfants(id_noeud) };
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
    * @param id_entite L'identifiant de l'entité.
    * @param id_document L'identifiant du document.
    * @param fichiers_annexes Les fichiers annexes. */
  async ajouterFichierAnnexes(id_entite, id_document, fichiers_annexes) {
    var resultat = null;
    var swp = new PastellService();
    // Ajoute des fichier au sein du documents.
    for(var i=0; i<fichiers_annexes.length; i++)
      resultat = await swp.atacherFichierDocument(document.id_e, document.id_d, 'documents_annexes', i, document_a_signer);
    // Retour du résultat.
    return resultat;
  }
}
// Export du module.
module.exports = SignaturePieceMarcheRoutine;
