import React from 'react'
import {TextField, Grid, Button, Typography} from '@material-ui/core'
import {makeStyles} from '@material-ui/styles'
import {Formik} from 'formik'
import * as Yup from 'yup'
import {CommonRegistrationSchema} from 'common/schemas'
import {apiRequest} from '../utils/api'
import {useAuth} from '../auth/AuthContext'
import {CommonFormPropsFactory} from '../utils/forms'
import {useErrorHandling} from '../ErrorHandler'

const useStyles = makeStyles((theme) => ({
  input: {
    width: 300,
    marginBottom: theme.spacing(2),
  },
}))

const RegistrationSchema = Yup.object({
  ...CommonRegistrationSchema,
  passwordConfirmation: Yup.string().oneOf(
    [Yup.ref('password'), null],
    'Passwords must match!'
  ),
})

export const Registration = () => {
  const styles = useStyles()
  const {login} = useAuth()
  const {setError} = useErrorHandling()

  const onSubmit = async (values, setSubmitting, setErrors) => {
    const {data: player, status} = await apiRequest('player', 'POST', {
      login: values.login,
      password: values.password,
      pin: values.pin,
    })
    setSubmitting(false)
    if (player) {
      login(player.id)
    } else {
      if (status < 500) {
        setErrors({
          failedRegistration: 'Please try another username or check PIN.',
        })
      } else {
        setError(true)
      }
    }
  }

  return (
    <Formik
      initialValues={{
        login: '',
        pin: '',
        password: '',
        passwordConfirmation: '',
      }}
      validationSchema={RegistrationSchema}
      onSubmit={(values, {setSubmitting, setErrors}) => {
        onSubmit(values, setSubmitting, setErrors)
      }}
    >
      {(formProps) => {
        const getCommonProps = CommonFormPropsFactory(formProps, {
          className: styles.input,
        })
        const {handleSubmit, isSubmitting, errors} = formProps
        return (
          <form onSubmit={handleSubmit} noValidate>
            <Grid container direction="column">
              <TextField
                type="text"
                label="Login"
                {...getCommonProps('login')}
              />
              <TextField
                type="password"
                label="Password"
                {...getCommonProps('password')}
              />
              <TextField
                type="password"
                label="Repeat password"
                {...getCommonProps('passwordConfirmation')}
              />
              <TextField
                type="text"
                label="Secret pin"
                {...getCommonProps('pin')}
              />
              {errors && errors.failedRegistration && (
                <Typography variant="caption" color="error">
                  {errors.failedRegistration}
                </Typography>
              )}
              <Button type="submit" disabled={isSubmitting}>
                Register
              </Button>
            </Grid>
          </form>
        )
      }}
    </Formik>
  )
}
