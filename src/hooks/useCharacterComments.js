import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getRoomCharacterBySpeaker,
  getRoomSpeakerArchetypeLabel,
  getRoomSpeakerLabel,
  getRoomSpeakerTone,
  normalizeRoomSpeaker,
} from '../lib/roomSpeakers'

/** Duration of the auto-dismissing panel for hesitation / hint-used events. */
const PANEL_DURATION_MS = 6000

function pickRandom(items) {
  if (!items || !items.length) return null
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * Build a comment data object from a raw comment entry and the characters map.
 * @param {{ speaker: string, text: string }} comment
 * @param {import('../types/challenge').CategoryCharacters | null | undefined} characters
 */
function buildCommentData(comment, characters) {
  const speakerKey = normalizeRoomSpeaker(comment.speaker)
  const character = getRoomCharacterBySpeaker(characters, comment.speaker)
  return {
    speaker: comment.speaker,
    speakerKey,
    text: comment.text,
    character,
    characterName: character?.name ?? getRoomSpeakerLabel(speakerKey),
    characterImage: character?.imageSrc ?? '',
    tone: character?.tone ?? getRoomSpeakerTone(speakerKey),
    archetypeLabel: getRoomSpeakerArchetypeLabel(speakerKey),
  }
}

/**
 * @param {import('../types/challenge').CategoryCharacterComments | null | undefined} characterComments
 * @param {import('../types/challenge').CategoryCharacters | null | undefined} characters
 */
export function useCharacterComments(characterComments, characters) {
  /**
   * `activePanel`: driven by onHesitation / onHintUsed — shown as a floating panel
   *  with an auto-dismiss timer managed here in the hook.
   */
  const [activePanel, setActivePanel] = useState(null)
  /**
   * `resultComment`: driven by onCorrect / onWrong — embedded inside ResultModal.
   * Cleared explicitly via clearResultComment().
   */
  const [resultComment, setResultComment] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const dismissPanel = useCallback(() => {
    setActivePanel(null)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const clearResultComment = useCallback(() => {
    setResultComment(null)
  }, [])

  const showComment = useCallback(
    /** @param {'onCorrect' | 'onWrong' | 'onHintUsed' | 'onHesitation'} eventType */
    (eventType) => {
      if (!characterComments) return

      const pool = characterComments[eventType]
      const comment = pickRandom(pool)
      if (!comment) return

      const data = buildCommentData(comment, characters)

      if (eventType === 'onCorrect' || eventType === 'onWrong') {
        // These are displayed inline inside ResultModal; no timer needed here.
        setResultComment({ ...data, eventType })
      } else {
        // onHesitation | onHintUsed → auto-dismissing floating panel.
        if (timerRef.current) clearTimeout(timerRef.current)
        setActivePanel({ ...data, eventType })
        timerRef.current = setTimeout(() => {
          setActivePanel(null)
          timerRef.current = null
        }, PANEL_DURATION_MS)
      }
    },
    [characterComments, characters],
  )

  return { activePanel, resultComment, showComment, dismissPanel, clearResultComment }
}
