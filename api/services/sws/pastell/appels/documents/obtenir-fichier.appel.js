var PastellAppelService = require('./../pastell.appel.js');

class ObtenirFichier extends PastellAppelService {
  /** Initialise une nouvelle instance de la classe 'DetailDocument'.
    * @param id_entite L'identifiant de l'entite.
    * @param id_document L'identifiant du document pastell.
    * @param nom_fichier Le nom d paramètre du fichier à récupérer.
    * @param index Si plusieurs fichier à récupérer sur ce paramètre indiquer son idnex. */
  constructor(id_entite, id_document, nom_fichier, index) {
    console.log(id_entite);
    console.log(id_document);
    console.log(nom_fichier);
    console.log(index);
    super('GET', 'entite/'+id_entite+'/document/'+id_document+'/file/'+nom_fichier);
    if(index != undefined && index != null) super.modifierService('entite/'+id_entite+'/document/'+id_document+'/file/'+nom_fichier+'/'+index);
  }
  /** Appel le service web. */
  async appeler() {
    // Invoquation du resultat.
    var retour = await super.appelSync();
    // Vérification du retour du service.
    console.log(retour.status);
    if(retour.status == 404) return null;
    else if(retour.status != 200 && retour.status != 201) throw await retour.json();
    // Retour du résulat.
    //var resultat = Buffer.from(await retour.text());
    return await retour.buffer();
  }
}
// Export de la classe.
module.exports = ObtenirFichier;
