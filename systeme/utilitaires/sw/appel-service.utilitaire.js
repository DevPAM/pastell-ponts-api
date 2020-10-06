const fetch = require('node-fetch');

const chaine = require('./../chaines/chaine.utilitaire.js');

const Headers = fetch.Headers;

/** Classe permettant d'invoquer un service web. */
class AppelService {
  /** Initialise une nouvelle instance de la classe 'Invoqueur'.
      @param methode La méthode d'appel HTTP du service.
      @param hote L'adresse de l'hôte du service.
      @param service Le service appelé. */
  constructor(methode, hote, service) {
    // Vérification des précondition de la méthode.
    if(chaine.estNullOuVide(service)) throw "L'adresse de l'hôte est vide.";
    if(chaine.estNullOuVide(methode)) throw "Le service est vide.";
    if(chaine.estNullOuVide(hote)) "[Invoqueur - constructor] La méthode HTTP est vide.";
    // Intialisation des éléments.
    this.corps_message = null;
    this.hote = hote;
    this.methode = methode;
    this.service = service;
    this.headers = new Headers();
  }
  /** Récupère la méthode pour atteindre le service. */
  obtenirMethode() { return this.methode; }
  /** Récupère l'adresse de l'hôte. */
  obtenirHote(){ return this.hote; }
  /** Récupère le service à atteindre. */
  obtenirService(){ return this.service; }
  /** Récupère L'header de la requête. */
  obtenirHeaders(){ return this.headers; }
  /** Modifie le service utilisé.
      @param service Le nouveau service utilisé. */
  modifierService(service) {
    if(chaine.estNullOuVide(service)) throw  "Le service ne peut être null ou vide.";
    this.service = service;
  }
  /** Initialise l'authentification sur le serveur.
      @param type Le type de l'authentification.
      @param login Le login de connexion.
      @param mot_de_passe Le mot de passe lié au login. */
  authentification(type, login, mot_de_passe) {
    // Vérification des précondition de la méthode.
    if(chaine.estNullOuVide(type)) throw "Le service est vide.";
    if(chaine.estNullOuVide(login)) throw "Le service est vide." ;
    if(chaine.estNullOuVide(mot_de_passe)) throw "La méthode HTTP est vide.";
    // Ajouter une l'entête adequate selon le type.
    if(type.toLowerCase() == 'basic') {
      this.ajouterEntete('Authorization', 'Basic '+ Buffer.from(login+':'+mot_de_passe, "utf8").toString("base64") );
      return;
    }
    // Le type d'authentification n'est pas gérer.
    throw "Vous devez implémenter cette authentification ('"+type+"')."
  }
  /** Ajoute une en-tête à la requête.
      @param cle La clé de l'entête.
      @param valeur La valeur de la clé. */
  ajouterEntete(cle, valeur) {
    // Vérification des préconditions.
    if(chaine.estNullOuVide(cle)) throw "L'entête ne peut être vide.";
    if(chaine.estNullOuVide(valeur)) throw "La valeur de l'entête ne peut être vide.";
    // Ajout de l'en-tête.
    this.headers.append(cle, valeur);
  }
  /** Modifie le corps du message pour l'appel du service.
      @param corps_message Le nouveau corps du message. */
  modifierCorpsMessage(corps_message) {
    this.corps_message = corps_message;
  }
  /** Invoque le service. */
  async appelSync() {
    // Intialisation des options.
    var options = { method: this.methode, headers : this.headers }
    // Modification du coups si il y en a de présent.
    if(this.corps_message != null) options.body = this.corps_message;
    // appel du service.
    return await fetch(this.hote+this.service, options);
  }
  /** Invoque le service. */
  appelAsync() {
    return fetch;
  }
}
// Export de la classe.
module.exports = AppelService;
