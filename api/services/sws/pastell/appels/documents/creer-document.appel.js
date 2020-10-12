const FormData = require('form-data');

var PastellAppelService = require('./../pastell.appel.js');

/** ,Clase permettant de créer un dossier su Pastell. */
class CreerDocument extends PastellAppelService {
  /** Initialise une nouvelle instance de la classe 'DetailDocument'.
    * @param id_entite L'identifiant de l'entite.
    * @param type_document Le type du document pastell. */
  constructor(id_entite, type_document) {
    super('POST', 'entite/'+id_entite+'/document');
    this.type_document = type_document;
  }
  /** Appel le service web. */
  async appeler() {
    // Mise en place du body.
    this.modifierCorpsMessage();
    // Invocation du resultat.
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
    var formdata = new FormData();
    formdata.append('type', this.type_document);
    super.modifierCorpsMessage(formdata);
  }
}
// Export de la classe.
module.exports = CreerDocument;
