import { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { getCoachingNotesByTag } from '../lib/coachNotes';

/**
 * Zeigt Coaching Notes ("WhatsApp Wisdom Drops") passend zu einem Tag/
 * Activity-Type/Topic — zugeklappt per Default, damit sie nicht aufdringlich
 * wirken. Keine Coach-Notes zum Tag vorhanden → rendert nichts (kein leerer
 * Platzhalter).
 */
export default function CoachNoteCard({ tag }) {
  const notes = getCoachingNotesByTag(tag);
  const [openId, setOpenId] = useState(null);

  if (!notes.length) return null;

  return (
    <div className="space-y-2">
      {notes.map((note) => {
        const isOpen = openId === note.id;
        return (
          <div key={note.id} className="rounded-xl border border-fit-line bg-fit-bg2 overflow-hidden">
            <button
              onClick={() => setOpenId(isOpen ? null : note.id)}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left"
            >
              <Lightbulb size={13} className="text-fit-accent shrink-0" />
              <span className="flex-1 text-[11px] font-bold text-fit-ink">{note.title}</span>
              <ChevronDown
                size={13}
                className={`text-fit-dim shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="px-3.5 pb-3.5 text-[11px] leading-relaxed text-fit-dim whitespace-pre-line">
                {note.summary && <p className="mb-2 font-medium text-fit-ink/80">{note.summary.trim()}</p>}
                {note.body?.trim()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
