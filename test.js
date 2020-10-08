process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
//const SignaturePieceMarcheRoutine = require('./api/taches/commande-publique/signature-piece-marche-routine.tache.js');
const ExecuterRoutineService = require('./api/taches/administration/executer-routine-service.tache.js');
var body = { body : { nom_routine: 'signature-piece-marche', id_entite : 25, id_document : 'hQdRw1' } };
var service = new ExecuterRoutineService(body, null);
service.executer();
