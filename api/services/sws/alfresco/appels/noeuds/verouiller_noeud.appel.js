const AlfrescoAppelService = require('./../alfresco.appel.js');

/** Classe permettant d'obtenir le contenu d'un 'noeud'.  */
class VerouillerNoeud extends AlfrescoAppelService {

  /** Initalise une nouvelle instance de la classe 'ObtenirInformationsNode'.
  * @param id_noeud L'identifiant du noeud à vérouiller.  */
  constructor(id_noeud) {
    super('POST', 'nodes/' + id_noeud +'/lock');
  }

  /** Invoque le service. */
  async appeler() {
    // Invoquation du resultat.
    var retour = await super.appeler();
    var resultat = await retour.json();
    // Vérification du retour du service.
    if(retour.status != 200) throw resultat;
    // Retour du résulat.
    return resultat;
  }
}
// Export de la classe.
module.exports = VerouillerNoeud;
