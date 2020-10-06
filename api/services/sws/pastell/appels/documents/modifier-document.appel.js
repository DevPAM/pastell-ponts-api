const FormData = require('form-data');

var PastellAppelService = require('./../pastell.appel.js');

/** Classe permettant modifier un document sur Pastell.  */
class ModifierDocument extends PastellAppelService {
  /** Initalise une nouvelle instance de la classe 'ModifierDocument'.
    * @param id_entite L'identifiant de l'entité.
    * @param id_document L'identifiant du document.
    * @param donnes Les données à modifier sur le document. */
  constructor(id_entite, id_document, donnees) {
    super('PATCH', 'entite/' + id_entite + '/document/'+id_document);
    this.donnees = donnees;
  }
  /** Invoque le service. */
  async appeler() {
    // Mise en place du body.
    this.modifierCorpsMessage();
    // Invoquation du resultat.
    var retour = await super.appelSync();
    var resultat = await retour.json();
    // Vérification du retour du service.
    if(retour.status != 200 && retour.status != 201) throw resultat;
    // Retour du résulat.
    return resultat;
  }
  /** Modifie le corps du message pour l'appel du service.
      @param corps_message Le nouveau corps du message. */
  modifierCorpsMessage() {
    var urlSearchParams = new URLSearchParams();
    for(var cle in this.donnees)
      urlSearchParams.append(cle, this.donnees[cle]);
    super.modifierCorpsMessage(urlSearchParams);
  }

}
// Export de la classe.
module.exports = ModifierDocument;
