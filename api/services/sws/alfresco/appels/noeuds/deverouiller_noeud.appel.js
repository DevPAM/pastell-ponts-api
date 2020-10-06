const AlfrescoAppelService = require('./../alfresco.appel.js');

/** Classe permettant d'obtenir le contenu d'un 'noeud'.  */
class DeverouillerNoeud extends AlfrescoAppelService {

  /** Initalise une nouvelle instance de la classe 'ObtenirInformationsNode'.
    * @param id_noeud L'identifiant du document.   */
  constructor(id_noeud) {
    super('POST', 'nodes/' + id_noeud +'/unlock');
  }

  /** Invoque le service. */
  appeler() {
    // Intialisation des options.
    var options = { method: super.obtenirMethode(), headers : super.obtenirHeaders() };
    // Appel du service
    var fetch = super.appelAsync();
    fetch(super.obtenirHote()+super.obtenirService(), options)
    .then(reponse => reponse.json())
    .then(function(json) { return; })
    .catch(function(erreur) { return; });
  }
}
// Export de la classe.
module.exports = DeverouillerNoeud;
