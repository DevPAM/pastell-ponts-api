const AlfrescoAppelService = require('./../alfresco.appel.js');

/** Classe permettant d'obtenir le contenu d'un 'noeud'.  */
class ObtenirContenueNoeud extends AlfrescoAppelService {

  /** Initalise une nouvelle instance de la classe 'ObtenirInformationsNode'.
    * @param id_noeud L'identifiant du document. */
  constructor(id_noeud) {
    super('GET', 'nodes/' + id_noeud +'/content');
  }

  /** Invoque le service. */
  async appeler() {
    // Invoquation du resultat.
    var retour = await super.appeler();
    var resultat = null;
    // Vérification du retour du service.
    if(retour.status != 200) throw (await retour.json());
    // Retour du résulat.
    return await retour.buffer();
  }

}
// Export de la classe.
module.exports = ObtenirContenueNoeud;
