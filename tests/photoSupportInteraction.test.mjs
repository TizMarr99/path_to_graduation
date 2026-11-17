import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createElement, isValidElement, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { createInitialDraftAnswerForChallenge } from '../src/lib/challengeDraftState.js'

const room = JSON.parse(readFileSync(new URL('../src/data/categories/cura-corpo.json', import.meta.url)))
const challenge = room.challenges.find((item) => item.quizSubType === 'photo_supports')
const photoOrder = challenge.items.map((item) => item.id).reverse()

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements)
  if (!isValidElement(node)) return []
  return [node, ...elements(node.props.children)]
}

test('photo matching preserves saved IDs while numbering and selecting in display order', async (t) => {
  const server = await createServer({ configFile: false, plugins: [react()], server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { default: Matching } = await server.ssrLoadModule('/src/components/challenges/templates/ImageOptionMatchingChallenge.jsx')
    const { evaluateChallenge } = await server.ssrLoadModule('/src/lib/challengeRegistry.js')
    function play({ initial = {}, steps = [], disabled = false, verify }) {
      let draft = { ...createInitialDraftAnswerForChallenge(challenge), imageOptionItemOrderIds: photoOrder, ...initial }
      let writes = 0
      function Harness() {
        const [step, setStep] = useState(0)
        const adapted = Matching({ challenge, draftAnswer: draft, disabled, onSubmit() {},
          onDraftAnswerChange(patch) { draft = { ...draft, ...patch }; writes++ },
        })
        // Own the inner template hooks to exercise consecutive selection events.
        const view = adapted.type(adapted.props)
        const nodes = elements(view)
        const context = { draft, nodes, writes,
          button: (label) => nodes.find((node) => node.type === 'button' && node.props['aria-label'] === label),
          assign: (photo, target) => nodes.find((node) => node.type === 'button' && node.props['aria-label']?.startsWith(`Abbina Scatto ${photo} a ${target}`)),
          submit: nodes.find((node) => node.type === 'button' && node.props.type === 'submit'),
        }
        if (step < steps.length) { steps[step](context); setStep(step + 1) }
        else verify(context)
        return view
      }
      return renderToStaticMarkup(createElement(Harness))
    }

    await t.test('shuffled first image is Scatto 1 and the next selection follows the visible photos', () => {
      const html = play({ steps: [({ button, assign, submit }) => {
        assert.equal(button('Seleziona Scatto 1').props['aria-pressed'], true)
        assert.equal(submit.props.disabled, true)
        assign(1, 'Smartphone').props.onClick()
      }], verify({ draft, nodes, button }) {
        assert.deepEqual(draft.imageOptionSelections, { 'action-cam': 'smartphone' })
        assert.equal(button('Seleziona Scatto 2').props['aria-pressed'], true)
        const cards = nodes.filter((node) => node.type === 'article' && node.props.className?.startsWith('photo-source-card'))
        assert.equal(cards[0].key, 'action-cam')
        assert.equal(cards[1].key, 'polaroid')
      } })
      assert.doesNotMatch(html, /\? (?:assegnato|selezionato)/)
      assert.match(html, /Rimuovi Scatto 1 da Smartphone/)
    })

    await t.test('moving a photo replaces its target, keeps one-to-one assignments and supports removal', () => {
      play({ initial: { imageOptionSelections: { 'action-cam': 'smartphone', polaroid: 'rullino' } }, steps: [
        ({ button }) => button('Seleziona Scatto 1').props.onClick(),
        ({ assign }) => assign(1, 'Fotocamera a pellicola 35 mm').props.onClick(),
        ({ draft, button }) => {
          assert.deepEqual(draft.imageOptionSelections, { 'action-cam': 'rullino' })
          assert.equal(button('Seleziona Scatto 2').props['aria-pressed'], true)
          button('Rimuovi Scatto 1 da Fotocamera a pellicola 35 mm').props.onClick()
        },
      ], verify({ draft, button, submit }) {
        assert.deepEqual(draft.imageOptionSelections, {})
        assert.equal(button('Seleziona Scatto 1').props['aria-pressed'], true)
        assert.equal(submit.props.disabled, true)
      } })
    })

    await t.test('a complete saved draft keeps labels consistent and enables final confirmation', () => {
      play({ initial: { imageOptionSelections: Object.fromEntries(challenge.items.map((item) => [item.id, item.correctOptionId])) }, verify({ submit, button }) {
        assert.equal(submit.props.disabled, false)
        assert.ok(button('Rimuovi Scatto 1 da Action cam / GoPro'))
        assert.ok(button('Rimuovi Scatto 5 da Fotocamera a pellicola 35 mm'))
      } })
    })

    await t.test('disabled assignment cannot mutate a resumed draft', () => {
      play({ disabled: true, steps: [({ assign }) => {
        const target = assign(1, 'Smartphone')
        assert.equal(target.props.disabled, true)
        target.props.onClick()
      }], verify({ draft, writes, submit }) {
        assert.deepEqual(draft.imageOptionSelections, {})
        assert.equal(writes, 0)
        assert.equal(submit.props.disabled, true)
      } })
    })

    await t.test('solution numbering follows the same shuffled photos without changing the score', () => {
      const draftAnswer = { imageOptionItemOrderIds: photoOrder,
        imageOptionSelections: Object.fromEntries(challenge.items.map((item) => [item.id, item.correctOptionId])),
      }
      const feedback = evaluateChallenge({ challenge, draftAnswer, challengeState: {}, category: room })
      assert.equal(feedback.isCorrect, true)
      assert.equal(feedback.scoreEarned, 5)
      assert.equal(feedback.solutionLines[0], 'Scatto 1 → Action cam / GoPro')
      assert.equal(feedback.solutionLines[4], 'Scatto 5 → Fotocamera a pellicola 35 mm')
    })
  } finally { await server.close() }
})
