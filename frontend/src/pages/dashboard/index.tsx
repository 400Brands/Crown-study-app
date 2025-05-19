import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";
import { Button, Card, CardBody, Chip, Divider } from "@heroui/react";
import { supabase } from "@/supabaseClient";
import { useEffect, useState } from "react";
import ProfileEditorModal from "./components/ProfileModal";
import { ProfileData } from "@/types";

const IndexDashboard = () => {
  const [profile, setProfile] = useState<ProfileData>({
    user_id: "",
    full_name: "",
    email: "",
    profile_complete: false,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Get current user session from Supabase auth
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session.session) {
        // Redirect to login if no session
        window.location.href = "/auth/login";
        return;
      }

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;
      if (!userData.user) {
        window.location.href = "/auth/login";
        return;
      }

      // Try to fetch existing profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

      // Special handling for "no rows returned" error
      if (error) {
        if (error.code === "PGRST116") {
          // No profile exists, create a new one
          const newProfileData = {
            user_id: userData.user.id,
            full_name: userData.user.user_metadata?.full_name || "",
            email: userData.user.email,
            profile_complete: false,
          };

          // Insert new profile
          const { error: insertError } = await supabase
            .from("profiles")
            .insert(newProfileData);

          if (insertError) throw insertError;

          // Fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", userData.user.id)
            .single();

          if (fetchError) throw fetchError;
          setProfile(newProfile as ProfileData);
        } else {
          // Handle other errors
          throw error;
        }
      } else {
        // Profile exists, set it in state
        setProfile(data as ProfileData);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      // Handle authentication errors
      if (error?.message?.includes("auth") || error.message?.includes("JWT")) {
        window.location.href = "/auth/login?error=session_expired";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: Partial<ProfileData>) => {
    try {
      setIsSaving(true);
      const { data: session } = await supabase.auth.getSession();

      if (!session.session?.user?.id) {
        throw new Error("Authentication required");
      }

      // Create the updated profile data
      const updatedProfileData = {
        ...updates,
        updated_at: new Date().toISOString(),
        profile_complete: checkProfileComplete({ ...profile, ...updates }),
      };

      // First check if the profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", session.session.user.id)
        .single();

      if (checkError) {
        // If error is "no rows returned", we need to create the profile
        if (checkError.code === "PGRST116") {
          // Create a new profile with the user's data and updates
          const newProfileData = {
            user_id: session.session.user.id,
            full_name: profile.full_name || "",
            email: profile.email || session.session.user.email,
            ...updatedProfileData,
          };

          // Insert new profile
          const { error: insertError } = await supabase
            .from("profiles")
            .insert(newProfileData);

          if (insertError) throw insertError;
        } else {
          throw checkError;
        }
      } else {
        // Profile exists, update it
        const { error: updateError } = await supabase
          .from("profiles")
          .update(updatedProfileData)
          .eq("user_id", session.session.user.id);

        if (updateError) throw updateError;
      }

      // Fetch the updated/created profile
      const { data: updatedProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.session.user.id)
        .single();

      if (fetchError) throw fetchError;

      // Update local state with the new profile data
      setProfile(updatedProfile as ProfileData);
      setIsEditModalOpen(false);

      // You could add a success notification here
      // showNotification({ type: "success", message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      // showNotification({ type: "error", message: "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploading(true);

      const { data: session } = await supabase.auth.getSession();

      if (!session.session?.user?.id) {
        throw new Error("Authentication required");
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }

      // Check file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Invalid file type. Please use JPG, PNG or GIF");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${session.session.user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update profile with new avatar URL
      await handleUpdateProfile({ avatar_url: publicUrl });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      // Show error notification
      // showNotification({ type: "error", message: error.message || "Failed to upload photo" });
    } finally {
      setUploading(false);
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

  // Fields that need updating
  const missingFields = [
    ...(!profile.date_of_birth ? ["Date of Birth"] : []),
    ...(!profile.gender ? ["Gender"] : []),
    ...(!profile.school_name ? ["School Name"] : []),
    ...(!profile.department ? ["Department"] : []),
    ...(!profile.level ? ["Level"] : []),
    ...(!profile.state_of_origin ? ["State of Origin"] : []),
    ...(!profile.matric_number ? ["Matriculation Number"] : []),
  ];

  const handleSignOut = async () => {
    try {
      setSignOutLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setSignOutLoading(false);
    }
  };

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <DefaultLayout>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <p>Loading profile...</p>
          </div>
        </DashboardLayout>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6">

          {!profile.profile_complete && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-blue-800 mb-2">
                      Complete Your Profile
                    </h2>
                    <p className="text-gray-700 mb-4">
                      Please update the following information to get full access
                      to all features:
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {missingFields.map((field) => (
                        <Chip key={field} color="warning" variant="flat">
                          {field}
                        </Chip>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      Profile completion:{" "}
                      {Math.round(((9 - missingFields.length) / 9) * 100)}%
                    </div>
                  </div>
                  <Button
                    color="primary"
                    onClick={openEditModal}
                    className="shrink-0"
                  >
                    Complete Profile
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          <Card className="border border-gray-200">
            <CardBody className="p-6">
              <div
                className="flex flex-col md:flex-row gap-6"
                id="profile-details"
              >
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center space-y-4">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <svg
                        className="w-full h-full text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112 15c3.183 0 6.235 1.264 8.485 3.515A9.975 9.975 0 0024 20.993zM12 12a6 6 0 100-12 6 6 0 000 12z" />
                      </svg>
                    </div>
                  )}
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleAvatarUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <Button
                    variant="bordered"
                    size="sm"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                    isLoading={uploading}
                    isDisabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Change Photo"}
                  </Button>
                </div>

                {/* Profile Details Section */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {profile.full_name || "Not provided"}
                      </h2>
                      <p className="text-gray-500">
                        {profile.email || "Not provided"}
                      </p>
                    </div>
                    <Button
                      variant="flat"
                      color="primary"
                      onClick={openEditModal}
                    >
                      Edit Profile
                    </Button>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">
                        Date of Birth
                      </span>
                      <p className="font-medium">
                        {profile.date_of_birth || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Gender</span>
                      <p className="font-medium">
                        {profile.gender || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">School</span>
                      <p className="font-medium">
                        {profile.school_name || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Department</span>
                      <p className="font-medium">
                        {profile.department || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Level</span>
                      <p className="font-medium">
                        {profile.level || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">
                        State of Origin
                      </span>
                      <p className="font-medium">
                        {profile.state_of_origin || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">
                        Matric Number
                      </span>
                      <p className="font-medium">
                        {profile.matric_number || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {profile.profile_complete && (
            <div className="mt-6">
              {/* Your actual dashboard content would go here */}
              <p>
                Your profile is complete! You can now access all dashboard
                features.
              </p>
            </div>
          )}
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

export default IndexDashboard;
