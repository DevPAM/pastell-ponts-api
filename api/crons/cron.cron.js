var CronJob = require('cron').CronJob;
const PontBDD = require('./../services/bdds/ponts.bdd.js');
const Loggueur = require('./../../systeme/utilitaires/loggueur/loggueur.utilitaire.js');

/** Classe définisasnt un cron */
class Cron {
  /** Initialise une nouevelle instance de la classe 'Cron'.
    * @param type Le type du cron.
    * @param frequence La fréquence à laquelle le cron doit s'executer.
    * @param tache La tâche a éxecuter. */
  constructor(id, type, frequence, tache) {
    this.id= id;
    this.frequence = frequence;

    this.travail = new CronJob(frequence, this.executer, null, true, "Europe/Paris");
    this.travail.type = type;
    this.travail.tache = tache;
  }
  /** Modifie la fréquence de la tâche.
    * @param frequence La nouvelle fréquence du cron. */
  modifierFrequence(frequence) {
    this.travail.setTime(frequence);
  }
  /** Stoppe le cron. */
  stoper() {
    this.travail.stop();
  }
  /** Demarre */
  demarrer() {
    this.travail.start();
  }
  /** Execute le cron. */
  executer() {
    var cron = this;
    var bdd = new PontBDD();
    // Récupération de tous les document dont le type correspond au cron.
    bdd.obtenirDocumentsEnCours(this.type)
    .then(function(liste_documents) {
      // Pour chaque document execution de la méthode.
    for(var i=0; i<liste_documents.length; i++)
      new cron.tache({ body : { id_entite : liste_documents[i].entite, id_document : liste_documents[i].document } }).executer();
    }) // FIN : Récupération de tous les document dont le type correspond au cron.
    // ERREUR : Récupération de tous les document dont le type correspond au cron.
    .catch(function(erreur) { Loggueur.erreur(erreur) });
  }
}
// Export de la classe.
module.exports = Cron;
