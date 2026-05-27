import * as Select from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface BookFiltersProps {
  categories: string[];
  languages: string[];
  categoryFilter: string;
  languageFilter: string;
  ratingFilter: string;
  availabilityFilter: string;
  onCategoryChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onAvailabilityChange: (value: string) => void;
}

export function BookFilters({
  categories,
  languages,
  categoryFilter,
  languageFilter,
  ratingFilter,
  availabilityFilter,
  onCategoryChange,
  onLanguageChange,
  onRatingChange,
  onAvailabilityChange,
}: BookFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm mb-6">
      <FilterSelect
        label="Categoria"
        value={categoryFilter}
        onValueChange={onCategoryChange}
        options={categories}
        allLabel="Todas las categorias"
      />
      <FilterSelect
        label="Idioma"
        value={languageFilter}
        onValueChange={onLanguageChange}
        options={languages}
        allLabel="Todos los idiomas"
      />
      <FilterSelect
        label="Rating Minimo"
        value={ratingFilter}
        onValueChange={onRatingChange}
        options={["4", "4.5", "4.7"]}
        allLabel="Cualquier rating"
        labelFor={(value) => `${value}+ estrellas`}
      />
      <FilterSelect
        label="Disponibilidad"
        value={availabilityFilter}
        onValueChange={onAvailabilityChange}
        options={["available", "unavailable"]}
        allLabel="Todos"
        labelFor={(value) => (value === "available" ? "Disponibles" : "No disponibles")}
      />
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  allLabel: string;
  onValueChange: (value: string) => void;
  labelFor?: (value: string) => string;
}

function FilterSelect({ label, value, options, allLabel, onValueChange, labelFor }: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select.Root value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {labelFor ? labelFor(option) : option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select.Root>
    </div>
  );
}
