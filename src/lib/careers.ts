export type Vacancy = {
  id: string; title: string; location?: string; division?: string; publishedDate?: string;
  experience?: string; qualification?: string; employmentType?: string; description?: string;
  responsibilities?: string[]; skills?: string[]; vacancies?: number; deadline?: string;
  status: "open" | "closed" | "filled" | "draft";
};
export type RecruitmentFlyer = { id: string; title: string; url: string; imageUrl?: string; roles: string[]; status: "open" | "closed" | "draft" };

export const LIFE_SECTIONS = [
  {
    "title": "People, Learning & Development",
    "paragraphs": [
      "At Ramky Infrastructure Limited, we believe that our people are the foundation of our success. We are committed to building a skilled, safety-conscious, inclusive and performance-driven workforce capable of delivering complex infrastructure projects and creating long-term value for our stakeholders.",
      "Our employee learning and development initiatives focus on strengthening technical expertise, improving execution capabilities, promoting workplace safety and nurturing leadership talent across our projects and corporate functions."
    ]
  },
  {
    "title": "Training & Capability Development",
    "paragraphs": [
      "We focus on providing role-specific training to our Employees comprises Both Technical and Non Technical Trainings. Our training initiatives are designed to enhance technical competencies, improve operational efficiency, strengthen quality standards and promote safe working practices at project sites.",
      "In addition to technical training, we encourage continuous learning through employee induction and orientation programmes, junior and middle management development, leadership development, communication and soft-skills training, and project execution best practices.",
      "Through structured learning initiatives, on-the-job training and knowledge-sharing programmes, we aim to equip our employees with the capabilities required to meet evolving project requirements, adopt new technologies and contribute to the Company's business objectives."
    ]
  },
  {
    "title": "Building a Connected Workforce",
    "paragraphs": [
      "We strive to ensure that our employees understand and contribute to Ramky Infrastructure Limited's vision, mission, values and strategic priorities. Our employee engagement initiatives aim to foster collaboration, strengthen organizational culture and create a shared sense of purpose across corporate offices and project locations.",
      "Our initiatives include:",
      "Community Engagement: Encouraging employee participation in community development and social responsibility initiatives.",
      "Knowledge Sharing: Promoting the exchange of project experiences, engineering practices, execution insights and lessons learned across teams and locations.",
      "Employee Engagement Activities: Encouraging participation in team-building activities, sports, cultural events and employee wellness initiatives, as appropriate to the workplace and project environment.",
      "Leadership Connect: Facilitating interactions between management and employees through project visits, reviews and communication initiatives to strengthen alignment with the Company's long-term objectives."
    ]
  },
  {
    "title": "Digitalising Human Resources",
    "paragraphs": [
      "We continue to recognise the importance of efficient, technology-enabled human resource processes in supporting our growing and geographically distributed workforce. Our HR digitalisation efforts can focus on improving accessibility, accuracy, transparency and employee experience across the employment lifecycle.",
      "Key focus areas include:",
      "Digitisation of employee records and personnel information.",
      "Streamlining recruitment and candidate management processes.",
      "Digital onboarding and induction for new employees.",
      "Efficient payroll and employee benefits administration.",
      "Leveraging enterprise resource planning and HR technology for workforce information, reporting and employee lifecycle management.",
      "Supporting workforce planning, training records and employee development through structured digital processes.",
      "These initiatives support operational efficiency, improve access to employee information and help create a more responsive and employee-centric HR function."
    ]
  },
  {
    "title": "Celebrating Diversity & Inclusion",
    "paragraphs": [
      "Ramky Infrastructure Limited recognises the value of a diverse workforce in delivering projects across different regions, communities and operating environments. We aim to foster a workplace culture built on mutual respect, equal opportunity, collaboration and inclusion.",
      "Our approach to diversity and inclusion focuses on:",
      "Geographical Diversity: Bringing together employees with varied regional backgrounds and experiences across our project locations.",
      "Workforce Inclusion: Encouraging collaboration among employees, contractors and project teams while respecting local communities and working environments.",
      "Cultural Awareness: Promoting sensitivity to regional cultures, languages, local practices and applicable workplace requirements.",
      "Gender Diversity: Encouraging women's participation across corporate functions, technical roles, leadership positions and other suitable areas of our business.",
      "Equal Opportunity: Supporting a respectful workplace where employees are valued for their skills, contributions and performance.",
      "We aspire to create an environment in which every employee has the opportunity to contribute, develop professionally and succeed."
    ]
  },
  {
    "title": "Grow with Ramky",
    "paragraphs": [
      "At Ramky Infrastructure Limited, we believe that employee growth and organisational growth go hand in hand. We seek to identify employees with strong performance, leadership potential and a commitment to continuous improvement, and support their development through suitable learning and career opportunities.",
      "Our employee development approach can include:",
      "Career Progression: Providing opportunities for employees to take on greater responsibilities based on their performance, competencies and organisational requirements.",
      "Leadership Development: Preparing high-potential employees for supervisory, managerial and project leadership roles.",
      "Project Exposure: Offering opportunities to gain experience across different projects, business verticals, locations and stages of project execution, subject to business needs.",
      "Knowledge Transfer: Encouraging experienced professionals to share practical knowledge, engineering expertise and execution best practices with colleagues.",
      "Continuous Learning: Supporting the development of technical, managerial, digital and interpersonal capabilities required for future business challenges.",
      "Through these initiatives, we aim to nurture future leaders, strengthen our project delivery capabilities and build a workforce that grows alongside Ramky Infrastructure Limited.",
      "At Ramky, we build more than infrastructure. We build capabilities, careers and a culture of continuous learning."
    ]
  }
];
export const POSITIONS_INTRO = "At Ramky, we are passionate about our work and love to innovate. At the root of our success lies the commitment of our people and the hunger to excel. Our people power us and make Ramky a great place to work.At Ramky, you get to change lives, build a sustainable world, and have fun while doing it. If you're ready to discover just how far your talents can take you, we invite you to explore the various possibilities with us.Kick start your career with Ramky Team and explore limitless opportunities. Interested candidates may apply to current openings with their updated resumes at  careers@ramky.com";
export const PURPOSE = {
  vision: "We shall be a leading global enterprise in world - class infrastructure development & environment management through sustainable growth",
  mission: "We shall ensure quality, timely and budgetary deliverances through continuous technology upgradation, thereby enhancing the value of all its stakeholders",
  valuesIntro: "Ramky, in achieving its vision, shall promote high standards of:",
  values: ["Integrity", "Quality, Timely & Budgetary deliverance", "Customer Satisfaction", "Safety, Health & Environment", "Social Commitment"],
};

// Source: the recruitment screenshot in Careers.docx. Only supplied fields are published.
export const VACANCIES: Vacancy[] = [{ id: "3105", title: "CONSTRUCTION MANAGER - URBAN", location: "India, Any Where In India, IN", division: "BU Urban Infrastructure", publishedDate: "9 Oct 2026", status: "open" }];
export const RECRUITMENT_FLYERS: RecruitmentFlyer[] = [];
// Preserve the previous sample records without presenting them as verified vacancies.
export const LEGACY_UNPUBLISHED_ROLES = [
  { title: "Project Manager — Highways", location: "Hyderabad", type: "Full-time" },
  { title: "Site Engineer — Civil", location: "Bengaluru", type: "Full-time" },
  { title: "Planning Engineer", location: "Hyderabad", type: "Full-time" },
  { title: "Safety Officer (HSE)", location: "Chennai", type: "Full-time" },
  { title: "Quantity Surveyor", location: "Pune", type: "Full-time" },
  { title: "Graduate Engineer Trainee", location: "Multiple locations", type: "Trainee" },
];
export function careersHead(title: string, description: string) {
  const fullTitle = `${title} | Ramky Infrastructure`;
  return { meta: [{ title: fullTitle }, { name: "description", content: description }, { property: "og:title", content: fullTitle }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}
