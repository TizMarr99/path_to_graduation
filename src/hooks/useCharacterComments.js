import { useCallback, useEffect, useRef, useState } from 'react'

const TOAST_DURATION_MS = 4000

function pickRandom(items) {
  if (!items || !items.length) return null
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * @param {import('../types/challenge').CategoryCharacterComments | null | undefined} characterComments
 * @param {import('../types/challenge').CategoryCharacters | null | undefined} characters
 */
export function useCharacterComments(characterComments, characters) {
  const [activeToast, setActiveToast] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const dismissToast = useCallback(() => {
    setActiveToast(null)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const showComment = useCallback(
    /** @param {'onCorrect' | 'onWrong' | 'onHintUsed' | 'onHesitation'} eventType */
    (eventType) => {
      if (!characterComments) return

      const pool = characterComments[eventType]
      const comment = pickRandom(pool)
      if (!comment) return

      const speakerKey = comment.speaker === 'critic' ? 'critic' : 'curator'
      const character = characters?.[speakerKey] ?? null

      if (timerRef.current) clearTimeout(timerRef.current)

      setActiveToast({
        speaker: comment.speaker,
        text: comment.text,
        archetypeLabel: speakerKey === 'critic' ? 'Voce del Critico' : 'Voce del Curatore',
        characterName: character?.name ?? (speakerKey === 'critic' ? 'Il Critico' : 'Il Curatore'),
        characterImage: character?.imageSrc ?? '',
        tone: character?.tone ?? (speakerKey === 'critic' ? 'silver' : 'gold'),
      })

      timerRef.current = setTimeout(() => {
        setActiveToast(null)
        timerRef.current = null
      }, TOAST_DURATION_MS)
    },
    [characterComments, characters],
  )

  return { activeToast, showComment, dismissToast }
}
