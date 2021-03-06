import { SupervisedListDisplay } from 'shared/query/supervised'
import { UUID } from '%/query/columnTypes'

export interface SupervisedListSuccess {
  ok: true
  supervised: SupervisedListDisplay[]
}

export interface SupervisedListFail {
  ok: false
  supervised: []
  message: string
}

export type SupervisedListResult = SupervisedListSuccess | SupervisedListFail

export interface AddSupervisedReqBody {
  device_id: UUID
}

interface AddSupervisedResOk {
  ok: true
}

interface AddSupervisedResError {
  ok: false
  message: string
}

export type AddSupervisedRes = AddSupervisedResOk | AddSupervisedResError

export interface SupervisedRemoveReqBody {
  supervised_id: UUID
}

interface SupervisedRemoveResFail {
  ok: false
  message: string
}

interface SupervisedRemoveResSuccess {
  ok: true
}

type SupervisedRemoveRes = SupervisedRemoveResFail | SupervisedRemoveResSuccess
