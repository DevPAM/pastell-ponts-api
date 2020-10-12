const FormData = require('form-data');

var PastellAppelService = require('./../pastell.appel.js');

/** Classe permettant d'attacher un fichier à un document. */
class AttacherFichierDocument extends PastellAppelService {
  /** Initialise une nouvelle instance de la classe 'DetailDocument'.
    * @param id_entite L'identifiant de l'entite.
    * @param id_document L'identifiant du document pastell.
    * @param id_parametre L'identifiant du paramètre sur lequel attacher le fichier.
    * @param index L'index du fichier sur le paramètre.
    * @param fichier Le fichier à joindre. */
  constructor(id_entite, id_document, id_parametre, index, fichier) {
    super('POST', 'entite/'+id_entite+'/document/'+id_document+'/file/'+id_parametre);
    if(index != undefined && index != null) this.modifierService('entite/'+id_entite+'/document/'+id_document+'/file/'+id_parametre+'/'+index);
    this.fichier = fichier;
  }
  /** Appel le service web. */
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
  /** Modifie le corps du message pour l'appel du service. */
  modifierCorpsMessage() {
    var formdata = new FormData();
    formdata.append('file_name', this.fichier.nom);
    formdata.append('file_content', this.fichier.contenu);
    super.modifierCorpsMessage(formdata);
  }
}
// Export de la classe.
module.exports = AttacherFichierDocument;
