process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
//const SignaturePieceMarcheRoutine = require('./api/taches/commande-publique/signature-piece-marche-routine.tache.js');

/*const ExecuterPiecesigneeService = require('./api/taches/commande-publique/signature-piece-marche-service.tache.js');
var body = { body : { nomDossier : "Nom du dossier", directionOperationnelle : "DSI", objetConsultation : "Objet du marché XXXXXXXXXX-2", numeroMarche: "Lot-00-0000000001", numeroConsultation : "000000001", idDocumentASigner: "10d916d4-e18f-4c3a-89c0-b441a946365b", idDocumentsAnnexes : [  ] } };
var service = new ExecuterPiecesigneeService(body, null);
service.executer();*/


const ExecuterRoutineService = require('./api/taches/administration/executer-routine-service.tache.js');
var body = { body : { nom_routine: 'signature-piece-marche', id_entite : 25, id_document : 'LMlgGnx' } };
var service = new ExecuterRoutineService(body, null);
service.executer();

/*const test = require('./systeme/utilitaires/chemins/chemin.utilitaire.js');
console.log(test.rechercherFichiers('./api/taches', ".*-routine.tache.js"));*/

/*const GestionnaireCron = require("./api/crons/gestionnaire-cron.cron.js");
var gestionnaire = new GestionnaireCron();*/
