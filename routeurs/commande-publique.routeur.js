const express = require('express');
const bodyParser = require('body-parser');

/* Initialisation du routeur. */
var routeur = express.Router();
/* Paramétrage du routeur. */
routeur.use(bodyParser.urlencoded({extended: false}));
routeur.use(bodyParser.json());

// Récupération des tâches du services.
const SignaturePieceMarcheService =  require('./../api/taches/commande-publique/signature-piece-marche-service.tache.js');
const SignaturePieceMarcheRoutine =  require('./../api/taches/commande-publique/signature-piece-marche-routine.tache.js');
const Flux = require('./../systeme/administration.systeme.js').flux.commande_publique;

/** */
routeur.post('/'+Flux.piece_signee_marche.SERVICE, function(requete, retour){
  var tache = new SignaturePieceMarcheService(requete, retour);
  tache.executer();
});

/** */
routeur.post('/maj-signature-piece-marche', function(requete, retour){
  var tache = new SignaturePieceMarcheRoutine(requete, retour);
  tache.executer();
});

// Export du module.
module.exports = routeur;
