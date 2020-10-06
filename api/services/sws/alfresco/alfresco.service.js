const CreerNoeud = require('./appels/noeuds/creer_noeud.appel.js');
const DetailNoeud = require('./appels/noeuds/detail_noeud.appel.js');
const SupprimerNoeud = require('./appels/noeuds/supprimer_noeud.appel.js');
const VerouillerNoeud = require('./appels/noeuds/verouiller_noeud.appel.js');
const DeverouillerNoeud = require('./appels/noeuds/deverouiller_noeud.appel.js');
const ObtenirContenueNoeud = require('./appels/noeuds/obtenir_contenu_noeud.appel.js');
const ModifierContenuNoeud = require('./appels/noeuds/modifier_contenu_noeud.appel.js');
const ObtenirListeNoeudsEnfants = require('./appels/noeuds/obtenir_liste_noeud_enfant.appel.js');

/** Classe pour les services web Alfresco. */
class AlfrescoService {
  /** Initialise une nouvelle instance de la classe 'AlfrescoService'. */
  constructor() { }
  /** Méthode permettant de récupérer le détail d'un noeud.
    * @param id_noeud L'identifiant du noeud. */
  async detailNoeud(id_noeud) {
    var appel = new DetailNoeud(id_noeud);
    return await appel.appeler();
  }
  /** Méthode permettant de créer un noeud dans un noeud.
    * @param id_noeud_parent L'identifiant du noeud dans lequel créer le nouvel éléments.
    * @param nom_noeud Le nom du nouvel élement.
    * @param type_noeud Le type du noeud. (cm:folder|cm:content)*/
  async creerNoeud(id_noeud_parent, nom_noeud, type_noeud) {
    var appel = new CreerNoeud(id_noeud_parent, nom_noeud, type_noeud);
    return await appel.appeler();
  }
  /** Méthode permettant de créer un noeud.
    * @param id_noeud L'identifiant du noeud. */
  async supprimerNoeud(id_noeud) {
    var appel = new SupprimerNoeud(id_noeud);
    return await appel.appeler();
  }
  /** Méthode permettant de créer un noeud de manière asynchrone.
    * @param id_noeud L'identifiant du noeud. */
  supprimerNoeudAsync(id_noeud) {
    var appel = new SupprimerNoeud(id_noeud);
    appel.appelerAsync();
  }
  /** Permet d'obtenir la liste des noeud enfants.
    * @param id_noeud L'identifiant du noeud pour lequel on souhaite récupérer les enfants.*/
  async obtenirListeNoeudsEnfants(id_noeud) {
    var appel = new ObtenirListeNoeudsEnfants(id_noeud);
    return await appel.appeler();
  }
  /** Modifie le contenu du noeud.
    * @param id_noeud L'identifiant du noeud à modifier.
    * @param contenu Le contenu du fichier. */
  async modifierContenuNoeud(id_noeud, contenu) {
    var appel = new ModifierContenuNoeud(id_noeud, contenu);
    return await appel.appeler();
  }
  /** Dévérouille un noeud dans Alfresco.
    * @param id_noeud L'identifiant du noeud. */
  deverouillerNoeud(id_noeud) {
    var appel = new DeverouillerNoeud(id_noeud);
    appel.appeler();
  }
  /** Verrouille un noued en GED.
    * @param id_noeud L'identifiant du noeud à verrouiller. */
  async verouillerNoeud(id_noeud){
    var appel = new VerrouillerNoeud(id_noeud);
    return await appel.appeler();
  }
  /** Permet de récupérer le contenu d'un noeud.
    * @param id_noeud L'identifiant du noeud. */
  async obtenirListeNoeudsEnfants() {
    var appel = new ObtenirListeNoeudsEnfants(id_noeud);
    return await appel.appeler();
  }
  /** Méthode permettant de récupérer le contenu d'un noeud.
    * @param id_noeud L'identifiant du noeud. */
  async obtenirContenuNoeud(id_noeud) {
    var appel = new ObtenirContenueNoeud();
    return await appel.appeler();
  }
  /************* CUSTOM ******************/
  /** Permet de supprimer un noeud par son nom.
    * @param id_noeud_parent L'identifiant du noeud.
    * @param nom_noeud Le nom du noeud recherché. */
  async supprimerNoeudEnfantParNom(id_noeud_parent, nom_noeud) {
    var noeuds_enfants = await this.obtenirListeNoeudsEnfants(id_noeud_parent);
    // Recherche du noeud enfant par son nom.
    var max = noeuds_enfants.list.entries.length;
    var index = 0;
    while(index < max && noeuds_enfants.list.entries[index].entry.name != nom_noeud) index++;
    if(index == max) return null;
    return await this.supprimerNoeud(noeuds_enfants.list.entries[index].entry.id);
  }
  /** Modification du contenu du fichier.
    * @param nom_fichier Le nom du fichier.
    * @param contenu Le contenu du fichier. */
  async creationFichier(id_noeud_parent, nom_fichier, contenu) {
    var noeud = await this.creerNoeud(id_noeud_parent, nom_fichier, 'cm:content');
    return await this.modifierContenuNoeud(noeud.entry.id, contenu);
  }
  /** Méthode permettant de récupérer le contenu d'un neoud.
    * @param id_noeud L'identifiant Alfresco du noeud. */
  async obtenirNomContenuNoeud(id_nieud) {
    // Création du résultat.
    var resultat =  { };
    // Appel des service nécessaires.
    var detail_noeud = await this.detailNoeud(id_noeud);
    // Intiialisation du résultat.
    resultat.contenu = await this.ObtenirContenueNoeud();
    resultat.nom = detail_noeud.entry.name;
    resultat.id_parent = detail_noeud.entry.parentId;
    // retour du resultat.
    return resultat;
  }
  /** Méthode permettant de récupérer le contenus d'une listes de noeuds.
    * @param ids_noeuds La liste des identifiants des noeuds. */
  async obtenirNomsContenusNoeuds(ids_noeuds) {
    // Test de la préconditions.
    if(ids_noeuds == undefined || ids_noeuds == null ) return [];
    // Creation du resulat.
    var resultat = [];
    // Récupération du contenues des fichiers.
    for(var i=0; i<ids_noeuds.length; i++)
      resultat.push(await this.obtenirNomContenuNoeud(ids_noeuds[i]));
    // Retour du résulat.
    return resultat;
  }
}
// Export de la classe.
module.exports = AlfrescoService;
