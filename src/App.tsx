import { useEffect, useReducer, useState } from 'react';
import { Item, SkillCategory } from '../utils';
import DataTable, { TableColumn } from 'react-data-table-component';
import Highlighter from 'react-highlight-words';
import { Reducer, SetText, SetJob, SetSlot, SetSkill, SetMinLevel, Reset, Initial } from './condition';
import * as filter from './query';
import * as column from './column';

const constants: {
  jobs: { id: number; en: string; ja: string; ens: string; jas: string }[];
  slots: { id: number; en: string; ja: string }[];
  skills: { id: number; en: string; ja: string; category: SkillCategory }[];
} = require('./constants.json');
const data: Item[] = require('./items.json');

const columns = (extra: TableColumn<Item>[], words: string[]): TableColumn<Item>[] => [
  {
    name: 'アイテム',
    selector: row => row.name,
    cell: row => (
      <a
        href={`http://wiki.ffo.jp/search.cgi?CCC=%E6%84%9B&Command=Search&qf=${encodeURIComponent(
          row.name
        )}&order=match&ffotype=title&type=title`}
      >
        <Highlighter searchWords={words} textToHighlight={row.name} />
      </a>
    ),
    sortable: true,
    width: '14em',
  },
  {
    name: '説明',
    selector: row => row.description,
    cell: row => <Highlighter searchWords={words} textToHighlight={row.description} />,
    sortable: true,
    width: '28em',
    format: row => row.description.split('\n').map(line => <div key={line}>{line}</div>),
  },
  ...extra,
  {
    name: '種別',
    selector: row => row.type,
    sortable: true,
    width: '14em',
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
];

const App = () => {
  const [items, setItems] = useState<Item[]>(data);
  const [cond, dispatchCondition] = useReducer(Reducer, Initial());

  useEffect(() => {
    setItems(filter.Apply(cond, data));
  }, [cond]);

  const words = cond.text.split(/\s/).filter(t => t !== '');
  const props = column.PropNames(words);
  const extra = props.map(column.Extra);
  const sorted = items.sort(column.Sorter(props));

  return (
    <div>
      <div
        style={{
          paddingLeft: 15,
          paddingRight: 15,
          textAlign: 'left',
        }}
      >
        <div>
          <h1>FFXI アイテム検索</h1>
          <input
            type="text"
            value={cond.text}
            placeholder="例: ストアTP>10"
            onChange={e => dispatchCondition(SetText(e.target.value))}
            style={{ width: '80%', height: 30, margin: '10px', maxWidth: 600 }}
          />
        </div>
        <div>
          ジョブ：
          {constants.jobs.slice(1, -1).map(job =>
            job.id ? (
              <button
                key={job.jas}
                onClick={() => dispatchCondition(SetJob(job.id))}
                style={{
                  background: cond.job_flags & (1 << job.id) && 'grey',
                  border: 0,
                }}
              >
                {job.jas}
              </button>
            ) : (
              <div key={job.jas}></div>
            )
          )}
        </div>
        <div>
          スキル：
          {constants.skills
            .filter(skill => skill.category === 'Combat' && !['回避', '受け流し', 'ガード'].includes(skill.ja))
            .map(skill => (
              <button
                key={skill.ja}
                onClick={() => dispatchCondition(SetSkill(skill.id))}
                style={{
                  background: cond.skill & (1 << skill.id) ? 'grey' : 0,
                  border: 0,
                }}
              >
                {skill.ja}
              </button>
            ))}
        </div>
        <div>
          装備枠：
          {constants.slots.map(slot => (
            <button
              key={slot.ja}
              onClick={() => dispatchCondition(SetSlot(slot.id))}
              style={{
                background: cond.slot_flags & (1 << slot.id) && 'grey',
                border: 0,
              }}
            >
              {slot.ja}
            </button>
          ))}
          <button
            onClick={() => dispatchCondition(SetMinLevel(cond.minLevel === 119 ? 0 : 119))}
            style={{
              background: cond.minLevel === 119 ? 'grey' : 0,
              border: 0,
            }}
          >
            IL119
          </button>
          <button
            onClick={() => dispatchCondition(SetMinLevel(cond.minLevel === 99 ? 0 : 99))}
            style={{ background: cond.minLevel === 99 ? 'grey' : 0, border: 0 }}
          >
            Lv99
          </button>
          <button onClick={() => dispatchCondition(Reset)} style={{ background: 0, border: 0 }}>
            リセット
          </button>
        </div>
      </div>
      <DataTable
        columns={columns(extra, words.map(column.PropName))}
        data={sorted}
        fixedHeader={true}
        pagination={true}
        paginationPerPage={30}
        paginationRowsPerPageOptions={[10, 30, 50, 100, 200]}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
};

export default App;
