//@ts-nocheck
import { Tabs, Tab, Card, CardHeader, CardBody } from "@heroui/react";
import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";
import { useState } from "react";

const Opportunities = () => {
  const [activeTab, setActiveTab] = useState("academic");

  const rewards = {
    academic: [
      {
        title: "AI Study Champion Badge",
        description:
          "Earn recognition for mastering study tasks and consistency.",
        upgrade: true,
      },
      {
        title: "CrownApp + TII Certificate",
        description:
          "Awarded after exams for top contributors with 500+ points.",
        upgrade: false,
      },
      {
        title: "Rare Course Access: Generative AI",
        description: "Unlock exclusive learning after 1,000 points.",
        upgrade: true,
      },
    ],
    career: [
      {
        title: "Internship Offers",
        description: "Top scorers get referred to internship placements.",
        upgrade: true,
      },
      {
        title: "Paid Gigs (Coming Soon)",
        description: "Earn income through trusted microtasks and student jobs.",
        upgrade: false,
      },
    ],
    global: [
      {
        title: "Scholarship Alerts + Mentorship",
        description: "Stay informed and guided on global opportunities.",
        upgrade: true,
      },
      {
        title: "Personal Portfolio Website",
        description:
          "Get a custom academic/career portfolio to show your work.",
        upgrade: true,
      },
    ],
    community: [
      {
        title: "Referral Rewards",
        description: "Earn points when you bring friends on board.",
        upgrade: false,
      },
      {
        title: "Club Recognition",
        description: "Your student club gets featured and celebrated.",
        upgrade: false,
      },
    ],
  };

  const renderCards = (items) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {items.map((item, index) => (
        <Card key={index} className="relative p-4 shadow-md border">
          {item.upgrade && (
            <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Upgrade
            </span>
          )}
          <CardHeader className="text-lg font-semibold mb-1">
            {item.title}
          </CardHeader>
          <CardBody className="text-sm text-gray-600">
            {item.description}
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
