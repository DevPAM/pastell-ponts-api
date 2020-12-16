const Tache = require('./../../../systeme/utilitaires/taches/tache.utilitaire.js');
const Traceur = require('./../../../systeme/utilitaires/traceur/traceur.utilitaire.js');
const PontBDD = require('./../../services/bdds/ponts.bdd.js');
/** Permet d'obtenir la version de l'API. */
class ObtenirVersionService extends Tache {
  /** Initialise une nouvelle instance de la classe 'ObtenirVersionService'.
    * @param requete La requête cliente
    * @param reponse La réponse cliente */
  constructor(requete, reponse) {
    super(requete, reponse);
  }
  /** Execute la tâche. */
  executer() {
    // Initialisation des éléments necessaires à l'execution de la tache.
    var tache = this;
    var bdd = new PontBDD();
    var traceur = new Traceur('obtenir-version-service', super.obtenirCorpsRequete().body);
    // Récupération de la version d'application en cours.
    traceur.debuterAction("Récupération de la version d'application en cours.");
    bdd.obtenirVersion()
    .then(function(version){
      // Fin e l'action de récupération des informations pastell.
      traceur.finirAction(true);
      // Ajout des données.
      traceur.ajouterDonnees("version", version);
      // Fin du tracage.
      traceur.finirTrace(true, null);
      // Envoie de la réponse.
      tache.envoiReponse(200, traceur);
    })// FIN : Récupération de la version d'application en cours.
    // ERREUR : Récupération de la version d'application en cours.
    .catch(function(erreur){
      // Fin e l'action de récupération des informations pastell.
      traceur.finirAction(false);
      // Initialisation de l'erreur.
      traceur.log(erreur);
      // Fin de l'appel service.
      traceur.finirTrace(false, "Une erreur est survenue lors de la répération de la version de l'API en base de données.");
      // Envoi de la réponse.
      tache.envoiReponse(500, traceur);
    });
  }
}
/** Export du module. */
module.exports = ObtenirVersionService;
