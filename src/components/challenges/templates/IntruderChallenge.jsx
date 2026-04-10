import SingleChoiceChallengeForm from '../common/SingleChoiceChallengeForm.jsx'

function IntruderChallenge({
  challenge,
  draftAnswer,
  onDraftAnswerChange,
  onSubmit,
  disabled,
}) {
  return (
    <SingleChoiceChallengeForm
      assets={challenge.assets}
      challengeId={challenge.id}
      disabled={disabled}
      inputName={`${challenge.id}-intruder`}
      onChange={(selectedItemId) => onDraftAnswerChange({ selectedItemId })}
      onSubmit={onSubmit}
      options={challenge.items}
      prompt={challenge.prompt}
      selectedValue={draftAnswer.selectedItemId}
    />
  )
}

export default IntruderChallenge