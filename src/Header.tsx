import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Condition, jobNames } from './condition';

export const siteName = 'FFXI アイテム検索';

const getTitle = (cond: Condition) =>
  `${siteName} ${jobNames(cond, '')} ${[...cond.types].join(' ')}`;

const Header = (props: { cond: Condition }) => {
  const [title, setTitle] = useState<string>(getTitle(props.cond));

  useEffect(() => {
    setTitle(getTitle(props.cond));
  }, [props.cond]);

  return (
    <Head>
      <title>{title}</title>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@ajiyoshi" />
      <meta name="twitter:creator" content="@ajiyoshi" />
      <meta property="og:title" content={title} />
      <meta
        property="og:description"
        content="ファイナルファンタジーXIのアイテム検索ツールです。ジョブ、武器・防具の種類、レベル、ステータスやプロパティなど様々な検索が可能です。"
      />
      <meta
        property="og:image"
        content="http://graphics8.nytimes.com/images/2011/12/08/technology/bits-newtwitter/bits-newtwitter-tmagArticle.jpg"
      />
    </Head>
  );
};

export default Header;
