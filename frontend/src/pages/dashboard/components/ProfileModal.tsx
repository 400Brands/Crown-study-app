import { ProfileData } from "@/types";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { useState, useEffect } from "react";
import {
  commonDepartments,
  educationalLevels,
  genderOptions,
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Remove any unchanged fields to avoid unnecessary updates
    const updates: Partial<ProfileData> = {};

    for (const [key, value] of Object.entries(formData)) {
      if (value !== profile[key]) {
        updates[key] = value;
      }
    }

    // Only call onSave if there are actual changes
    if (Object.keys(updates).length > 0) {
      onSave(updates);
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Update Profile</h2>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                type="text"
                value={formData.full_name || ""}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Your full name"
                variant="bordered"
                size="lg"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <Input
                type="date"
                value={formData.date_of_birth || ""}
                onChange={(e) =>
                  handleInputChange("date_of_birth", e.target.value)
                }
                variant="bordered"
                size="lg"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <Select
                variant="bordered"
                size="lg"
                className="w-full"
                value={formData.gender || ""}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                placeholder="Select gender"
              >
                {genderOptions.map((option) => (
                  <SelectItem key={option.value}>{option.label}</SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                University/School
              </label>
              <Select
                variant="bordered"
                size="lg"
                className="w-full"
                value={formData.school_name || ""}
                onChange={(e) =>
                  handleInputChange("school_name", e.target.value)
                }
                placeholder="Select school"
              >
                {nigerianUniversities.map((school) => (
                  <SelectItem key={school.label}>{school.label}</SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>

              <Select
                variant="bordered"
                size="lg"
                className="w-full"
                value={formData.department || ""}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
                placeholder="Your department"
              >
                {commonDepartments.map((dept) => (
                  <SelectItem key={dept.label}>{dept.label}</SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <Select
                variant="bordered"
                size="lg"
                className="w-full"
                value={formData.level || ""}
                onChange={(e) => handleInputChange("level", e.target.value)}
                placeholder="Select level"
              >
                {educationalLevels.map((option) => (
                  <SelectItem key={option.value}>{option.label}</SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State of Origin
              </label>
              <Select
                variant="bordered"
                size="lg"
                className="w-full"
                value={formData.state_of_origin || ""}
                onChange={(e) =>
                  handleInputChange("state_of_origin", e.target.value)
                }
                placeholder="Select state"
              >
                {nigerianStates.map((state) => (
                  <SelectItem key={state.label}>{state.label}</SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matric Number
              </label>
              <Input
                type="text"
                value={formData.matric_number || ""}
                onChange={(e) =>
                  handleInputChange("matric_number", e.target.value)
                }
                placeholder="Your matriculation number"
                variant="bordered"
                size="lg"
                className="w-full"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="flat"
            color="danger"
            onPress={onClose}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={isSaving}>
            {isSaving ? "Saving..." : "Save All Changes"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProfileEditorModal;
