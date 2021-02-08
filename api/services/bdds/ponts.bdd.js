const MySQL = require('./../../../systeme/utilitaires/bdds/mysql/mysql.utilitaire.js');

// Récupération des paramètres de la base de données.
const administration = require('./../../../systeme/administration.systeme.js');
const parametre_bdd = administration.bdds.ponts[ administration.env ];

/** Classe permettant d'effectuer des requête SQL vers la base de données. */
class PontBDD extends MySQL {
  /** Initialise une nouvelle instance de la classe 'PontBDD'. */
  constructor() {
    super(parametre_bdd.hote, parametre_bdd.login, parametre_bdd.mdp, parametre_bdd.bdd);
  }
  /** Insère un appel service en base de données.
    * @param nom_service Le nom du service appeller. */
  async debuterAppelService(nom_service){
    var resultat = await super.executerSync("select f_appel_service("+super.formaterVarchar(nom_service)+") as id_appel");
    return resultat.id_appel;
  }
  /** Modifie l'appel l'appel d'un service pour l'indique en tant que terminer.
    * @param id_appel L'identifiant de l'appel service.
    * @param succes Indique si l'appel c'est terminer avec succes (1) ou non (0). */
  terminerAppelService(id_appel, succes) {
    super.executerAsync("call p_terminer_appel("+id_appel+", "+succes+")");
  }
  /** Ajoute en base de données les informations du document pastell créé pour cette appel.
    * @param id_appel L'identifiant de l'appel service.
    * @param id_entite_document L'entite Pastell auquel est rattaché le document.
    * @param id_document L'identifiant du document sur Pastell.
    * @param etat_initial L'état initial d'un document. */
  async insererDocumentAppel(id_appel, id_entite_document, id_document, etat_initial) {
    var resultat = await super.executerSync("select f_ajouter_document("+id_appel+", "+ id_entite_document+", "+super.formaterVarchar(id_document)+", '"+etat_initial+"') as id_document");
    return resultat.id_document;
  }
  /** Dans le cas d'une utilisation future: enregistre l'identifiant d'un fichier alfresco et son type.
    * @param id_document L'identifiant du document en base de données.
    * @param type_fichier Le type de fichier pour ce document.
    * @param id_fichier L'identifiant alfresco du fichier. */
  insererFichierDocument(id_document, type_fichier, id_fichier) {
    super.executerAsync("call p_ajouter_fichier("+id_document+", "+super.formaterVarchar(type_fichier)+", "+super.formaterVarchar(id_fichier)+")");
  }
  /** Récupération des identifiants alfresco lié à un dossier Pastell d'un type donné.
    * @param id_entite L'identifiant de l'entité de rattachement du dossier Pastell.
    * @param id_document L'identifiant du dossier Pastell.
    * @param type_fichier Le type de fichier rattaché au dossier. */
  async obtenirIdFichiersAlfresco(id_entite, id_document, type_fichier) {
    //console.log("call p_obtenir_id_alfresco("+id_entite+", "+ super.formaterVarchar(id_document) +", "+ super.formaterVarchar(type_fichier) +")");
    return await super.executerSync("call p_obtenir_id_alfresco("+id_entite+", "+ super.formaterVarchar(id_document) +", "+ super.formaterVarchar(type_fichier) +")");
  }
  /** Insère un fichier alfresco relié à un document Pastell.
    * @param id_appel L'identifiant de l'appel service.
    * @param id_entite_document L'entite Pastell auquel est rattaché le document.
    * @param id_document L'identifiant du document sur Pastell.
    * @param etat_initial L'état initial du document Pastell.
    * @param type_fichier Le type de fichier pour ce document.
    * @param id_fichier L'identifiant alfresco du fichier. */
  insererDocumentFichier(id_appel, id_entite_document, id_document, etat_initial, type_fichier, id_fichier){
    var bdd = this;
    // Insertion du document en base de données.
    bdd.insererDocumentAppel(id_appel, id_entite_document, id_document, etat_initial)
    .then(function(id_doc) {
      bdd.insererFichierDocument(id_doc, type_fichier, id_fichier);
    }) // FIN : Insertion du document en base de données.
    .catch(function(erreur) { throw erreur; })
  }
  /** Insère en base de données la fin de gestion d'un document Pastell.
    * @param id_appel L'identifiant de l'appel.
    * @param succes Le succes de l'appel. */
  finirAppel(id_appel, succes) {
    super.executerAsync("call p_finir_appel("+id_appel+", "+succes+")");
  }
  /** Méthode permettant de récupérer la configuration d'un type de cron.
    * @param type Le type de cron. */
  async obtenirParametrageCron(type) {
    return await super.executerSync("call p_obtenir_parametrage_cron('"+type+"')");
  }
  /** Permet d'obtenir les dossiers en cours d'un certains type.
    * @param */
  async obtenirDocumentsEnCours(type_document) {
    return await super.executerSync("call p_obtenir_dossier_en_cours('"+type_document+"')");
  }
  /** Permet de mettre à jour document. */
  async finirDocumentPastell(id_entite, id_document, etat, succes) {
    return await super.executerSync("call p_finir_document("+id_entite+", "+ super.formaterVarchar(id_document) +", "+ super.formaterVarchar(etat) +", "+ succes +" )");
  }
  /** Permet de lister les documents par type.
    * @param type Le type de document.
    * @param nom_pastell Le nom pastell du document.
    * @param date_debut La date de début de création du document.
    * @param date_fin La date de fin de de gestion du document.
    * @param comparaison_debut
    * @param comparaison_fin
    * @param etat_document
    * @param ordre
    * @param direction  */
  async listerDocumentsParType(type, nom_pastell, date_debut, date_fin, comparaison_debut, comparaison_fin, etat_document, ordre, direction){
    return await super.executerSync("call p_lister_document_par_type("+super.formaterVarchar(type)+", "+super.formaterVarchar(nom_pastell)+", "+super.formaterVarchar(date_debut)+", "+super.formaterVarchar(date_fin)+", "+super.formaterVarchar(comparaison_debut)+", "+super.formaterVarchar(comparaison_fin)+", "+super.formaterVarchar(etat_document)+", "+ super.formaterVarchar(ordre) +", "+ super.formaterVarchar(direction) +" )");
  }
  /** Méthode permettant d'obtenir une version. */
  async obtenirVersion(){
    var resultat = await super.executerSync("select (f_obtenir_version()) as version");
    return resultat.version;
  }
}
module.exports = PontBDD;
