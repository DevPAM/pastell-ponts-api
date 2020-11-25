const PontBDD = require('./../../services/bdds/ponts.bdd.js');
const Tache = require('./../../../systeme/utilitaires/taches/tache.utilitaire.js');
const Traceur = require('./../../../systeme/utilitaires/traceur/traceur.utilitaire.js');

/** Classe permettant de lister les flux. */
class ListerFluxService extends Tache {
  /** Initialise une nouvelle instance de la classe 'Tache'.
    * @param requete La requête cliente.
    * @param reponse Le port de réponse client. */
  constructor(requete, reponse){
    super(requete, reponse);
  }
  /** Execute la tâche. */
  executer(){
    var tache = this;
    var bdd = new PontBDD();
    var corps = super.obtenirCorpsRequete();
    var traceur = new Traceur('ListerFluxService', corps);
    // Récupération en base de données.
    traceur.debuterAction("Récupération de la liste des documents disponible.");
    bdd.listerDocumentsParType(corps.type, corps.nom_pastell, corps.date_debut, corps.date_fin, corps.comparaison_debut, corps.comparaison_fin, corps.etat_document, corps.ordre, corps.direction)
    .then(function(donnees) {
      tache.envoiReponseSimple(200, 'Ok', tache.traduire(donnees));
    })// FIN :  Récupération de la liste des documents disponible.
    // ERREUR : Récupération de la liste des documents disponible.
    .catch(function(erreur) {
      console.log(erreur);
      tache.envoiReponseSimple(500, "Une erreur est survenue lors de la récupération des document du flux '"+corps.type+"'.", null);
    });
  }
  /** Traduit les données 'RowPacketData' en JSON.
    * @param donnees Les données à traduire. */
  traduire(donnees) {
    var resultat = [];
    for(var i = 0; i < donnees.length; i++) resultat.push({
      selection: donnees[i].selection,
      id: donnees[i].id,
      id_service: donnees[i].id_service,
      id_entite: donnees[i].id_entite,
      id_pastell: donnees[i].id_pastell,
      etat: donnees[i].etat,
      date_debut: donnees[i].date_debut,
      date_fin: donnees[i].date_fin,
      succes: donnees[i].succes
    });
    return resultat;
  }
};
// Export de la classe.
module.exports = ListerFluxService;
