const FormData = require('form-data');

var AlfrescoAppelService = require('./../alfresco.appel.js');

/** Classe permettant de récupérer les détail d'un noeud. */
class CreerNoeud extends AlfrescoAppelService {
  /** Initialise une nouvelle instance de la classe 'DetailDocument'.
    * @param id_noeud_parent Le noeud du document parent.
    * @param nom_noeud Le nom du noeud.
    * @param type_noeud Le type du noeud. */
  constructor(id_noeud_parent, nom_noeud, type_noeud) {
    super('POST', 'nodes/'+id_noeud_parent+'/children');
    this.nom_noeud = nom_noeud;
    this.type_noeud = type_noeud;
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
    super.modifierCorpsMessage( JSON.stringify({ name: this.nom_noeud, nodeType : this.type_noeud }) );
  }
}
// Export de la classe.
module.exports = CreerNoeud;
