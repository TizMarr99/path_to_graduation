export const roomSpeakerLabels = {
  guardian: 'Il Guardiano',
  inquisitor: "L'Inquisitore",
  neutral: 'La Sala',
}

export function normalizeRoomSpeaker(speaker) {
  if (speaker === 'neutral') {
    return 'neutral'
  }

  if (speaker === 'critic' || speaker === 'inquisitor') {
    return 'inquisitor'
  }

  return 'guardian'
}

export function getRoomSpeakerLabel(speaker) {
  return roomSpeakerLabels[normalizeRoomSpeaker(speaker)]
}

export function getRoomSpeakerTone(speaker) {
  return normalizeRoomSpeaker(speaker) === 'inquisitor' ? 'silver' : 'gold'
}

export function getRoomSpeakerArchetypeLabel(speaker) {
  const normalizedSpeaker = normalizeRoomSpeaker(speaker)

  if (normalizedSpeaker === 'inquisitor') {
    return "Voce dell'Inquisitore"
  }

  if (normalizedSpeaker === 'neutral') {
    return 'Voce della Sala'
  }

  return 'Voce del Guardiano'
}

export function getRoomCharacterBySpeaker(characters, speaker) {
  const normalizedSpeaker = normalizeRoomSpeaker(speaker)

  if (normalizedSpeaker === 'guardian') {
    return characters?.guardian ?? characters?.curator ?? null
  }

  if (normalizedSpeaker === 'inquisitor') {
    return characters?.inquisitor ?? characters?.critic ?? null
  }

  return null
}

export function getRoomNarrativeBySpeaker(introNarrative, speaker) {
  const normalizedSpeaker = normalizeRoomSpeaker(speaker)

  if (normalizedSpeaker === 'guardian') {
    return introNarrative?.guardian ?? introNarrative?.curator ?? null
  }

  if (normalizedSpeaker === 'inquisitor') {
    return introNarrative?.inquisitor ?? introNarrative?.critic ?? null
  }

  return null
}