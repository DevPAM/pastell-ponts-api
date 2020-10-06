/** Indique si la chaîne de caractères est null ou vide.
    @param chaine La chaîne de caractères  */
function estNullOuVide(chaine) {
  return (chaine == undefined || chaine == null || chaine.trim() == "");
}
// Export des fonctions utilitaires.
module.exports = { estNullOuVide: estNullOuVide };
