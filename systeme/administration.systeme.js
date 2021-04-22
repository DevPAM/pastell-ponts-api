var administration_statique = require('./administration-statique.systeme.js');
module.exports = {
  env : 'DEV', // ('DEV'|'REC'|'PRO')
  port: 8080,
  flux : administration_statique,
  bdds : {
    ponts :{
      DEV : { hote: 'localhost', login: 'xxxx', mdp: 'xxxx', bdd: 'xxxxxxx' },
      REC : { hote: '', login: '', mdp: '', bdd: '' },
      PRO : { hote: '', login: '', mdp: '', bdd: '' },
    }
  },
  services : {
    pastell : {
      DEV : { hote: 'https://pastell-tst.intranet.cg59.fr/api/v2/', type_aut: 'basic', login: 'xxxxxxxxxxxxx', mdp: 'xxxxxxxxx' },
      REC : { hote: '', type_aut: '', login: '', mdp: '' },
      PRO : { hote: '', type_aut: '', login: '', mdp: '' }
    },
    alfresco : {
      DEV : { hote: 'https://gaia-siap.intranet.cg59.fr/alfresco/api/-default-/public/alfresco/versions/1/', type_aut: 'basic', login: 'xxxxxxxxxxx', mdp: 'xxxxxx' },
      REC : { hote: '', type_aut: '', login: '', mdp: '' },
      PRO : { hote: '', type_aut: '', login: '', mdp: '' }
    }
  },
  logs : {
    DEV : { chemin : __dirname+'/../logs', nom_fichier : '%DATE%-pastell-ponts.log' },
    REC : { chemin : null , nom_fichier : null },
    PRO : { chemin : null, nom_fichier : null }
  }
};
