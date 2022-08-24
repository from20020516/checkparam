import { useReducer, useEffect } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import Highlighter from 'react-highlight-words';

import {
  Reducer,
  SetText,
  SetJob,
  SetType,
  SetMinLevel,
  Reset,
  StoreParam,
  LoadParam,
} from './condition';
import { Job, Armor, Weapon, Items, Normalize, JobNames } from './const';
import { Item } from './types';
import * as filter from './filter';
import * as column from './column';
import './App.css';

const columns = (
  extra: TableColumn<Item>[],
  words: string[]
): TableColumn<Item>[] => [
  {
    name: 'アイテム',
    selector: row => row.name,
    cell: row => (
      <a href={searchLink(row.name)}>
        <Highlighter
          searchWords={words}
          textToHighlight={row.name}
          autoEscape={true}
          caseSensitive={false}
        />
      </a>
    ),
    sortable: true,
    width: '14em',
  },
  {
    name: '説明',
    selector: row => row.description,
    cell: row => (
      <Highlighter
        searchWords={words}
        textToHighlight={row.description}
        autoEscape={true}
        caseSensitive={false}
      />
    ),
    sortable: true,
    width: '28em',
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
    selector: row => JobNames(row.jobs),
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
  const [cond, dispatchCondition] = useReducer(Reducer, LoadParam());

  useEffect(() => {
    StoreParam(cond);
  }, [cond]);

  const words = cond.text
    .split(/\s/)
    .filter(t => t !== '')
    .map(Normalize);
  const props = column.PropNames(words);
  const extra = props.map(column.Extra);
  const data = Items.filter(filter.Build(cond)).sort(column.Sorter(props));

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
          {Job.map(job => (
            <button
              key={job.jas}
              onClick={() => dispatchCondition(SetJob(job.id))}
              className={cond.job_flags & (1 << job.id) ? 'on' : 'off'}
            >
              {job.jas}
            </button>
          ))}
        </div>
        <div>
          武器：
          {Weapon.map(name => (
            <button
              key={name}
              onClick={() => dispatchCondition(SetType(name))}
              className={cond.types.has(name) ? 'on' : 'off'}
            >
              {name}
            </button>
          ))}
        </div>
        <div>
          防具：
          {Armor.map(slot => (
            <button
              key={slot}
              onClick={() => dispatchCondition(SetType(slot))}
              className={cond.types.has(slot) ? 'on' : 'off'}
            >
              {slot}
            </button>
          ))}
          <button
            onClick={() =>
              dispatchCondition(SetMinLevel(cond.minLevel === 119 ? 0 : 119))
            }
            className={cond.minLevel === 119 ? 'on' : 'off'}
          >
            IL119
          </button>
          <button
            onClick={() =>
              dispatchCondition(SetMinLevel(cond.minLevel === 99 ? 0 : 99))
            }
            className={cond.minLevel === 99 ? 'on' : 'off'}
          >
            Lv99
          </button>
          <button onClick={() => dispatchCondition(Reset)}>リセット</button>
        </div>
      </div>
      <DataTable
        columns={columns(extra, words.map(column.PropName))}
        data={data}
        fixedHeader={true}
        pagination={true}
        paginationPerPage={30}
        paginationRowsPerPageOptions={[10, 30, 50, 100, 200]}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
};

const searchLink = (s: string): string => {
  const x = encodeURIComponent(s);
  return `http://wiki.ffo.jp/search.cgi?CCC=%E6%84%9B&Command=Search&qf=${x}&order=match&ffotype=title&type=title`;
};

export default App;
