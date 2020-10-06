const fs = require('fs');
/** Reche un fichier sur un chemin donné. */
function rechercheFichier(chemin, nom_fichier) {
  var resultat = null;
  // Ouverture du dossier.
  var dossier = fs.opendirSync(chemin);
  // Lecture du premier élément du dossier.
  var contenu = dossier.readSync();
  // Recherche du fichier.
  while(contenu != null && resultat == null) {
    var nouveau_chemin = chemin + '/' + contenu.name;
    // Si le contenu est un dossier recherche dans ce dossier du fichier.
    if(contenu.isDirectory()) resultat = this.rechercheFichier(nouveau_chemin, nom_fichier);
    // Test si le fichier à le même nom que celui recherché.
    else if( contenu.name == nom_fichier ) resultat = nouveau_chemin;
    // Passage au proche élément du dossier.
    contenu = dossier.readSync();
  }
  dossier.close();
  return resultat;
}
// Export du module.
module.exports = { rechercheFichier : rechercheFichier };
