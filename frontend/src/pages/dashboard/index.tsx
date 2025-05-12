import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";
import { Button, Card, CardBody, Chip, Divider } from "@heroui/react";
import { useState } from "react";

type ProfileData = {
  fullName?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  schoolName?: string;
  department?: string;
  level?: string;
  stateOfOrigin?: string;
  matricNumber?: string;
  profileComplete: boolean;
};

const IndexDashboard = () => {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: "John Doe",
    email: "john.doe@university.edu",
    profileComplete: false, // Set based on actual data
  });

  // Fields that need updating
  const missingFields = [
    ...(!profile.dateOfBirth ? ["Date of Birth"] : []),
    ...(!profile.gender ? ["Gender"] : []),
    ...(!profile.schoolName ? ["School Name"] : []),
    ...(!profile.department ? ["Department"] : []),
    ...(!profile.level ? ["Level"] : []),
    ...(!profile.stateOfOrigin ? ["State of Origin"] : []),
    ...(!profile.matricNumber ? ["Matriculation Number"] : []),
  ];

  const handleEditProfile = () => {
    // This would navigate to your actual edit profile page
    console.log("Navigate to edit profile");
  };

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {!profile.profileComplete && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <CardBody className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-blue-800 mb-2">
                      Update Profile
                    </h2>
                    <p className="text-gray-700 mb-4">
                      Your profile information is not up to date. The following
                      fields need to be updated:
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {missingFields.map((field) => (
                        <Chip key={field} color="warning" variant="flat">
                          {field}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <Button
                    color="primary"
                    onPress={handleEditProfile}
                    className="shrink-0"
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          <Card className="border border-gray-200">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <svg
                      className="w-full h-full text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112 15c3.183 0 6.235 1.264 8.485 3.515A9.975 9.975 0 0024 20.993zM12 12a6 6 0 100-12 6 6 0 000 12z" />
                    </svg>
                  </div>
                  <Button
                    variant="bordered"
                    size="sm"
                    onPress={handleEditProfile}
                  >
                    Change Photo
                  </Button>
                </div>

                {/* Profile Details Section */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {profile.fullName || "Not provided"}
                      </h2>
                      <p className="text-gray-500">
                        {profile.email || "Not provided"}
                      </p>
                    </div>
                    <Button
                      variant="flat"
                      color="primary"
                      onPress={handleEditProfile}
                    >
                      Edit Profile
                    </Button>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">
                        Date of Birth
                      </h3>
                      <p>{profile.dateOfBirth || "Not provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">
                        Gender
                      </h3>
                      <p>{profile.gender || "Not provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">
                        School
                      </h3>
                      <p>{profile.schoolName || "Not provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">
                        Department
                      </h3>
                      <p>{profile.department || "Not provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">
                        Level
                      </h3>
                      <p>{profile.level || "Not provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">
                        State of Origin
                      </h3>
                      <p>{profile.stateOfOrigin || "Not provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">
                        Matric Number
                      </h3>
                      <p>{profile.matricNumber || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Conditional Dashboard Content */}
          {profile.profileComplete && (
            <div className="mt-6">
              {/* Your actual dashboard content would go here */}
              <p>I'm here</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default IndexDashboard;
