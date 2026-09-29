// "Étapes suivies" content per project (text only — no images).
// Written from the Tachrone project sheets
// (https://tachrone.ma/fr/profil/lahlou-workers/4672).
// Résidences MISSIMI keeps its image steps on its page and is intentionally
// absent here.
import type { TimelineStep } from "@/components/project-timeline";

export const PROJECT_STEPS: Record<string, TimelineStep[]> = {
  "immeuble-r-plus-5": [
    { title: "Terrassement", text: "Fouilles en pleine masse et évacuation des déblais." },
    { title: "Fondations", text: "Radier et semelles adaptés aux descentes de charges." },
    {
      title: "Post-tension",
      text: "Pose des câbles, coulage, puis mise en tension contrôlée des dalles.",
    },
    { title: "Élévation", text: "Voiles et poteaux montés au rythme des cycles de tension." },
    { title: "Contrôles", text: "Vérifications géométriques et relevés à chaque niveau." },
    { title: "Livraison", text: "Structure réceptionnée, prête pour le second œuvre." },
  ],
  "villas-piscines": [
    { title: "Terrassement", text: "Plateformes et fouilles des bassins." },
    { title: "Fondations", text: "Semelles filantes et radier piscine." },
    { title: "Gros œuvre", text: "Élévation des murs et planchers des 3 villas." },
    { title: "Piscines", text: "Structures, étanchéité et pièces à sceller." },
    { title: "Finitions", text: "Enduits et détails haut de gamme." },
    { title: "Livraison", text: "Villas prêtes à vivre, bassins en eau." },
  ],
  "usine-ciment-tan-tan": [
    { title: "Terrassement", text: "Grandes plateformes industrielles et pistes de chantier." },
    { title: "VRD", text: "Voiries, réseaux secs et humides, assainissement." },
    { title: "Gros œuvre", text: "Ouvrages béton et massifs techniques." },
    { title: "Espaces verts", text: "Plantations et arrosage intégré." },
    { title: "Réception", text: "Levée des réserves avec l’industriel, un an de suivi." },
  ],
  "siege-administratif": [
    { title: "Conception", text: "Plans d’aménagement et phasage en site occupé." },
    { title: "Curage", text: "Dépose sélective, tri et évacuation des gravats." },
    { title: "Aménagement", text: "Cloisons, faux plafonds, électricité et plomberie." },
    { title: "Finitions", text: "Peinture, sols et menuiseries." },
    { title: "Réception", text: "Remise des clés, site resté en activité." },
  ],
  "bureaux-orosand": [
    { title: "Conception", text: "Plans, matériaux et planning validés avec le client." },
    { title: "Second œuvre", text: "Cloisons, sols, peinture, lots techniques." },
    { title: "Habillages", text: "Habillages muraux et détails sur mesure." },
    { title: "Ameublement", text: "Mobilier posé et réglé pièce par pièce." },
    { title: "Réception", text: "Bureaux prêts à travailler." },
  ],
};
