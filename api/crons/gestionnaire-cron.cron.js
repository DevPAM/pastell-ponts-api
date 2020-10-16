const Cron = require('./cron.cron.js')
const PontBDD = require('./../services/bdds/ponts.bdd.js');
const Chemin = require('./../../systeme/utilitaires/chemins/chemin.utilitaire.js');
const Logueur = require('./../../systeme/utilitaires/loggueur/loggueur.utilitaire.js');

/** Gestionnaire de cron. */
class GestionnaireCron {
  /** Initialise une nouvelle instance de la classe GestionnaireCron. */
  constructor() {
    console.log("Test Création");

    this.travaux = { } ;
    this.initialiser();
  }
  /** Méthode permettant d'initialiser les crons. */
  initialiser(){
    // Initialisation des éléments système.
    var bdd = new PontBDD();
    var gestionnaire = this;
    // Récupération de toutes les routines en place dans le système.
    var liste_routines = Chemin.rechercherFichiers(__dirname+'/../taches', ".*-routine.tache.js");
    // Initialisation des crons.
    gestionnaire.initialiserCrons(liste_routines)
    .then(function(travaux) {
      gestionnaire.travaux = travaux;
    }) // FIN : intialisation des crons.
    // Erreur: INitialisation des crons.
    .catch(function(erreur) { Logueur.erreur(erreur); });
  }
  /** Initialise les crons du gestionnaire.
    * @param liste_routines Liste des chemins vers les routines. */
  async initialiserCrons(liste_routines) {
    var resultat = [];
    for(var i=0; i<liste_routines.length; i++) {
      var cron = await this.initialiserCron(liste_routines[i]);
      resultat.push(cron);
    }
    return resultat;
  }
  /** Permet d'initialiser un cron.
    * @param chemin_fichier_routine Le chemin vers le fichier de routine. */
  async initialiserCron(chemin_fichier_routine) {
    // Récupération du nom du cron sur le nom de fichier.
    var match = chemin_fichier_routine.match(/([^/]+)-routine.tache.js$/);
    if(match == null) return null;
    // Récupération du nom de la routine.
    var nom_routine = match[1];
    // Récupération en base de données de la configuration de la routine
    var bdd = new PontBDD();
    var parametrage = await bdd.obtenirParametrageCron(nom_routine);
    var requis = require(chemin_fichier_routine);
    // Initialisation du cron.
    var resultat = new Cron(parametrage[0].id, parametrage[0].nom, parametrage[0].frequence, requis);
    // Démarrage du cron.
    resultat.demarrer();
    // Retour du résultat.
    return resultat;
  }
}
/** Export de la classe. */
module.exports = GestionnaireCron;
