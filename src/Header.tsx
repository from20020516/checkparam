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
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@ajiyoshi" />
      <meta name="twitter:creator" content="@ajiyoshi" />
      <meta property="og:url" content={document.location.href} />
      <meta property="og:title" content={title} />
      <meta
        property="og:description"
        content="ファイナルファンタジーXIのアイテム検索ツールです。ジョブ、武器・防具の種類、レベル、ステータスやプロパティなど様々な検索が可能です。"
      />
    </Helmet>
  );
};

export default Header;
