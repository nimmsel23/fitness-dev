/**
 * Shared day-strip logic for all three header concepts — extracted from the
 * original DateStrip.jsx so Calm/Dense/Timeline don't each reimplement
 * offset/jump/date-label handling.
 */

import { useRef, useState } from 'react';
import { localToday } from '@utils';

const MON = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

export function useDayStrip({ date, setDate, rollingDays }) {
  const today = localToday();
  const todayIdx = rollingDays.findIndex(d => d === today);
  const [offset, setOffset] = useState(Math.max(0, todayIdx - 6));
  const dateInputRef = useRef(null);

  const visible = rollingDays.slice(offset, offset + 7);
  const canBack = offset > 0;
  const canFwd = offset + 7 < rollingDays.length;

  function jumpToDate(d) {
    if (!d) return;
    setDate(d);
    const idx = rollingDays.findIndex(x => x === d);
    if (idx >= 0) setOffset(Math.max(0, Math.min(rollingDays.length - 7, idx - 3)));
  }

  const selectedObj = new Date(date + 'T12:00:00');
  const dateLabel = `${selectedObj.getDate()}. ${MON[selectedObj.getMonth()]} ${selectedObj.getFullYear()}`;

  return {
    today, visible, canBack, canFwd, dateInputRef, dateLabel,
    goBack: () => setOffset(Math.max(0, offset - 3)),
    goFwd: () => setOffset(Math.min(rollingDays.length - 7, offset + 3)),
    jumpToDate,
  };
}
