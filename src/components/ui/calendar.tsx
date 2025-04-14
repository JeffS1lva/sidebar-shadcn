import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { pt } from "date-fns/locale"
import { format, getMonth, getYear } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month,
  onMonthChange,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  // Gerar anos (últimos 10 anos e próximos 2)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 13 }, (_, i) => currentYear - 5 + i)

  // Meses
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(0, i), 'MMMM', { locale: pt })
      .replace(/^\w/, (c) => c.toUpperCase()),
  }))

  const handleMonthChange = (monthIndex: number) => {
    if (!month) return
    
    const newMonth = new Date(month.getFullYear(), monthIndex, 1)
    onMonthChange?.(newMonth)
  }

  const handleYearChange = (year: number) => {
    if (!month) return
    
    const newMonth = new Date(year, month.getMonth(), 1)
    onMonthChange?.(newMonth)
  }

  return (
    <DayPicker
      locale={pt}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      month={month}
      onMonthChange={onMonthChange}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeft className="size-4" {...props} />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRight className="size-4" {...props} />
        ),
        Caption: ({ displayMonth }) => {
          const currentMonth = getMonth(displayMonth)
          const currentYear = getYear(displayMonth)

          return (
            <div className="flex justify-center pt-1 relative items-center gap-2">
              <Select
                value={currentYear.toString()}
                onValueChange={(value) => handleYearChange(Number(value))}
              >
                <SelectTrigger className="h-7 w-[85px] text-xs px-2">
                  <SelectValue placeholder={currentYear.toString()} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-xs">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={currentMonth.toString()}
                onValueChange={(value) => handleMonthChange(Number(value))}
              >
                <SelectTrigger className="h-7 w-[100px] text-xs px-2">
                  <SelectValue placeholder={months[currentMonth].label} />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()} className="text-xs">
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }
      }}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }