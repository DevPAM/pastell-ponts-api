const ListerEntites = require('./appels/entites/lister-entites.appel.js');
const CreerDocument = require('./appels/documents/creer-document.appel.js');
const DetailDocument = require('./appels/documents/detail-document.appel.js');
const ObtenirFichier = require('./appels/documents/obtenir-fichier.appel.js');
const AttacherFichierDocument = require('./appels/documents/attacher-fichier-document.appel.js');

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
  /** Méthode permetant de créer un document dans pastell.
    * @param nom_entite L'identifiant de l'entité ou créé le dossier Pastell.
    * @param type_document Le type de document à creer dans l'entite. */
  async CreerDocument(nom_entite, type_document) {
    // Récupération de la liste des entité disponible dans Pastell.
    var liste_entites = new ListerEntites().appeler();
    // Recherche de notre entité dans la liste.
    var index = 0;
    while(index < liste_entites.length && liste_entites[index].denomination.toLowerCase() != nom_entite.toLowerCase())
      index++;
    // Vérification que l'entite a été trouvé.
    if(index == liste_entites.length) throw "L'entité '"+nom_entite+"' n'existe pas en sur Pastell.";
    // Création du document.
    return (await new CreerDocument(liste_entites[index].id_e, type).appeler());
  }
  /** Méthode permettant de modifier un document.
    * @param donnees Les données à modifier sur le document. */
  async modifierDocument(id_entite, id_document, donnees) {
    var appel = new ModifierDocument(id_entite, id_document, donnees);
    return await appel.appeler();
  }
  /** Méthode permettant d'attacher un fichier à un document.
    * @param id_entite L'identifiant de l'entite.
    * @param id_document L'identifiant du document pastell.
    * @param id_parametre L'identifiant du paramètre sur lequel attacher le fichier.
    * @param index L'index du fichier sur le paramètre.
    * @param fichier Le fichier à joindre. */
  async atacherFichierDocument(id_entite, id_document, id_parametre, index, fichier) {
    var appel = new AttacherFichierDocument(id_entite, id_document, id_parametre, index, fichier);
    return await appel.appeler();
  }
}
// Export du module.
module.exports = PastellService;
