import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createElement, isValidElement, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { createInitialDraftAnswerForChallenge } from '../src/lib/challengeDraftState.js'
import { canSubmitVisualChallenge } from '../src/lib/visualChallengeRules.js'

const room = JSON.parse(readFileSync(new URL('../src/data/categories/cura-corpo.json', import.meta.url)))
const challenge = room.challenges.find((item) => item.id === 'cc-hitster-style-01')
const chronologicalSlots = Object.fromEntries(challenge.items.map((item) => [item.id,
  [...new Set(challenge.items.map((look) => look.year))].sort((a, b) => a - b).indexOf(item.year),
]))

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements)
  if (!isValidElement(node)) return []
  return [node, ...elements(node.props.children)]
}

test('Hitster card interactions preserve chronological slots, swaps and the final gate', async (t) => {
  const server = await createServer({ configFile: false, plugins: [react()], server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { default: Timeline } = await server.ssrLoadModule('/src/components/challenges/templates/VisualTimelineChallenge.jsx')

    function play({ draft: initialDraft, count = 0, disabled = false, steps = [], verify }) {
      let draft = { ...createInitialDraftAnswerForChallenge(challenge), ...initialDraft }
      let runtime = { visualTimelineRevealedCount: count }
      let writes = 0
      function Harness() {
        const [step, setStep] = useState(0)
        // Own the template hooks here so each scripted event receives the next render.
        const view = Timeline({ challenge, draftAnswer: draft, challengeState: runtime, disabled,
          onDraftAnswerChange(patch) { draft = { ...draft, ...patch }; writes++ },
          onChallengeStateChange(patch) { runtime = { ...runtime, ...patch }; writes++ },
          onSubmit() {},
        })
        const nodes = elements(view)
        const context = {
          nodes, draft, runtime, writes,
          button: (label) => nodes.find((node) => node.type === 'button' && node.props['aria-label'] === label),
          position: (slot) => nodes.find((node) => node.type === 'ol').props.children[slot],
          submit: nodes.find((node) => node.type.name === 'ChallengeSubmitButton'),
        }
        if (step < steps.length) {
          steps[step](context)
          setStep(step + 1)
        } else verify(context)
        return view
      }
      return renderToStaticMarkup(createElement(Harness))
    }

    await t.test('reveal and touch-place every card, including both contemporaries', () => {
      const steps = challenge.initialOrder.flatMap((id) => [
        ({ nodes, submit }) => {
          assert.equal(submit.props.disabled, true)
          const reveal = nodes.find((node) => node.props.className === 'style-hitster__reveal')
          assert.equal(reveal.props.disabled, false)
          reveal.props.onClick()
        },
        ({ nodes }) => {
          const target = nodes.find((node) => node.props.className === 'style-hitster__empty' &&
            node.props['aria-label'].startsWith(`Colloca il look selezionato nella posizione ${chronologicalSlots[id] + 1}`))
          assert.equal(target.props.disabled, false)
          target.props.onClick()
        },
      ])
      const html = play({ steps, verify({ draft, runtime, submit }) {
        assert.deepEqual(draft.visualTimelineSlots, chronologicalSlots)
        assert.equal(canSubmitVisualChallenge(challenge, runtime, Date.now(), draft), true)
        assert.equal(submit.props.disabled, false)
      } })
      assert.ok(html.indexOf('Le carte stile') < html.indexOf('La tua timeline'))
      assert.match(html, /Più antico/)
      assert.match(html, /Più recente/)
      assert.match(html, /Bonus facoltativi/)
      assert.doesNotMatch(html, /<select/)
    })

    await t.test('drag swaps into a full double position and touch can swap back', () => {
      play({ count: 7, draft: { visualTimelineSlots: chronologicalSlots }, steps: [
        ({ position }) => position(3).props.onDrop({ preventDefault() {}, stopPropagation() {},
          dataTransfer: { getData: () => 'flapper-1920' },
        }),
        ({ draft, button }) => {
          assert.equal(draft.visualTimelineSlots['flapper-1920'], 3)
          assert.equal(draft.visualTimelineSlots['punk-1970'], 0)
          button('Seleziona look 2').props.onClick()
        },
        ({ button }) => button('Scambia look 2 con look 1 nella posizione 1').props.onClick(),
      ], verify({ draft, runtime }) {
        assert.deepEqual(draft.visualTimelineSlots, chronologicalSlots)
        assert.equal(canSubmitVisualChallenge(challenge, runtime, Date.now(), draft), true)
      } })
    })

    await t.test('placing a new card into a full slot returns the displaced card to the deck', () => {
      play({ count: 2, draft: { visualTimelineSlots: { 'punk-1970': 0 } }, steps: [
        ({ position }) => position(0).props.onDrop({ preventDefault() {}, stopPropagation() {},
          dataTransfer: { getData: () => 'flapper-1920' },
        }),
      ], verify({ draft, nodes, submit }) {
        assert.deepEqual(draft.visualTimelineSlots, { 'flapper-1920': 0 })
        assert.equal(nodes.find((node) => node.props.className === 'style-hitster__reveal').props.disabled, true)
        assert.equal(submit.props.disabled, true)
      } })
    })

    await t.test('a resumed completed draft renders all cards and disabled drops cannot change it', () => {
      play({ count: 7, disabled: true, draft: { visualTimelineSlots: chronologicalSlots }, steps: [
        ({ position }) => position(5).props.onDrop({ preventDefault() {}, stopPropagation() {},
          dataTransfer: { getData: () => 'flapper-1920' },
        }),
      ], verify({ nodes, draft, writes, submit }) {
        assert.equal(nodes.filter((node) => node.props.className === 'style-hitster__pick').length, 7)
        assert.deepEqual(draft.visualTimelineSlots, chronologicalSlots)
        assert.equal(writes, 0)
        assert.equal(submit.props.disabled, true)
      } })
    })
  } finally { await server.close() }
})
