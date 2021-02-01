import React from 'react'
import {useHistory} from 'react-router-dom'
import {TextField, Button, Grid} from '@material-ui/core'
import {makeStyles} from '@material-ui/styles'
import {Formik} from 'formik'
import * as Yup from 'yup'
import {apiRequest} from '../utils/api'
import {CommonFormPropsFactory} from '../utils/forms'

const useStyles = makeStyles((theme) => ({
  input: {
    width: 350,
  },
}))

const CreateGameSchema = Yup.object().shape({
  numberOfPlayers: Yup.number()
    .min(5, 'Min number of players is 5!')
    .max(10, 'Max number of players is 10!')
    .required('Number of players is required!'),
})

export const CreateGame = () => {
  const styles = useStyles()
  const history = useHistory()

  const onSubmit = async (values, setSubmitting) => {
    try {
      const game = await apiRequest('game', 'POST', {
        numberOfPlayers: values.numberOfPlayers,
      })
      setSubmitting(false)
      history.push(`game/${game.id}`)
    } catch (error) {
      setSubmitting(false)
      alert('Unxepected error ...')
    }
  }

  return (
    <Formik
      initialValues={{numberOfPlayers: 5}}
      validationSchema={CreateGameSchema}
      onSubmit={(values, {setSubmitting}) => {
        onSubmit(values, setSubmitting)
      }}
    >
      {(formProps) => {
        const getCommonProps = CommonFormPropsFactory(formProps, {
          className: styles.input,
        })
        const {handleSubmit, isSubmitting} = formProps
        return (
          <form onSubmit={handleSubmit} noValidate>
            <Grid container direction="column">
              <TextField
                type="number"
                label="Number of players"
                {...getCommonProps('numberOfPlayers')}
              />
              <Button disabled={isSubmitting} type="submit">
                Create game
              </Button>
            </Grid>
          </form>
        )
      }}
    </Formik>
  )
}
