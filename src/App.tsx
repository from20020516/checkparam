import { useEffect, useReducer, useState } from 'react'
import { Item, SkillCategory } from '../utils'
import DataTable, { TableColumn } from 'react-data-table-component'
import toRegexRange from 'to-regex-range'

const constants: {
  jobs: { id: number, en: string, ja: string, ens: string, jas: string }[],
  slots: { id: number, en: string, ja: string }[],
  skills: { id: number, en: string, ja: string, category: SkillCategory }[]
} = require('./constants.json')
const data: Item[] = require('./items.json')

const columns: TableColumn<Item>[] = [
  {
    name: 'アイテム',
    selector: row => row.name,
    sortable: true,
    width: '14em',
  },
  {
    name: '種別',
    selector: row => row.type,
    sortable: true,
    width: '14em',
  },
  {
    name: '説明',
    selector: row => row.description,
    sortable: true,
    width: '28em',
    format: row => row.description.split('\n').map(line => <div key={line}>{line}</div>),
  },
  {
    name: 'ジョブ',
    selector: row => row.jobs,
    sortable: true,
    width: '28em',
  },
  {
    name: 'Lv',
    selector: row => row.level,
    sortable: true,
    width: '10em',
  },
  {
    name: 'IL',
    selector: row => row.item_level,
    sortable: true,
    width: '10em',
  },
]

type FilterState = {
  job_flags: number
  slot_flags: number
  skill: number
  text: string
  isIL119: boolean
  isLv99: boolean
}

type FilterAction =
  | { type: 'SET_TEXT', text: string }
  | { type: 'SET_JOB_FLAGS', bits: number }
  | { type: 'SET_SLOT_FLAGS', bits: number }
  | { type: 'SET_SKILL', id: number }
  | { type: 'SET_IL119' }
  | { type: 'SET_LV99' }
  | { type: 'RESET' }

const initialFilter = {
  job_flags: 0,
  slot_flags: 0,
  skill: 0,
  isIL119: false,
  isLv99: false,
  text: ''
}

const filterReducer = (state: FilterState, action: FilterAction) => {
  switch (action.type) {
    case 'SET_JOB_FLAGS':
      return {
        ...state,
        job_flags: state.job_flags === (1 << action.bits) ? 0 : 0 ^ (1 << action.bits)/** 指定ジョブのbitを排他的に反転させる */
      }
    case 'SET_SLOT_FLAGS':
      return {
        ...state,
        slot_flags: state.slot_flags ^ (1 << action.bits) /** 指定スロットのbitを反転させる */
      }
    case 'SET_SKILL':
      return {
        ...state,
        skill: state.skill === action.id ? 0 : action.id
      }
    case 'SET_TEXT':
      return {
        ...state,
        text: action.text
      }
    case 'SET_IL119':
      return {
        ...state,
        isIL119: !state.isIL119
      }
    case 'SET_LV99':
      return {
        ...state,
        isLv99: !state.isLv99
      }
    case 'RESET':
      return initialFilter
    default:
      throw new Error('UNKNOWN_ACTION')
  }
}

const App = () => {
  const [items, setItems] = useState<Item[]>(data)
  const [filter, dispatchFilter] = useReducer(filterReducer, initialFilter)

  useEffect(() => {
    console.log(filter)
    let items = data
    if (filter.text) {
      /** 空白区切り`AND`クエリ */
      items = filter.text.split(/\s/).reduce((items, query) => {
        const groups = query.match(/(?<key>.+)(?<operator>>=|>)(?<threshold>\d+)/)?.groups
        if (groups) {
          const threshold = groups.operator === '>='
            ? Number(groups.threshold)
            : Number(groups.threshold) + 1
          return items.filter(item => item.description.match(new RegExp(`(^|\\s)${groups.key}\\+${toRegexRange(threshold, 999)}`)))
        }
        return items.filter(item => [item.name, item.description].join().includes(query))
      }, items)
    }
    if (filter.job_flags)
      items = items.filter(item => (item._jobs & filter.job_flags) === filter.job_flags)
    if (filter.slot_flags)
      items = items.filter(item => item._slots & filter.slot_flags)
    if (filter.skill)
      items = items.filter(item => item.skill === filter.skill)
    if (filter.isIL119)
      items = items.filter(item => item.item_level === 119)
    if (filter.isLv99)
      items = items.filter(item => item.level === 99)
    setItems(items)
  }, [filter])

  return (
    <div>
      <div style={{
        paddingLeft: 15,
        paddingRight: 15,
        textAlign: 'center',
      }}>
        <div>
          <h1>FFXI アイテム検索</h1>
          <input
            type='text'
            value={filter.text}
            placeholder='例: ストアTP>10'
            onChange={e => dispatchFilter({ type: 'SET_TEXT', text: e.target.value })}
            style={{ width: '80%', height: 30, margin: '10px', maxWidth: 600 }}
          />
        </div>
        <div>
          {constants.jobs.slice(0, -1).map(job => job.id
            ? <button
              key={job.jas}
              onClick={() => dispatchFilter({ type: 'SET_JOB_FLAGS', bits: job.id })}
              style={{ background: filter.job_flags & (1 << job.id) && 'grey', border: 0 }}
            >
              {job.jas}
            </button>
            : <div key={job.jas}></div>
          )}
        </div>
        <div>
          {constants.skills.filter(skill => skill.category === 'Combat' && !['回避', '受け流し', 'ガード'].includes(skill.ja)).map(skill =>
            <button
              key={skill.ja}
              onClick={() => dispatchFilter({ type: 'SET_SKILL', id: skill.id })}
              style={{ background: filter.skill === skill.id ? 'grey' : 0, border: 0 }}
            >
              {skill.ja}
            </button>)}
        </div>
        <div>
          {constants.slots.map(slot => <button
            key={slot.ja}
            onClick={() => dispatchFilter({ type: 'SET_SLOT_FLAGS', bits: slot.id })}
            style={{ background: filter.slot_flags & (1 << slot.id) && 'grey', border: 0 }}
          >
            {slot.ja}
          </button>)}
          <button
            onClick={() => dispatchFilter({ type: 'SET_IL119' })}
            style={{ background: filter.isIL119 ? 'grey' : 0, border: 0 }}
          >
            IL119
          </button>
          <button
            onClick={() => dispatchFilter({ type: 'SET_LV99' })}
            style={{ background: filter.isLv99 ? 'grey' : 0, border: 0 }}
          >
            Lv99
          </button>
          <button
            onClick={() => dispatchFilter({ type: 'RESET' })}
            style={{ background: 0, border: 0 }}
          >
            リセット
          </button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={items}
        fixedHeader={true}
        pagination={true}
        paginationPerPage={30}
        paginationRowsPerPageOptions={[10, 30, 50, 100, 200]}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  )
}

export default App
