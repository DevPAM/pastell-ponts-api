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
    // Moification du corps du message.
    this.modifierCorpsMessage();
    // Invoquation du resultat.
    var retour = await super.appelSync();
    var resultat = await retour.json();
    // Vérification du retour du service.
    if(retour.status != 200) throw resultat;
    // Retour du résulat.
    return resultat;
  }
  /** Modifie le corps du message pour l'appel du service.
      @param corps_message Le nouveau corps du message. */
  modifierCorpsMessage() {
    var corps = { timeToExpire: 0, type: 'ALLOW_OWNER_CHANGES', lifetime : 'PERSISTENT' };
    super.modifierCorpsMessage(JSON.stringify(corps));
  }
}
// Export de la classe.
module.exports = VerouillerNoeud;
