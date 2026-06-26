import Journal from '@view/journal/index.jsx'

export default function JournalApp({ onOpenSession }) {
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto">
      <Journal onOpenSession={onOpenSession} />
    </div>
  )
}
