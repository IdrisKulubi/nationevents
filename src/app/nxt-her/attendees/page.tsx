"use client"

import { useState, useEffect } from "react"
import { Attendee } from "./types/attendee"
import { mockAttendees } from "./data/attendee-data"
import { HeroSection } from "./hero/hero-section"
import { SearchFilters } from "./search/search-filters"
import { AttendeesGrid } from "./grid/attendees-grid"

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [countryFilter, setCountryFilter] = useState("")
  const [expertiseFilter, setExpertiseFilter] = useState("")
  const [interestFilter, setInterestFilter] = useState("")

  useEffect(() => {
    // Load attendees from localStorage (in a real app, this would be from an API)
    const savedRegistration = localStorage.getItem('registrationData')
    if (savedRegistration) {
      const registration = JSON.parse(savedRegistration)
      const currentUser: Attendee = {
        id: "current-user",
        ...registration,
        registeredAt: registration.registeredAt || new Date().toISOString()
      }
      setAttendees([currentUser, ...mockAttendees])
    } else {
      setAttendees(mockAttendees)
    }
  }, [])

  useEffect(() => {
    let filtered = attendees

    if (searchTerm) {
      filtered = filtered.filter(attendee => 
        `${attendee.firstName} ${attendee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.bio.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (countryFilter) {
      filtered = filtered.filter(attendee => attendee.country === countryFilter)
    }

    if (expertiseFilter) {
      filtered = filtered.filter(attendee => 
        attendee.expertise.includes(expertiseFilter)
      )
    }

    if (interestFilter) {
      filtered = filtered.filter(attendee => 
        attendee.interests.includes(interestFilter)
      )
    }

    setFilteredAttendees(filtered)
  }, [attendees, searchTerm, countryFilter, expertiseFilter, interestFilter])

  const countries = [...new Set(attendees.map(a => a.country))]
  const allExpertise = [...new Set(attendees.flatMap(a => a.expertise))]
  const allInterests = [...new Set(attendees.flatMap(a => a.interests))]

  const clearAllFilters = () => {
    setSearchTerm("")
    setCountryFilter("")
    setExpertiseFilter("")
    setInterestFilter("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <HeroSection attendees={attendees} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          countryFilter={countryFilter}
          setCountryFilter={setCountryFilter}
          expertiseFilter={expertiseFilter}
          setExpertiseFilter={setExpertiseFilter}
          interestFilter={interestFilter}
          setInterestFilter={setInterestFilter}
          countries={countries}
          allExpertise={allExpertise}
          allInterests={allInterests}
        />

        {/* Attendees Grid */}
        <AttendeesGrid 
          attendees={filteredAttendees} 
          onClearFilters={clearAllFilters}
        />
      </div>
    </div>
  )
}