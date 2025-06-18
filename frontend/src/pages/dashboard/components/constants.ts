// Nigerian states with their respective capital cities
export const nigerianStates = [
  { label: "Abia", value: "abia", capital: "Umuahia" },
  { label: "Adamawa", value: "adamawa", capital: "Yola" },
  { label: "Akwa Ibom", value: "akwa_ibom", capital: "Uyo" },
  { label: "Anambra", value: "anambra", capital: "Awka" },
  { label: "Bauchi", value: "bauchi", capital: "Bauchi" },
  { label: "Bayelsa", value: "bayelsa", capital: "Yenagoa" },
  { label: "Benue", value: "benue", capital: "Makurdi" },
  { label: "Borno", value: "borno", capital: "Maiduguri" },
  { label: "Cross River", value: "cross_river", capital: "Calabar" },
  { label: "Delta", value: "delta", capital: "Asaba" },
  { label: "Ebonyi", value: "ebonyi", capital: "Abakaliki" },
  { label: "Edo", value: "edo", capital: "Benin City" },
  { label: "Ekiti", value: "ekiti", capital: "Ado-Ekiti" },
  { label: "Enugu", value: "enugu", capital: "Enugu" },
  { label: "Federal Capital Territory", value: "fct", capital: "Abuja" },
  { label: "Gombe", value: "gombe", capital: "Gombe" },
  { label: "Imo", value: "imo", capital: "Owerri" },
  { label: "Jigawa", value: "jigawa", capital: "Dutse" },
  { label: "Kaduna", value: "kaduna", capital: "Kaduna" },
  { label: "Kano", value: "kano", capital: "Kano" },
  { label: "Katsina", value: "katsina", capital: "Katsina" },
  { label: "Kebbi", value: "kebbi", capital: "Birnin Kebbi" },
  { label: "Kogi", value: "kogi", capital: "Lokoja" },
  { label: "Kwara", value: "kwara", capital: "Ilorin" },
  { label: "Lagos", value: "lagos", capital: "Ikeja" },
  { label: "Nasarawa", value: "nasarawa", capital: "Lafia" },
  { label: "Niger", value: "niger", capital: "Minna" },
  { label: "Ogun", value: "ogun", capital: "Abeokuta" },
  { label: "Ondo", value: "ondo", capital: "Akure" },
  { label: "Osun", value: "osun", capital: "Osogbo" },
  { label: "Oyo", value: "oyo", capital: "Ibadan" },
  { label: "Plateau", value: "plateau", capital: "Jos" },
  { label: "Rivers", value: "rivers", capital: "Port Harcourt" },
  { label: "Sokoto", value: "sokoto", capital: "Sokoto" },
  { label: "Taraba", value: "taraba", capital: "Jalingo" },
  { label: "Yobe", value: "yobe", capital: "Damaturu" },
  { label: "Zamfara", value: "zamfara", capital: "Gusau" },
];

// Educational levels commonly used in Nigerian educational system
export const educationalLevels = [
  { label: "100 Level", value: "100" },
  { label: "200 Level", value: "200" },
  { label: "300 Level", value: "300" },
  { label: "400 Level", value: "400" },
  { label: "500 Level", value: "500" },
  { label: "600 Level", value: "600" },
  { label: "Postgraduate", value: "postgraduate" },
];

// Common Nigerian university departments
export const commonDepartments = [
  { label: "Accounting", value: "accounting" },
  { label: "Agricultural Science", value: "agricultural_science" },
  { label: "Architecture", value: "architecture" },
  { label: "Banking and Finance", value: "banking_and_finance" },
  { label: "Biochemistry", value: "biochemistry" },
  { label: "Business Administration", value: "business_administration" },
  { label: "Chemical Engineering", value: "chemical_engineering" },
  { label: "Civil Engineering", value: "civil_engineering" },
  { label: "Computer Engineering", value: "computer_engineering" },
  { label: "Computer Science", value: "computer_science" },
  { label: "Economics", value: "economics" },
  {
    label: "Electrical/Electronic Engineering",
    value: "electrical_engineering",
  },
  { label: "English Language", value: "english_language" },
  { label: "Geology", value: "geology" },
  { label: "History", value: "history" },
  { label: "Law", value: "law" },
  { label: "Mass Communication", value: "mass_communication" },
  { label: "Mathematics", value: "mathematics" },
  { label: "Mechanical Engineering", value: "mechanical_engineering" },
  { label: "Medicine and Surgery", value: "medicine_and_surgery" },
  { label: "Microbiology", value: "microbiology" },
  { label: "Nursing", value: "nursing" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Physics", value: "physics" },
  { label: "Political Science", value: "political_science" },
  { label: "Psychology", value: "psychology" },
  { label: "Sociology", value: "sociology" },
  { label: "Statistics", value: "statistics" },
  { label: "Other", value: "other" },
];

// List of common Nigerian universities
export const nigerianUniversities = [
  { label: "University of Lagos", value: "unilag" },
  { label: "University of Ibadan", value: "ui" },
  { label: "Obafemi Awolowo University", value: "oau" },
  { label: "University of Nigeria, Nsukka", value: "unn" },
  { label: "Ahmadu Bello University", value: "abu" },
  { label: "University of Benin", value: "uniben" },
  { label: "University of Ilorin", value: "unilorin" },
  { label: "University of Port Harcourt", value: "uniport" },
  { label: "Federal University of Technology, Akure", value: "futa" },
  { label: "Federal University of Technology, Minna", value: "futminna" },
  { label: "Federal University of Technology, Owerri", value: "futo" },
  { label: "Covenant University", value: "cu" },
  { label: "Landmark University", value: "lmu" },
  { label: "Babcock University", value: "babcock" },
  { label: "Pan-Atlantic University", value: "pau" },
  { label: "American University of Nigeria", value: "aun" },
  { label: "Lagos State University", value: "lasu" },
  { label: "Nnamdi Azikiwe University", value: "unizik" },
  { label: "University of Jos", value: "unijos" },
  { label: "University of Calabar", value: "unical" },
  { label: "Other", value: "other" },
];

export interface OpportunityItem {
  title: string;
  description: string;
  details: string;
  pointsRequired: number;
  premium: boolean;
  locked: boolean;
  category: "academic" | "career" | "global" | "community" | "exclusive";
}

export interface OpportunityCategory {
  [key: string]: OpportunityItem[];
}

export const rewards: OpportunityCategory = {
  academic: [
    {
      title: "AI Study Champion Badge",
      description: "Earn your first recognition badge",
      details:
        "Displayed on your profile and visible to partner institutions. Unlocks basic study analytics.",
      pointsRequired: 100,
      premium: false,
      locked: false,
      category: "academic",
    },
    {
      title: "Exam Prep Toolkit Pro",
      description: "Advanced question banks and study planners",
      details:
        "Includes 10+ premium exam templates, 5 simulated tests with AI grading, and personalized weak area analysis.",
      pointsRequired: 300,
      premium: false,
      locked: false,
      category: "academic",
    },
    {
      title: "TII-CrownApp Joint Certificate",
      description: "Recognized certification for top contributors",
      details:
        "Digital + physical certificate co-signed by Technology Innovation Institute. Valid for LinkedIn and CVs.",
      pointsRequired: 500,
      premium: false,
      locked: true,
      category: "academic",
    },
    {
      title: "Generative AI Fundamentals Course",
      description: "12-week intensive on AI foundations",
      details:
        "Includes hands-on labs with GPT models, weekly mentor sessions, and final project showcase.",
      pointsRequired: 1000,
      premium: true,
      locked: true,
      category: "academic",
    },
    {
      title: "Research Co-Authorship Program",
      description: "Contribute to published academic papers",
      details:
        "Work with CrownApp research team on education technology studies. Name included in journal publications.",
      pointsRequired: 2500,
      premium: true,
      locked: true,
      category: "academic",
    },
    {
      title: "Elite Study Retreat Invitation",
      description: "3-day intensive learning experience",
      details:
        "All-expenses-paid retreat with industry experts at partner university campus. Limited to top 20 students monthly.",
      pointsRequired: 5000,
      premium: true,
      locked: true,
      category: "academic",
    },
  ],
  career: [
    {
      title: "LinkedIn Optimization Session",
      description: "Professional profile makeover",
      details:
        "1-hour consultation with career coach to boost your visibility to recruiters (3x more profile views guaranteed).",
      pointsRequired: 200,
      premium: false,
      locked: false,
      category: "career",
    },
    {
      title: "Microtask Marketplace Access",
      description: "Paid AI training tasks ($15-50/hr)",
      details:
        "Flexible work annotating data, moderating content, and testing educational AI models. Minimum 5 hours/week available.",
      pointsRequired: 400,
      premium: false,
      locked: true,
      category: "career",
    },
    {
      title: "Tech Internship Fast-Track",
      description: "Priority interviews with partners",
      details:
        "Guaranteed first-round interviews with 5+ tech companies including AI startups and Fortune 500 firms.",
      pointsRequired: 800,
      premium: false,
      locked: true,
      category: "career",
    },
    {
      title: "Startup Pitch Competition Entry",
      description: "Compete for $10,000 seed funding",
      details:
        "Annual event with mentorship from Y Combinator alumni. Top 3 teams receive investment and incubation.",
      pointsRequired: 1500,
      premium: true,
      locked: true,
      category: "career",
    },
    {
      title: "Executive Shadow Program",
      description: "Day-in-the-life experience",
      details:
        "Spend a workday with C-level executives from tech, finance, or academia sectors of your choice.",
      pointsRequired: 3000,
      premium: true,
      locked: true,
      category: "career",
    },
    {
      title: "Guaranteed Summer Internship",
      description: "Placement at partner organization",
      details:
        "8-12 week paid internship matched to your skills and career aspirations. 90% conversion to full-time offers.",
      pointsRequired: 5000,
      premium: true,
      locked: true,
      category: "career",
    },
  ],
  global: [
    {
      title: "Scholarship Matchmaking Service",
      description: "Personalized opportunity alerts",
      details:
        "Weekly curated list of scholarships matching your profile with application strategy tips.",
      pointsRequired: 600,
      premium: false,
      locked: false,
      category: "global",
    },
    {
      title: "Portfolio Website Package",
      description: "Showcase your academic journey",
      details:
        "Custom domain (yourname.com) with hosting for 1 year, 5 premium templates, and AI content assistant.",
      pointsRequired: 1200,
      premium: false,
      locked: true,
      category: "global",
    },
    {
      title: "Application Fee Waivers",
      description: "Save $500+ on study abroad apps",
      details:
        "Exclusive partnerships with 30+ universities to waive application costs for CrownApp top performers.",
      pointsRequired: 1800,
      premium: true,
      locked: true,
      category: "global",
    },
    {
      title: "Global Hackathon Ticket",
      description: "Compete in international events",
      details:
        "Travel stipend included (up to $1,500) for in-person finals at locations like Dubai, Singapore, or Berlin.",
      pointsRequired: 3500,
      premium: true,
      locked: true,
      category: "global",
    },
    {
      title: "Cultural Exchange Program",
      description: "2-week university immersion",
      details:
        "All-expenses-paid experience at partner institutions across 5 continents with networking events.",
      pointsRequired: 7000,
      premium: true,
      locked: true,
      category: "global",
    },
    {
      title: "Postgraduate Application Support",
      description: "Full MBA/Masters package",
      details:
        "Includes test prep, essay editing, and 10 hours of 1:1 consultation with admissions experts ($5,000 value).",
      pointsRequired: 10000,
      premium: true,
      locked: true,
      category: "global",
    },
  ],
  community: [
    {
      title: "Referral Rewards Program",
      description: "Earn $10 per successful referral",
      details:
        "Cash paid via PayPal when referred users reach 100 points. Bonus tiers at 5, 10, and 20 referrals.",
      pointsRequired: 0,
      premium: false,
      locked: false,
      category: "community",
    },
    {
      title: "Study Club Sponsorship",
      description: "$200 activity budget",
      details:
        "Official recognition for your student group plus marketing support to attract new members.",
      pointsRequired: 300,
      premium: false,
      locked: false,
      category: "community",
    },
    {
      title: "Content Creator Partnership",
      description: "Monetize your study content",
      details:
        "70% revenue share on educational materials you create. Access to 100k+ user audience.",
      pointsRequired: 800,
      premium: true,
      locked: true,
      category: "community",
    },
    {
      title: "Local Meetup Host Grant",
      description: "$500 event budget",
      details:
        "Organize CrownApp study sessions with food, venue, and promotional support covered.",
      pointsRequired: 1500,
      premium: true,
      locked: true,
      category: "community",
    },
    {
      title: "CrownApp Brand Ambassador",
      description: "Exclusive merch + perks",
      details:
        "Limited edition hoodie, mug, and notebook. VIP access to all events. $100 monthly activity stipend.",
      pointsRequired: 5000,
      premium: true,
      locked: true,
      category: "community",
    },
    {
      title: "Advisory Board Position",
      description: "Shape CrownApp's future",
      details:
        "Quarterly strategy meetings with founders, early feature access, and $1,000 annual honorarium.",
      pointsRequired: 10000,
      premium: true,
      locked: true,
      category: "community",
    },
  ],
  exclusive: [
    {
      title: "Founders' Dinner Invitation",
      description: "Private networking event",
      details:
        "Annual luxury dinner with CrownApp founders and special guests from tech and academia.",
      pointsRequired: 15000,
      premium: true,
      locked: true,
      category: "exclusive",
    },
    {
      title: "AI Lab Tour Experience",
      description: "Behind-the-scenes access",
      details:
        "Visit TII's research facilities in Abu Dhabi with meet-and-greet sessions with AI scientists.",
      pointsRequired: 20000,
      premium: true,
      locked: true,
      category: "exclusive",
    },
    {
      title: "Equity Grant Opportunity",
      description: "Earn startup shares",
      details:
        "Top contributors may receive stock options in CrownApp's parent company (subject to board approval).",
      pointsRequired: 30000,
      premium: true,
      locked: true,
      category: "exclusive",
    },
  ],
};