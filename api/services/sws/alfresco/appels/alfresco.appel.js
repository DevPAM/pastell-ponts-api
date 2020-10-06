const AppelService = require('./../../../../../systeme/utilitaires/sw/appel-service.utilitaire.js');

// Récupération des paramèter du service web.
const administration = require('./../../../../../systeme/administration.systeme.js');
const parametres = administration.services.alfresco[administration.env];

/** Classe peremttant d'appeler in service web Alfresco. */
class AlfrescoAppelService extends AppelService {
  /** Initalise une nouvelle instance de la classe 'AlfrescoAppelService'. */
  constructor(methode, service) {
    super(methode, parametres.hote, service);
    super.authentification(parametres.type_aut, parametres.login, parametres.mdp);
  }
}
// Export du module.
module.exports = AlfrescoAppelService;
