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
    .then(function(liste) {
      tache.gererSucces(traceur, liste);
    })// FIN :  Récupération de la liste des documents disponible.
    // ERREUR : Récupération de la liste des documents disponible.
    .catch(function(erreur) { tache.gererErreur(traceur, erreur); });
  }
  /** Gère le succès de l'appel du service.
    * @param traceur Le traceur du service.
    * @param liste La liste documents trouvés. */
  gererSucces(traceur, liste) {
    traceur.finirAction(true);
    traceur.ajouterDonnees("resultat", liste);
    // Trace de la fin du service.
    traceur.finirTrace(true, "Ok");
    // Envoie de la réponse au client.
    this.envoiReponse(200, traceur);
  }
  /** Gère une erreur lors de l'appel du service.
    * @param traceur Le traceur de su service.
    * @param erreur L'exception ayant causé l'érreur. */
  gererErreur(traceur, erreur){
    traceur.finirAction(false);
    traceur.finirTrace(false, "Une erreur est survenue lors de la récupération de la liste des documents.");
    // Initialisation de l'erreur.
    traceur.log(erreur);
    // Envoie de la réponse.
    this.envoiReponse(500, traceur);
  }
};
// Export de la classe.
module.exports = ListerFluxService;
