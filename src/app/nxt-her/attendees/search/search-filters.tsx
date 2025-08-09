"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

interface SearchFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  countryFilter: string
  setCountryFilter: (country: string) => void
  expertiseFilter: string
  setExpertiseFilter: (expertise: string) => void
  interestFilter: string
  setInterestFilter: (interest: string) => void
  countries: string[]
  allExpertise: string[]
  allInterests: string[]
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  countryFilter,
  setCountryFilter,
  expertiseFilter,
  setExpertiseFilter,
  interestFilter,
  setInterestFilter,
  countries,
  allExpertise,
  allInterests
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const clearAllFilters = () => {
    setSearchTerm("")
    setCountryFilter("")
    setExpertiseFilter("")
    setInterestFilter("")
  }

  const hasActiveFilters = searchTerm || countryFilter || expertiseFilter || interestFilter

  return (
    <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-slate-50 to-blue-50">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name, organization, title, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-2 transition-all duration-200 ${
                showFilters 
                  ? 'border-blue-400 bg-blue-50 text-blue-600' 
                  : 'border-blue-400 text-blue-600 hover:bg-blue-50 hover:border-blue-500'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {showFilters && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Country</label>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Expertise</label>
              <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue placeholder="All expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All expertise</SelectItem>
                  {allExpertise.map(expertise => (
                    <SelectItem key={expertise} value={expertise}>{expertise}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Interests</label>
              <Select value={interestFilter} onValueChange={setInterestFilter}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue placeholder="All interests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All interests</SelectItem>
                  {allInterests.map(interest => (
                    <SelectItem key={interest} value={interest}>{interest}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
} 