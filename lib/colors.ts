// ─────────────────────────────────────────────────────────────────────────────
// Palette inspirée des couleurs traditionnelles de l'Ouest du Cameroun
// (pays Bamiléké / Grassfields) : le tissu royal Toghu — velours noir brodé
// de rouge, or et bleu indigo — ainsi que le vert des tissus Ndop.
// ─────────────────────────────────────────────────────────────────────────────

export const CAMEROON = {
  black: '#171210',   // velours Toghu
  red: '#A81C1C',      // rouge royal
  gold: '#D4A017',     // broderie or
  indigo: '#1F3A63',   // bleu indigo
  green: '#2F5233',    // vert Ndop
  goldLight: '#E8B923',
}

// Couleur attribuée à chaque nouvelle personne selon sa génération.
export const GEN_COLORS: Record<number, string[]> = {
  1: [CAMEROON.red, CAMEROON.gold],
  2: [CAMEROON.gold, CAMEROON.indigo, CAMEROON.green, CAMEROON.red, CAMEROON.black, CAMEROON.indigo, CAMEROON.green],
  3: [CAMEROON.indigo, CAMEROON.green, CAMEROON.gold, CAMEROON.red, CAMEROON.black],
  4: [CAMEROON.green, CAMEROON.indigo, CAMEROON.gold, CAMEROON.red],
  5: [CAMEROON.gold, CAMEROON.red, CAMEROON.indigo, CAMEROON.green],
}
