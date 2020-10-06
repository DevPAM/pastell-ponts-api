var PastellAppelService = require('./../pastell.appel.js');

/** ,Clase permettant de créer un dossier su Pastell. */
class CreerDocument extends PastellAppelService {
  /** Initialise une nouvelle instance de la classe 'DetailDocument'.
    * @param id_entite L'identifiant de l'entite.
    * @param id_document L'identifiant du document pastell. */
  constructor(id_entite, id_document) {
    super('GET', 'entite/'+id_entite+'/document/'+id_document);
  }
  /** Appel le service web. */
  async appeler() {
    // Invoquation du resultat.
    var retour = await super.appelSync();
    var resultat = await retour.json();
    // Vérification du retour du service.
    if(retour.status != 200 && retour.status != 201) throw resultat;
    // Retour du résulat.
    return resultat;
  }
}
// Export de la classe.
module.exports = DetailDocument;
