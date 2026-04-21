export type ChallengeType =
  | 'multiple_choice'
  | 'free_text'
  | 'ordering'
  | 'multi_stage_progressive_reveal'
  | 'intruder'
  | 'sequence_reconstruction'
  | 'guess_title_author'
  | 'face_morph'
  | 'fill_lyrics'
  | 'musical_chain'
  | 'hitster'
  | 'speedrun_characters'
  | 'image_option_matching'
  | 'column_reorder_matching'
  | 'card_matching'

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard'
export type ChallengeSpeaker = 'guardian' | 'inquisitor' | 'curator' | 'critic' | 'neutral'
export type CategoryKind = 'room' | 'side_game' | 'final_path'
export type ChallengeAssetKind = 'image' | 'audio' | 'video'
export type RewardArtifactType = 'hint' | 'shield' | 'light_key'

export interface ChallengeAsset {
  id?: string
  kind: ChallengeAssetKind
  src: string
  alt?: string
  caption?: string
}

export interface CategoryFear {
  id: string
  name: string
  icon?: string
  description: string
  sfxSrc?: string
}

export interface RewardArtifact {
  type: RewardArtifactType
  label: string
  description: string
}

export interface CategoryMapHotspot {
  id: string
  label: string
  description?: string
  introPrompt?: string
  icon?: string
  x: number
  y: number
  width: number
  height: number
}

export interface AcceptedAnswerGroup {
  id?: string
  acceptedAnswers: string[]
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

export interface GuessTitleAuthorScoring {
  passThreshold: number
  fullMatchRatio: number
  partialMatchRatio: number
}

export interface FillLyricsScoring {
  minimumWordMatchRatio: number
  maxScore?: number
}

export interface MusicalChainScoring {
  maxScore: number
  revealPenalty: number
  minScore: number
}

export interface HitsterScoring {
  minimumCorrectPlacements: number
}

export interface MusicalChainStage {
  id: string
  title?: string
  assets: ChallengeAsset[]
}

export interface HitsterTrack {
  id: string
  year: number
  title: string
  titleAcceptedAnswers: string[]
  artist: string
  artistAcceptedAnswers: string[]
  assets: ChallengeAsset[]
}

export interface ChallengeBase<T extends ChallengeType> {
  id: string
  zoneId?: string
  difficulty: ChallengeDifficulty
  type: T
  title?: string
  prompt: string
  infoText?: string
  assets: ChallengeAsset[]
  hint: string
  explanation: string
  introNarration?: string
  successMessage?: string
  failureMessage?: string
  speaker: ChallengeSpeaker
  creditReward?: number
  hintCost?: number
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

export interface GuessTitleAuthorChallenge
  extends ChallengeBase<'guess_title_author'> {
  acceptedTitleAnswers: string[]
  acceptedAuthorAnswers: string[]
  titlePlaceholder?: string
  authorPlaceholder?: string
  scoring: GuessTitleAuthorScoring
}

export interface FaceMorphChallenge extends ChallengeBase<'face_morph'> {
  singerGroups: AcceptedAnswerGroup[]
  answerSlots: number
  minimumCorrectGroups: number
  placeholder?: string
}

export interface FillLyricsChallenge extends ChallengeBase<'fill_lyrics'> {
  solutionText: string
  placeholder?: string
  scoring: FillLyricsScoring
}

export interface MusicalChainChallenge extends ChallengeBase<'musical_chain'> {
  stages: MusicalChainStage[]
  acceptedAnswers: string[]
  scoring: MusicalChainScoring
}

export interface HitsterChallenge extends ChallengeBase<'hitster'> {
  tracks: HitsterTrack[]
  initialOrder: string[]
  correctOrder: string[]
  scoring: HitsterScoring
}

export interface SpeedrunCharacter {
  id: string
  showName: string
  assets: ChallengeAsset[]
  acceptedAnswers: string[]
}

export interface SpeedrunCharactersChallenge extends ChallengeBase<'speedrun_characters'> {
  timerSeconds: number
  minimumCorrect: number
  characters: SpeedrunCharacter[]
}

export interface ImageOptionMatchingItem {
  id: string
  label?: string
  assets: ChallengeAsset[]
  correctOptionId: string
}

export interface ImageOptionMatchingOption {
  id: string
  label: string
  icon?: string
  assets?: ChallengeAsset[]
}

export interface ImageOptionMatchingChallenge extends ChallengeBase<'image_option_matching'> {
  items: ImageOptionMatchingItem[]
  options: ImageOptionMatchingOption[]
  minimumCorrectPairs: number
}

export interface ColumnReorderRow {
  id: string
  correctOrder: string[]
  bonusNameAcceptedAnswers?: string[]
}

export interface ColumnReorderCell {
  id: string
  column: number
  assets: ChallengeAsset[]
}

export interface ColumnReorderMatchingChallenge extends ChallengeBase<'column_reorder_matching'> {
  columns: string[]
  rows: ColumnReorderRow[]
  cells: ColumnReorderCell[]
  shuffledColumnOrders: string[][]
  lockedColumns?: number[]
  minimumCorrectRows: number
  bonusNameCredit?: number
}

export interface CardMatchingItem {
  id: string
  assets: ChallengeAsset[]
  correctNumber: string
  correctSuit: string
}

export interface CardMatchingChallenge extends ChallengeBase<'card_matching'> {
  items: CardMatchingItem[]
  numberOptions: string[]
  suitOptions: string[]
  minimumCorrect: number
}

export type Challenge =
  | MultipleChoiceChallenge
  | FreeTextChallenge
  | OrderingChallenge
  | ProgressiveRevealChallenge
  | IntruderChallenge
  | SequenceReconstructionChallenge
  | GuessTitleAuthorChallenge
  | FaceMorphChallenge
  | FillLyricsChallenge
  | MusicalChainChallenge
  | HitsterChallenge
  | SpeedrunCharactersChallenge
  | ImageOptionMatchingChallenge
  | ColumnReorderMatchingChallenge
  | CardMatchingChallenge

export interface ChallengeDraftAnswer {
  selectedChoiceId: string
  selectedItemId: string
  textAnswer: string
  orderedItemIds: string[]
  sequenceOrderIds: string[]
  titleAnswer: string
  authorAnswer: string
  faceMorphAnswers: string[]
  hitsterTrackAnswers: Record<string, { titleAnswer: string; artistAnswer: string }>
  hitsterTrackOrderIds: string[]
  speedrunAnswers: Record<string, string>
  speedrunSkippedIds: string[]
  imageOptionSelections: Record<string, string>
  columnOrders: string[][]
  columnBonusNames: Record<string, string>
  cardSelections: Record<string, { number: string; suit: string }>
}

export interface ChallengeRuntimeState {
  revealedStageCount: number
  musicalChainStageIndex: number
  hitsterRevealedTrackCount: number
  speedrunCurrentIndex: number
  speedrunTimeRemaining: number
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
  solutionLines?: string[]
  metadata?: Record<string, unknown>
}

export interface Category {
  id: string
  kind: CategoryKind
  title: string
  ghost: string
  description: string
  unlockCost: number
  buyAccessCost?: number
  backgroundImage?: string
  mapImage?: string
  mapHotspots?: CategoryMapHotspot[]
  fear?: CategoryFear | null
  rewardArtifact?: RewardArtifact | null
  characters?: CategoryCharacters
  introNarrative?: CategoryIntroNarrative
  characterComments?: CategoryCharacterComments
  weightedScoring?: WeightedScoringConfig | null
  subPrizes?: SubPrize[]
  challenges: Challenge[]
}

export interface WeightedScoringConfig {
  passingThreshold: number
  typeWeights: Record<string, number>
}

export interface SubPrizeCondition {
  type: 'zone_clear' | 'type_threshold' | 'min_weighted_score' | 'perfect_type'
  zoneId?: string
  quizTypes?: string[]
  minPassed?: number
  minScore?: number
  quizType?: string
}

export interface SubPrize {
  id: string
  label: string
  description?: string
  condition: SubPrizeCondition
}

export interface TypeResult {
  passed: number
  total: number
  score: number
}

export interface CategoryCharacterInfo {
  id: string
  name: string
  role: string
  imageSrc: string
  fallbackImageSrc?: string
  tone: 'gold' | 'silver'
}

export interface CategoryCharacters {
  guardian?: CategoryCharacterInfo
  inquisitor?: CategoryCharacterInfo
  curator?: CategoryCharacterInfo
  critic?: CategoryCharacterInfo
}

export interface CategoryNarrativeMessage {
  name: string
  message: string
}

export interface CategoryIntroNarrative {
  guardian?: CategoryNarrativeMessage
  inquisitor?: CategoryNarrativeMessage
  curator?: CategoryNarrativeMessage
  critic?: CategoryNarrativeMessage
}

export interface CharacterComment {
  speaker: ChallengeSpeaker
  text: string
}

export interface CategoryCharacterComments {
  onCorrect?: CharacterComment[]
  onWrong?: CharacterComment[]
  onHintUsed?: CharacterComment[]
  onHesitation?: CharacterComment[]
}

export interface RawChallengeBase {
  id: string
  zoneId?: string
  difficulty: ChallengeDifficulty
  type?: ChallengeType
  mode?: 'multiple_choice' | 'free_text'
  title?: string
  prompt: string
  infoText?: string
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

export interface RawGuessTitleAuthorChallenge extends RawChallengeBase {
  type: 'guess_title_author'
  acceptedTitleAnswers?: string[]
  acceptedAuthorAnswers?: string[]
  titlePlaceholder?: string
  authorPlaceholder?: string
  scoring?: Partial<GuessTitleAuthorScoring>
}

export interface RawFaceMorphChallenge extends RawChallengeBase {
  type: 'face_morph'
  singerGroups?: AcceptedAnswerGroup[]
  answerSlots?: number
  minimumCorrectGroups?: number
  placeholder?: string
}

export interface RawFillLyricsChallenge extends RawChallengeBase {
  type: 'fill_lyrics'
  solutionText?: string
  placeholder?: string
  scoring?: Partial<FillLyricsScoring>
}

export interface RawMusicalChainStage {
  id: string
  title?: string
  assets?: Array<string | ChallengeAsset>
}

export interface RawMusicalChainChallenge extends RawChallengeBase {
  type: 'musical_chain'
  stages?: RawMusicalChainStage[]
  acceptedAnswers?: string[]
  scoring?: Partial<MusicalChainScoring>
}

export interface RawHitsterTrack {
  id: string
  year: number
  title: string
  titleAcceptedAnswers?: string[]
  artist: string
  artistAcceptedAnswers?: string[]
  assets?: Array<string | ChallengeAsset>
}

export interface RawHitsterChallenge extends RawChallengeBase {
  type: 'hitster'
  tracks?: RawHitsterTrack[]
  initialOrder?: string[]
  correctOrder?: string[]
  scoring?: Partial<HitsterScoring>
}

export interface RawSpeedrunCharacter {
  id: string
  showName: string
  assets?: Array<string | ChallengeAsset>
  acceptedAnswers: string[]
}

export interface RawSpeedrunCharactersChallenge extends RawChallengeBase {
  type: 'speedrun_characters'
  timerSeconds?: number
  minimumCorrect?: number
  characters?: RawSpeedrunCharacter[]
}

export interface RawImageOptionMatchingItem {
  id: string
  label?: string
  assets?: Array<string | ChallengeAsset>
  correctOptionId: string
}

export interface RawImageOptionMatchingOption {
  id: string
  label: string
  icon?: string
  assets?: Array<string | ChallengeAsset>
}

export interface RawImageOptionMatchingChallenge extends RawChallengeBase {
  type: 'image_option_matching'
  items?: RawImageOptionMatchingItem[]
  options?: RawImageOptionMatchingOption[]
  minimumCorrectPairs?: number
}

export interface RawColumnReorderMatchingChallenge extends RawChallengeBase {
  type: 'column_reorder_matching'
  columns?: string[]
  rows?: ColumnReorderRow[]
  cells?: ColumnReorderCell[]
  shuffledColumnOrders?: string[][]
  lockedColumns?: number[]
  minimumCorrectRows?: number
  bonusNameCredit?: number
}

export interface RawCardMatchingItem {
  id: string
  assets?: Array<string | ChallengeAsset>
  correctNumber: string
  correctSuit: string
}

export interface RawCardMatchingChallenge extends RawChallengeBase {
  type: 'card_matching'
  items?: RawCardMatchingItem[]
  numberOptions?: string[]
  suitOptions?: string[]
  minimumCorrect?: number
}

export type RawChallenge =
  | RawMultipleChoiceChallenge
  | RawFreeTextChallenge
  | RawOrderingChallenge
  | RawProgressiveRevealChallenge
  | RawIntruderChallenge
  | RawSequenceReconstructionChallenge
  | RawGuessTitleAuthorChallenge
  | RawFaceMorphChallenge
  | RawFillLyricsChallenge
  | RawMusicalChainChallenge
  | RawHitsterChallenge
  | RawSpeedrunCharactersChallenge
  | RawImageOptionMatchingChallenge
  | RawColumnReorderMatchingChallenge
  | RawCardMatchingChallenge

export interface DailyStats {
  date: string
  quizzesStarted: number
  attemptsRemaining: number
  wrongAnswers: number
  livesRemaining: number
  lastResetAt: number
}

export interface RoomSessionSummary {
  categoryId: string
  startedAt: number
  completedAt: number
  correctCount: number
  wrongCount: number
  passed: boolean
  unlockedCategoryIds: string[]
  prizeAwarded: boolean
}

export interface RoomCompletedSessionSnapshot {
  challengeResults: Record<string, ChallengeFeedback>
  completedAt: number
  currentChallengeId: string
  correctCount: number
  totalChallenges: number
  wrongCount: number
}

export interface RoomProgress {
  categoryId: string
  startedAt: number | string | null
  sessions: RoomSessionSummary[]
  lastCompletedSession: RoomCompletedSessionSnapshot | null
  unlockedByScore: boolean
  prizeWon: boolean
  buyAccessAvailable: boolean
  victoryModalSeen?: boolean
}

export interface PendingBridgeTransition {
  sourceCategoryId: string
  targetCategoryId: string
  createdAt: string
  bridgeCompletedAt: string | null
}

export interface TransitionState {
  pendingBridge: PendingBridgeTransition | null
}

export interface PlayerState {
  version: 1
  createdAt: number
  credits: number
  stats: DailyStats
  roomProgress: Record<string, RoomProgress>
  unlockedCategoryIds: string[]
  currentRoom: string | null
  currentChallengeId: string
  activeSession: Record<string, unknown> | null
  lastPlayedAt: string | null
  transitionState: TransitionState
  rewardState?: Record<string, unknown>
  emailState?: Record<string, unknown>
}

export interface RawCategory {
  id: string
  kind?: CategoryKind
  title: string
  ghost: string
  description: string
  unlockCost?: number
  buyAccessCost?: number
  backgroundImage?: string
  mapImage?: string
  mapHotspots?: CategoryMapHotspot[]
  fear?: CategoryFear | null
  rewardArtifact?: RewardArtifact | null
  characters?: CategoryCharacters
  introNarrative?: CategoryIntroNarrative
  characterComments?: CategoryCharacterComments
  challenges?: RawChallenge[]
  questions?: Array<RawMultipleChoiceChallenge | RawFreeTextChallenge>
}