var AlfrescoAppelService = require('./../alfresco.appel.js');

/** Classe permettant de récupérer modifier le contenu d'un noeud. */
class ModifierContenuNoeud extends AlfrescoAppelService {
  /** Initialise une nouvelle instance de la classe 'ModifierContenuNoeud'.
    * @param id_noeud Le noeud du document.
    * @param contenu Le nouveau contenu du noeud. */
  constructor(id_noeud, contenu) {
    super('PUT', 'nodes/'+id_noeud+'/content');
    this.contenu = contenu;
  }
  /** Appel le service web. */
  async appeler() {
    super.modifierCorpsMessage(this.contenu);
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
module.exports = ModifierContenuNoeud;
