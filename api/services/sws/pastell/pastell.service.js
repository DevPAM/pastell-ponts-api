const DetailDocument = require('./appels/documents/detail-document.appel.js');
const ObtenirFichier = require('./appels/documents/obtenir-fichier.appel.js');

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
}
// Export du module.
module.exports = PastellService;
