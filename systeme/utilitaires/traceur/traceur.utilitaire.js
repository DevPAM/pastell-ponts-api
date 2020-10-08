const Action = require('./action-traceur.utilitaire.js');

/** Classe permettant pour gérer les informations. */
class Traceur {
  /** Initialise une nouvelle instance de la classe 'Information'.
    * @param service Le service appelé.
    * @param parametres Les parametres utlisés lors de l'appel. */
  constructor(service, parametres) {
    this.fin = null;
    this.actions = [];
    this.succes = null;
    this.erreur = null;
    this.donnees = { };
    this.message = null;
    this.service = service;
    this.debut = new Date();
    this.parametres = parametres;
  }
  /** Débute ube action.
    * @param action L'action à logger. */
  debuterAction(action) {
    this.actions.push(new Action(action));
  }
  /** Indique la fin de la dernière action en cours.
    * @param succes Le succes ou non de la dernière action menée. */
  finirAction(succes) {
    var index = this.actions.length - 1;
    this.actions[index].finirAction(succes);
  }
  /** Ajoute une données.
    * @param cle La clé de la valeur.
    * @param valeur La valeur de la clé. */
  ajouterDonnees(cle, valeur){
    this.donnees[cle] = valeur;
  }
  /** Ajoute une erreur et indque l'execution en erreur.
    * @param erreur L'erreur retourner par le service. */
  log(erreur) {
    this.erreur = erreur;
  }
  /** Modifie le message du traceur.
    * @param message*/
  finirTrace(succes, message) {
    this.succes = succes;
    this.fin = Date.now();
    this.message = message;
  }
  /** Transforme en JSON de la classe. */
  JSON() {
    // Récupération des actions au format JSON.
    var actions = [];
    for(var i=0; i<this.actions.length; i++)
      actions.push( this.actions[i].JSON() );
    // Retour du format JSON.
    return  {
      succes : this.succes,
      message : this.message,
      erreur_service : this.erreur,
      informations : {
        service : this.service,
        date : this.dateEnChaine(this.debut),
        heure_debut : this.dateEnHeure(this.debut),
        heure_fin : this.dateEnHeure(this.fin),
        temps_execution : (this.fin - this.debut) + 'ms',
        parametres : this.parametres
      },
      actions : actions,
      donnees : this.donnees
    };
  }
  /** Transforme en Texte de la classe. */
  TEXT() {
    var resultat = "===================================================================================================================\n";
    // Date de début de l'action.
    resultat += "DATE : "+ this.dateEnChaine(this.debut) + "\n";
    // Heures
    resultat += "DEBUT : "+ this.dateEnHeure(this.debut) + "\n";
    resultat += "FIN : "+ this.dateEnHeure(this.fin) + "\n";
    // Temps d'execution
    resultat += "TEMPS D'EXECUTION : "+ (this.fin - this.debut) + 'ms' + "\n";
    // Le succes de la requête.
    resultat += "SUCCES :"+ this.succes +"\n";
    // Le message.
    resultat += "MESSAGE : "+ this.message +"\n";
    // L'erreur.
    if(this.erreur != null) {
      try{ resultat += "ERREUR : " +JSON.stringify(this.erreur) + "\n";
      }catch(erreur){ resultat += "ERREUR : " + this.erreur+"\n"; }
    }
    // Les actions.
    for(var i=0; i<this.actions.length; i++)
      resultat +=  this.actions[i].TEXT();
    // parametres utilisés
    resultat += "PARAMETRES : ";
    try{ resultat += JSON.stringify(this.parametres) + "\n";
  }catch(erreur) { resultat += this.parametres + "\n"; };
    // Donnees
    resultat += "DONNEES : ";
    try{ resultat += JSON.stringify(this.donnees) + "\n";
    }catch(erreur) { resultat += this.donnees + "\n"; } ;
    // Retour du résulat.
    return resultat;
  }
  /** Traduit une date en chaîne de caractères.
    * @param date La date à traduire. */
  dateEnHeure(date){
    var d = new Date(date);
    return d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+':'+d.getMilliseconds();
  }
  /** Traduit une date en chaîne de caractères.
    * @param date La date à traduire. */
    dateEnChaineComplete(date){
    var d = new Date(date);
    return d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+':'+d.getMilliseconds();
  }
  /** Traduit une date en chaîne de caractères.
    * @param date La date à traduire. */
    dateEnChaine(date){
    var d = new Date(date);
    return d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
  }
}
// Export du module.
module.exports = Traceur;
