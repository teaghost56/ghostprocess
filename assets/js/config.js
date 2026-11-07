/* =========================================================================
   Ghostprocess — RÉGLAGES DU SITE
   C'est le seul fichier à modifier pour brancher le site.
   ========================================================================= */
window.GP_CONFIG = {
  /* URL "Production URL" du nœud Webhook n8n (workflow fourni dans /n8n).
     Exemple : "https://votre-instance.app.n8n.cloud/webhook/ghostprocess-contact"
     Laissez vide tant que le workflow n'est pas actif : le formulaire proposera WhatsApp/e-mail. */
  WEBHOOK_URL: "",

  /* Numéro WhatsApp de Ghostprocess, format international SANS + ni espaces.
     Exemple : "21620123456". Vide = le bouton WhatsApp renvoie vers le formulaire. */
  WHATSAPP_NUMBER: "21656517360",

  /* Message pré-rempli quand un visiteur clique sur un bouton WhatsApp */
  WHATSAPP_MESSAGE: "Bonjour Ghostprocess, je souhaite un appel découverte.",

  /* Adresse e-mail affichée sur le site */
  EMAIL: "contact@ghostprocess.net",

  /* Places restantes du programme pilote (0 à 3) */
  PILOT_SEATS_LEFT: 3,

  /* Délai max d'envoi du formulaire (millisecondes) */
  FORM_TIMEOUT_MS: 15000,
};
