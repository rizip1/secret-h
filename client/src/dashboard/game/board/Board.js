import React from 'react'
import {Paper, Box, Typography} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'

import {BoardCard} from './BoardCard'
import {StatusBar} from './StatusBar'
import {Players} from './Players'
import {BoardCardActions} from './BoardCardActions'
import {GameResults, GoBack} from './GameResults'
import {PresidentTurn, ChancellorTurn, Vote} from './election'
import {ChoosePresident, KillPlayer, Investigate, Examine} from './cardActions'

import {useGameData} from '../GameDataContext'
import {fascistCardsConf} from 'common/constants.js'

const useCardPlaceholderStyles = makeStyles((theme) => {
  const border = (race) => `2px dashed ${theme.palette[race].dark}`

  return {
    wrapper: {
      height: '100%',
      position: 'relative',
      width: 'calc(100% / 6.5)',
      display: 'flex',
      justifyContent: 'center',
      background: ({race, position}) => {
        if (race === 'liberal') {
          return position === 4
            ? theme.palette[race].dark
            : theme.palette[race].main
        } else {
          return position < 3
            ? theme.palette[race].main
            : theme.palette[race].dark
        }
      },
      border: ({race, position}) => {
        if (race === 'liberal') {
          return position < 4 ? border(race) : 'none'
        } else {
          return position < 3 ? border(race) : 'none'
        }
      },
    },
    endGame: {
      marginTop: 80,
    },
    front: {
      position: 'relative',
      zIndex: 1,
    },
    bg: {
      position: 'absolute',
    },
  }
})

const CardPlaceholder = ({race, position, children}) => {
  const styles = useCardPlaceholderStyles({race, position})
  const {
    gameData: {gameInfo},
  } = useGameData()

  if (race === 'fascist') {
    const conf = fascistCardsConf[gameInfo.number_of_players]
    let actions = conf[position] || []

    return (
      <Box className={styles.wrapper}>
        <Box className={styles.front}>{children}</Box>
        <Box className={styles.bg}>
          {position < 5 ? (
            <BoardCardActions actions={actions} />
          ) : (
            <Typography variant="h6" align="center" className={styles.endGame}>
              Fascists win
            </Typography>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box className={styles.wrapper}>
      <Box className={styles.front}>{children}</Box>
      <Box className={styles.bg}>
        {position === 4 && (
          <Typography variant="h6" align="center" className={styles.endGame}>
            Liberals win
          </Typography>
        )}
      </Box>
    </Box>
  )
}

const useScoreBoardStyles = makeStyles((theme) => {
  return {
    wrapper: {
      flex: 1,
      display: 'flex',
      background: ({type}) =>
        type === 'fascist'
          ? theme.palette.fascist.dark
          : theme.palette.liberal.dark,
      padding: theme.spacing(2),
      border: ({type}) => `10px double ${theme.palette[type].main}`,
    },
    innerWrapper: {
      flex: 1,
      height: 200,
      background: ({type}) =>
        type === 'fascist'
          ? theme.palette.fascist.main
          : theme.palette.liberal.main,
      display: 'flex',
      justifyContent: 'space-between',
      padding: theme.spacing(0.5),
    },
  }
})

const ScoreBoard = ({children, type}) => {
  const styles = useScoreBoardStyles({type})
  return (
    <Box className={styles.wrapper}>
      <Box className={styles.innerWrapper}>{children}</Box>
    </Box>
  )
}

const useBoardStyles = makeStyles((theme) => {
  return {
    room: {
      background: theme.palette.primary.main,
      display: 'flex',
      minWidth: 1100,
      minHeight: '100vh',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'column',
    },
    boardWrapper: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
    },
    board: {
      width: '1000px',
      display: 'flex',
      flexDirection: 'column',
      background: 'inherit',
    },
    playersWrapper: {
      marginBottom: 20,
    },
    goBack: {
      position: 'absolute',
      left: 20,
      top: 20,
    },
  }
})

export const Board = () => {
  const styles = useBoardStyles()
  const {
    gameData: {gameInfo},
  } = useGameData()

  return (
    <Box className={styles.room}>
      <Box className={styles.goBack}>
        <GoBack />
      </Box>
      <Box className={styles.boardWrapper}>
        <Paper className={styles.board}>
          <StatusBar />

          <Box mt={1.5} />

          <ScoreBoard type="fascist">
            {Array.from(Array(6)).map((__, i) => {
              return (
                <CardPlaceholder key={i} position={i} race="fascist">
                  {i < gameInfo.conf.fascistsLawsCount ? (
                    <BoardCard type="fascist" />
                  ) : null}
                </CardPlaceholder>
              )
            })}
          </ScoreBoard>

          <Box mt={1.5} />

          <ScoreBoard type="liberal">
            {Array.from(Array(5)).map((__, i) => {
              return (
                <CardPlaceholder key={i} position={i} race="liberal">
                  {i < gameInfo.conf.liberalLawsCount ? (
                    <BoardCard type="liberal" />
                  ) : null}
                </CardPlaceholder>
              )
            })}
          </ScoreBoard>
        </Paper>
      </Box>

      <Box className={styles.playersWrapper}>
        <Players />
      </Box>

      {/* Election actions */}
      {gameInfo.conf.action === 'vote' && <Vote />}
      {gameInfo.conf.action === 'president-turn' && <PresidentTurn />}
      {gameInfo.conf.action === 'president-turn-veto' && <PresidentTurn veto />}
      {gameInfo.conf.action === 'chancellor-turn' && <ChancellorTurn />}
      {gameInfo.conf.action === 'chancellor-turn-veto' && (
        <ChancellorTurn veto />
      )}

      {/* Card actions */}
      {gameInfo.conf.action === 'kill' && <KillPlayer />}
      {gameInfo.conf.action === 'examine' && <Examine />}
      {gameInfo.conf.action === 'investigate' && <Investigate />}
      {gameInfo.conf.action === 'choose-president' && <ChoosePresident />}

      {/* Final results */}
      {gameInfo.conf.action === 'results' && <GameResults />}
    </Box>
  )
}
