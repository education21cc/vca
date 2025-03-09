import { useTranslationStore } from '@/stores/translations'
import { useContentStore } from '@/stores/content'
import './styles/finderBox.scss'
import { GameState, useGameStateStore } from '@/stores/gameState';

interface Props {
  foundSituations: string[];
  onOpenGame: () => void;
}

const FinderBox = (props: Props) => {
  const { getText } = useTranslationStore()
  const { content } = useContentStore()
  const { foundSituations, onOpenGame } = props
  const { setState } = useGameStateStore()

  if (!content?.finder) return null
  const finderContent = content?.finder
  const disabled = foundSituations.length < finderContent.situations.length

  const handleNext = () => {
    if (content.finder?.complete) {
      // A finder game with a complete state
      setState(GameState.complete)
    } else {
      //
      onOpenGame()
    }
  }

  return (
    <div className="finder-box">
      {getText('finder-instruction')}
      {`(${foundSituations.length}/${content.finder.situations.length})`}
      <button className="green button" disabled={disabled} onClick={handleNext}>
        {getText('button-next')}
      </button>
    </div>
  )
}

export default FinderBox
