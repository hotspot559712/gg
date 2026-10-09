import { User, Semester, Course, Lesson, Question, ExamAttempt, Department, DepartmentItem, EducationLevel, ChoiceKey } from '../types';

export const INITIAL_DEPARTMENTS: DepartmentItem[] = [
  {
    id: 'dept-bc',
    name: 'คอมพิวเตอร์ธุรกิจ',
    code: 'BC',
    description: 'หลักสูตรเทคโนโลยีสารสนเทศธุรกิจและการพัฒนาโปรแกรม',
    color: '#3b82f6',
    active: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'dept-ac',
    name: 'การบัญชี',
    code: 'AC',
    description: 'หลักสูตรการบัญชีการเงินและระบบภาษีอากร',
    color: '#10b981',
    active: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'dept-at',
    name: 'ช่างยนต์',
    code: 'AT',
    description: 'หลักสูตรเทคโนโลยียานยนต์และเครื่องกลการเกษตร',
    color: '#f59e0b',
    active: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'dept-mk',
    name: 'การตลาด',
    code: 'MK',
    description: 'หลักสูตรการตลาดดิจิทัลและการบริหารจัดการพาณิชย์',
    color: '#ec4899',
    active: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'dept-ep',
    name: 'ไฟฟ้ากำลัง',
    code: 'EP',
    description: 'หลักสูตรวิศวกรรมช่างไฟฟ้าและพลังงานทดแทน',
    color: '#8b5cf6',
    active: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'dept-it',
    name: 'เทคโนโลยีสารสนเทศ',
    code: 'IT',
    description: 'หลักสูตรระบบเครือข่ายและความมั่นคงปลอดภัยไซเบอร์',
    color: '#06b6d4',
    active: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'dept-om',
    name: 'การจัดการสำนักงาน',
    code: 'OM',
    description: 'หลักสูตรการบริหารสำนักงานดิจิทัลและงานเลขานุการ',
    color: '#64748b',
    active: true,
    createdAt: '2024-01-01'
  }
];

export const DEPARTMENTS: Department[] = INITIAL_DEPARTMENTS.map(d => d.name);

export const EDUCATION_LEVELS: EducationLevel[] = [
  'ปวช.1',
  'ปวช.2',
  'ปวช.3',
  'ปวส.1',
  'ปวส.2',
  'ทุกระดับ'
];

export const INITIAL_SEMESTERS: Semester[] = [
  {
    id: 'sem-2567-1',
    name: '1/2567',
    academicYear: '2567',
    term: '1',
    isOpen: true,
    startDate: '2024-05-15',
    endDate: '2024-10-15',
  },
  {
    id: 'sem-2567-2',
    name: '2/2567',
    academicYear: '2567',
    term: '2',
    isOpen: false,
    startDate: '2024-11-01',
    endDate: '2025-03-31',
  },
  {
    id: 'sem-2566-2',
    name: '2/2566',
    academicYear: '2566',
    term: '2',
    isOpen: false,
    startDate: '2023-11-01',
    endDate: '2024-03-31',
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    password: 'password123',
    name: 'นายอดิศร วิทยาการ (ผู้ดูแลระบบกลาง)',
    role: 'admin',
    department: 'ส่วนกลาง',
    level: 'ทุกระดับ',
    email: 'admin@vocational-elearning.ac.th',
    phone: '081-234-5678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-05-01'
  },
  {
    id: 'usr-t1',
    username: 'teacher1',
    password: 'password123',
    name: 'อ.สมชาย เก่งวิชาการ',
    role: 'teacher',
    department: 'คอมพิวเตอร์ธุรกิจ',
    level: 'ทุกระดับ',
    email: 'somchai@vocational-elearning.ac.th',
    phone: '089-111-2233',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-05-02'
  },
  {
    id: 'usr-t2',
    username: 'teacher2',
    password: 'password123',
    name: 'อ.วันเพ็ญ สุขสวัสดิ์',
    role: 'teacher',
    department: 'การบัญชี',
    level: 'ทุกระดับ',
    email: 'wanpen@vocational-elearning.ac.th',
    phone: '086-222-3344',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-05-02'
  },
  {
    id: 'usr-t3',
    username: 'teacher3',
    password: 'password123',
    name: 'อ.ประเสริฐ นวัตกรรมช่าง',
    role: 'teacher',
    department: 'ช่างยนต์',
    level: 'ทุกระดับ',
    email: 'prasert@vocational-elearning.ac.th',
    phone: '084-555-6677',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-05-02'
  },
  {
    id: 'usr-s1',
    username: 'std6701',
    password: 'password123',
    name: 'น.ส.นารี รัตนโชติ',
    role: 'student',
    studentCode: '6720401001',
    department: 'คอมพิวเตอร์ธุรกิจ',
    level: 'ปวช.2',
    email: 'naree@student.ac.th',
    phone: '095-123-4567',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-05-10'
  },
  {
    id: 'usr-s2',
    username: 'std6702',
    password: 'password123',
    name: 'นายสมศักดิ์ มุ่งมั่นพัฒนา',
    role: 'student',
    studentCode: '6730402005',
    department: 'คอมพิวเตอร์ธุรกิจ',
    level: 'ปวส.1',
    email: 'somsak@student.ac.th',
    phone: '092-987-6543',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-05-10'
  },
  {
    id: 'usr-s3',
    username: 'std6703',
    password: 'password123',
    name: 'น.ส.กัญญา บุญมีพาณิชย์',
    role: 'student',
    studentCode: '6720101012',
    department: 'การบัญชี',
    level: 'ปวช.1',
    email: 'kanya@student.ac.th',
    phone: '091-888-9999',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-05-10'
  },
  {
    id: 'usr-s4',
    username: 'std6704',
    password: 'password123',
    name: 'นายวิชัย เครื่องกลช่าง',
    role: 'student',
    studentCode: '6730101009',
    department: 'ช่างยนต์',
    level: 'ปวส.1',
    email: 'wichai@student.ac.th',
    phone: '093-444-5555',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-05-10'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-30204-2001',
    code: '30204-2001',
    title: 'การพัฒนาโปรแกรมบนเว็บและสื่อผสม',
    description: 'ศึกษาและปฏิบัติเกี่ยวกับการออกแบบ พัฒนาเว็บไซต์ โครงสร้างภาษา HTML, CSS, JavaScript, Framework และการเชื่อมต่อฐานข้อมูลสำหรับงานธุรกิจภาคสมทบ',
    department: 'คอมพิวเตอร์ธุรกิจ',
    level: 'ปวส.1',
    semesterId: 'sem-2567-1',
    teacherId: 'usr-t1',
    teacherName: 'อ.สมชาย เก่งวิชาการ',
    credit: 3,
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=80',
    active: true,
    passingScore: 20,
    totalQuestionsTarget: 40
  },
  {
    id: 'crs-20204-2002',
    code: '20204-2002',
    title: 'การใช้โปรแกรมประมวลผลคำและตารางคำนวณ',
    description: 'ศึกษาและปฏิบัติเกี่ยวกับการใช้โปรแกรม Microsoft Office, Google Workspace ในการจัดทำเอกสาร รายงาน บัญชีเบื้องต้น และการคำนวณสถิติธุรกิจ',
    department: 'คอมพิวเตอร์ธุรกิจ',
    level: 'ปวช.2',
    semesterId: 'sem-2567-1',
    teacherId: 'usr-t1',
    teacherName: 'อ.สมชาย เก่งวิชาการ',
    credit: 2,
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
    active: true,
    passingScore: 20,
    totalQuestionsTarget: 40
  },
  {
    id: 'crs-20201-1001',
    code: '20201-1001',
    title: 'การบัญชีเบื้องต้น 1',
    description: 'หลักการบัญชีเบื้องต้น สมการบัญชี การบันทึกรายการค้าในสมุดรายวันทั่วไป การผ่านรายการไปยังบัญชีแยกประเภท งบทดลอง และกระดาษทำการ',
    department: 'การบัญชี',
    level: 'ปวช.1',
    semesterId: 'sem-2567-1',
    teacherId: 'usr-t2',
    teacherName: 'อ.วันเพ็ญ สุขสวัสดิ์',
    credit: 3,
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    active: true,
    passingScore: 20,
    totalQuestionsTarget: 40
  },
  {
    id: 'crs-30101-2001',
    code: '30101-2001',
    title: 'เทคโนโลยีเครื่องยนต์ยานยนต์สมัยใหม่',
    description: 'ระบบควบคุมเครื่องยนต์ด้วยอิเล็กทรอนิกส์ ระบบฉีดเชื้อเพลิงคอมมอนเรล และยานยนต์ไฟฟ้าเบื้องต้น (EV)',
    department: 'ช่างยนต์',
    level: 'ปวส.1',
    semesterId: 'sem-2567-1',
    teacherId: 'usr-t3',
    teacherName: 'อ.ประเสริฐ นวัตกรรมช่าง',
    credit: 3,
    coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
    active: true,
    passingScore: 20,
    totalQuestionsTarget: 40
  },
  {
    id: 'crs-30204-2003',
    code: '30204-2003',
    title: 'ระบบฐานข้อมูลและการจัดการคลาวด์',
    description: 'การออกแบบฐานข้อมูลเชิงสัมพันธ์ SQL, NoSQL และการประยุกต์ใช้งานระบบคลาวด์ Google Cloud / Firebase ในธุรกิจดิจิทัล',
    department: 'คอมพิวเตอร์ธุรกิจ',
    level: 'ปวส.1',
    semesterId: 'sem-2567-1',
    teacherId: 'usr-t1',
    teacherName: 'อ.สมชาย เก่งวิชาการ',
    credit: 3,
    coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
    active: true,
    passingScore: 20,
    totalQuestionsTarget: 40
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'lsn-101',
    courseId: 'crs-30204-2001',
    order: 1,
    title: 'บทที่ 1: สถาปัตยกรรมเว็บแอปพลิเคชันและโปรโตคอล HTTP/HTTPS',
    description: 'ทำความเข้าใจหลักการทำงานของ Client-Server, Request-Response Cycle, RESTful API และความปลอดภัยบนเว็บ',
    content: `## บทที่ 1: สถาปัตยกรรมเว็บแอปพลิเคชัน
1. **Client-Server Architecture**: โมเดลการสื่อสารระหว่างเว็บเบราว์เซอร์ (Frontend) และเว็บเซิร์ฟเวอร์ (Backend)
2. **HTTP vs HTTPS**: โปรโตคอลการรับส่งข้อมูลและการเข้ารหัส SSL/TLS เพื่อความปลอดภัย
3. **โครงสร้างพื้นฐานของ HTML5 & CSS3**: Semantic Tags, Responsive Web Design และ Grid/Flexbox
4. **JavaScript Engine & DOM Manipulation**: การเขียนสคริปต์ควบคุมการทำงานหน้าเว็บ`,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
    driveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    attachments: [
      { id: 'att-1', title: 'เอกสารประกอบการสอน บทที่ 1 (PDF)', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf' },
      { id: 'att-2', title: 'ลิงก์สไลด์บรรยาย Google Slides', url: 'https://docs.google.com/presentation', type: 'link' }
    ],
    createdAt: '2024-05-18'
  },
  {
    id: 'lsn-102',
    courseId: 'crs-30204-2001',
    order: 2,
    title: 'บทที่ 2: การจัดการฐานข้อมูลและการเชื่อมต่อ Google Sheets API',
    description: 'การใช้ Google Sheets เป็นฐานข้อมูลแบบไร้ต้นทุน พร้อมสร้าง Web App ด้วย Google Apps Script',
    content: `## บทที่ 2: Google Sheets Database & Google Apps Script
1. **ประโยชน์ของ Google Sheets Database**: ใช้งานฟรี 100%, ใช้งานง่าย, สำรองข้อมูลอัตโนมัติบน Google Drive
2. **การเขียน Web App ด้วย Apps Script (doGet, doPost)**: การรับส่งข้อมูลผ่าน JSON Endpoint
3. **การประยุกต์ใช้งานในระบบ E-learning ภาคสมทบ**: การจัดเก็บข้อมูลผู้เรียน บทเรียน คลังข้อสอบ และคะแนนสอบ`,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
    driveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    attachments: [
      { id: 'att-3', title: 'คู่มือการเชื่อมต่อ Google Apps Script (PDF)', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf' }
    ],
    createdAt: '2024-05-25'
  },
  {
    id: 'lsn-103',
    courseId: 'crs-30204-2001',
    order: 3,
    title: 'บทที่ 3: การสร้างระบบบริหารจัดการและประเมินผลการเรียนออนไลน์',
    description: 'การจัดการสิทธิ์ผู้ใช้งาน (RBAC), การวัดและประเมินผลคลังข้อสอบ 40 ข้อ และการออกรายงาน',
    content: `## บทที่ 3: ระบบประเมินผลออนไลน์
- การแบ่งบทบาทผู้ใช้งาน: ผู้ดูแลระบบ (Admin), ครูผู้สอน (Teacher), นักเรียน (Student)
- เกณฑ์การผ่านการทดสอบตามมาตรฐานอาชีวศึกษา (50% ขึ้นไป หรือ 20 ข้อขึ้นไป)
- การทดสอบแบบไม่จำกัดรอบเพื่อส่งเสริมการเรียนรู้ตลอดชีวิต (Lifelong Learning)`,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
    attachments: [
      { id: 'att-4', title: 'เอกสารสรุปบทที่ 3 (PDF)', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf' }
    ],
    createdAt: '2024-06-01'
  },
  {
    id: 'lsn-201',
    courseId: 'crs-20204-2002',
    order: 1,
    title: 'บทที่ 1: การใช้ฟังก์ชันและการคำนวณขั้นสูงใน Google Sheets / Excel',
    description: 'ฟังก์ชัน SUM, AVERAGE, VLOOKUP, XLOOKUP, IF และ Pivot Table สำหรับงานธุรกิจ',
    content: `## บทที่ 1: ตารางคำนวณสำหรับธุรกิจ
- การใช้สูตรคำนวณพื้นฐานและการอ้างอิงเซลล์แบบสัมพัทธ์และสัมบูรณ์ ($A$1)
- ฟังก์ชันเงื่อนไข IF, SUMIF, COUNTIF
- การสร้าง Pivot Table สรุปข้อมูลยอดขาย`,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
    createdAt: '2024-05-20'
  },
  {
    id: 'lsn-301',
    courseId: 'crs-20201-1001',
    order: 1,
    title: 'บทที่ 1: สินทรัพย์ หนี้สิน และส่วนของเจ้าของ (สมการบัญชี)',
    description: 'สมการบัญชี สินทรัพย์ = หนี้สิน + ส่วนของเจ้าของ (A = L + OE) และผลกระทบของการเกิดรายการค้า',
    content: `## บทที่ 1: ความรู้เบื้องต้นเกี่ยวกับการบัญชี
- ความหมายและประโยชน์ของข้อมูลทางการบัญชี
- การจัดหมวดหมู่บัญชี 5 หมวด (สินทรัพย์, หนี้สิน, ทุน, รายได้, ค่าใช้จ่าย)
- กฎเดบิตและเครดิต`,
    pdfUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
    createdAt: '2024-05-19'
  }
];

// Helper to generate full 40 questions for web programming
function generateWebCourseQuestions(): Question[] {
  const qBank: Omit<Question, 'id' | 'courseId' | 'questionNumber'>[] = [
    {
      questionText: 'ข้อใดคือความหมายของโปรโตคอล HTTP ในการทำงานของระบบเครือข่ายอินเทอร์เน็ต?',
      optionA: 'โปรโตคอลสำหรับการโอนถ่ายไฟล์ขนาดใหญ่ระหว่างเครื่อง',
      optionB: 'โปรโตคอลสำหรับการสื่อสารและรับส่งข้อมูลเว็บเพจบนระบบเครือข่าย',
      optionC: 'โปรโตคอลสำหรับจัดการความปลอดภัยของฐานข้อมูล',
      optionD: 'ภาษาคอมพิวเตอร์ที่ใช้ในการเขียนโปรแกรมเว็บ',
      correctAnswer: 'B',
      explanation: 'HyperText Transfer Protocol คือโปรโตคอลหลักในการสื่อสารเพื่อเรียกดูเอกสารเว็บ'
    },
    {
      questionText: 'พอร์ตมาตรฐานที่ใช้สำหรับการรับส่งข้อมูล HTTPS คือพอร์ตหมายเลขใด?',
      optionA: '80',
      optionB: '21',
      optionC: '443',
      optionD: '8080',
      correctAnswer: 'C',
      explanation: 'HTTPS ใช้งานผ่านพอร์ต 443 ส่วน HTTP ปกติใช้พอร์ต 80'
    },
    {
      questionText: 'แท็ก HTML5 ใดที่ใช้สำหรับการสร้างหัวข้อหลักที่มีความสำคัญสูงสุดในหน้าเว็บ?',
      optionA: '<header>',
      optionB: '<h1>',
      optionC: '<title>',
      optionD: '<main>',
      correctAnswer: 'B',
      explanation: '<h1> แสดงระดับหัวข้อหลักที่มีความสำคัญสูงสุดทาง Semantic'
    },
    {
      questionText: 'ในภาษา CSS3 คำสั่งใดที่ใช้จัดกึ่งกลางเนื้อหาทั้งแนวนอนและแนวตั้งด้วย Flexbox ได้ถูกต้องที่สุด?',
      optionA: 'display: block; text-align: center;',
      optionB: 'display: flex; justify-content: center; align-items: center;',
      optionC: 'float: center; margin: auto;',
      optionD: 'position: fixed; center: true;',
      correctAnswer: 'B',
      explanation: 'justify-content จัดแกนหลัก และ align-items จัดแกนรอง'
    },
    {
      questionText: 'ในการพัฒนาเว็บด้วย Google Apps Script ฟังก์ชันใดใช้รองรับการร้องขอแบบ GET Request?',
      optionA: 'onGet(e)',
      optionB: 'doGet(e)',
      optionC: 'fetchData(e)',
      optionD: 'handleRequest(e)',
      correctAnswer: 'B',
      explanation: 'doGet(e) เป็นชื่อฟังก์ชันสงวนของ Google Apps Script Web App สำหรับรับ HTTP GET'
    },
    {
      questionText: 'ฟังก์ชันใดใน Google Apps Script ที่ใช้รับข้อมูลแบบ POST Request เมื่อมีการส่งฟอร์มหรือข้อสอบ?',
      optionA: 'doPost(e)',
      optionB: 'sendPost(e)',
      optionC: 'saveData(e)',
      optionD: 'onPostRequest(e)',
      correctAnswer: 'A',
      explanation: 'doPost(e) ใช้รับ HTTP POST'
    },
    {
      questionText: 'รูปแบบข้อมูลแบบใดที่นิยมใช้เป็นสื่อกลางในการแลกเปลี่ยนข้อมูลระหว่าง Frontend และ Backend API มากที่สุดในปัจจุบัน?',
      optionA: 'XML',
      optionB: 'JSON (JavaScript Object Notation)',
      optionC: 'CSV',
      optionD: 'TXT Binary',
      correctAnswer: 'B',
      explanation: 'JSON มีน้ำหนักเบาและแปลงเป็นออบเจกต์ในภาษาต่างๆ ได้ง่าย'
    },
    {
      questionText: 'ใน JavaScript การประกาศตัวแปรที่ไม่ต้องการให้เปลี่ยนค่าได้อีก (Immutable) ควรใช้คีย์เวิร์ดใด?',
      optionA: 'var',
      optionB: 'let',
      optionC: 'const',
      optionD: 'static',
      correctAnswer: 'C',
      explanation: 'const ใช้สำหรับประกาศตัวแปรค่าคงที่'
    },
    {
      questionText: 'เกณฑ์การผ่านการทดสอบมาตรฐานในระบบภาคสมทบสำหรับข้อสอบ 40 ข้อนี้คือเท่าใด?',
      optionA: '15 ข้อขึ้นไป',
      optionB: '20 ข้อขึ้นไป (50%)',
      optionC: '25 ข้อขึ้นไป',
      optionD: '30 ข้อขึ้นไป (75%)',
      correctAnswer: 'B',
      explanation: 'เกณฑ์มาตรฐานกำหนดผ่านที่ 20 ข้อขึ้นไปจาก 40 ข้อ'
    },
    {
      questionText: 'ข้อใดคือข้อดีของการใช้ Google Sheets ร่วมกับ Google Apps Script เป็นฐานข้อมูลสำหรับระบบการเรียนการสอน?',
      optionA: 'ไม่มีค่าใช้จ่ายค่าเช่าโฮสติ้งและฐานข้อมูล (100% Free)',
      optionB: 'สามารถดูและแก้ไขข้อมูลผ่านตาราง Google Sheets ได้โดยตรง',
      optionC: 'มีการสำรองข้อมูลอัตโนมัติบน Google Drive',
      optionD: 'ถูกต้องทุกข้อ',
      correctAnswer: 'D',
      explanation: 'Google Sheets ใช้งานฟรี จัดการง่าย และสำรองบนคลาวด์ของ Google'
    },
    {
      questionText: 'เครื่องมือใดในเบราว์เซอร์ที่นักพัฒนาใช้สำหรับตรวจสอบโค้ด ดู Network และตรวจหาข้อผิดพลาดของ JavaScript?',
      optionA: 'Google Translate',
      optionB: 'Developer Tools (F12 / Console)',
      optionC: 'Bookmarks Manager',
      optionD: 'History Tab',
      correctAnswer: 'B',
      explanation: 'Developer Tools มี Console, Network, Elements ฯลฯ'
    },
    {
      questionText: 'ในระบบจัดการสิทธิ์ผู้ใช้ (Role-based Access Control) ผู้ใช้บทบาท "ครูผู้สอน (Teacher)" มีสิทธิ์ทำสิ่งใด?',
      optionA: 'ลบระบบฐานข้อมูลหลักทั้งหมด',
      optionB: 'เพิ่มบทเรียน อัปโหลด PDF ขึ้น Google Drive จัดการคลังข้อสอบ และดูคะแนนนักเรียน',
      optionC: 'แก้ไขข้อมูลผู้ดูแลระบบ',
      optionD: 'ปิดเปิดภาคเรียนทั่วสถานศึกษา',
      correctAnswer: 'B',
      explanation: 'บทบาทครูเน้นจัดการการสอนและคลังข้อสอบประจำวิชา'
    },
    {
      questionText: 'ผู้ใช้บทบาท "นักเรียน (Student)" เมื่อเข้าสู่ระบบแล้วจะเห็นรายวิชาลักษณะใด?',
      optionA: 'เห็นทุกรายวิชาของทุกสาขาและทุกสถาบัน',
      optionB: 'กรองเห็นเฉพาะวิชาในสาขาและระดับชั้น (ปวช./ปวส.) ของตนเอง',
      optionC: 'ไม่สามารถดูวิชาใดๆ ได้จนกว่าครูจะอนุญาตเป็นรายชั่วโมง',
      optionD: 'เห็นเฉพาะรายวิชาที่สอบผ่านแล้วเท่านั้น',
      correctAnswer: 'B',
      explanation: 'ระบบจะกรองวิชาให้ตรงตามสาขาวิชาและระดับชั้นของผู้เรียนอัตโนมัติ'
    },
    {
      questionText: 'ฟังก์ชัน JSON.parse() ในภาษา JavaScript มีหน้าที่การทำงานอย่างไร?',
      optionA: 'แปลง JavaScript Object ให้กลายเป็นข้อความสตริง JSON',
      optionB: 'แปลงข้อความสตริง JSON ให้กลับมาเป็น JavaScript Object',
      optionC: 'ลบข้อมูล JSON ออกจากหน่วยความจำ',
      optionD: 'ตรวจสอบไวยากรณ์ของโค้ด HTML',
      correctAnswer: 'B',
      explanation: 'JSON.parse แปลง JSON String เป็น Object'
    },
    {
      questionText: 'ฟังก์ชัน JSON.stringify() ในภาษา JavaScript มีหน้าที่อย่างไร?',
      optionA: 'แปลง JavaScript Object ให้เป็นข้อความ JSON String สำหรับส่งผ่านเครือข่าย',
      optionB: 'แปลง JSON เป็นไฟล์รูปภาพ',
      optionC: 'ดึงข้อมูลจากฐานข้อมูล',
      optionD: 'แปลงสตริงเป็นตัวเลข',
      correctAnswer: 'A',
      explanation: 'JSON.stringify แปลง Object ให้เป็น String'
    },
    {
      questionText: 'คำว่า Responsive Web Design หมายถึงอะไร?',
      optionA: 'การออกแบบเว็บไซต์ที่ตอบสนองต่อผู้ใช้งานด้วยเสียงพูด',
      optionB: 'การออกแบบเว็บไซต์ที่สามารถปรับเปลี่ยนการแสดงผลให้เหมาะสมกับทุกขนาดหน้าจอ (มือถือ, แท็บเล็ต, คอมพิวเตอร์)',
      optionC: 'การสร้างเว็บไซต์ที่มีความเร็วในการดาวน์โหลดสูงที่สุดเท่านั้น',
      optionD: 'การออกแบบหน้าเว็บที่ไม่ใช้รูปภาพประกอบเลย',
      correctAnswer: 'B',
      explanation: 'Responsive Design รองรับทุกขนาดอุปกรณ์'
    },
    {
      questionText: 'คลาส utility ของ Tailwind CSS คำใดที่ใช้กำหนดให้มีความโค้งมนของมุมกล่อง?',
      optionA: 'circle-box',
      optionB: 'rounded-lg / rounded-xl',
      optionC: 'corner-smooth',
      optionD: 'curve-all',
      correctAnswer: 'B',
      explanation: 'rounded-lg / rounded-xl ใน Tailwind ใช้กำหนด border-radius'
    },
    {
      questionText: 'ในการเขียน JavaScript แบบ Asynchronous คำสั่งคู่ใดที่นิยมใช้จัดการ Promise เพื่อให้อ่านเข้าใจง่าย?',
      optionA: 'try - catch',
      optionB: 'async - await',
      optionC: 'while - do',
      optionD: 'import - export',
      correctAnswer: 'B',
      explanation: 'async/await ทำให้โค้ดอะซิงโครนัสเขียนได้เหมือนซิงโครนัส'
    },
    {
      questionText: 'เมื่อนักเรียนส่งข้อสอบเสร็จสิ้น ระบบห้องสอบออนไลน์นี้จะแสดงผลอย่างไร?',
      optionA: 'แสดงเฉลยคำตอบที่ถูกต้องทุกข้อทันที',
      optionB: 'แสดงคะแนนและสถานะผ่าน/ไม่ผ่านทันที แต่ไม่แสดงเฉลยข้อสอบ เพื่อรักษามาตรฐานคลังข้อสอบ',
      optionC: 'ไม่แสดงผลคะแนนจนกว่าจะสิ้นสุดภาคเรียน',
      optionD: 'ระบบจะตัดสิทธิ์และล็อกบัญชีผู้ใช้ทันที',
      correctAnswer: 'B',
      explanation: 'ตามข้อกำหนด: ผลคะแนนปรากฏ แจ้งสถานะผ่าน/ไม่ผ่านทันที แต่ไม่แสดงเฉลยคำตอบ'
    },
    {
      questionText: 'หากนักเรียนทำข้อสอบแล้วได้คะแนนไม่ผ่านเกณฑ์ (น้อยกว่า 20 คะแนน) สามารถดำเนินการอย่างไรได้บ้าง?',
      optionA: 'ต้องรอเปิดภาคเรียนใหม่เท่านั้น',
      optionB: 'สามารถทบทวนบทเรียนและเข้าทำข้อสอบใหม่ได้ไม่จำกัดรอบ',
      optionC: 'ต้องชำระค่าธรรมเนียมสอบซ่อม',
      optionD: 'ไม่สามารถสอบวิชานี้ได้อีก',
      correctAnswer: 'B',
      explanation: 'ระบบอนุญาตให้สอบได้ไม่จำกัดรอบเพื่อส่งเสริมการเรียนรู้'
    },
    {
      questionText: 'ในการแชร์เอกสารบทเรียน PDF จาก Google Drive มายังระบบ ควรตั้งค่าการเข้าถึงไฟล์อย่างไร?',
      optionA: 'จำกัดสิทธิ์เฉพาะเจ้าของไฟล์เท่านั้น (Restricted)',
      optionB: 'ทุกคนที่มีลิงก์สามารถดูได้ (Anyone with the link can view)',
      optionC: 'ทุกคนที่มีลิงก์สามารถแก้ไขได้ (Editor)',
      optionD: 'ลบไฟล์ทิ้งหลังอัปโหลด',
      correctAnswer: 'B',
      explanation: 'ตั้งค่า Anyone with link can view เพื่อให้นักเรียนเปิดอ่านเอกสารได้'
    },
    {
      questionText: 'การเก็บข้อมูลประวัติการสอบของนักเรียนลงในตาราง ExamResults ของ Google Sheets มีประโยชน์อย่างไร?',
      optionA: 'ครูและแอดมินสามารถดูพัฒนาการและคะแนนของนักเรียนแต่ละรอบได้',
      optionB: 'นำข้อมูลไปสรุปรายงานสถิติร้อยละการสอบผ่านประจำภาคเรียนได้',
      optionC: 'เป็นหลักฐานการวัดผลสำหรับหลักสูตรภาคสมทบ',
      optionD: 'ถูกต้องทุกข้อ',
      correctAnswer: 'D',
      explanation: 'ช่วยให้ครูและผู้บริหารติดตามสถิติและหลักฐานการเรียนได้ครบถ้วน'
    },
    {
      questionText: 'แท็ก <iframe> ในภาษา HTML มีหน้าที่หลักในการทำอะไร?',
      optionA: 'แสดงรูปภาพกราฟิกแบบเวกเตอร์',
      optionB: 'ฝังเอกสาร หน้าเว็บ หรือตัวแสดงไฟล์ PDF ให้อยู่ภายในหน้าเว็บปัจจุบัน',
      optionC: 'สร้างแบบฟอร์มกรอกข้อสอบ',
      optionD: 'เชื่อมต่อกับไมโครโฟนของผู้ใช้',
      correctAnswer: 'B',
      explanation: 'iframe ใช้ฝังเอกสารภายนอกหรือ PDF Viewer เข้าในหน้าเว็บ'
    },
    {
      questionText: 'Local Storage ในเบราว์เซอร์มีความแตกต่างจาก Session Storage อย่างไร?',
      optionA: 'Local Storage จะคงอยู่ตลอดไปแม้จะปิดเบราว์เซอร์แล้ว แต่ Session Storage จะหายไปเมื่อปิดแท็บ',
      optionB: 'Local Storage เก็บข้อมูลได้น้อยกว่า',
      optionC: 'Local Storage ต้องเชื่อมต่ออินเทอร์เน็ตตลอดเวลา',
      optionD: 'ไม่มีความแตกต่างกัน',
      correctAnswer: 'A',
      explanation: 'Local Storage มีอายุคงทนข้ามเซสชัน'
    },
    {
      questionText: 'ข้อใดคือหน้าที่หลักของ ผู้ดูแลระบบ (Admin) ในระบบการเรียนการสอนภาคสมทบ?',
      optionA: 'จัดการข้อมูลผู้ใช้, เปิด/ปิดภาคเรียน, จัดการสาขาวิชา, ระดับชั้น ปวช./ปวส., และดูรายงานสรุปผล',
      optionB: 'เข้าทำข้อสอบแทนนักเรียนทุกคน',
      optionC: 'ซ่อมแซมสายสัญญาณอินเทอร์เน็ตประจำห้องเรียน',
      optionD: 'พิมพ์ข้อสอบลงกระดาษเท่านั้น',
      correctAnswer: 'A',
      explanation: 'แอดมินดูแลภาพรวมโครงสร้างระบบ ผู้ใช้งาน ภาคเรียน และรายงานสรุป'
    },
    {
      questionText: 'รหัสสถานะ HTTP 200 หมายถึงอะไร?',
      optionA: 'Not Found (ไม่พบหน้าเว็บ)',
      optionB: 'OK (การร้องขอและการตอบกลับสำเร็จสมบูรณ์)',
      optionC: 'Internal Server Error (เซิร์ฟเวอร์เกิดข้อผิดพลาด)',
      optionD: 'Forbidden (ไม่มีสิทธิ์เข้าถึง)',
      correctAnswer: 'B',
      explanation: 'HTTP 200 OK แสดงสถานะสำเร็จ'
    },
    {
      questionText: 'รหัสสถานะ HTTP 404 หมายถึงอะไร?',
      optionA: 'Bad Request',
      optionB: 'Unauthorized',
      optionC: 'Not Found (ไม่พบข้อมูลหรือหน้านั้นบนเซิร์ฟเวอร์)',
      optionD: 'Success',
      correctAnswer: 'C',
      explanation: '404 คือ Not Found'
    },
    {
      questionText: 'ฟังก์ชัน fetch() ใน JavaScript ใช้สำหรับอะไรเป็นหลัก?',
      optionA: 'สร้างกราฟและภาพเคลื่อนไหว',
      optionB: 'ส่งคำขอ HTTP Request ไปยังเซิร์ฟเวอร์เพื่อดึงหรือบันทึกข้อมูลแบบ Asynchronous',
      optionC: 'ปิดหน้าต่างเบราว์เซอร์',
      optionD: 'คำนวณสูตรคณิตศาสตร์',
      correctAnswer: 'B',
      explanation: 'fetch API ใช้สำหรับส่ง HTTP Request'
    },
    {
      questionText: 'ข้อดีของการมี "แถบนำทางข้อสอบ (Question Navigation 1-40)" ในระบบห้องสอบออนไลน์คืออะไร?',
      optionA: 'ช่วยให้นักเรียนมองเห็นภาพรวมของข้อที่ตอบแล้ว และข้อที่ยังไม่ได้ทำได้อย่างชัดเจน',
      optionB: 'สามารถกดกระโดดข้ามไปยังข้อที่ต้องการทบทวนได้ทันทีอย่างสะดวกรวดเร็ว',
      optionC: 'ลดโอกาสในการส่งข้อสอบโดยลืมทำบางข้อ',
      optionD: 'ถูกต้องทุกข้อ',
      correctAnswer: 'D',
      explanation: 'แถบ 1-40 เพิ่มความสะดวกและป้องกันการลืมตอบข้อสอบ'
    },
    {
      questionText: 'เหตุใดระบบข้อสอบนี้จึง "ไม่มีตัวจับเวลา"?',
      optionA: 'เพราะผู้พัฒนาระบบลืมเขียนโค้ด',
      optionB: 'เพื่อให้นักเรียนภาคสมทบที่มีภาระงานประจำสามารถศึกษาและคิดวิเคราะห์ได้อย่างเต็มที่และยืดหยุ่น',
      optionC: 'เพราะเทคโนโลยีเว็บไม่สามารถจับเวลาได้',
      optionD: 'เพื่อให้สอบได้พร้อมกันทั้งประเทศเท่านั้น',
      correctAnswer: 'B',
      explanation: 'สอดคล้องกับธรรมชาติของผู้เรียนภาคสมทบที่เน้นการเรียนรู้ตามอัธยาศัยและยืดหยุ่น'
    },
    {
      questionText: 'ในภาษา HTML ตัวเลือกข้อสอบที่เลือกได้เพียงตัวเลือกเดียวในกลุ่มคำถามเดียวกัน ควรใช้อินพุตประเภทใด?',
      optionA: '<input type="checkbox">',
      optionB: '<input type="radio">',
      optionC: '<input type="text">',
      optionD: '<input type="button">',
      correctAnswer: 'B',
      explanation: 'radio button บังคับให้เลือกได้ 1 ตัวเลือกต่อ 1 คำถาม'
    },
    {
      questionText: 'คำสั่ง Array.prototype.filter() ใน JavaScript ใช้ทำอะไร?',
      optionA: 'คัดกรองสมาชิกในอาร์เรย์ตามเงื่อนไขที่กำหนดและคืนค่าเป็นอาร์เรย์ใหม่',
      optionB: 'เรียงลำดับข้อมูลจากมากไปน้อย',
      optionC: 'รวมผลบวกตัวเลขในอาร์เรย์',
      optionD: 'ลบอาร์เรย์ทั้งหมด',
      correctAnswer: 'A',
      explanation: 'filter() คัดกรองไอเทมตามเงื่อนไขที่กำหนด'
    },
    {
      questionText: 'คำสั่ง Array.prototype.map() ใน JavaScript ใช้ทำอะไร?',
      optionA: 'สร้างอาร์เรย์ใหม่ที่แปลงค่าของแต่ละสมาชิกในอาร์เรย์เดิมตามฟังก์ชันที่ระบุ',
      optionB: 'ค้นหาพิกัดแผนที่บน Google Maps',
      optionC: 'สลับตำแหน่งข้อมูลแบบสุ่ม',
      optionD: 'ลบค่าที่ซ้ำกันออก',
      correctAnswer: 'A',
      explanation: 'map() แปลงข้อมูลในแต่ละองค์ประกอบ'
    },
    {
      questionText: 'ระดับชั้น "ปวช." และ "ปวส." ย่อมาจากคำเต็มว่าอะไรตามลำดับ?',
      optionA: 'ประกาศนียบัตรวิชาชีพ และ ประกาศนียบัตรวิชาชีพชั้นสูง',
      optionB: 'ประถมศึกษาตอนปลาย และ มัธยมศึกษาตอนปลาย',
      optionC: 'ปริญญาตรีวิชาการ และ ปริญญาโทวิชาชีพ',
      optionD: 'ประกาศนียบัตรวิชาชีพช่าง และ ปวช. ระดับสูง',
      correctAnswer: 'A',
      explanation: 'ปวช. คือ ประกาศนียบัตรวิชาชีพ และ ปวส. คือ ประกาศนียบัตรวิชาชีพชั้นสูง'
    },
    {
      questionText: 'เมื่อต้องการส่งออกรายงานผลการสอบของนักเรียนเพื่อนำไปเปิดในโปรแกรม Excel ควรส่งออกในรูปแบบไฟล์ใด?',
      optionA: 'ไฟล์ .EXE',
      optionB: 'ไฟล์ .CSV หรือ .XLSX',
      optionC: 'ไฟล์ .MP4',
      optionD: 'ไฟล์ .PNG',
      correctAnswer: 'B',
      explanation: 'CSV / Excel เป็นมาตรฐานการนำเข้าส่งออกตารางคะแนน'
    },
    {
      questionText: 'ข้อใดคือประโยชน์ของการจัดทำคลังข้อสอบ 40 ข้อในระบบ E-learning?',
      optionA: 'ครอบคลุมจุดประสงค์การเรียนรู้ตลอดทั้งรายวิชา',
      optionB: 'สร้างมาตรฐานการวัดผลสัมฤทธิ์ทางการเรียนที่มีความน่าเชื่อถือ',
      optionC: 'ทำให้ครูผู้สอนสามารถปรับปรุงข้อสอบได้อย่างเป็นระบบ',
      optionD: 'ถูกต้องทุกข้อ',
      correctAnswer: 'D',
      explanation: 'คลัง 40 ข้อครอบคลุมทุกหน่วยการเรียนรู้และวัดผลได้อย่างมีคุณภาพ'
    },
    {
      questionText: 'ในระบบ Google Apps Script บริการ (Service) ใดที่ใช้เข้าถึงและเขียนข้อมูลลงในตารางชีต?',
      optionA: 'DocumentApp',
      optionB: 'SpreadsheetApp',
      optionC: 'GmailApp',
      optionD: 'DriveApp',
      correctAnswer: 'B',
      explanation: 'SpreadsheetApp คือคลาสหลักสำหรับควบคุม Google Sheets'
    },
    {
      questionText: 'ในระบบ Google Apps Script บริการใดที่ใช้สำหรับสร้างหรือจัดการไฟล์บน Google Drive?',
      optionA: 'SpreadsheetApp',
      optionB: 'DriveApp',
      optionC: 'UrlFetchApp',
      optionD: 'CalendarApp',
      correctAnswer: 'B',
      explanation: 'DriveApp ใช้จัดการไฟล์และโฟลเดอร์บน Google Drive'
    },
    {
      questionText: 'การทำให้ Web App บน Google Apps Script ให้นักเรียนทุกคนสามารถเชื่อมต่อเพื่อดึงข้อสอบได้ จะต้องตั้งค่า "Who has access" อย่างไร?',
      optionA: 'Only myself (เฉพาะฉัน)',
      optionB: 'Anyone (ทุกคน)',
      optionC: 'Google Workspace Users Only',
      optionD: 'Disabled',
      correctAnswer: 'B',
      explanation: 'ต้องตั้งค่า Anyone เพื่อให้ Web App ตอบสนอง API ข้ามโดเมนได้ถูกต้อง'
    },
    {
      questionText: 'ข้อใดสรุปจุดประสงค์หลักของระบบการเรียนการสอนภาคสมทบ E-learning ได้ถูกต้องและสมบูรณ์ที่สุด?',
      optionA: 'เปิดโอกาสให้นักศึกษาภาคสมทบสามารถเรียนรู้บทเรียนและประเมินผลตนเองได้ทุกที่ทุกเวลา',
      optionB: 'ช่วยให้ครูและผู้บริหารมีเครื่องมือจัดการหลักสูตรและติดตามผลคะแนนแบบเรียลไทม์',
      optionC: 'ลดต้นทุนการจัดหาระบบเซิร์ฟเวอร์ด้วยการใช้ Google Sheets เป็นฐานข้อมูลฟรี 100%',
      optionD: 'ถูกต้องทุกข้อที่กล่าวมา',
      correctAnswer: 'D',
      explanation: 'ระบบ E-learning ภาคสมทบมุ่งเน้นความยืดหยุ่น ประสิทธิภาพ และความคุ้มค่า'
    }
  ];

  return qBank.map((q, idx) => ({
    id: `q-30204-${idx + 1}`,
    courseId: 'crs-30204-2001',
    questionNumber: idx + 1,
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation
  }));
}

// Generate 40 questions for Course 20204-2002
function generateOfficeCourseQuestions(): Question[] {
  const list: Question[] = [];
  for (let i = 1; i <= 40; i++) {
    list.push({
      id: `q-20204-${i}`,
      courseId: 'crs-20204-2002',
      questionNumber: i,
      questionText: `คำถามข้อที่ ${i}: เกี่ยวกับการใช้โปรแกรมประมวลผลคำและตารางคำนวณในงานธุรกิจ (หัวข้อที่ ${Math.ceil(i / 8)})`,
      optionA: `ตัวเลือก ก: การใช้คำสั่งและเครื่องมือจัดรูปแบบเอกสารแบบที่ ${i}`,
      optionB: `ตัวเลือก ข: การประยุกต์ใช้ฟังก์ชันคำนวณและสูตรทางสถิติมาตรฐาน`,
      optionC: `ตัวเลือก ค: การพิมพ์รายงานและส่งออกเป็นไฟล์ PDF`,
      optionD: `ตัวเลือก ง: การแชร์ไฟล์งานบนคลาวด์เพื่อทำงานร่วมกัน`,
      correctAnswer: (['A', 'B', 'C', 'D'][i % 4]) as ChoiceKey,
      explanation: `คำอธิบายประกอบการเรียนรู้ข้อที่ ${i}`
    });
  }
  return list;
}

// Generate 40 questions for Accounting
function generateAccountingCourseQuestions(): Question[] {
  const list: Question[] = [];
  for (let i = 1; i <= 40; i++) {
    list.push({
      id: `q-20201-${i}`,
      courseId: 'crs-20201-1001',
      questionNumber: i,
      questionText: `คำถามข้อที่ ${i}: หลักการบัญชีเบื้องต้น 1 - หมวดการวิเคราะห์รายการค้าและสมการบัญชี (ข้อที่ ${i})`,
      optionA: `ตัวเลือก ก: สินทรัพย์ (Assets) เพิ่มขึ้นและหนี้สิน (Liabilities) ลดลง`,
      optionB: `ตัวเลือก ข: ส่วนของเจ้าของ (Owner's Equity) เพิ่มขึ้นตามผลกำไร`,
      optionC: `ตัวเลือก ค: การบันทึกรายการในสมุดรายวันทั่วไปด้านเดบิตและเครดิต`,
      optionD: `ตัวเลือก ง: การจัดทำงบทดลองและกระดาษทำการปิดบัญชี`,
      correctAnswer: (['B', 'A', 'C', 'D'][(i + 1) % 4]) as ChoiceKey,
      explanation: `คำอธิบายหลักการบัญชีข้อที่ ${i}`
    });
  }
  return list;
}

// Generate 40 questions for Auto Mechanics
function generateAutoCourseQuestions(): Question[] {
  const list: Question[] = [];
  for (let i = 1; i <= 40; i++) {
    list.push({
      id: `q-30101-${i}`,
      courseId: 'crs-30101-2001',
      questionNumber: i,
      questionText: `คำถามข้อที่ ${i}: เทคโนโลยีเครื่องยนต์ยานยนต์สมัยใหม่และระบบไฟฟ้ายานยนต์ (ข้อที่ ${i})`,
      optionA: `ตัวเลือก ก: การทำงานของระบบหัวฉีดคอมมอนเรลแรงดันสูง`,
      optionB: `ตัวเลือก ข: การควบคุมมอเตอร์ไฟฟ้ากระแสสลับในรถยนต์ Hybrid/EV`,
      optionC: `ตัวเลือก ค: เซนเซอร์ตรวจวัดไอเสียและกล่องควบคุม ECU`,
      optionD: `ตัวเลือก ง: มาตรฐานการตรวจสอบและบำรุงรักษาตามระยะเวลา`,
      correctAnswer: (['C', 'D', 'A', 'B'][(i + 2) % 4]) as ChoiceKey,
      explanation: `คำอธิบายช่างยนต์ข้อที่ ${i}`
    });
  }
  return list;
}

export const INITIAL_QUESTIONS: Question[] = [
  ...generateWebCourseQuestions(),
  ...generateOfficeCourseQuestions(),
  ...generateAccountingCourseQuestions(),
  ...generateAutoCourseQuestions()
];

export const INITIAL_EXAM_ATTEMPTS: ExamAttempt[] = [
  {
    id: 'att-001',
    studentId: 'usr-s2',
    studentName: 'นายสมศักดิ์ มุ่งมั่นพัฒนา',
    studentCode: '6730402005',
    courseId: 'crs-30204-2001',
    courseCode: '30204-2001',
    courseTitle: 'การพัฒนาโปรแกรมบนเว็บและสื่อผสม',
    department: 'คอมพิวเตอร์ธุรกิจ',
    level: 'ปวส.1',
    attemptNumber: 1,
    score: 18,
    totalQuestions: 40,
    passingScore: 20,
    passed: false,
    answers: {},
    startedAt: '2024-06-05 14:00:00',
    submittedAt: '2024-06-05 14:42:15'
  },
  {
    id: 'att-002',
    studentId: 'usr-s2',
    studentName: 'นายสมศักดิ์ มุ่งมั่นพัฒนา',
    studentCode: '6730402005',
    courseId: 'crs-30204-2001',
    courseCode: '30204-2001',
    courseTitle: 'การพัฒนาโปรแกรมบนเว็บและสื่อผสม',
    department: 'คอมพิวเตอร์ธุรกิจ',
    level: 'ปวส.1',
    attemptNumber: 2,
    score: 34,
    totalQuestions: 40,
    passingScore: 20,
    passed: true,
    answers: {},
    startedAt: '2024-06-08 19:15:00',
    submittedAt: '2024-06-08 19:50:30'
  },
  {
    id: 'att-003',
    studentId: 'usr-s1',
    studentName: 'น.ส.นารี รัตนโชติ',
    studentCode: '6720401001',
    courseId: 'crs-20204-2002',
    courseCode: '20204-2002',
    courseTitle: 'การใช้โปรแกรมประมวลผลคำและตารางคำนวณ',
    department: 'คอมพิวเตอร์ธุรกิจ',
    level: 'ปวช.2',
    attemptNumber: 1,
    score: 29,
    totalQuestions: 40,
    passingScore: 20,
    passed: true,
    answers: {},
    startedAt: '2024-06-10 10:20:00',
    submittedAt: '2024-06-10 11:00:00'
  },
  {
    id: 'att-004',
    studentId: 'usr-s3',
    studentName: 'น.ส.กัญญา บุญมีพาณิชย์',
    studentCode: '6720101012',
    courseId: 'crs-20201-1001',
    courseCode: '20201-1001',
    courseTitle: 'การบัญชีเบื้องต้น 1',
    department: 'การบัญชี',
    level: 'ปวช.1',
    attemptNumber: 1,
    score: 36,
    totalQuestions: 40,
    passingScore: 20,
    passed: true,
    answers: {},
    startedAt: '2024-06-12 16:30:00',
    submittedAt: '2024-06-12 17:10:00'
  },
  {
    id: 'att-005',
    studentId: 'usr-s4',
    studentName: 'นายวิชัย เครื่องกลช่าง',
    studentCode: '6730101009',
    courseId: 'crs-30101-2001',
    courseCode: '30101-2001',
    courseTitle: 'เทคโนโลยีเครื่องยนต์ยานยนต์สมัยใหม่',
    department: 'ช่างยนต์',
    level: 'ปวส.1',
    attemptNumber: 1,
    score: 22,
    totalQuestions: 40,
    passingScore: 20,
    passed: true,
    answers: {},
    startedAt: '2024-06-15 13:00:00',
    submittedAt: '2024-06-15 13:45:00'
  }
];
