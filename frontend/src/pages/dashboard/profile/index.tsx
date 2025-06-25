//@ts-nocheck

import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { Button, Card, CardBody, Chip, Divider, Avatar } from "@heroui/react";
import { ProfileData } from "@/types";
import DefaultLayout from "@/layouts/default";
import DashboardLayout from "@/layouts/dashboardLayout";
import ProfileEditorModal from "../components/ProfileModal";
import { useGameContext } from "../context/GameProvider";

const ProfileComponent = () => {
  const {
    userProfile: profile,
    profileLoading: loading,
    profileError,
    complexity,
    userProfile,
    session,
    refreshProfile,
    isInitialized,
    userId,
  } = useGameContext();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && !userId) {
      window.location.href = "/auth/login";
    }
  }, [isInitialized, userId]);

  const handleUpdateProfile = async (updates: Partial<ProfileData>) => {
    if (!userId || !profile) {
      setUpdateError("User not authenticated or profile not loaded");
      return;
    }

    try {
      setIsSaving(true);
      setUpdateError(null);

      const updatedProfileData = {
        ...updates,
        updated_at: new Date().toISOString(),
        profile_complete: checkProfileComplete({ ...profile, ...updates }),
      };

      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", userId)
        .single();

      if (checkError) {
        if (checkError.code === "PGRST116") {
          const newProfileData = {
            user_id: userId,
            full_name: profile.full_name || "",
            email: profile.email || "",
            ...updatedProfileData,
          };

          const { error: insertError } = await supabase
            .from("profiles")
            .insert(newProfileData);

          if (insertError) throw insertError;
        } else {
          throw checkError;
        }
      } else {
        const { error: updateError } = await supabase
          .from("profiles")
          .update(updatedProfileData)
          .eq("user_id", userId);

        if (updateError) throw updateError;
      }

      await refreshProfile();
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setUpdateError(error?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const checkProfileComplete = (profile: ProfileData) => {
    const requiredFields: (keyof ProfileData)[] = [
      "full_name",
      "email",
      "date_of_birth",
      "gender",
      "school_name",
      "department",
      "level",
      "state_of_origin",
      "matric_number",
    ];
    return requiredFields.every((field) => Boolean(profile[field]));
  };

  console.log(userProfile);

  const missingFields = profile
    ? [
        ...(!profile.date_of_birth ? ["Date of Birth"] : []),
        ...(!profile.gender ? ["Gender"] : []),
        ...(!profile.school_name ? ["School Name"] : []),
        ...(!profile.department ? ["Department"] : []),
        ...(!profile.level ? ["Level"] : []),
        ...(!profile.state_of_origin ? ["State of Origin"] : []),
        ...(!profile.matric_number ? ["Matriculation Number"] : []),
      ]
    : [];

  if (!isInitialized || loading) {
    return (
      <DefaultLayout>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading profile...
              </p>
            </div>
          </div>
        </DashboardLayout>
      </DefaultLayout>
    );
  }

  if (profileError && !profile) {
    return (
      <DefaultLayout>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <Card className="max-w-md">
              <CardBody className="text-center p-6">
                <div className="text-red-500 mb-4">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Profile Error
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {profileError}
                </p>
                <Button color="primary" onClick={refreshProfile}>
                  Try Again
                </Button>
              </CardBody>
            </Card>
          </div>
        </DashboardLayout>
      </DefaultLayout>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6 ml-4">
          {/* Profile Completion Card */}
          {!profile.profile_complete && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800">
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">
                      Complete Your Profile
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Please update the following information to get full access
                      to all features. Your current game complexity level is{" "}
                      {complexity}.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {missingFields.map((field) => (
                        <Chip key={field} color="warning" variant="flat">
                          {field}
                        </Chip>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Profile completion:{" "}
                      {Math.round(((9 - missingFields.length) / 9) * 100)}%
                    </div>
                  </div>
                  <Button
                    color="primary"
                    onClick={() => setIsEditModalOpen(true)}
                    className="shrink-0"
                  >
                    Complete Profile
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Error Messages */}
          {(updateError || uploadError) && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">
                    {updateError || uploadError}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onClick={() => {
                    setUpdateError(null);
                    setUploadError(null);
                  }}
                  className="mt-2"
                >
                  Dismiss
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Profile Information Card */}
          <Card>
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row gap-12">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar
                    src={session?.user?.user_metadata?.avatar_url}
                    alt="Profile Avatar"
                    className="w-32 h-32 text-lg"
                    isBordered
                  />
                </div>

                {/* Profile Details Section */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {profile.full_name || "Anonymous User"}
                    </h2>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      Edit Profile
                    </Button>
                  </div>

                  <Divider className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Email
                      </h3>
                      <p className="text-gray-900 dark:text-gray-100">
                        {profile.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Matric Number
                      </h3>
                      <p className="text-gray-900 dark:text-gray-100">
                        {profile.matric_number || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Date of Birth
                      </h3>
                      <p className="text-gray-900 dark:text-gray-100">
                        {profile.date_of_birth
                          ? new Date(profile.date_of_birth).toLocaleDateString()
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Gender
                      </h3>
                      <p className="text-gray-900 dark:text-gray-100">
                        {profile.gender || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        School
                      </h3>
                      <p className="text-gray-900 dark:text-gray-100">
                        {profile.school_name || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Department
                      </h3>
                      <p className="text-gray-900 dark:text-gray-100">
                        {profile.department || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Level
                      </h3>
                      <p className="text-gray-900 dark:text-gray-100">
                        {profile.level || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        State of Origin
                      </h3>
                      <p className="text-gray-900 dark:text-gray-100">
                        {profile.state_of_origin || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {profile.profile_complete && (
                    <div className="mt-6">
                      <Chip color="success" variant="flat">
                        Profile Complete
                      </Chip>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Your profile is 100% complete. Thank you for providing
                        all the required information.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Profile Editor Modal */}
        <ProfileEditorModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onSave={handleUpdateProfile}
          isSaving={isSaving}
        />
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default ProfileComponent;
