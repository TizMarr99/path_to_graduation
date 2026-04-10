export type ChallengeType =
  | 'multiple_choice'
  | 'free_text'
  | 'ordering'
  | 'multi_stage_progressive_reveal'
  | 'intruder'
  | 'sequence_reconstruction'

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard'
export type ChallengeSpeaker = 'curator' | 'critic' | 'neutral'
export type CategoryKind = 'room' | 'side_game' | 'final_path'
export type ChallengeAssetKind = 'image' | 'audio' | 'video'

export interface ChallengeAsset {
  id?: string
  kind: ChallengeAssetKind
  src: string
  alt?: string
  caption?: string
}

export interface ChoiceItem {
  id: string
  text: string
  description?: string
}

export interface OrderedItem {
  id: string
  label: string
  description?: string
}

export interface SequenceSegment {
  id: string
  label: string
  description?: string
}

export interface RevealStage {
  id: string
  title?: string
  body: string
  assets?: ChallengeAsset[]
}

export interface ProgressiveRevealMultipleChoiceSolution {
  mode: 'multiple_choice'
  choices: ChoiceItem[]
  correctChoiceId: string
}

export interface ProgressiveRevealFreeTextSolution {
  mode: 'free_text'
  acceptedAnswers: string[]
}

export type ProgressiveRevealSolution =
  | ProgressiveRevealMultipleChoiceSolution
  | ProgressiveRevealFreeTextSolution

export interface ProgressiveRevealScoring {
  maxScore: number
  revealPenalty: number
  minScore: number
}

export interface ChallengeBase<T extends ChallengeType> {
  id: string
  difficulty: ChallengeDifficulty
  type: T
  title?: string
  prompt: string
  assets: ChallengeAsset[]
  hint: string
  explanation: string
  introNarration?: string
  successMessage?: string
  failureMessage?: string
  speaker: ChallengeSpeaker
}

export interface MultipleChoiceChallenge extends ChallengeBase<'multiple_choice'> {
  choices: ChoiceItem[]
  correctChoiceId: string
}

export interface FreeTextChallenge extends ChallengeBase<'free_text'> {
  acceptedAnswers: string[]
  placeholder?: string
}

export interface OrderingChallenge extends ChallengeBase<'ordering'> {
  items: OrderedItem[]
  correctOrder: string[]
  initialOrder: string[]
}

export interface ProgressiveRevealChallenge
  extends ChallengeBase<'multi_stage_progressive_reveal'> {
  stages: RevealStage[]
  initialVisibleStages: number
  solution: ProgressiveRevealSolution
  scoring: ProgressiveRevealScoring
}

export interface IntruderChallenge extends ChallengeBase<'intruder'> {
  items: ChoiceItem[]
  intruderId: string
}

export interface SequenceReconstructionChallenge
  extends ChallengeBase<'sequence_reconstruction'> {
  segments: SequenceSegment[]
  correctOrder: string[]
  initialOrder: string[]
}

export type Challenge =
  | MultipleChoiceChallenge
  | FreeTextChallenge
  | OrderingChallenge
  | ProgressiveRevealChallenge
  | IntruderChallenge
  | SequenceReconstructionChallenge

export interface ChallengeDraftAnswer {
  selectedChoiceId: string
  selectedItemId: string
  textAnswer: string
  orderedItemIds: string[]
  sequenceOrderIds: string[]
}

export interface ChallengeRuntimeState {
  revealedStageCount: number
}

export interface ChallengeFeedback {
  isCorrect: boolean
  title: string
  message: string
  attemptedChallengeId: string
  categoryTitle: string
  speaker: ChallengeSpeaker
  tone: 'idle' | 'success' | 'failure'
  scoreEarned?: number
  maxScore?: number
}

export interface Category {
  id: string
  kind: CategoryKind
  title: string
  ghost: string
  description: string
  unlockCost: number
  challenges: Challenge[]
}

export interface RawChallengeBase {
  id: string
  difficulty: ChallengeDifficulty
  type?: ChallengeType
  mode?: 'multiple_choice' | 'free_text'
  title?: string
  prompt: string
  assets?: Array<string | ChallengeAsset>
  hint?: string
  explanation?: string
  introNarration?: string
  successMessage?: string
  failureMessage?: string
  speaker?: ChallengeSpeaker
}

export interface RawMultipleChoiceChallenge extends RawChallengeBase {
  type?: 'multiple_choice'
  mode?: 'multiple_choice'
  choices: ChoiceItem[]
  correctChoiceId: string
}

export interface RawFreeTextChallenge extends RawChallengeBase {
  type?: 'free_text'
  mode?: 'free_text'
  acceptedAnswers: string[]
  placeholder?: string
}

export interface RawOrderingChallenge extends RawChallengeBase {
  type: 'ordering'
  items: OrderedItem[]
  correctOrder: string[]
  initialOrder?: string[]
}

export interface RawProgressiveRevealChallenge extends RawChallengeBase {
  type: 'multi_stage_progressive_reveal'
  stages: RevealStage[]
  initialVisibleStages?: number
  solution: ProgressiveRevealSolution
  scoring?: Partial<ProgressiveRevealScoring>
}

export interface RawIntruderChallenge extends RawChallengeBase {
  type: 'intruder'
  items: ChoiceItem[]
  intruderId: string
}

export interface RawSequenceReconstructionChallenge extends RawChallengeBase {
  type: 'sequence_reconstruction' | 'puzzle'
  segments?: SequenceSegment[]
  pieces?: SequenceSegment[]
  correctOrder?: string[]
  solutionOrder?: string[]
  initialOrder?: string[]
}

export type RawChallenge =
  | RawMultipleChoiceChallenge
  | RawFreeTextChallenge
  | RawOrderingChallenge
  | RawProgressiveRevealChallenge
  | RawIntruderChallenge
  | RawSequenceReconstructionChallenge

export interface RawCategory {
  id: string
  kind?: CategoryKind
  title: string
  ghost: string
  description: string
  unlockCost?: number
  challenges?: RawChallenge[]
  questions?: Array<RawMultipleChoiceChallenge | RawFreeTextChallenge>
}