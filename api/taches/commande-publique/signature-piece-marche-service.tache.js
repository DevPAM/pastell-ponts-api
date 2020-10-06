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

    // Verouillage du fichier à signer.
    traceur.debuterAction("Verouillage du noeud/fichier à signer.");
    swa.verouillerNoeud(donnees.idDocumentASigner)
    .then(function(document) {

      // Le verouillage est ok
      traceur.finirAction(true);

      // Récupération du noeud/fichier à signer.
      traceur.debuterAction("Récupération du noeud/fichier à signer.")
      swa.obtenirNomContenuNoeud(donnees.idDocumentASigner)
      .then(function( document_a_signer) {

        // Indicaion que la récupération du document à signer est ok.
        traceur.finirAction(true);
        // Récupération des documents annexes.
        traceur.debuterAction("Récupération des documents annexes.");
        swa.obtenirNomsContenusNoeuds(donnees.idDocumentsAnnexes)
        .then(function( documents_annexes ){

          // Inidication que l'on a vien récupérer les fichiers annexes.
          traceur.finirAction(true);
          // Création du document dans Pastell.
          traceur.debuterAction("Création du document dans Pastell.");
          swp.creerDocument(parametres.ENTITE, parametres.DOCUMENT)
          then(function(document) {

            // Indication que la création du documents est ok.
            traceur.finirAction(true);
            // Modification du document.
            tache.modifierDocumentCommandePublique(document.id_e, document.id_d, donnees.nomDossier, donnees.directionOperationnelle, donnees.numeroConsultation, donnees.objetConsultation, donnees.numeroMarche)
            .then(function(modification) {

              // Indication que la modification du document est ok.
              traceur.finirAction(true);
              // Attache le fichier à signer dans le document.
              traceur.debuterAction("Attache le fichier à signer dans le document.");
              swp.atacherFichierDocument(document.id_e, document.id_d, 'document_a_signer', null, document_a_signer);
              .then(function (ajout_fichier_a_signer) {

                // Indication que la modification du document est ok.
                traceur.finirAction(true);
                // Attache les fichiers annexes au document.
                traceur.debuterAction("Attache les fichiers annexes au document.");
                tache.ajouterFichierAnnexes(document.id_e, document.id_d, documents_annexes)
                .then(function( ajout_fichier_annexes ){

                  // Indication que la modification du document est ok.
                  traceur.finirAction(true);
                  // Vérification que le dossier puisse partir dans son flux.
                  var verification = ajout_fichier_annexes != null ? ajout_fichier_a_signer.formulaire_ok : ajout_fichier_annexes.formulaire_ok;
                  fi(verification == 0) {
                    
                    return ;
                  } // FIN : Vérification que le dossier puisse partir dans son flux.


                }) // FIN : Attache les fichiers annexes au document.
                // ERREUR : Attache les fichiers annexes au document.
                .catch(function(erreur){ tache.gererErreurNiveau2(traceur, erreur, donnees.idDocumentASigner); });

              }) // FIN : Attache le fichier à signer dans le document.
              // ERREUR : Attache le fichier à signer dans le document.
              .catch(function(erreur) { tache.gererErreurNiveau2(traceur, erreur, donnees.idDocumentASigner); })

            }) // FIN : Modification du document.
            // ERREUR : Modification du document.
            .catch( function(erreur) { tache.gererErreurNiveau2(traceur, erreur, donnees.idDocumentASigner); } )

          }) // FIN : Création du document dans Pastell.
          // ERREUR : Création du document dans Pastell.
          .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur, donnees.idDocumentASigner); })

        }) // FIN : Récupération des documents annexes.
        // ERREUR : Récupération des documents annexes.
        .catch( function(erreur) { tache.gererErreurNiveau1(traceur, erreur, donnees.idDocumentASigner); });


      }) // FIN : Récupération du noeud/fichier à signer.
      // ERREUR : Récupération du noeud/fichier à signer.
      .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur, donnees.idDocumentASigner) });

    }) // FIN : Verouillage du fichier à signer.
    // ERREUR : Verouillage du fichier à signer.
    .catch(function(erreur) { tache.gererErreurNiveau1(traceur, erreur, donnees.idDocumentASigner); });
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
    * @param erreur L'erreur levée. */
  gererErreurNiveau2(traceur, erreur, id_noeud, id_document) {
    // Suppression du dossier.
    var swp = new PastellService();
    // Suppression du document su Pastell.
    swp.supprimerDocument(id_document);
    // Gestion de la suite de erreur
    this.gererErreurNiveau1(traceur, erreur, id_noeud);
  }
  /** Gère une erreur de niveau 1.
    * @param traceur Le traceur d'erreur.
    * @param erreur L'erreur lancer par le système. */
  gererErreurNiveau1(traceur, erreur, id_noeud){
    var swa = new AlfrescoService();
    // Dévérouillage du noued.
    swp.deverouillerNoeud(id_noeud);
    // Fin e l'action de récupération des informations pastell.
    traceur.finirAction(false);
    // Initialisation de l'erreur.
    traceur.log(erreur);
    // Envoie de la réponse.
    this.envoiReponse(500, traceur.JSON(parametres.MESSAGE_ERREUR_ROUTINE));
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
