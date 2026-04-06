import { Fragment } from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
  matchOffset: number;
  activeMatchIdx: number;
}

export function HighlightText({ text, query, matchOffset, activeMatchIdx }: HighlightTextProps) {
  if (!query) return <>{text}</>;

  const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
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
}