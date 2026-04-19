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