const FormData = require('form-data');

var PastellAppelService = require('./../pastell.appel.js');

/** Classe permettant d'ajouter un document sur Pastell.  */
class ActionDocument extends PastellAppelService {
  /** Initalise une nouvelle instance de la classe 'ObtenirInformationsNode'.
    * @param id_entite L'identifiant de l'entité.
    * @param id_document L'identifiant du document. */
  constructor(id_entite, id_document, action) {
    super('POST', 'entite/'+id_entite+'/document/'+id_document+'/action/'+action);
  }
  /** Invoque le service. */
  async appeler() {
    // Appel du service
    var retour = await super.appelSync();
    var resultat = await retour.json();
    // Vérification du retour service.
    if(retour.status != 200 && retour.status != 201) throw resultat;
    // Retour du résulat.
    return resultat;
  }
  /** Invoque le service de manère asynchrone */
  appelerAsync() {
    // Intialisation des options.
    var options = { method: super.obtenirMethode(), headers : super.obtenirHeaders() };
    // Appel du service
    var fetch = super.appelAsync();
    fetch(super.obtenirHote()+super.obtenirService(), options)
    .then(reponse => reponse.json())
    .then(function(json) { return; })
    .catch(function(erreur) { throw erreur; }); ;
  }
}
// Export de la classe.
module.exports = ActionDocument;
