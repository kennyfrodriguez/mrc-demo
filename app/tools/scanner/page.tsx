'use client'

import { useState } from 'react'
import mammoth from 'mammoth'
import { parse } from 'node-html-parser'
import { Header } from "@/components/Header"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from '@/app/f-mngr/file-uploader'
import { Label } from "@/components/ui/label"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Info, 
  AlertCircle,
  ScanLine 
} from "lucide-react"

type FormStep = 'intake' | 'outtake' | 'complete'
type FormField = {
  key: string;
  value: string;
  label: string;
  section?: string;
}
type FormData = {
  fields: FormField[];
  rawText?: string;
}

const KNOWN_SECTIONS = [
  { letter: 'A', title: 'Consumer Information' },
  { letter: 'B', title: 'Pickup and Dropoff Location' },
  { letter: 'C', title: 'Destination' },
  { letter: 'D', title: 'Additional Destination/Alternate Address' },
  { letter: 'E', title: 'Consumers Schedule' },
  { letter: 'F', title: 'Instructions' },
  { letter: 'G', title: 'MRC Staff' },
]

interface DaySchedule {
  day: string
  arrivalTime: string
  departureTime: string
}

const SHORT_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const DAY_MAP: Record<string, string> = {
  "SUN": "Sunday",
  "MON": "Monday",
  "TUE": "Tuesday",
  "WED": "Wednesday",
  "THU": "Thursday",
  "FRI": "Friday",
  "SAT": "Saturday"
}

const parseStandardFieldsFromText = (text: string, formData: FormData) => {
  const lines = text.split('\n')
  let currentSection = KNOWN_SECTIONS[0]
  let currentSectionFull = `(${currentSection.letter}) ${currentSection.title}`
  let currentField: FormField | null = null
  let skipNextLine = false
  let isInInstructions = false
  let instructionsContent = ''
  let isCollectingInstructions = false

  const switchSection = (letter: string, title: string) => {
    const found = KNOWN_SECTIONS.find(s => s.letter === letter)
    if (found) {
      currentSection = found
      currentSectionFull = `(${letter}) ${title}`
      currentField = null
      isInInstructions = letter === 'F'
    }
  }

  const cleanValue = (value: string): string => {
    return value.toUpperCase().startsWith('N/A') ? 'N/A' : value.trim()
  }

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    if (isInInstructions) {
      const instructionsPrompt = "Please list/describe any health or behavioral issues that may impact transportation.  This section can be also used to record other instructions related to unique transportation needs or trip details."
      
      if (trimmedLine.includes(instructionsPrompt)) {
        isCollectingInstructions = true
        continue
      }

      if (isCollectingInstructions) {
        // Stop collecting if we hit the next section or broker-related content
        if (trimmedLine.toLowerCase().includes('broker') ||
            trimmedLine.toLowerCase().includes('hst date') ||
            trimmedLine.toLowerCase().includes('mart date') ||
            KNOWN_SECTIONS.some(s => 
              new RegExp(`^\\(${s.letter}\\)\\s*${s.title}`, 'i').test(trimmedLine)
            )) {
          isCollectingInstructions = false
        } else {
          instructionsContent += (instructionsContent ? ' ' : '') + trimmedLine
        }
      }
    }

    // Skip this line if flagged from previous iteration
    if (skipNextLine) {
      skipNextLine = false
      continue
    }

    // Stop processing if we detect broker-related content
    if (trimmedLine.toLowerCase().includes('broker') ||
        trimmedLine.toLowerCase().includes('hst date') ||
        trimmedLine.toLowerCase().includes('mart date')) {
      break
    }

    // Handle "Additional Destination" as a section transition
    if (trimmedLine.toLowerCase().includes('additional destination')) {
      switchSection('D', 'Additional Destination/Alternate Address')
      skipNextLine = true
      continue
    }

    // Special handling for section D to E transition
    if (currentSection.letter === 'D') {
      if (trimmedLine.toLowerCase().includes('schedule') || 
          trimmedLine.toLowerCase().includes('arrival time') ||
          trimmedLine.toLowerCase().includes('departure time')) {
        switchSection('E', 'Consumers Schedule')
        continue
      }
    }

    let matchedSection = KNOWN_SECTIONS.find(s => 
      new RegExp(`^\\(${s.letter}\\)\\s*${s.title}`, 'i').test(trimmedLine)
    )

    if (!matchedSection) {
      matchedSection = KNOWN_SECTIONS.find(s => {
        return trimmedLine.toLowerCase() === s.title.toLowerCase()
      })
    }

    if (matchedSection) {
      switchSection(matchedSection.letter, matchedSection.title)
      continue
    }

    // Rest of the parsing logic
    if (line.includes(':')) {
      const [rawKey, ...valueParts] = line.split(':')
      const key = rawKey.trim()
      
      // Skip if this is the "Additional Destination" line
      if (key.toLowerCase().includes('additional destination')) {
        skipNextLine = true
        continue
      }

      let value = valueParts.join(':').trim()
      
      // Skip broker-related fields
      if (key.toLowerCase().includes('broker') ||
          key.toLowerCase().includes('hst') ||
          key.toLowerCase().includes('mart')) {
        continue
      }

      value = cleanValue(value)
      const fieldKey = `${key.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${formData.fields.length}`
      
      // Special handling for Instructions section
      if (isInInstructions && key.toLowerCase().includes('additional instructions')) {
        currentField = {
          key: 'instructions',
          value: value || 'N/A',
          label: 'Instructions',
          section: currentSectionFull,
        }
      } else {
        currentField = {
          key: fieldKey,
          value: value || 'N/A',
          label: key,
          section: currentSectionFull,
        }
      }
      formData.fields.push(currentField)
    } else if (currentField) {
      // Don't append content if it's related to Additional Destination
      if (!trimmedLine.toLowerCase().includes('additional destination')) {
        // For Instructions section, keep appending content
        if (isInInstructions && currentField.key === 'instructions') {
          currentField.value += ` ${trimmedLine}`
          currentField.value = cleanValue(currentField.value)
        } else if (!isInInstructions) {
          currentField.value += ` ${trimmedLine}`
          currentField.value = cleanValue(currentField.value)
        }
      }
    }
  }

  // Add the collected instructions as a field if we found any
  if (instructionsContent) {
    formData.fields.push({
      key: 'instructions',
      value: instructionsContent,
      label: 'Instructions',
      section: '(F) Instructions'
    })
  }
}

const extractScheduleFromHTML = async (html: string) => {
  const root = parse(html)
  const tables = root.querySelectorAll('table')

  if (!tables || tables.length === 0) {
    throw new Error("No tables found in the provided HTML.")
  }

  let scheduleTable = null
  let headerRowIndex = -1
  let headers: string[] = []

  outerLoop:
  for (const t of tables) {
    const rows = t.querySelectorAll('tr')
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll('td, th').map(cell => cell.text.trim().toUpperCase())
      const containsDay = cells.some(cell => SHORT_DAYS.includes(cell))

      if (containsDay) {
        const arrivalRow = rows[i + 1]
        const departureRow = rows[i + 2]

        if (!arrivalRow || !departureRow) continue

        const arrivalRowText = arrivalRow.text.toUpperCase()
        const departureRowText = departureRow.text.toUpperCase()

        if (arrivalRowText.includes("PROGRAM ARRIVAL TIME") && departureRowText.includes("PROGRAM DEPARTURE TIME")) {
          scheduleTable = t
          headerRowIndex = i
          headers = cells
          break outerLoop
        }
      }
    }
  }

  if (!scheduleTable || headerRowIndex === -1) {
    throw new Error("Schedule format not recognized.")
  }

  const rows = scheduleTable.querySelectorAll('tr')
  const arrivalRow = rows[headerRowIndex + 1]
  const departureRow = rows[headerRowIndex + 2]

  if (!arrivalRow || !departureRow) {
    throw new Error("Could not find arrival/departure rows.")
  }

  const arrivalCells = arrivalRow.querySelectorAll('td').map(cell => cell.text.trim())
  const departureCells = departureRow.querySelectorAll('td').map(cell => cell.text.trim())

  const schedule: DaySchedule[] = []

  headers.forEach((header, index) => {
    const headerText = header.trim().toUpperCase()
    if (SHORT_DAYS.includes(headerText)) {
      const arrivalTime = arrivalCells[index] || 'N/A'
      const departureTime = departureCells[index] || 'N/A'
      schedule.push({
        day: headerText,
        arrivalTime,
        departureTime
      })
    }
  })

  if (schedule.length === 0) {
    throw new Error("No valid day columns found.")
  }

  return schedule
}

const processConsumersSchedule = async (html: string, formData: FormData) => {
  let schedule: DaySchedule[]
  try {
    schedule = await extractScheduleFromHTML(html)
  } catch (error) {
    console.warn(error)
    return
  }

  const arrivalPairs: string[] = []
  const departurePairs: string[] = []

  schedule.forEach(s => {
    const fullDayName = DAY_MAP[s.day] || s.day
    if (s.arrivalTime && s.arrivalTime.toUpperCase() !== 'N/A') {
      arrivalPairs.push(`${fullDayName},${s.arrivalTime}`)
    }
    if (s.departureTime && s.departureTime.toUpperCase() !== 'N/A') {
      departurePairs.push(`${fullDayName},${s.departureTime}`)
    }
  })

  const arrivalValue = arrivalPairs.length > 0 ? arrivalPairs.join(' ') : 'N/A'
  const departureValue = departurePairs.length > 0 ? departurePairs.join(' ') : 'N/A'

  formData.fields.push({
    key: `program_arrival_dates`,
    value: arrivalValue,
    label: `Program Arrival Dates`,
    section: `(E) Consumers Schedule`,
  })

  formData.fields.push({
    key: `program_departure_dates`,
    value: departureValue,
    label: `Program Departure Dates`,
    section: `(E) Consumers Schedule`,
  })
}

export default function Page() {
  const [currentStep, setCurrentStep] = useState<FormStep>('intake')
  const [currentSection, setCurrentSection] = useState<string>('A')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [formData, setFormData] = useState<FormData>({ fields: [] })
  const [isParsing, setIsParsing] = useState<boolean>(false)
  const [sectionIndex, setSectionIndex] = useState(0)
  const [showSummary, setShowSummary] = useState(false)

  const handleFileUpload = async (file: File) => {
    setAttachment(file)
    setIsParsing(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const rawResult = await mammoth.extractRawText({ arrayBuffer })
      const text = rawResult.value

      if (!text || !text.trim()) {
        alert('The document appears to be empty or could not be parsed.')
        setIsParsing(false)
        return
      }

      const htmlResult = await mammoth.convertToHtml({ arrayBuffer })
      const html = htmlResult.value

      const newFormData: FormData = {
        fields: [],
        rawText: text,
      }

      parseStandardFieldsFromText(text, newFormData)
      await processConsumersSchedule(html, newFormData)

      setFormData(newFormData)
    } catch (error) {
      console.error('Error parsing document:', error)
      alert('An error occurred while parsing the document.')
    } finally {
      setIsParsing(false)
    }
  }

  const handleComplete = () => {
    setShowSummary(true)
  }

  const isStepEnabled = (step: FormStep) => {
    switch (step) {
      case 'intake':
        return true
      case 'outtake':
        return currentStep === 'intake' || currentStep === 'outtake' || currentStep === 'complete'
      case 'complete':
        return currentStep === 'outtake' || currentStep === 'complete'
      default:
        return false
    }
  }

  const handleFinalSubmit = async () => {
    try {
      if (!formData?.fields.length) {
        alert('Form fields are required')
        return
      }

      setIsParsing(true)
      
      // ... rest of the submit logic ...
      
      alert('Saved successfully!')
      setShowSummary(false)
      setCurrentStep('complete')
      window.location.href = '/tools/scanner/submissions'
    } catch (error: any) {
      console.error('Save error:', error)
      alert(`Failed to save: ${error.message || 'Unknown error'}`)
    } finally {
      setIsParsing(false)
    }
  }

  const renderForm = () => {
    switch (currentStep) {
      case 'intake':
        return <IntakeForm 
          formData={formData} 
          setFormData={setFormData} 
          sectionIndex={sectionIndex} 
          setSectionIndex={setSectionIndex} 
        />
      case 'outtake':
        return <OuttakeForm />
      case 'complete':
        return <CompleteForm />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1 pt-16">
          <AppSidebar />
          <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto md:ml-64">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 mb-6 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <ScanLine className="h-7 w-7 text-blue-300" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">Document Processing Center</h1>
              </div>
              <p className="text-gray-300">
                Upload and process transportation request documents efficiently
              </p>
            </div>

            {/* Main Content */}
            <Card className="overflow-hidden border shadow-lg bg-card">
              <CardHeader className="border-b bg-muted p-6">
                <CardTitle className="text-xl font-semibold text-foreground">
                  Document Scanner
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* File Upload Section */}
                <div className="mb-8">
                  <FileUploader onFileUpload={handleFileUpload} />
                </div>

                {/* Processing Status */}
                {attachment && (
                  <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground bg-accent/10 p-3 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span>Processing: {attachment.name}</span>
                  </div>
                )}
                {isParsing && (
                  <div className="mb-6 flex items-center gap-3 bg-accent/10 p-3 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent" />
                    <span className="text-sm text-muted-foreground">Analyzing document...</span>
                  </div>
                )}

                {/* Progress Indicator */}
                <div className="mb-8 bg-card p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-foreground">
                      Current Section: {KNOWN_SECTIONS[sectionIndex].letter} - {KNOWN_SECTIONS[sectionIndex].title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((sectionIndex / 6) * 100)}% Complete
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden border mb-6">
                    <div 
                      className={`h-full bg-accent transition-all duration-300 origin-left ${
                        `scale-x-[${sectionIndex / 6}]`
                      }`}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {KNOWN_SECTIONS.map((section, index) => (
                      <div 
                        key={section.letter}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                          transition-all duration-300 
                          ${index === sectionIndex ? 'bg-accent text-accent-foreground ring-2 ring-ring ring-offset-2' : ''}
                          ${index < sectionIndex ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                      >
                        <span>{section.letter} - {section.title}</span>
                        {index < sectionIndex && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Content */}
                <div className="mt-8">
                  {renderForm()}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-12 pt-6 border-t flex justify-center gap-4">
                  <Button
                    onClick={() => setCurrentStep('intake')}
                    variant={currentStep === 'intake' ? 'default' : 'outline'}
                    className="transition-all duration-200 hover:scale-105 min-w-[160px]"
                  >
                    Intake - Step 1
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('outtake')}
                    variant={currentStep === 'outtake' ? 'default' : 'outline'}
                    disabled={!isStepEnabled('outtake')}
                    className="transition-all duration-200 hover:scale-105 min-w-[160px]"
                  >
                    Survey - Step 2
                  </Button>
                  <Button
                    onClick={handleComplete}
                    variant={currentStep === 'complete' ? 'default' : 'outline'}
                    disabled={!isStepEnabled('complete')}
                    className="transition-all duration-200 hover:scale-105 min-w-[160px]"
                  >
                    Complete - Final Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showSummary && (
        <SummaryPopup 
          formData={formData} 
          onClose={() => setShowSummary(false)}
          onSubmit={handleFinalSubmit}
        />
      )}
    </SidebarProvider>
  )
}

type IntakeFormProps = {
  formData: FormData
  setFormData: (data: FormData) => void
  sectionIndex: number
  setSectionIndex: React.Dispatch<React.SetStateAction<number>>
}

function IntakeForm({ formData, setFormData, sectionIndex, setSectionIndex }: IntakeFormProps) {
  const currentSection = KNOWN_SECTIONS[sectionIndex].letter

  const handleSectionNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setSectionIndex(prev => Math.min(prev + 1, 6))
    } else if (direction === 'prev') {
      setSectionIndex(prev => Math.max(prev - 1, 0))
    }
  }

  const updateField = (key: string, value: string) => {
    const newFields = formData.fields.map(field => 
      field.key === key ? { ...field, value: value.toUpperCase() } : field
    )
    setFormData({ ...formData, fields: newFields })
  }

  const currentSectionData = KNOWN_SECTIONS.find(s => s.letter === currentSection)
  const sectionKey = currentSectionData ? `(${currentSectionData.letter}) ${currentSectionData.title}` : ''
  const fields = formData.fields.filter(field => field.section === sectionKey)

  const getInstructionsText = () => {
    const instructionsField = formData.fields.find(f => 
      f.key === 'instructions' || 
      f.label.toLowerCase().includes('additional instructions')
    )
    
    return {
      header: "Please review and edit the instructions below if needed.",
      instructions: instructionsField?.value || ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 bg-card p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">{currentSection}</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            {KNOWN_SECTIONS[sectionIndex].title}
          </h2>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => handleSectionNavigation('prev')}
            disabled={sectionIndex === 0}
            variant="outline"
            className="flex items-center gap-2 transition-all hover:shadow-md"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={() => handleSectionNavigation('next')}
            disabled={sectionIndex === 6}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 bg-card p-6 rounded-lg border shadow-sm">
        {currentSection === 'F' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Info className="h-5 w-5" />
              <h3 className="font-medium">Instructions Section</h3>
            </div>
            <div className="bg-muted p-4 rounded-md border">
              <div className="flex gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                <pre className="whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">
                  Please list/describe any health or behavioral issues that may impact transportation.  This section can be also used to record other instructions related to unique transportation needs or trip details.
                </pre>
              </div>
            </div>
            <div className="mt-6">
              <Label 
                htmlFor="instructions" 
                className="flex items-center gap-2 text-sm font-medium text-foreground mb-2"
              >
                <FileText className="h-4 w-4" />
                Instructions
              </Label>
              <Textarea 
                id="instructions"
                defaultValue={getInstructionsText().instructions}
                onChange={(e) => {
                  const newValue = e.target.value
                  setFormData({
                    ...formData,
                    fields: formData.fields.map(field => 
                      field.key === 'instructions' 
                        ? { ...field, value: newValue }
                        : field
                    )
                  })
                }}
                className="w-full min-h-[100px] bg-background focus:border-ring focus:ring-ring/50 transition-all"
                placeholder="Enter instructions here..."
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {fields.length > 0 ? (
              fields
                .filter((field: FormField) => !(/^\d+$/.test(field.label.trim())))
                .map((field: FormField) => (
                <div key={field.key} className="space-y-2 group">
                  <Label 
                    htmlFor={field.key} 
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    {field.label}
                  </Label>
                  <Input 
                    id={field.key}
                    value={field.value}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="bg-background focus:border-ring focus:ring-ring/50 transition-all hover:border-ring"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic col-span-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                No fields found for this section.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function OuttakeForm() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">How did we do? :</h2>
      <div className="space-y-3">
        <Textarea 
          id="feedback" 
          placeholder="Issues with the current form? Feedback will allow our IT team to improve our product." 
          className="min-h-[200px] bg-background focus:border-ring focus:ring-ring/50 transition-all duration-200"
          style={{ textTransform: 'uppercase' }}
          onChange={(e) => e.target.value = e.target.value.toUpperCase()}
        />
      </div>
    </div>
  )
}

function CompleteForm() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-3">Process Complete!</h2>
      <p className="text-muted-foreground">
        Thank you for using MRC Document Scanner Tool. Your document has been processed successfully.
      </p>
    </div>
  )
}

function SummaryPopup({ formData, onClose, onSubmit }: { 
  formData: FormData
  onClose: () => void
  onSubmit: () => Promise<void>
}) {
  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Form Summary</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
        <div className="space-y-4">
          {KNOWN_SECTIONS.map((section) => (
            <div key={section.letter} className="border-b pb-4">
              <h3 className="font-medium text-foreground mb-2">Section {section.letter}: {section.title}</h3>
              <div className="space-y-2">
                {formData.fields
                  .filter(field => field.section?.includes(`(${section.letter})`))
                  .map(field => (
                    <div key={field.key} className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">{field.label}:</span>
                      <span className="text-foreground">{field.value}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Review Again
          </Button>
          <Button 
            onClick={onSubmit}
            className="bg-primary hover:bg-primary/90"
          >
            Submit Form
          </Button>
        </div>
      </div>
    </div>
  )
} 