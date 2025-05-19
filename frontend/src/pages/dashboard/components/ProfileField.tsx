import { useState, useEffect } from "react";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import {
  commonDepartments,
  educationalLevels,
  genderOptions,
  nigerianStates,
  nigerianUniversities,
} from "./constants";

// Constants for select options
const GENDER_OPTIONS = genderOptions;
const LEVEL_OPTIONS = educationalLevels;
const SCHOOL_OPTIONS = nigerianUniversities;
const DEPARTMENT_OPTIONS = commonDepartments;

export interface ProfileFieldProps {
  label: string;
  value?: string;
  onSave: (value: string) => void;
  isHighlighted?: boolean;
  fieldType?:
    | "text"
    | "date"
    | "select"
    | "gender"
    | "level"
    | "school"
    | "department"
    | "state";
  options?: Array<{ value: string; label: string }>;
}

const ProfileField = ({
  label,
  value,
  onSave,
  isHighlighted = false,
  fieldType = "text",
  options = [],
}: ProfileFieldProps) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [selectedDate, setSelectedDate] = useState<string>(value || "");

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value || "");
    if (fieldType === "date" && value) {
      setSelectedDate(value);
    }
  }, [value, fieldType]);

  const getOptionsForField = () => {
    switch (fieldType) {
      case "gender":
        return GENDER_OPTIONS;
      case "level":
        return LEVEL_OPTIONS;
      case "school":
        return SCHOOL_OPTIONS;
      case "department":
        return DEPARTMENT_OPTIONS;
      case "state":
        return nigerianStates.map((state) => ({
          value: state.value,
          label: state.label,
        }));
      default:
        return options;
    }
  };

  const handleSave = () => {
    if (fieldType === "date" && selectedDate) {
      onSave(selectedDate);
      setEditing(false);
      return;
    }

    if (inputValue.trim()) {
      onSave(inputValue.trim());
      setEditing(false);
    }
  };

  const renderFieldEditor = () => {
    switch (fieldType) {
      case "date":
        return (
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            fullWidth
            autoFocus
          />
        );
      case "select":
      case "gender":
      case "level":
      case "school":
      case "department":
      case "state":
        return (
          <Select
            selectedKeys={inputValue ? [inputValue] : []}
            onChange={(e) => setInputValue(e.target.value)}
            fullWidth
            placeholder={`Select ${label}`}
          >
            {getOptionsForField().map((option) => (
              <SelectItem key={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        );
      default:
        return (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            fullWidth
            placeholder={`Enter your ${label}`}
            autoFocus
          />
        );
    }
  };

  const getDisplayValue = () => {
    if (!value) return "Not provided";

    switch (fieldType) {
      case "date":
        try {
          return new Date(value).toLocaleDateString();
        } catch (e) {
          return value;
        }
      case "select":
      case "gender":
      case "level":
      case "school":
      case "department":
      case "state":
        const option = getOptionsForField().find((opt) => opt.value === value);
        return option ? option.label : value;
      default:
        return value;
    }
  };

  return (
    <div
      className={
        isHighlighted ? "bg-yellow-50 p-2 rounded-md transition-colors" : ""
      }
    >
      <h3 className="text-sm font-semibold text-gray-500">{label}</h3>
      {editing ? (
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex-1">{renderFieldEditor()}</div>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              size="sm"
              onClick={handleSave}
              isDisabled={
                fieldType === "date" ? !selectedDate : !inputValue.trim()
              }
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="light"
              onClick={() => {
                setEditing(false);
                setInputValue(value || "");
                if (fieldType === "date" && value) {
                  setSelectedDate(value);
                }
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className={!value ? "text-gray-400" : ""}>{getDisplayValue()}</p>
          <Button size="sm" variant="light" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileField;
