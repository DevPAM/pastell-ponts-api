const FormData = require('form-data');

var AlfrescoAppelService = require('./../alfresco.appel.js');

/** Classe permettant de modifier un noeud. */
class ModifierNoeud extends AlfrescoAppelService {
  /** Initialise une nouvelle instance de la classe 'ModifierNoeud'.
    * @param id_noeud L'identifiant du noeud.
    * @param proprietes Les éléments à modifier sur le noeud. */
  constructor(id_noeud, proprietes) {
    super('PUT', 'nodes/'+id_noeud_parent);
    this.proprietes = proprietes;
  }
  /** Appel le service web. */
  async appeler() {
    // Modification du corps de message.
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
    * @param corps_message Le nouveau corps du message. */
  modifierCorpsMessage() {
    super.modifierCorpsMessage( JSON.stringify(this.proprietes) );
  }
}
// Export de la classe.
module.exports = ModifierNoeud;
