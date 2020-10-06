const Tache = require('./../../../systeme/utilitaires/taches/tache.utilitaire.js');
const Traceur = require('./../../../systeme/utilitaires/traceur/traceur.utilitaire.js');

const Chemin = require('./../../../systeme/utilitaires/chemins/chemin.utilitaire.js');
const Chaine = require('./../../../systeme/utilitaires/chaines/chaine.utilitaire.js');

const parametres = require('./../../../systeme/administration.systeme.js').flux.administration.executer_routine;

/** Execute une routine. */
class ExecuterRoutineService extends Tache {
  /** Initialise une nouvelle instance de la classe 'Tache'.
    * La requête cliente.
    * Le port de réponse client. */
  constructor(requete, reponse) {
    super(requete, reponse)
  }
  /** Vérifie les preconditions pour executer la tache. */
  verifierPreconditions() {
    var message = "";
    var donnees = super.obtenirCorpsRequete();
    //if( !('id_entite' in donnees) || donnees['id_entite'] == null ) message += "Veuillez indiquer l'identifiant de l'entité du document pastell.\n";
    //if( !('id_document' in donnees) || donnees['id_document'] == null ) message += "Veuillez indiquer l'identifiant du document pastell.";
    if( !('nom_routine' in donnees) || donnees['nom_routine'] == null ) message += "Veuillez indiquer l'identifiant de la routine a executer.";

    if( Chaine.estNullOuVide(message) ) return { respect : true, donnees : donnees };
    return { respect : false, message : message };
  }
  /** Execute la tache. */
  executer() {
    var donnees = super.obtenirCorpsRequete();
    var traceur =  null;
    if( super.estAppelWeb() ) traceur = new Traceur(parametres.SERVICE+'-service', super.obtenirCorpsRequete().body);
    else traceur = new Traceur(parametres.SERVICE+'-routine', super.obtenirCorpsRequete().body);
    // Si les préconditions ne sont pas respecté arret de la routine.
    traceur.debuterAction("Récupértion de ta tache permettant d'exectuer le la routine.");
    var preconditions = this.verifierPreconditions();
    if(!preconditions.respect){
      // Trace du résultat de la préconditions.
      this.gererErreurNiveau1(traceur, preconditions, preconditions.message);
      // Fin
      return;
    }
    // Indication que l'action précédente est OK.
    traceur.finirAction(true);
    // Récupérationd es données de la requête.
    donnees = preconditions.donnees;
    // Récupération de ta tache permettant d'exectuer le la routine.
    traceur.debuterAction("Récupértion de ta tache permettant d'exectuer le la routine.");
    var chemin_fichier = Chemin.rechercheFichier(parametres.CHEMIN, donnees.nom_routine+'-routine.tache.js');
    if(chemin_fichier == null) {
      // Trace du résultat de la préconditions.
      this.gererErreurNiveau1(traceur, null, "Le fichier pour les routine de type : "+donnees.nom_routine+", n'a pas été trouvé.");
      // Fin
      return;
    }
    // Création de la routine.
    var requis = require(chemin_fichier);
    var routine = new requis( super.obtenirRequete(), super.obtenirReponse() );
    // Execution de la routine.
    routine.executer();
  }
  /** Gère le succès de la tache. */
  gererSucces(traceur) {
    // Fin e l'action de récupération des informations pastell.
    traceur.finirAction(true);;
    // Envoie de la réponse.
    this.envoiReponse(200, traceur.JSON(parametres.MESSAGE_SUCCES_ROUTINE));
  }
  /** Gère une erreur de niveau 1.
    * @param traceur Le traceur d'erreur.
    * @param erreur L'erreur lancer par le système. */
  gererErreurNiveau1(traceur, erreur, message){
    // Fin e l'action de récupération des informations pastell.
    traceur.finirAction(false);
    // Initialisation de l'erreur.
    traceur.log(erreur);
    // Envoie de la réponse.
    this.envoiReponse(500, traceur.JSON(parametres.MESSAGE_ERREUR_ROUTINE));
  }
}
// Export de la classe.
module.exports = ExecuterRoutineService;
