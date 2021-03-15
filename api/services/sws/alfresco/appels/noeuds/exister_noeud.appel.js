var AlfrescoAppelService = require('./../alfresco.appel.js');

/** Classe permettant d'indiquer si le noeud existe ou non. */
class ExisterNoeud extends AlfrescoAppelService {
  /** Initialise une nouvelle instance de la classe 'ExisterNoeud'.
    * @param id_noeud Le noeud du document. */
  constructor(id_noeud) {
    super('GET', 'nodes/'+id_noeud);
  }
  /** Appel le service web. */
  async appeler() {
    // Invoquation du resultat.
    var retour = await super.appelSync();
    var resultat = await retour.json();
    // Vérification du retour du service.
    if(retour.status != 200 && retour.status != 201 && retour.status != 404) throw resultat;
    if(retour.status == 404) return false;
    // Retour du résulat.
    return true;
  }
}
// Export de la classe.
module.exports = ExisterNoeud;
