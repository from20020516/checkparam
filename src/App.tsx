import { useReducer, useEffect } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import Highlighter from 'react-highlight-words';
import { createBrowserHistory } from 'history';

import {
  Reducer,
  SetText,
  SetJob,
  SetType,
  SetMinLevel,
  Reset,
} from './condition';
import {
  jobs,
  armor,
  weapon,
  shield,
  miscWeapon,
  items,
  normalize,
  Encode,
  Decode,
} from './const';
import { Condition } from './condition';
import { Item } from './types';
import * as filter from './filter';
import * as column from './column';

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
    format: row =>
      row.description.split('\n').map(line => <div key={line}>{line}</div>),
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

const updateSearchParam = (cond: Condition): void => {
  createBrowserHistory().push({
    search: Encode(cond).toString(),
  });
};

const App = () => {
  const initial = Decode(new URLSearchParams(document.location.search));
  const [cond, dispatchCondition] = useReducer(Reducer, initial);
  console.log(cond);

  useEffect(() => {
    updateSearchParam(cond);
  }, [cond]);

  const words = cond.text
    .split(/\s/)
    .filter(t => t !== '')
    .map(normalize);
  const props = column.PropNames(words);
  const extra = props.map(column.Extra);
  const data = items.filter(filter.Build(cond)).sort(column.Sorter(props));

  const miscButton = (t: string) => (
    <button
      key={t}
      onClick={() => dispatchCondition(SetType(t))}
      style={{
        background: cond.types.has(t) ? 'mistyrose' : 0,
        border: 0,
      }}
    >
      {t}
    </button>
  );

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
          {jobs.map(job => (
            <button
              key={job.jas}
              onClick={() => dispatchCondition(SetJob(job.id))}
              style={{
                background: cond.job_flags & (1 << job.id) && 'mistyrose',
                border: 0,
              }}
            >
              {job.jas}
            </button>
          ))}
        </div>
        <div>
          スキル：
          {weapon.map(skill => (
            <button
              key={skill.ja}
              onClick={() => dispatchCondition(SetType(skill.ja))}
              style={{
                background: cond.types.has(skill.ja) ? 'mistyrose' : 0,
                border: 0,
              }}
            >
              {skill.ja}
            </button>
          ))}
          {Object.values(miscWeapon).map(miscButton)}
        </div>
        <div>
          装備枠：
          {miscButton(shield)}
          {armor.map(slot => (
            <button
              key={slot.ja}
              onClick={() => dispatchCondition(SetType(slot.ja))}
              style={{
                background: cond.types.has(slot.ja) ? 'mistyrose' : 0,
                border: 0,
              }}
            >
              {slot.ja}
            </button>
          ))}
          <button
            onClick={() =>
              dispatchCondition(SetMinLevel(cond.minLevel === 119 ? 0 : 119))
            }
            style={{
              background: cond.minLevel === 119 ? 'mistyrose' : 0,
              border: 0,
            }}
          >
            IL119
          </button>
          <button
            onClick={() =>
              dispatchCondition(SetMinLevel(cond.minLevel === 99 ? 0 : 99))
            }
            style={{
              background: cond.minLevel === 99 ? 'mistyrose' : 0,
              border: 0,
            }}
          >
            Lv99
          </button>
          <button
            onClick={() => dispatchCondition(Reset)}
            style={{ background: 0, border: 0 }}
          >
            リセット
          </button>
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
