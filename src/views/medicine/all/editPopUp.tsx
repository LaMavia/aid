import Loader from '@/components/loader'
import { getApiBase } from '@/helpers/url'
import {
  TextField,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  Button,
  Snackbar
} from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import React, { ChangeEventHandler, useReducer } from 'react'
import { Locale } from '@/locale/model'
import { State } from '@/store/reducers'
import { connect } from 'react-redux'
import { Medicine, MedicineUpdateReq } from '%/query/medicine'
import { MedicineResUpdate } from '%/api/medicine'

enum Stage {
  Displayed = '@Medicine:All:AddPopUp:Displayed',
  Waiting = '@Medicine:All:AddPopUp:Waiting',
  Result = '@Medicine:All:AddPopUp:Result'
}

interface LocalState {
  ok: boolean
  message: string
  stage: Stage
  name: string
  unit: string
  amount: number
}

interface LocalProps {
  medicine: Medicine

  handleClose: () => void
  onResult: () => void
}

enum ActionType {
  IntoWaiting = '@Medicine:All:AddPopUp:Action:IntoWaiting',
  IntoResult = '@Medicine:All:AddPopUp:Action:IntoResult',
  IntoDisplayed = '@Medicine:All:AddPopUp:Action:IntoDisplayed',
  onInput = '@Medicine:All:AddPopUp:Action:onInput'
}

interface ActionIntoWaiting {
  type: ActionType.IntoWaiting
}

interface ActionIntoResult {
  type: ActionType.IntoResult
  ok: boolean
  message?: string
}

interface ActionIntoDisplayed {
  type: ActionType.IntoDisplayed
}

type DataKey = 'name' | 'unit' | 'amount'

interface ActionOnInput {
  type: ActionType.onInput
  key: DataKey
  data: string
}

type Action = ActionOnInput | ActionIntoWaiting | ActionIntoResult | ActionIntoDisplayed

interface DispatchProps {
  locale: Locale
}

const mapProps = (state: State): DispatchProps => ({
  locale: state.lang.dict
})

const defaultState: LocalState = {
  ok: true,
  message: '',
  stage: Stage.Displayed,
  name: '',
  unit: '',
  amount: 0
}

const Elem = ({ onResult, handleClose, medicine, locale }: LocalProps & DispatchProps): React.ReactElement => {
  const { name, unit, amount } = medicine

  const [state, dispatch] = useReducer(
    (prev: LocalState = defaultState, action: Action) => {
      switch (action.type) {
        case ActionType.onInput:
          return { ...prev, [action.key]: action.data }
        case ActionType.IntoWaiting:
          return { ...prev, stage: Stage.Waiting }
        case ActionType.IntoResult:
          return {
            ...prev,
            stage: Stage.Result,
            device_id: '',
            ok: action.ok,
            message: action.message
          }
        case ActionType.IntoDisplayed:
          return { ...prev, stage: Stage.Displayed }
        default:
          return prev
      }
    },
    { ...defaultState, stage: Stage.Displayed, name, unit, amount }
  )

  const handleChange = (key: DataKey): ChangeEventHandler => e => {
    dispatch({
      type: ActionType.onInput,
      key,
      data: (e.currentTarget as HTMLInputElement).value
    })
  }

  const handleSubmitClick = () => {
    dispatch({
      type: ActionType.IntoWaiting
    })

    fetch(`${getApiBase()}/medicine/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        medicine_id: medicine.medicine_id,
        supervised_id: medicine.supervised_id,
        name: state.name.trim(),
        amount: state.amount,
        unit: state.unit.trim()
      } as MedicineUpdateReq)
    })
      .then(async r => {
        const message: string = await r
          .text()
          .then(JSON.parse)
          .then((j: MedicineResUpdate) => j.message || r.statusText)
          .catch(e => `${String(e)}; (${r.status}) ${r.statusText}`)

        dispatch({
          type: ActionType.IntoResult,
          ok: r.ok,
          message
        })

        onResult()
      })
      .catch(e => {
        dispatch({
          type: ActionType.IntoResult,
          ok: false,
          message: String(e)
        })

        onResult()
      })
  }

  const saveDisabled = state.name === '' || state.unit === ''

  if (state.stage === Stage.Waiting) return <Loader />
  if (state.stage === Stage.Result)
    return (
      <Snackbar
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        open
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={state.ok ? 'success' : 'error'}>
          {state.message}
        </Alert>
      </Snackbar>
    )

  // if (state.stage === Stage.Displayed)
  return (
    <Dialog open onClose={handleClose}>
      <DialogTitle>{locale.medicine.all.edit.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{locale.medicine.all.edit.body}</DialogContentText>
        <TextField
          margin='dense'
          id='name'
          label={locale.medicine.all.edit.name}
          type='text'
          fullWidth
          required
          onChange={handleChange('name')}
          value={state.name}
        />
        <TextField
          margin='dense'
          id='unit'
          label={locale.medicine.all.edit.unit}
          type='text'
          fullWidth
          required
          onChange={handleChange('unit')}
          value={state.unit}
        />
        <TextField
          margin='dense'
          id='amount'
          label={locale.medicine.all.edit.amount}
          type='number'
          fullWidth
          required
          onChange={handleChange('amount')}
          value={state.amount}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{locale.medicine.common.button.cancel}</Button>
        <Button color='primary' disabled={saveDisabled} onClick={handleSubmitClick}>
          {locale.medicine.common.button.save}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default connect<DispatchProps>(mapProps)(Elem)
