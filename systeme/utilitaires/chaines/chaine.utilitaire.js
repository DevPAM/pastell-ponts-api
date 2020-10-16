/** Indique si la chaîne de caractères est null ou vide.
    @param chaine La chaîne de caractères  */
function estNullOuVide(chaine) {
  return (chaine == undefined || chaine == null || chaine.trim() == "");
}
/** Permet d'obtenir la date actuel au format 'string' */
function obtenirDate(){
  var d = Date.now();
  return d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
}
// Export des fonctions utilitaires.
module.exports = { estNullOuVide: estNullOuVide, obtenirDate: obtenirDate };
