var mysql = require('mysql');
var util = require('util');

/** @class Classe permettant d'executer des requête SQL vers une base de données MySQL. **/
class MySql {
  /** @meth Initalise une nouvelle instance de la classe 'MySql'.
      @arg hote L'hôte de la base de données.
      @arg usager Le nom de l'usager de la base de données.
      @arg mot_de_passe Le mot de passe de l'usager.
      @arg base_de_donnees Le nom de la base de données.**/
  constructor(hote, usager, mot_de_passe, base_de_donnees ) {
    this.hote = hote;
    this.usager = usager;
    this.mot_de_passe = mot_de_passe;
    this.base_de_donnees  = base_de_donnees;
  }
  /** @meth obtenirConnexion Permet d'obtenir une connexion vers la base de données.
      @return Une instance de la classe 'Promise' contenant une connexion vers la base de données. **/
  async obtenirConnexion() {
    var mySql = this;
    // Initialisation des paramètres de connexions.
    var connexion = mysql.createConnection({
      host : mySql.hote,
      user : mySql.usager,
      password: mySql.mot_de_passe,
      database: mySql.base_de_donnees
    });
    // En attente d'un connexion.
    await connexion.connect(function(erreur){
      if(erreur) throw erreur;
    });
    // Préparation du système de requêtage en Pomise.
    connexion.query = util.promisify(connexion.query);
    return connexion;
  }
  /** @meth executer Execute Une requête vers la base de données de manière synchrone.
      @arg requete The request to executer on the database.
      @return A Promise that executer the request. **/
  async executerSync(requete){
    var connexion = await this.obtenirConnexion();

    if(connexion instanceof Error) throw  connexion.erreur;
    var resultat = null;
    try {
      resultat = await connexion.query(requete);
    }catch(erreur){
      connexion.end();
      throw erreur;
    }
    connexion.end();
    return resultat[0];
  }
  /** @meth Execute une requête su la base de données de manière asynchrone.
    * @param requete La requete a executer.
      @return Une instance de la classe 'Promise' contenant une connexion vers la base de données. **/
  executerAsync(requete) {
    var mySql = this;
    // Création de la connexion.
    var connexion = mysql.createConnection({
      host : mySql.hote,
      user : mySql.usager,
      password: mySql.mot_de_passe,
      database: mySql.base_de_donnees
    });
    // Test de la connexion.
    connexion.connect(function(erreur){
      // Connexion raté.
      if(erreur) console.log(erreur);
      // Execution de la requête.
      connexion.query(requete, function(err, result){
        // Erreur lors de l'execution de la requête.
        if(err) console.log(err);
        connexion.end();
        // La reqête s'et bien executé. fin.
        return;
      });
    });
  }
  /** @meth formaterVariable Formatte une varible pour requete.
    * @arg variable La variable à formatter. */
  formaterVarchar(variable){
    if(variable == null || variable == undefined) return 'null';
    return "'"+variable+"'";
  }
}
// Export de la classe.
module.exports = MySql;
