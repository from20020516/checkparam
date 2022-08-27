import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Condition, jobNames } from './condition';

export const siteName = 'FFXI アイテム検索';

const Header = (props: { cond: Condition }) => {
  const [title, setTitle] = useState('');

  const handleTitle = (cond: Condition) =>
    `${siteName} ${jobNames(cond, '')}+${[...cond.types].join('')}`;

  useEffect(() => {
    setTitle(handleTitle(props.cond));
  }, [props.cond]);

  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
};

export default Header;
