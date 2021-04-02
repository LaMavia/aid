import { UUID } from '%/query/columnTypes'
import { Medicine } from '%/query/medicine'

export interface MedicineReqAllBody {
  supervised_id: UUID
}

interface MedicineResAllSuccess {
  ok: true
  medicine: Medicine[]
}

interface MedicineResAllFail {
  ok: false
  message: string
}

export type MedicineResAll = MedicineResAllFail | MedicineResAllSuccess