import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MultiSelect({ options, selected = [], onChange, placeholder = "Select items..." }) {
  const [open, setOpen] = useState(false);

  const handleToggle = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleRemove = (value, e) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[40px] bg-[#1B2230] border-[#2B3648] text-[#F8F9FA] hover:bg-[#20293A]"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selected.length === 0 ? (
              <span className="text-[#6C7A91]">{placeholder}</span>
            ) : (
              selected.map((value) => (
                <Badge
                  key={value}
                  variant="secondary"
                  className="bg-[#20A4F3]/20 text-[#20A4F3] hover:bg-[#20A4F3]/30 border-[#20A4F3]/30"
                >
                  {value}
                  <button
                    className="ml-1 hover:text-[#F8F9FA]"
                    onClick={(e) => handleRemove(value, e)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-[#1B2230] border-[#2B3648]" align="start">
        <div className="max-h-64 overflow-auto">
          {options.length === 0 ? (
            <div className="p-4 text-sm text-[#6C7A91]">No options available</div>
          ) : (
            <div className="p-2">
              {options.map((option) => {
                const isSelected = selected.includes(option);
                return (
                  <div
                    key={option}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md hover:bg-[#20293A] transition-colors",
                      isSelected && "bg-[#20A4F3]/10"
                    )}
                    onClick={() => handleToggle(option)}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 border-2 rounded flex items-center justify-center",
                        isSelected
                          ? "bg-[#20A4F3] border-[#20A4F3]"
                          : "border-[#2B3648]"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-[#F8F9FA]">{option}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}