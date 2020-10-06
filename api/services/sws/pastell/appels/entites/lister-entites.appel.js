var PastellAppelService = require('./../pastell.appel.js');

/** Classe permettant de lister les entités présente sur Pastell.  */
class ListerEntites extends PastellAppelService {
  /** Initalise une nouvelle instance de la classe 'ObtenirInformationsNode'.  */
  constructor() {
    super('GET', 'entite');
  }
  /** Invoque le service. */
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
module.exports = ListerEntites;
