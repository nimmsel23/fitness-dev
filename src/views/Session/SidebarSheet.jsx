import SessionSidebar from './SessionSidebar';

export default function SidebarSheet({
  onClose, onShowMap,
  location, setLocation, duration, setDuration,
  hasActivity, setHasActivity, block, setBlock,
  effort, setEffort, notes, setNotes,
  onDownload, onExportObsidian,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border-t border-line rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-card pt-4 pb-2 flex justify-center z-10">
          <div className="w-10 h-1 rounded-full bg-line" />
        </div>
        <SessionSidebar
          location={location} setLocation={setLocation}
          duration={duration} setDuration={setDuration}
          hasActivity={hasActivity} setHasActivity={setHasActivity}
          block={block} setBlock={setBlock}
          effort={effort} setEffort={setEffort}
          notes={notes} setNotes={setNotes}
          onDownload={onDownload}
          onExportObsidian={onExportObsidian}
          onShowMap={onShowMap}
          onClose={onClose}
        />
        <div className="h-8" />
      </div>
    </div>
  );
}
