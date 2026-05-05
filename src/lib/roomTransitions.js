export const roomTransitionRegistry = {
  musica: {
    targetCategoryId: 'serie-film',
    bridgeNarrative: {
      eyebrow: 'Passaggio di Sala',
      title: 'La Soglia di Mezzo.',
      description:
        'La sala si è chiusa alle tue spalle. Ora resta solo da decidere se varcare la soglia seguente.',
      ctaLabel: 'Raggiungi la Grotta delle Ombre',
      andrea: {
        name: 'Andrea Sachs',
        role: 'La Curatrice',
        message:
          'Questa sala è chiusa. Qui il premio è già tuo. Nella Grotta delle Ombre ti aspetta il passaggio verso la sala successiva.',
      },
      miranda: {
        name: 'Miranda Priestly',
        role: 'La Critica',
        message:
          'Non confondere una vittoria con un diritto d’ingresso. Hai finito con queste frequenze. Ora scendi nella Grotta, paga il prezzo della soglia e vedremo se la stanza seguente vorrà accoglierti.',
      },
    },
    purchasePrompt: {
      title: 'Vuoi sbloccare la prossima sala?',
      description:
        'Puoi acquistare adesso l’accesso alla sala seguente e, se oggi hai ancora tentativi, entrarci subito.',
      blockedDescription:
        'Puoi acquistare adesso l’accesso alla sala seguente, ma il primo ingresso dovrà attendere domani.',
      actionLabel: 'Sblocca l’accesso',
    },
  },
  'serie-film': {
    targetCategoryId: 'shadow-hall',
    destinationPath: '/shadows',
    bridgeNarrative: {
      eyebrow: 'Ritorno alla Grotta',
      title: 'Gli schermi si spengono.',
      description:
        'La sala ha lasciato andare il suo ultimo riflesso. Il Proiettore di Ombre ora e tuo, e la Grotta delle Ombre ne conservera la traccia.',
      ctaLabel: 'Torna alla Sala delle Ombre',
      andrea: {
        name: 'Andrea Sachs',
        role: 'Il Curatore',
        message:
          'Hai rimesso insieme battute, volti e legami senza lasciare che il buio decidesse il montaggio. Il Proiettore di Ombre adesso ti appartiene. Torna nella Grotta: la sala si e illuminata e l\'artefatto ti aspetta tra le ombre che hai gia attraversato.',
      },
      miranda: {
        name: 'Amanda Priestly',
        role: 'La Critica',
        message:
          'Non confondere memoria e talento. Hai solo dimostrato di saper riconoscere una storia anche quando la faccio a pezzi. Tieniti il tuo proiettore, torna pure nella Grotta e prova a goderti il raro privilegio di avermi contraddetta con successo.',
      },
    },
  },
}

export function getRoomTransition(sourceCategoryId) {
  if (!sourceCategoryId) {
    return null
  }

  return roomTransitionRegistry[sourceCategoryId] ?? null
}

export function getIncomingRoomTransition(targetCategoryId) {
  if (!targetCategoryId) {
    return null
  }

  return Object.entries(roomTransitionRegistry).find(([, transition]) => {
    return transition.targetCategoryId === targetCategoryId
  }) ?? null
}