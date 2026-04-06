import { Fragment, memo } from 'react';
import { escapeRegExp } from '@/utils/string';

interface HighlightTextProps {
  text: string;
  query: string;
  matchOffset: number;
  activeMatchIdx: number;
}

export const HighlightText = memo(function HighlightText({ text, query, matchOffset, activeMatchIdx }: HighlightTextProps) {
  if (!query) return <>{text}</>;

  const escapedQuery = escapeRegExp(query);
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  let currentMatch = matchOffset;

  return (
    <>
      {parts.map((part, i) => {
        if (part.toLowerCase() === query.toLowerCase()) {
          const isMatch = currentMatch === activeMatchIdx;
          const currentId = `match-${currentMatch}`;
          currentMatch++;

          return (
            <mark
              key={i}
              id={currentId}
              className={`rounded px-1 transition-colors ${
                isMatch ? 'bg-orange-400 font-bold text-white' : 'bg-yellow-200 text-black'
              }`}
            >
              {part}
            </mark>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
});