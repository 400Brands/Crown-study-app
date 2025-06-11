import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { Button, Card, CardBody, Chip, Divider, Avatar } from "@heroui/react";
import { ProfileData } from "@/types";
import DefaultLayout from "@/layouts/default";
import DashboardLayout from "@/layouts/dashboardLayout";
import ProfileEditorModal from "../components/ProfileModal";

const ProfileComponent = () => {
  const [profile, setProfile] = useState<ProfileData>({
    user_id: "",
    full_name: "",
    email: "",
    profile_complete: false,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session.session) {
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

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          const newProfileData = {
            user_id: userData.user.id,
            full_name: userData.user.user_metadata?.full_name || "",
            email: userData.user.email,
            profile_complete: false,
          };

          const { error: insertError } = await supabase
            .from("profiles")
            .insert(newProfileData);

          if (insertError) throw insertError;

          const { data: newProfile, error: fetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", userData.user.id)
            .single();

          if (fetchError) throw fetchError;
          setProfile(newProfile as ProfileData);
        } else {
          throw error;
        }
      } else {
        setProfile(data as ProfileData);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
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

      const updatedProfileData = {
        ...updates,
        updated_at: new Date().toISOString(),
        profile_complete: checkProfileComplete({ ...profile, ...updates }),
      };

      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", session.session.user.id)
        .single();

      if (checkError) {
        if (checkError.code === "PGRST116") {
          const newProfileData = {
            user_id: session.session.user.id,
            full_name: profile.full_name || "",
            email: profile.email || session.session.user.email,
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
          .eq("user_id", session.session.user.id);

        if (updateError) throw updateError;
      }

      const { data: updatedProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.session.user.id)
        .single();

      if (fetchError) throw fetchError;

      setProfile(updatedProfile as ProfileData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
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

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }

      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Invalid file type. Please use JPG, PNG or GIF");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${session.session.user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      await handleUpdateProfile({ avatar_url: publicUrl });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
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

  const missingFields = [
    ...(!profile.date_of_birth ? ["Date of Birth"] : []),
    ...(!profile.gender ? ["Gender"] : []),
    ...(!profile.school_name ? ["School Name"] : []),
    ...(!profile.department ? ["Department"] : []),
    ...(!profile.level ? ["Level"] : []),
    ...(!profile.state_of_origin ? ["State of Origin"] : []),
    ...(!profile.matric_number ? ["Matriculation Number"] : []),
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading profile...</p>
      </div>
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
                    onClick={() => setIsEditModalOpen(true)}
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
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-4">
                  {profile.avatar_url ? (
                    <Avatar
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-32 h-32"
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
                      onPress={() => setIsEditModalOpen(true)}
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

          <ProfileEditorModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            profile={profile}
            onSave={handleUpdateProfile}
            isSaving={isSaving}
          />
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default ProfileComponent;
