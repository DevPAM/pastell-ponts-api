const express = require('express');
const bodyParser = require('body-parser');

/* Initialisation du routeur. */
var routeur = express.Router();
/* Paramétrage du routeur. */
routeur.use(bodyParser.urlencoded({extended: false}));
routeur.use(bodyParser.json());

// Récupération des tâches du services.
const ExecuterRoutineService =  require('./../api/taches/administration/executer-routine-service.tache.js');
const Flux = require('./../systeme/administration.systeme.js').flux.commande_publique;

/** Service permettant d'executer un service données. */
routeur.post('/executer-routine', function(requete, retour){
  var tache = new ExecuterRoutineService(requete, retour);
  tache.executer();
});
// Export du module.
module.exports = routeur;
