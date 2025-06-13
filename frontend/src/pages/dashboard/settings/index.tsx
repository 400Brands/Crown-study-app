import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";

const Settings = () => {
  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="w-full flex justify-center items-center ml-4 bg-red-500">Settings</div>
      </DashboardLayout>
    </DefaultLayout>
  );
}

export default Settings