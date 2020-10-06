const Logueur = require('./../loggueur/loggueur.utilitaire.js');
const env = require('./../../administration.systeme.js').env;

/** Classe permettant de gérer un tâche du système. */
class Tache {
  /***** CONSTRUCTEURS *****/
  /** Initialise une nouvelle instance de la classe 'Tache'.
    * La requête cliente.
    * Le port de réponse client. */
  constructor(requete, reponse) {
    this.requete = requete;
    this.reponse = reponse;
  }
  /***** GETTERS *****/
  /** Méthode permettant d'obtenir le corps de la requête cliente. */
  obtenirCorpsRequete() {
    if(!this.estRequeteValide()) return null;
    return this.requete.body;
  }
  /** Méthode permettant de récupérer la requete cliente. */
  obtenirRequete() {
    return this.requete;
  }
  /** Méthode permettant de récupérer le connecteur de réponse au client. */
  obtenirReponse() {
    return this.reponse;
  }
  /***** ACTIONS *****/
  /** Envoie la réponse au client. */
  envoiReponse(status, reponse) {
    // Log de la réponse si la requête à un retour négatif.
    if(status != 200 && status != 202) {
      Logueur.error(reponse);
      if(env == 'DEV') console.log(reponse);
    }
    // Vérification que la réponse existe.
    if(!this.estAppelWeb()) return;
    // Envoie de la réponse au client.
    else this.reponse.status(status).send(reponse);
    // Fin
    return;
  }
  /***** PRECONDITIONS *****/
  /** Vérifie que la requête fournit par le client est valide. */
  estRequeteValide() {
    // Vétification que la requête est expoloitable.
    if(this.requete == undefined || this.requete == null || this.requete.body == undefined || this.requete.body == null) return false;
    return true;
  }
  /** Vérifie si c'est appel interne ou web/ */
  estAppelWeb() {
    // Vérification que la réponse existe.
    if(this.reponse == undefined ||this.reponse == null) return false;
    return true;
  }
}
// Export du module.
module.exports = Tache;
