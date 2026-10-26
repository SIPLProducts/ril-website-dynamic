// Board of Directors profiles, taken from the official profile document.
// Shaped as a plain data entity so a future admin panel can manage it.

import ph1 from "@/assets/director-anantapuram-guggela-ravindranath-reddy.jpg.asset.json";
import ph2 from "@/assets/director-isaac-wesley-vijaya-kumar.jpg.asset.json";
import ph3 from "@/assets/director-ravi-kumar-reddy-somavarapu.jpg.asset.json";
import ph4 from "@/assets/director-eshwar-reddy-purmandla.jpg.asset.json";
import ph5 from "@/assets/director-malvieka-joshi.jpg.asset.json";
import ph6 from "@/assets/director-peddibhotla-gangadhara-sastry.jpg.asset.json";
import nagarajaPhoto from "@/assets/director-yancharla-rathnakara-nagaraja.jpg.asset.json";

export type Director = {
  id: string;
  slug: string;
  name: string;
  designation: string;
  /** URL of the profile photograph (JPG/JPEG/PNG/WebP). null shows a placeholder. */
  profileImage: string | null;
  displayOrder: number;
  status: "published" | "draft";
  biography: string[];
  education: string[];
  professionalExperience: string[];
  expertise: string[];
  awards: string[];
  otherInformation: string[];
};

export const PROFILE_SECTIONS = [
  { key: "biography", heading: "Professional Profile" },
  { key: "education", heading: "Education & Qualifications" },
  { key: "professionalExperience", heading: "Professional Experience" },
  { key: "expertise", heading: "Areas of Expertise" },
  { key: "awards", heading: "Awards & Recognition" },
  { key: "otherInformation", heading: "Professional Contributions" },
] as const;

export const DIRECTORS: Director[] = [
  {
    "id": "director-1",
    "slug": "yancharla-rathnakara-nagaraja",
    "name": "Mr. Yancharla Rathnakara Nagaraja",
    "designation": "Managing Director",
    "profileImage": nagarajaPhoto.url,
    "displayOrder": 1,
    "status": "published",
    "biography": [
      "Mr. Y R Nagaraja is a seasoned Civil Engineer with a Bachelor’s Degree from Karnataka University and over 41 years of comprehensive experience in civil, industrial and environmental infrastructure. He began his career with the Public Works Department, Government of Karnataka and later contributed his expertise at Mandanlal Steels Limited and Navega Engineers Private Limited. Over the decades, he has successfully led the design, engineering, and execution of numerous infrastructure projects across India and abroad, spanning water treatment, industrial wastewater, sewage treatment, roads, industrial buildings, and specialized structural works."
    ],
    "education": [],
    "professionalExperience": [],
    "expertise": [
      "A recognized expert in environmental infrastructure, Mr. Nagaraja played a pivotal role in the development of India’s first major hazardous waste landfill facility. He was instrumental in the design and execution of two phases of Waste to Energy Plants at Jawahar Nagar, Hyderabad, and an additional plant at Dundigal. Under his leadership, his company secured and implemented the Hyderabad Waste Management Project (HWMP) on a Build-Own-Operate (BOO) basis – the first project of its kind in the country. He has also designed and commissioned wastewater and sewage treatment plants utilizing UASBR (Upflow Anaerobic Sludge Blanket Reactor) and SBR technology, reinforcing his technical versatility and innovative approach."
    ],
    "awards": [],
    "otherInformation": [
      "Mr. Nagaraja is an active contributor to the professional community through participation in seminars, symposia, and training programs. He is a member of several prestigious institutions including the Environmental Auditors Registration Association (EARA), Indian Association for Environmental Management (IAEM), the Institution of Engineers (India), and the Institute of Public Health Engineers Association. His extensive travel within India and internationally has provided valuable exposure to global best practices in civil construction and environmental management, enhancing his ability to deliver sustainable and forward-thinking solutions."
    ]
  },
  {
    "id": "director-2",
    "slug": "anantapuram-guggela-ravindranath-reddy",
    "name": "Dr. Anantapuram Guggela Ravindranath Reddy",
    "designation": "Non-Executive Director",
    "profileImage": ph1.url,
    "displayOrder": 2,
    "status": "published",
    "biography": [],
    "education": [
      "Dr. A. G. Ravindranath Reddy is a Fellow Company Secretary, a Post Graduate in Commerce and a Graduate in Law. He is a Corporate Consultant for the past 29 years, specializing in corporate laws, economic laws, foreign exchange laws, corporate restructuring, etc. He believes in ‘learning beyond law’ and was awarded with a Ph.D. in Management on topic – ‘Role of Shareholders in Corporate Governance’."
    ],
    "professionalExperience": [
      "He practiced as an Advocate in Criminal Courts for the initial 2 years of his career. Post that, he had also worked in senior management levels in various companies for 6 years. He possesses hands-on experience in legal and court proceedings, handling public issues, coordinating amalgamation proceedings, negotiating and drafting various agreements, restructuring and implementation and compliance of corporate governance."
    ],
    "expertise": [],
    "awards": [],
    "otherInformation": []
  },
  {
    "id": "director-3",
    "slug": "isaac-wesley-vijaya-kumar",
    "name": "Mr. Isaac Wesley Vijaya Kumar",
    "designation": "Non-Executive Director",
    "profileImage": ph2.url,
    "displayOrder": 3,
    "status": "published",
    "biography": [],
    "education": [
      "Mr. I W Vijaya Kumar is a Chartered Accountant from the Institute of Chartered Accountants of India (ICAI) and is also a Company Secretary from the Institute of Company Secretaries of India (ICSI) and is currently trained for Certified Public Accountant (CPA), New York, USA. He is also an Oracle Financial Consultant and has vast knowledge in US GAAP, UK GAAP, Indian GAAP and IFRS."
    ],
    "professionalExperience": [
      "Mr. I W Vijaya Kumar has 31 + years of multinational experience in the areas of finance and strategic planning, business valuations, corporate accounting and Taxation, Internal and External Audit, Legal , Secretarial, general administration and management experience with expertise in project finance, accounting systems development, fiscal management, financial reporting, developing and implementing financial and operational controls.",
      "Mr. I W Vijaya Kumar prior to joining Ramky was the Chief Financial Officer of Doowa Group of Companies, Bangkok, Thailand. Mr. Vijaya Kumar has hands on experience heading the finance function in various industries such as infrastructure – construction & dredging, real estate, embroidery, textile manufacturing and export, IT education and training, Thai food and beverage business; Garment manufacture and export; and owning and operating hotels and serviced apartments."
    ],
    "expertise": [],
    "awards": [],
    "otherInformation": []
  },
  {
    "id": "director-4",
    "slug": "ravi-kumar-reddy-somavarapu",
    "name": "Dr. Ravi Kumar Reddy Somavarapu",
    "designation": "Independent Director",
    "profileImage": ph3.url,
    "displayOrder": 4,
    "status": "published",
    "biography": [
      "Dr. Ravi Kumar Reddy Somavarapu, a Chartered Accountant with over 30 years of professional experience, is Managing Partner of RK Reddy & Associates, Hyderabad. He advises enterprises on financial planning, regulatory compliance, and business management, and serves as an Independent Director on several corporate boards.",
      "He brings to the board a unique blend of professional expertise and social commitment."
    ],
    "education": [],
    "professionalExperience": [],
    "expertise": [],
    "awards": [
      "Beyond his corporate role, Dr. Ravi has been actively engaged in rural empowerment for over two decades through REEDS, a non-profit organisation dedicated to improving quality of life in villages. His initiatives in sanitation, water conservation, and community development have earned national recognition, including the India Today Safaigiri Award – Water Warrior (2016) and the Gramodaya Bandhu Mitra Puraskar (2020). He was also conferred an Honorary Doctorate in 2015 by American Sentinel University (now part of Post University, USA) for his contributions to rural upliftment and skills development."
    ],
    "otherInformation": []
  },
  {
    "id": "director-5",
    "slug": "eshwar-reddy-purmandla",
    "name": "Mr. Eshwar Reddy Purmandla",
    "designation": "Independent Director",
    "profileImage": ph4.url,
    "displayOrder": 5,
    "status": "published",
    "biography": [],
    "education": [],
    "professionalExperience": [
      "Mr. Eshwar Reddy Purmandla holds, B.E (Hons), Chemical Engineering from Birla Institute of Technology & Science, Pilani, Rajasthan and M.Tech. (Process Plant Design) – IIT, Delhi, India, with 45 years of work experience. He has worked with Rashtriya Chemicals & Fertilizers Limited, which is the largest government owned company manufacturing Nitrogen and Nitro phosphorus based fertilizers and Industrial Chemicals in India. He worked for around 25 years in Voltas Limited and Rallis India Limited (both TATA group companies) producing agrochemicals, pharmaceuticals and fine chemicals. Handled assignments in Production, technical Services, new projects, product developments and environment protection and pollution control. Handled simultaneously multi-disciplinary teams and multiple projects at different locations."
    ],
    "expertise": [
      "His specialization in various aspects of the process industry, including fertilizers, pesticides, fine chemicals, and bulk drugs gives him a broad and impactful range of expertise. His focus on safety, health, and environment, as well as effluent and sewerage systems, is crucial for sustainable industrial practices."
    ],
    "awards": [],
    "otherInformation": []
  },
  {
    "id": "director-6",
    "slug": "malvieka-joshi",
    "name": "Ms. Malvieka Joshi",
    "designation": "Independent Director",
    "profileImage": ph5.url,
    "displayOrder": 6,
    "status": "published",
    "biography": [],
    "education": [
      "Ms. Malvieka Joshi is a seasoned Legal and Human Resources (HR) Professional with over 30 years of diverse experience across industries such as FMCG, Telecom, and Information Technology. She is a Fellow Company Secretary (FCS) from the Institute of Company Secretaries of India (ICSI), an Associate Certified Coach (ACC) from the International Coach Federation (ICF) and holds certifications from Cornell University. She is also a BA (Hons.) graduate from St. Xavier’s College."
    ],
    "professionalExperience": [
      "Over her three decade career, Ms. Joshi has held leadership roles with global organizations such as F5 Networks, Ciena India, Fibcom India, and Osram India (Siemens Group). At F5 Networks, she served as Vice President – Human Resources and played a pivotal role in setting up of state-of-the-art Engineering Centre in Hyderabad, scaling it from inception to a workforce of over 1,100 professionals. Under her leadership, F5 India was recognized among the Top 25 Companies in Asia and ranked among the Top 5 in India for millennials and women, also certified as a “Great Place to Work”.",
      "Earlier Ms. Joshi has joined Ciena India, as its first employee and was instrumental in building a team of more than 3,500 professionals, leading the organisation to bag multiple Workplace Excellence Awards. In the early phase of her career, she held key legal, secretarial, HR Leadership role including Company Secretary and HR Head at Fibcom India Limited, where she oversaw Statutory compliance, Board Governance, and Employee Relationship."
    ],
    "expertise": [
      "Ms. Joshi brings deep expertise in corporate governance, HR strategy, legal compliance, organizational development, and executive coaching. She has coached senior executives for over 500 hours as an ICF-certified coach and serves as an Independent Director on the Board of Disa India Limited (Norican Group)."
    ],
    "awards": [],
    "otherInformation": []
  },
  {
    "id": "director-7",
    "slug": "peddibhotla-gangadhara-sastry",
    "name": "Dr. Peddibhotla Gangadhara Sastry",
    "designation": "Independent Director",
    "profileImage": ph6.url,
    "displayOrder": 7,
    "status": "published",
    "biography": [],
    "education": [
      "Dr. P G Sastry holds a Bachelor’s Degree in Civil Engineering (Honours) and a Masters in Civil Engineering from the Indian Institute of Technology(IIT), Kharagpur as well as a Doctorate in Engineering from Technical University, Dresden, Germany and Post-Doctoral Research in Berlin and Hanover in Germany."
    ],
    "professionalExperience": [
      "Worked formerly as a Chairman in Ministry of Environment, Forests and Climate Change, Govt. of India, for Clearing Irrigation & Hydropower Projects in India. He was a Director, NIT, Warangal and Director General, Water and Land Management Training & Research Institute, Government of Andhra Pradesh. He is a Training Specialist, World Bank Hydrology Project, also a senior Expert, Netherlands-Funded Water Supply Project. He was Chief Advisor, Environment Protection Training & Research Institute and visiting Professor, Ohio State University, USA."
    ],
    "expertise": [],
    "awards": [
      "Dr. P G Sastry has received numerous prestigious International, National and State level awards throughout his illustrious career. He was awarded Germany’s esteemed Post-doctoral Humboldt Fellowship thrice in 1963, 1964, and 1970. He also received three best paper awards from the Institution of Engineers (IEI) in 1978, 1979, and 1980. In 1998, he was honoured with the Professional Expertise Award from Vishwabharathi Academy. The Chief Minister of Andhra Pradesh conferred upon him the title of “Paryavarana Praveena”. In 2005, he received the Bharat Ratna Sir M. Visveswaraya Special Award from IEI, followed by the Sir Arthur Cotton Award by Jandhyala Charitable Trust in 2006. He was also titled “Professor Par Excellence” by the Chief Minister of Andhra Pradesh. In 2007, he was awarded the “Padma Bhushan Dr. K. L. Rao Special Award” by the Government of Andhra Pradesh. Additionally, he received the “Paul Harris Fellow Award” from Rotary International Foundation in 2007, “the Engineering Educator Life Time Achievement Award” by ISTE, India in 2008, “the Rotary Vocational Excellence Award” in 2009, “the Award of Excellence in Technical Education” by Lions Club in 2013, “the Life Time Achievement Award” by the Indian Society for Hydraulics in 2015, and “the Engineering Seva Ratna Award” by the International Elders Club in 2021. In 2023, he was also honoured as the “Best Professor & Director in Environment Education” by the Ideal Teaching Awards Programme (ITAP)."
    ],
    "otherInformation": [
      "Dr. P G Sastry has made significant contributions to the establishment of Outcomes-Based Engineering Education (OBE). During his visiting professorship at Ohio State University, USA in 1998, he was involved in the preparations by the Accreditation Board for Engineering & Technology (ABET) for the introduction of OBE in US Engineering and Technology Institutions, which was implemented in 2000, Europe followed suit in 2010.",
      "In India, the National Board of Accreditation (NBA) introduced a paradigm shift in Engineering Education by transitioning to OBE in 2013. As one of the pioneers of OBE, Dr. Sastry played a crucial role in its establishment in Telangana, Andhra Pradesh, and other states. He trained 8,400 faculty members in 92 engineering colleges and polytechnics between 2010 and 2020, significantly impacting the quality of Engineering Education in India."
    ]
  }
];

export const publishedDirectors = () =>
  DIRECTORS.filter((d) => d.status === "published").sort((a, b) => a.displayOrder - b.displayOrder);

export const getDirector = (slug: string) => publishedDirectors().find((d) => d.slug === slug);
