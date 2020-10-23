process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var bodyParser = require('body-parser');
const express = require('express');
var cors = require('cors');

const api = express();

// Paramétrage de l'API.
api.use(bodyParser.urlencoded({extended: false}));
api.use(bodyParser.json());
api.use(cors());

// Définition des routeurs utilisés.
var commande_publique_routeur = require('./routeurs/commande-publique.routeur.js');
var administration_routeur = require('./routeurs/administration.routeur.js');
var flux = require('./routeurs/flux.routeur.js');

// Utilisation des routeurs par l'API.
api.use('/commande-publique', commande_publique_routeur);
api.use('/administration', administration_routeur);
api.use('/flux', flux);
// api.use('/crons', cron)

// Ouverture du port pour écoute.
api.listen(80, function(){
  console.log('*************************************************');
  console.log('*               PASTELL - PONTS                 *');
  console.log('*************************************************');
  console.log(' +  Lancement du web service sur le port 80...');
});
