import React, { useEffect, useReducer, useState } from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { makeInfoUrl, makeLocationUrl, makeMedicineUrl } from '@/app.routes'
import Loader from '@/components/loader'
import { ignore } from '@/helpers/func'
import { getApiBase } from '@/helpers/url'
import { Locale } from '@/locale/model'
import { State } from '@/store/reducers'
import { listed } from '@/styles/ts/common'
import { Collapse, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import LocalHospitalIcon from '@material-ui/icons/LocalHospital'
import InfoIcon from '@material-ui/icons/Info'
import DeleteIcon from '@material-ui/icons/Delete'
import AlertCaller from '@/components/alert-caller'
import { SupervisedListFail, SupervisedListSuccess } from '%/api/supervised'
import { SupervisedListDisplay } from '%/query/supervised'
import AddPopUp from './addPopup'
import DeletePopup from './deletePopup'

interface StateProps {
  locale: Locale
}

enum Stage {
  Loading = '@Supervised:Stage:Loading',
  Loaded = '@Supervised:Stage:Loaded'
}

interface LocalState {
  stage: Stage
  supervised: SupervisedListDisplay[]
  message: string
}

enum LocalActionType {
  Load = '@Supervised:LocalActionType:Load',
  LoadFail = '@Supervised:LocalActionType:LoadFail'
}

interface LocalActionLoad {
  type: LocalActionType.Load
  data: SupervisedListDisplay[]
}

interface LocalActionLoadFail {
  type: LocalActionType.LoadFail
  message: string
}
type LocalAction = LocalActionLoad | LocalActionLoadFail

const mapState = (state: State) => ({
  locale: state.lang.dict
})

const Supervised = ({ locale }: StateProps) => {
  // Main state
  const [state, dispatch] = useReducer(
    (prev: LocalState, action: LocalAction) => {
      switch (action.type) {
        case LocalActionType.Load:
          return { ...prev, stage: Stage.Loaded, supervised: action.data }
        case LocalActionType.LoadFail:
          return { ...prev, message: action.message }
        default:
          return prev
      }
    },
    { stage: Stage.Loading, supervised: [], message: '' }
  )

  const [fn, refetch] = useState(true)
  const onPopUpResult = () => refetch(!fn)

  useEffect(() => {
    fetch(`${getApiBase()}/supervised/list`)
      .then(r => {
        if (!r.ok && r.bodyUsed)
          r.text().then(j =>
            dispatch({
              type: LocalActionType.LoadFail,
              message: (JSON.parse(j) as SupervisedListFail).message
            })
          )
        else if (!r.ok)
          r.text().then(j =>
            dispatch({
              type: LocalActionType.LoadFail,
              message: j
            })
          )
        else
          r.text().then(j =>
            dispatch({
              type: LocalActionType.Load,
              data: (JSON.parse(j) as SupervisedListSuccess).supervised
            })
          )
      })
      .catch(e =>
        dispatch({
          type: LocalActionType.LoadFail,
          message: String(e)
        })
      )
  }, [fn])

  // Open tab state
  const [openNr, setOpenNr] = useState(-1)
  const handleClick = (v: number) => () => {
    if (v === openNr) setOpenNr(-1)
    else setOpenNr(v)
  }

  const [deleteOn, switchDelete] = useState(false)
  const [currentSupervised, setCurrentSupervised] = useState<SupervisedListDisplay>(null)
  const handleDeleteClick = (i: number) => () => {
    setCurrentSupervised(state.supervised[i])
    switchDelete(true)
  }

  const styles = listed()

  return (
    <>
      <Helmet>
        <title>{locale.title.supervised}</title>
      </Helmet>
      <div className={styles.container}>
        {state.stage === Stage.Loading ? (
          <Loader />
        ) : (
          <List component='ul' className={styles.fullCard}>
            {state.supervised.map(({ name, lastname, supervised_id }, i) => (
              <ListItem className={styles.fullCard} key={supervised_id}>
                <List className={styles.fullCard}>
                  <ListItem button onClick={handleClick(i)} className={styles.topItem}>
                    <ListItemText primary={name} secondary={lastname} />
                  </ListItem>
                  <Collapse in={openNr === i} timeout='auto' unmountOnExit>
                    <List component='ul' className={styles.subItem}>
                      <ListItem component={Link} to={makeInfoUrl(supervised_id)}>
                        <ListItemIcon>
                          <InfoIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={locale.supervised.list.item.healthDetail}
                          className={styles.camouflagedLink}
                        />
                      </ListItem>
                      <ListItem component={Link} to={makeLocationUrl(supervised_id)}>
                        <ListItemIcon>
                          <LocationOnIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={locale.supervised.list.item.location}
                          className={styles.camouflagedLink}
                        />
                      </ListItem>
                      <ListItem component={Link} to={makeMedicineUrl(supervised_id)}>
                        <ListItemIcon>
                          <LocalHospitalIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={locale.supervised.list.item.medications}
                          className={styles.camouflagedLink}
                        />
                      </ListItem>
                      <ListItem button className={styles.listItemDanger} onClick={handleDeleteClick(i)}>
                        <ListItemIcon>
                          <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText primary={locale.medicine.common.button.delete} color='warning' />
                      </ListItem>
                      <AlertCaller supervised={state.supervised[i]} />
                    </List>
                  </Collapse>
                </List>
              </ListItem>
            ))}
          </List>
        )}
      </div>
      <AddPopUp
        open={false}
        title={locale.supervised.add.title}
        body={locale.supervised.add.body}
        fieldLabel={locale.supervised.add.fieldLabel}
        button={locale.supervised.add.button}
        onResult={onPopUpResult}
      />
      {deleteOn && (
        <DeletePopup onResult={onPopUpResult} handleClose={() => switchDelete(false)} supervised={currentSupervised} />
      )}
    </>
  )
}

export default connect<StateProps>(mapState, ignore({}))(Supervised)
