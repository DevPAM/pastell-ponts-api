const winston = require('winston');
const rotation = require('winston-daily-rotate-file');

// Récupération des paramètes d'environnement.
const administration = require('./../../administration.systeme.js');
const parametre = administration.logs[ administration.env ];

// Mis en place du transport.
var transport = new rotation({
  filename : parametre.nom_fichier,
  dirname: parametre.chemin,
  datePattern : 'YYYY-MM-DD',
  maxFiles : '30d'
});
// Création du logueur.
const logger = winston.createLogger({
format: winston.format.combine(
  winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  winston.format.prettyPrint(),
  winston.format.printf(error => `${error.message}`)
),
transports: [transport]
});
// Export du loggueur.
module.exports = logger;
