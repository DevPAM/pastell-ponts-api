const ListerEntites = require('./appels/entites/lister-entites.appel.js');
const CreerDocument = require('./appels/documents/creer-document.appel.js');
const DetailDocument = require('./appels/documents/detail-document.appel.js');
const ObtenirFichier = require('./appels/documents/obtenir-fichier.appel.js');
const ActionDocument = require('./appels/documents/action-document.appel.js');
const ModifierDocument = require('./appels/documents/modifier-document.appel.js');
const AttacherFichierDocument = require('./appels/documents/attacher-fichier-document.appel.js')

/** Classe représentant un service web. */
class PastellService {
  /** Initialise une nouvelle instance de la classe 'PastellService'. */
  constructor() { }
  /** Récupère le détail d'un document.
  * @param id_entite L'identifiant de l'entite.
  * @param id_document L'identifiant du document pastell. */
  async obtenirDetailDocument(id_entite, id_document) {
    var appel = new DetailDocument(id_entite, id_document);
    return await appel.appeler();
  }
  /**
    * @param id_entite L'identifiant de l'entite.
    * @param id_document L'identifiant du document pastell.
    * @param nom_fichier Le nom d paramètre du fichier à récupérer.
    * @param index Si plusieurs fichier à récupérer sur ce paramètre indiquer son idnex. */
  async obtenirFichier(id_entite, id_document, nom_fichier, index){
    var appel = new ObtenirFichier(id_entite, id_document, nom_fichier, index);
    return await appel.appeler();
  }
  /** Liste les entités disponible sur Pastell. */
  async listerEntites() {
    // Récupération de la liste des entité disponible dans Pastell.
    var appel = new ListerEntites();
    return appel.appeler();
  }
  /** Recherche une entité au sein de la liste des entités.
    * @param nom_entite Le nom ed l'entité. */
  async obtenirEntite(nom_entite) {
    // Récupération de la liste des entités.
    var liste = await this.listerEntites();
    var index = 0;
    // Recherche de l'entités au seind e la liste.
    while(index < liste.length && liste[index].denomination.toLowerCase() != nom_entite.toLowerCase())
      index++;
    // Vérification que l'entite a été trouvé.
    if(index == liste.length) throw "L'entité '"+nom_entite+"' n'existe pas en sur Pastell.";
    // Retour de l'identifiant de l'entité.
    return liste[index].id_e;
  }
  /** Méthode permetant de créer un document dans pastell.
    * @param nom_entite L'identifiant de l'entité ou créé le dossier Pastell.
    * @param type_document Le type de document à creer dans l'entite. */
  async creerDocument(nom_entite, type_document) {
    var id_entite = await this.obtenirEntite(nom_entite);
    // Création du document.
    return (await new CreerDocument(id_entite, type_document).appeler());
  }
  /** Méthode permettant de modifier un document.
    * @param donnees Les données à modifier sur le document. */
  async modifierDocument(id_entite, id_document, donnees) {
    var appel = new ModifierDocument(id_entite, id_document, donnees);
    return await appel.appeler();
  }
  /** Méthode permettant d'attacher un fichier à un document.
    * @param nom_entite L'identifiant de l'entite.
    * @param id_document L'identifiant du document pastell.
    * @param id_parametre L'identifiant du paramètre sur lequel attacher le fichier.
    * @param index L'index du fichier sur le paramètre.
    * @param fichier Le fichier à joindre. */
  async atacherFichierDocument(nom_entite, id_document, id_parametre, index, fichier) {
    var id_entite = await this.obtenirEntite(nom_entite);
    var appel = new AttacherFichierDocument(id_entite, id_document, id_parametre, index, fichier);
    return await appel.appeler();
  }
  /** Lance un action sur le document.
    * @param id_entite L'identifiant alfresco du document.
    * @param id_document L'id_entifiant du document.
    * @param action L'action à executer. */
  async lancerActionDocument(nom_entite, id_document, action) {
    var id_entite = await this.obtenirEntite(nom_entite);
    var appel = new ActionDocument(id_entite, id_document, action);
    return await appel.appeler();
  }
  /** Lance un action sur le document.
    * @param nom_entite Le nom de l'entité du document Alfresco du document.
    * @param id_document L'id_entifiant du document.
    * @param action L'action à executer. */
  lancerActionDocumentAsync(nom_entite, id_document, action) {
    this.obtenirEntite(nom_entite).then(function(id_entite) {
      var appel = new ActionDocument(id_entite, id_document, action);
      appel.appelerAsync();
    }).catch(function(erreur) { throw erreur; })
  }
}
// Export du module.
module.exports = PastellService;
