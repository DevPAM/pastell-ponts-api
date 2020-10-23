const express = require('express');
const bodyParser = require('body-parser');

/* Initialisation du routeur. */
var routeur = express.Router();
/* Paramétrage du routeur. */
routeur.use(bodyParser.urlencoded({extended: false}));
routeur.use(bodyParser.json());

// Récupération des tâches du services.
const ListerFluxTypeService =  require('./../api/taches/flux/lister-flux-type-service.tache.js');
/** */
routeur.post('/lister-flux-type-service', function(requete, retour){
  var tache = new ListerFluxTypeService(requete, retour);
  tache.executer();
});
// Export du module.
module.exports = routeur;
