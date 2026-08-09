import { createPortal } from 'react-dom';
import SessionSidebar from './SessionSidebar';

export default function SidebarSheet({
  onClose, onShowMap,
  location, setLocation, duration, setDuration,
  sessionMode, block, setBlock,
  trainingsart, setTrainingsart,
  effort, setEffort, notes, setNotes,
  onDownload, onExportObsidian, coachFeedback = ""
}) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center lg:items-stretch lg:justify-end animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl bg-fit-card border-t border-fit-line rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto
          lg:max-w-[420px] lg:h-full lg:max-h-full lg:rounded-none lg:border-t-0 lg:border-l lg:slide-in-from-bottom-0 lg:slide-in-from-right"
      >
        <div className="sticky top-0 bg-fit-card pt-4 pb-2 flex justify-center z-10 lg:hidden">
          <div className="w-10 h-1 rounded-full bg-fit-line" />
        </div>
        <SessionSidebar
          location={location} setLocation={setLocation}
          duration={duration} setDuration={setDuration}
          sessionMode={sessionMode}
          block={block} setBlock={setBlock}
          trainingsart={trainingsart} setTrainingsart={setTrainingsart}
          effort={effort} setEffort={setEffort}
          notes={notes} setNotes={setNotes}
          onDownload={onDownload}
          onExportObsidian={onExportObsidian}
          onShowMap={onShowMap}
          onClose={onClose}
          coachFeedback={coachFeedback}
        />
        <div className="h-8" />
      </div>
    </div>,
    document.body
  );
}
