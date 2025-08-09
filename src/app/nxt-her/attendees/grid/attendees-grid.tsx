import { Button } from "@/components/ui/button"
import { AttendeeCard } from "../card/attendee-card"
import { Attendee } from "../types/attendee"

interface AttendeesGridProps {
  attendees: Attendee[]
  onClearFilters: () => void
}

export function AttendeesGrid({ attendees, onClearFilters }: AttendeesGridProps) {
  return (
    <div>
      {/* Attendees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {attendees.map((attendee) => (
          <AttendeeCard key={attendee.id} attendee={attendee} />
        ))}
      </div>

      {/* Empty State */}
      {attendees.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No attendees found</h3>
            <p className="text-gray-500 mb-6">
              No attendees match your current search criteria. Try adjusting your filters or search terms.
            </p>
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 