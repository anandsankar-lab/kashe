import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * Stroke-only SVG icons for all 18 SpendCategory values.
 * Rules: fill none, strokeWidth 1.5, strokeLinecap round, strokeLinejoin round.
 * Colour and size are always passed as props — never hardcoded here.
 */
const ICON_PATHS: Record<string, string> = {
  // House outline with door
  housing:
    'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9',

  // Shopping cart with wheels
  groceries:
    'M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.69L23 6H6 M9 21a1 1 0 100-2 1 1 0 000 2z M20 21a1 1 0 100-2 1 1 0 000 2z',

  // Fork and knife
  eating_out:
    'M18 2v6a2 2 0 01-2 2h0a2 2 0 01-2-2V2 M16 12v10 M6 2v4m0 4v10 M4 6h4',

  // Bus / tram outline
  transport:
    'M4 15V6a2 2 0 012-2h12a2 2 0 012 2v9 M4 15l-1 3h18l-1-3 M4 15h16 M9 19h6 M8 11h8 M8 7h8',

  // Medical cross — universally recognised health symbol
  health:
    'M12 5v14 M5 12h14',

  // Scissors — haircut, grooming, wellness
  personal_care:
    'M6 3a3 3 0 100 6 3 3 0 000-6z M18 3a3 3 0 100 6 3 3 0 000-6z M5.5 5.5l13 13 M18.5 5.5l-13 13',

  // Play button inside circle
  subscriptions:
    'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M10 8l6 4-6 4V8z',

  // Lightning bolt
  utilities:
    'M13 2L3 14h9l-1 8 10-12h-9l1-8z',

  // Shopping bag with handle cut-out
  shopping:
    'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0',

  // Paper plane / send arrow
  travel:
    'M22 2L11 13 M22 2L15 22l-4-9-9-4L22 2z',

  // Open book
  education:
    'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',

  // Shield outline
  insurance:
    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',

  // Adult + smaller child silhouettes
  childcare:
    'M9 11a4 4 0 100-8 4 4 0 000 8z M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M17 8a2 2 0 100-4 2 2 0 000 4z M19.5 21v-1a2.5 2.5 0 00-2.5-2.5h-.5',

  // Gift box with ribbon
  gifts_giving:
    'M20 12v10H4V12 M22 7H2v5h20V7z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z',

  // Four-square grid
  other:
    'M10 3H3v7h7V3z M21 3h-7v7h7V3z M21 14h-7v7h7v-7z M10 14H3v7h7v-7z',

  // Wallet body + downward arrow (money flowing in)
  income:
    'M2 8a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8z M22 13H18a2 2 0 010-4h4 M12 1v9 M9 7l3 3 3-3',

  // Trend line going up
  investment_transfer:
    'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',

  // Two opposing vertical arrows
  transfer:
    'M7 16V4m0 0L3 8m4-4l4 4 M17 8v12m0 0l4-4m-4 4l-4-4',
};

const DEFAULT_PATH =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z';

interface Props {
  categoryId: string;
  size?: number;
  color?: string;
}

export default function CategoryIcon({
  categoryId,
  size = 22,
  color = '#8A8A85',
}: Props) {
  const d = ICON_PATHS[categoryId] ?? DEFAULT_PATH;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d={d} />
    </Svg>
  );
}
