import { Tabs, Tab, Card, CardHeader, CardBody, Button } from "@heroui/react";
import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";
import { useState } from "react";
import { OpportunityItem, rewards } from "../components/constants";
import { useGameContext } from "../context/GameProvider";

const Opportunities = () => {
  const [activeTab, setActiveTab] = useState<string>("academic");
  const { score } = useGameContext();

  const renderCards = (items: OpportunityItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {items.map((item, index) => (
        <Card
          key={index}
          className={`relative p-4 shadow-md border ${item.locked ? "opacity-80" : ""}`}
        >
          {item.premium && (
            <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              Premium
            </span>
          )}
          <CardHeader className="text-lg font-semibold mb-1">
            {item.title}
          </CardHeader>
          <CardBody className="text-sm text-gray-600">
            <p>{item.description}</p>

            <div className={`mt-3 ${item.locked ? "filter blur-sm" : ""}`}>
              <p className="font-medium text-gray-800">Details:</p>
              <p>{item.details}</p>
              {item.pointsRequired > 0 && (
                <p className="mt-2 text-blue-600">
                  Requires {item.pointsRequired} points
                </p>
              )}
            </div>

            {item.locked && (
              <div className="mt-4 text-center">
                <Button
                  color="primary"
                  size="sm"
                  onPress={() => {
                    /* Implement upgrade modal */
                  }}
                >
                  {item.premium ? "Upgrade to Premium" : "Earn More Points"}
                </Button>
                <p className="text-xs mt-1 text-gray-500">
                  {item.premium
                    ? "Premium plan required"
                    : `${item.pointsRequired - 100} more points needed`}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6 px-4">
          <h1 className="text-2xl font-bold">🎖 CrownApp Opportunities</h1>
          <p className="text-gray-500">
            Unlock academic, career, and global rewards as you grow.
            <span className="ml-2 text-blue-600 font-medium">
              You have {score} points
            </span>
          </p>

          <Tabs
            aria-label="Opportunity Categories"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key.toString())}
          >
            <Tab key="academic" title="🎓 Academic Excellence" />
            <Tab key="career" title="💼 Career Boosters" />
            <Tab key="global" title="🌍 Global Mobility" />
            <Tab key="community" title="🤝 Community Perks" />
          </Tabs>

          {activeTab === "academic" && renderCards(rewards.academic)}
          {activeTab === "career" && renderCards(rewards.career)}
          {activeTab === "global" && renderCards(rewards.global)}
          {activeTab === "community" && renderCards(rewards.community)}
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default Opportunities;
