// @ts-nocheck
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function FilterBar({ filters, onChange }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name or email..."
          className="pl-9"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      <Select value={filters.level} onValueChange={(v) => onChange({ ...filters, level: v })}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All Levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="PSLC">PSLC</SelectItem>
          <SelectItem value="JCE">JCE</SelectItem>
          <SelectItem value="MSCE">MSCE</SelectItem>
          <SelectItem value="Standard 1-8">Standard 1-8</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.section} onValueChange={(v) => onChange({ ...filters, section: v })}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Sections" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sections</SelectItem>
          <SelectItem value="home">Home</SelectItem>
          <SelectItem value="study_notes">Study Notes</SelectItem>
          <SelectItem value="past_papers">Past Papers</SelectItem>
          <SelectItem value="tutorials">Tutorials</SelectItem>
          <SelectItem value="quizzes">Quizzes</SelectItem>
          <SelectItem value="career_resources">Career Resources</SelectItem>
          <SelectItem value="ask_teacher">Ask a Teacher</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.event} onValueChange={(v) => onChange({ ...filters, event: v })}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Events" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Events</SelectItem>
          <SelectItem value="login">Login</SelectItem>
          <SelectItem value="page_visit">Page Visit</SelectItem>
          <SelectItem value="download">Download</SelectItem>
          <SelectItem value="quiz_complete">Quiz Complete</SelectItem>
          <SelectItem value="video_play">Video Play</SelectItem>
          <SelectItem value="note_view">Note View</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}