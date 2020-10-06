/** CLasse permettant de de gérer une action. */
class Action {
  /** Initialise une novelle instance de la classe Action.
    * @param nom Le nom de l'action. */
  constructor(action) {
    this.action = action;
    this.date_fin = null;
    this.execution = null;
    this.date_debut = Date.now();
    this.temps_execution = null;
  }
  /** Met fin à l'action.
    * @param execution le resultat de l'execution. */
  finirAction(execution) {
    this.date_fin = Date.now();
    this.execution = execution;
    this.temps_execution = this.date_fin - this.date_debut;
  }
  /** Traduit en JSON la classe. */
  JSON() {
    return {
      action: this.action,
      execution : this.execution ? 'OK' : 'ERREUR',
      date_debut: this.dateEnChaine(this.date_debut),
      date_fin: this.dateEnChaine(this.date_fin),
      temps_execution : this.temps_execution+'ms'
    };
  }
  /** Traduit une date en chaîne de caractères.
    * @param date La date à traduire. */
    dateEnChaine(date){
    var d = new Date(date);
    return d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+':'+d.getMilliseconds();
  }
}
// Export du module.
module.exports = Action;
