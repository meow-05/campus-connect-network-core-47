
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface StudentsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  selectedYear: string;
  onYearChange: (value: string) => void;
  departments: Array<{ id: string; name: string }>;
  onClearFilters: () => void;
}

export function StudentsFilters({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedYear,
  onYearChange,
  departments,
  onClearFilters
}: StudentsFiltersProps) {
  const hasActiveFilters = searchTerm || (selectedDepartment && selectedDepartment !== 'all') || (selectedYear && selectedYear !== 'all');

  const handleDepartmentChange = (value: string) => {
    onDepartmentChange(value === 'all' ? '' : value);
  };

  const handleYearChange = (value: string) => {
    onYearChange(value === 'all' ? '' : value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search students by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={selectedDepartment || 'all'} onValueChange={handleDepartmentChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedYear || 'all'} onValueChange={handleYearChange}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="All Years" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          <SelectItem value="1">Year 1</SelectItem>
          <SelectItem value="2">Year 2</SelectItem>
          <SelectItem value="3">Year 3</SelectItem>
          <SelectItem value="4">Year 4</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="outline" onClick={onClearFilters} className="w-full sm:w-auto">
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
}
