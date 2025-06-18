import { ProfileData } from "@/types";
import { useState, useEffect, useRef } from "react";
import {
  commonDepartments,
  educationalLevels,
  nigerianStates,
  nigerianUniversities,
} from "./constants";

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSave: (profileData: Partial<ProfileData>) => void;
  isSaving: boolean;
}

const ProfileEditorModal = ({
  isOpen,
  onClose,
  profile,
  onSave,
  isSaving,
}: ProfileEditorModalProps) => {
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({});
  const modalRef = useRef<HTMLDivElement>(null);

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  // Initialize form data with current profile values
  useEffect(() => {
    if (isOpen) {
      setFormData({
        full_name: profile.full_name || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        school_name: profile.school_name || "",
        department: profile.department || "",
        level: profile.level || "",
        state_of_origin: profile.state_of_origin || "",
        matric_number: profile.matric_number || "",
      });
    }
  }, [isOpen, profile]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdowns({});
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setOpenDropdowns((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  const toggleDropdown = (field: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdowns((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getDisplayValue = (value: string | undefined, options: any[]) => {
    if (!value) return "";
    const option = options.find(
      (opt) => (opt.value || opt.label || opt) === value
    );
    return option ? option.label || option.value || option : value;
  };

  const handleSubmit = () => {
    // Remove any unchanged fields to avoid unnecessary updates
    const updates: Partial<ProfileData> = {};

    for (const [key, value] of Object.entries(formData)) {
      if (value !== profile[key as keyof ProfileData]) {
        updates[key as keyof ProfileData] = value;
      }
    }

    // Only call onSave if there are actual changes
    if (Object.keys(updates).length > 0) {
      onSave(updates);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Update Profile</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name || ""}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-base"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.date_of_birth || ""}
                onChange={(e) =>
                  handleInputChange("date_of_birth", e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-base"
              />
            </div>

            {/* Gender */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => toggleDropdown("gender", e)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-base text-left bg-white flex items-center justify-between"
                >
                  <span
                    className={
                      formData.gender ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {getDisplayValue(formData.gender, genderOptions) ||
                      "Select gender"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${openDropdowns.gender ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdowns.gender && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {genderOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleSelectChange("gender", option.value)
                        }
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* University/School */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University/School
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => toggleDropdown("school_name", e)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-base text-left bg-white flex items-center justify-between"
                >
                  <span
                    className={
                      formData.school_name ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {getDisplayValue(
                      formData.school_name,
                      nigerianUniversities
                    ) || "Select school"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${openDropdowns.school_name ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdowns.school_name && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {nigerianUniversities.map((school) => (
                      <button
                        key={school.value || school.label}
                        type="button"
                        onClick={() =>
                          handleSelectChange(
                            "school_name",
                            school.value || school.label
                          )
                        }
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                      >
                        {school.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Department */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => toggleDropdown("department", e)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-base text-left bg-white flex items-center justify-between"
                >
                  <span
                    className={
                      formData.department ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {getDisplayValue(formData.department, commonDepartments) ||
                      "Your department"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${openDropdowns.department ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdowns.department && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {commonDepartments.map((dept) => (
                      <button
                        key={dept.value || dept.label}
                        type="button"
                        onClick={() =>
                          handleSelectChange(
                            "department",
                            dept.value || dept.label
                          )
                        }
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                      >
                        {dept.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Level */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => toggleDropdown("level", e)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-base text-left bg-white flex items-center justify-between"
                >
                  <span
                    className={
                      formData.level ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {getDisplayValue(formData.level, educationalLevels) ||
                      "Select level"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${openDropdowns.level ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdowns.level && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {educationalLevels.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleSelectChange("level", option.value)
                        }
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* State of Origin */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State of Origin
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => toggleDropdown("state_of_origin", e)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-base text-left bg-white flex items-center justify-between"
                >
                  <span
                    className={
                      formData.state_of_origin
                        ? "text-gray-900"
                        : "text-gray-500"
                    }
                  >
                    {getDisplayValue(
                      formData.state_of_origin,
                      nigerianStates
                    ) || "Select state"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${openDropdowns.state_of_origin ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdowns.state_of_origin && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {nigerianStates.map((state) => (
                      <button
                        key={state.value || state.label}
                        type="button"
                        onClick={() =>
                          handleSelectChange(
                            "state_of_origin",
                            state.value || state.label
                          )
                        }
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                      >
                        {state.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Matric Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matric Number
              </label>
              <input
                type="text"
                value={formData.matric_number || ""}
                onChange={(e) =>
                  handleInputChange("matric_number", e.target.value)
                }
                placeholder="Your matriculation number"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-base"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
          >
            {isSaving && (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditorModal;
