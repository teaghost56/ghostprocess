/* =========================================================================
   Ghostprocess — SCHÉMAS ANIMÉS DE LA SECTION « SOLUTIONS »
   Une entrée par solution. Les clés (collect, book…) doivent correspondre aux
   data-flow des onglets et des cartes dans index.html.
     title  : titre affiché au-dessus du schéma
     besoin : option pré-sélectionnée dans le formulaire de contact
     cta    : texte du lien d'action
     steps  : 4 étapes { icon, title, text }  (icon = nom d'un symbole #i-… de index.html)
   Ces schémas sont illustratifs : ils expliquent le principe, rien n'est exécuté.
   ========================================================================= */
window.GP_FLOWS = {
  collect: {
    title: "GhostCollect · relance des impayés",
    besoin: "impayes",
    cta: "Demander GhostCollect →",
    steps: [
      { icon: "table", title: "Votre fichier", text: "Factures, chèques et traites lus dans Excel ou Google Sheets." },
      { icon: "search", title: "Analyse des échéances", text: "Regroupées par client, avec le bon message selon la date." },
      { icon: "send", title: "Rappel envoyé", text: "Sur WhatsApp, ou par e-mail en secours." },
      { icon: "bell", title: "Suivi", text: "Historique mis à jour, alerte quand un client est à appeler." },
    ],
  },
  book: {
    title: "GhostBook Pro · rendez-vous sur WhatsApp",
    besoin: "rendez-vous",
    cta: "Demander GhostBook Pro →",
    steps: [
      { icon: "chat", title: "Demande du client", text: "« 3andkom place jeudi ? » sur WhatsApp, à toute heure." },
      { icon: "cal", title: "Vérification", text: "Prestations, horaires et créneaux libres de votre agenda." },
      { icon: "check", title: "Réservation confirmée", text: "Récapitulatif au client, alerte à votre équipe." },
      { icon: "bell", title: "Rappel la veille", text: "Avec les boutons « Je confirme » et « Annuler »." },
    ],
  },
  reception: {
    title: "GhostReception · assistant clients",
    besoin: "assistant",
    cta: "Demander GhostReception →",
    steps: [
      { icon: "chat", title: "Message client", text: "Sur WhatsApp ou Instagram, en derja, arabe ou français." },
      { icon: "spark", title: "Analyse par l'IA", text: "La demande est comprise et comparée à vos informations." },
      { icon: "send", title: "Réponse envoyée", text: "Prix, horaires ou catalogue, uniquement d'après vos infos." },
      { icon: "table", title: "Suivi du prospect", text: "Contact noté dans votre fichier, relais à l'équipe si besoin." },
    ],
  },
  travel: {
    title: "GhostTravel · agence de voyage",
    besoin: "voyage",
    cta: "Demander GhostTravel →",
    steps: [
      { icon: "plane", title: "Question du voyageur", text: "Une offre, une date, un document à fournir…" },
      { icon: "search", title: "Recherche dans vos offres", text: "Séjours, Omra, conditions : vos informations uniquement." },
      { icon: "send", title: "Réponse organisée", text: "Claire et complète, dans la langue du voyageur." },
      { icon: "bell", title: "Suivi du dossier", text: "Demande notée, relance si le voyageur ne revient pas." },
    ],
  },
  mail: {
    title: "GhostMail · e-mails & brief du gérant",
    besoin: "emails",
    cta: "Demander GhostMail →",
    steps: [
      { icon: "mail", title: "Nouvel e-mail", text: "Arrivé dans votre boîte de réception." },
      { icon: "spark", title: "Classement par l'IA", text: "Demande client, facture, fournisseur ou newsletter." },
      { icon: "pen", title: "Action préparée", text: "Résumé et brouillon de réponse ; newsletters écartées." },
      { icon: "sun", title: "Brief du gérant", text: "L'essentiel de la journée en un seul message." },
    ],
  },
  custom: {
    title: "Sur mesure · votre process",
    besoin: "sur-mesure",
    cta: "En parler →",
    steps: [
      { icon: "file", title: "Votre tâche", text: "Une action répétitive que votre équipe fait à la main." },
      { icon: "search", title: "Analyse", text: "On repère les données, les règles et les exceptions." },
      { icon: "tool", title: "Automatisation", text: "Connectée aux outils que vous utilisez déjà." },
      { icon: "eye", title: "Contrôle", text: "Mode test : vous validez avant le lancement." },
    ],
  },
};
