import SingleChoiceChallengeForm from '../common/SingleChoiceChallengeForm.jsx'

function MultipleChoiceChallenge({
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
      inputName={challenge.id}
      onChange={(selectedChoiceId) => onDraftAnswerChange({ selectedChoiceId })}
      onSubmit={onSubmit}
      options={challenge.choices}
      prompt={challenge.prompt}
      selectedValue={draftAnswer.selectedChoiceId}
    />
  )
}

export default MultipleChoiceChallenge