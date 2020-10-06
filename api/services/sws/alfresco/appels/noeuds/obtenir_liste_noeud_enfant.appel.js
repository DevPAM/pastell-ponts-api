var AlfrescoAppelService = require('./../alfresco.appel.js');

/** Classe permettant de récupérer les détail d'un noeud. */
class ObtenirListeNoeudsEnfants extends AlfrescoAppelService {
  /** Initialise une nouvelle instance de la classe 'DetailDocument'.
    * @param id_noeud Le noeud du document. */
  constructor(id_noeud) {
    super('GET', 'nodes/'+id_noeud+'/children');
  }
  /** Appel le service web. */
  async appeler() {
    // Invoquation du resultat.
    var retour = await super.appelSync();
    var resultat = await retour.json();
    // Vérification du retour du service.
    if(retour.status != 200) throw resultat;
    // Retour du résulat.
    return resultat;
  }
}
// Export de la classe.
module.exports = ObtenirListeNoeudsEnfants;
