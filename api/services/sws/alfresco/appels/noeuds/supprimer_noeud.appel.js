var AlfrescoAppelService = require('./../alfresco.appel.js');

/** Classe permettant de récupérer les détail d'un noeud. */
class SupprimerNoeud extends AlfrescoAppelService {
  /** Initialise une nouvelle instance de la classe 'DetailDocument'.
    * @param id_noeud Le noeud du document. */
  constructor(id_noeud) {
    super('DELETE', 'nodes/'+id_noeud);
  }
  /** Appel le service web. */
  async appeler() {
    // Invoquation du resultat.
    var retour = await super.appelSync();
    var resultat = null;
    // Vérification du retour du service.
    if(retour.status != 204 && retour.status != 404) throw (await retour.json());
    // Retour du résulat.
    return resultat;
  }
  /** Appel du service web en asynchrone. */
  appelerAsync() {
    // Intialisation des options.
    var options = { method: super.obtenirMethode(), headers : super.obtenirHeaders() };
    // Appel du service.
    var fetch = super.appelAsync();
    fetch(super.obtenirHote()+super.obtenirService(), options)
    .then(reponse => reponse.text() )
    .catch(function(erreur) { console.log(erreur); return; });
  }
}
// Export de la classe.
module.exports = SupprimerNoeud;
