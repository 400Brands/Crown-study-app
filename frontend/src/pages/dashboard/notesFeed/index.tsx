import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";

const NotesFeed = () => {
  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="w-full flex justify-center items-center ml-4 bg-red-500">NotesFeed</div>
      </DashboardLayout>
    </DefaultLayout>
  );
}

export default NotesFeed