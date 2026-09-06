/**
 * SessionModalsLayer — bündelt alle Session-Modals hinter einem einzigen
 * `activeModal`-State (PHASE4_TODO.md Stück 1), statt dass jedes Modal
 * seinen eigenen Boolean + `createPortal()`-Call an verschiedenen Stellen
 * in SessionEditor.jsx trägt (vorher: `showSidebar`, `showTabSettings`,
 * lokales `gateSheetOpen`). Rein mechanisch zusammengeführt — jedes Modal
 * ist unverändert dieselbe Komponente wie vorher, nur zentral geroutet.
 * `activeModal`: null | 'sidebar' | 'settings' | 'gate'.
 */

import SidebarSheet from './SidebarSheet';
import SourceSettingsModal from './SourceSettingsModal';
import SessionGateSheet from './SessionGateSheet.jsx';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';

export default function SessionModalsLayer({
  activeModal, onClose,
  // sidebar
  location, setLocation, duration, setDuration, gpsMapsUrl,
  trainingsart, setTrainingsart, notes, setNotes,
  onDownload, onExportObsidian, coachFeedback,
  // gate
  date, sessionGate, currentSubTab, onSubNav, onStartGate, onStopGate,
}) {
  // ESC schließt das jeweils offene Modal — ein zentraler Handler reicht,
  // weil `activeModal` bereits zentral gebündelt ist (siehe Kommentar oben),
  // statt in SidebarSheet/SourceSettingsModal/SessionGateSheet je einzeln
  // denselben Listener zu registrieren.
  useEscapeKey(onClose, activeModal !== null);

  return (
    <>
      {activeModal === 'sidebar' && (
        <SidebarSheet
          onClose={onClose}
          location={location} setLocation={setLocation}
          duration={duration} setDuration={setDuration}
          gpsMapsUrl={gpsMapsUrl}
          trainingsart={trainingsart} setTrainingsart={setTrainingsart}
          notes={notes} setNotes={setNotes}
          onDownload={onDownload}
          onExportObsidian={onExportObsidian}
          coachFeedback={coachFeedback}
        />
      )}

      {activeModal === 'settings' && (
        <SourceSettingsModal onClose={onClose} />
      )}

      <SessionGateSheet
        open={activeModal === 'gate'}
        onClose={onClose}
        date={date}
        sessionGate={sessionGate}
        currentSubTab={currentSubTab}
        onSubNav={onSubNav}
        onStart={onStartGate}
        onStop={onStopGate}
      />
    </>
  );
}
