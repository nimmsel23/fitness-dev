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

export default function SessionModalsLayer({
  activeModal, onClose,
  // sidebar
  location, setLocation, duration, setDuration, gpsMapsUrl,
  trainingsart, setTrainingsart, notes, setNotes,
  onDownload, onExportObsidian, coachFeedback,
  // gate
  date, sessionGate, currentSubTab, onSubNav, onStartGate, onStopGate,
}) {
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
