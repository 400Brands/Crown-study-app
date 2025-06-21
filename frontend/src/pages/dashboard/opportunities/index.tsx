import {
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Image,
  Badge,
  Progress,
} from "@heroui/react";
import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";
import { useState } from "react";
import { OpportunityItem, rewards } from "../components/constants";
import { useGameContext } from "../context/GameProvider";
import {
  Lock,
  Star,
  Globe,
  Briefcase,
  GraduationCap,
  Users,
  ArrowRight,
  Zap,
  ChevronDown,
} from "lucide-react";

const Opportunities = () => {
  const [activeTab, setActiveTab] = useState<string>("academic");
  const { score } = useGameContext();
  const [mobileTabOpen, setMobileTabOpen] = useState(false);

  const tabIcons = {
    academic: <GraduationCap size={18} />,
    career: <Briefcase size={18} />,
    global: <Globe size={18} />,
    community: <Users size={18} />,
  };

  const tabLabels = {
    academic: "Academic",
    career: "Career",
    global: "Global",
    community: "Community",
  };

  const renderCards = (items: OpportunityItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
      {items.map((item, index) => (
        <Card
          key={index}
          className={`relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
            item.locked ? "opacity-90 border-dashed" : "border-solid"
          }`}
          isPressable={!item.locked}
        >
          {/* Premium Badge - Smaller on mobile */}
          {item.premium && (
            <div className="absolute top-2 right-2 z-10">
              <Chip
                color="secondary"
                variant="solid"
                size="sm"
                classNames={{
                  base: "text-xs px-1.5 py-0.5",
                  content: "text-[0.7rem]",
                }}
                startContent={<Star size={12} className="mr-1" />}
              >
                Premium
              </Chip>
            </div>
          )}

          {/* Card Header with Image - Adjusted height for mobile */}
          <CardHeader className="relative p-0 overflow-hidden h-32 sm:h-40">
            <Image
              alt={item.title}
              src={
                "https://res.cloudinary.com/dgbreoalg/image/upload/v1728465228/9067193_r2kwzy.jpg"
              }
              className="w-full h-full object-cover"
              removeWrapper
            />
            {item.locked && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Lock size={24} className="text-white" />
              </div>
            )}
          </CardHeader>

          {/* Card Body - Adjusted padding and text sizes for mobile */}
          <CardBody className="p-3 sm:p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-sm sm:text-base font-semibold line-clamp-2">
                {item.title}
              </h3>
              {item.pointsRequired > 0 && (
                <Badge color="warning" variant="flat" size="sm">
                  {item.pointsRequired} pts
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 line-clamp-2">
              {item.description}
            </p>

            {/* Progress indicator - Smaller on mobile */}
            {item.locked && (
              <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
                <div className="flex justify-between text-[0.65rem] sm:text-xs text-gray-500">
                  <span>Your points: {score}</span>
                  <span>Required: {item.pointsRequired}</span>
                </div>
                <Progress
                  size="sm"
                  value={(score / item.pointsRequired) * 100}
                  color="warning"
                  className="max-w-full"
                />
              </div>
            )}

            {/* Details section - Adjusted for mobile */}
            <div
              className={`mt-2 sm:mt-3 text-xs sm:text-sm ${item.locked ? "blur-sm" : ""}`}
            >
              <div className="flex items-center gap-1 text-gray-500 mb-1">
                <Zap size={12} className="text-yellow-500" />
                <span className="font-medium">Benefits:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-[0.7rem] sm:text-xs">
                {item.details.split(". ").map((detail, i) => (
                  <li key={i} className="text-gray-600">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action button - Full width and adjusted size */}
            <div className="mt-3 sm:mt-4 pt-2 border-t border-gray-100">
              {item.locked ? (
                <Button
                  fullWidth
                  size="sm"
                  color={item.premium ? "secondary" : "primary"}
                  variant="flat"
                  startContent={
                    item.premium ? <Star size={14} /> : <Lock size={14} />
                  }
                >
                  <span className="text-xs sm:text-sm">
                    {item.premium ? "Upgrade" : "Earn Points"}
                  </span>
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="sm"
                  color="primary"
                  variant="solid"
                  endContent={<ArrowRight size={14} />}
                >
                  <span className="text-xs sm:text-sm">Explore</span>
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="px-3 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-7xl mx-auto">
          {/* Hero Section - Stacked on mobile */}
          <div className="bg-gradient-to-r from-indigo-800 to-blue-600 rounded-xl p-0 md:p-8 text-white mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  🎖 CrownApp Opportunities
                </h1>
                <p className="text-blue-100 max-w-2xl">
                  Unlock academic, career, and global rewards as you grow. Your
                  progress opens doors to exclusive benefits and experiences.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-50">
                    Your Points
                  </span>
                  <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
                    Level 3
                  </span>
                </div>
                <div className="text-2xl font-bold mt-1">{score}</div>
                <Progress
                  size="sm"
                  value={((score % 1000) / 1000) * 100}
                  color="warning"
                  className="mt-2"
                />
                <div className="text-xs text-blue-100 mt-1">
                  {1000 - (score % 1000)} pts to next level
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6 sm:space-y-8">
            {/* Mobile-friendly tabs */}
            <div className="block sm:hidden">
              <Button
                fullWidth
                variant="flat"
                endContent={
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${mobileTabOpen ? "rotate-180" : ""}`}
                  />
                }
                onPress={() => setMobileTabOpen(!mobileTabOpen)}
                className="justify-between"
              >
                {tabIcons[activeTab as keyof typeof tabIcons]}
                <span className="ml-2">
                  {tabLabels[activeTab as keyof typeof tabLabels]} Opportunities
                </span>
              </Button>

              {mobileTabOpen && (
                <div className="mt-2 space-y-1">
                  {Object.keys(tabIcons).map((tabKey) => (
                    <Button
                      key={tabKey}
                      fullWidth
                      variant={activeTab === tabKey ? "solid" : "light"}
                      color={activeTab === tabKey ? "primary" : "default"}
                      startContent={tabIcons[tabKey as keyof typeof tabIcons]}
                      onPress={() => {
                        setActiveTab(tabKey);
                        setMobileTabOpen(false);
                      }}
                      className="justify-start"
                    >
                      {tabLabels[tabKey as keyof typeof tabLabels]}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop tabs */}
            <Tabs
              aria-label="Opportunity Categories"
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key.toString())}
              className="sticky top-0 z-10 bg-white dark:bg-gray-900 pt-2"
              classNames={{
                tabList: "gap-0 overflow-x-auto",
                tab: "px-3 sm:px-6 h-12", // Smaller padding on mobile
                cursor: "bg-blue-400 dark:bg-blue-600",
              }}
            >
              <Tab
                key="academic"
                title={
                  <div className="flex items-center gap-1 sm:gap-2">
                    {tabIcons.academic}
                    <span className="hidden sm:inline">
                      Academic Excellence
                    </span>
                    <span className="sm:hidden text-xs">Academic</span>
                  </div>
                }
              />
              <Tab
                key="career"
                title={
                  <div className="flex items-center gap-1 sm:gap-2">
                    {tabIcons.career}
                    <span className="hidden sm:inline">Career Boosters</span>
                    <span className="sm:hidden text-xs">Career</span>
                  </div>
                }
              />
              <Tab
                key="global"
                title={
                  <div className="flex items-center gap-1 sm:gap-2">
                    {tabIcons.global}
                    <span className="hidden sm:inline">Global Mobility</span>
                    <span className="sm:hidden text-xs">Global</span>
                  </div>
                }
              />
              <Tab
                key="community"
                title={
                  <div className="flex items-center gap-1 sm:gap-2">
                    {tabIcons.community}
                    <span className="hidden sm:inline">Community Perks</span>
                    <span className="sm:hidden text-xs">Community</span>
                  </div>
                }
              />
            </Tabs>

            {/* Tab Content */}
            <div className="pb-4 sm:pb-8">
              {activeTab === "academic" && renderCards(rewards.academic)}
              {activeTab === "career" && renderCards(rewards.career)}
              {activeTab === "global" && renderCards(rewards.global)}
              {activeTab === "community" && renderCards(rewards.community)}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default Opportunities;
