import * as XLSX from 'xlsx';
import { User, EducationLevel, Department, Question, ChoiceKey } from '../types';
import { DEPARTMENTS, EDUCATION_LEVELS } from '../data/initialData';

export interface ParsedStudentRow {
  studentCode: string;
  name: string;
  username: string;
  password?: string;
  level: EducationLevel;
  department: Department;
  phone?: string;
  email?: string;
  isValid: boolean;
  errors: string[];
  isExisting?: boolean;
}

/**
 * Clean and normalize text
 */
const cleanStr = (val: any): string => {
  if (val === undefined || val === null) return '';
  return String(val).trim();
};

/**
 * Match department against known departments
 */
const normalizeDepartment = (dept: string): Department => {
  const clean = cleanStr(dept);
  if (!clean) return 'คอมพิวเตอร์ธุรกิจ';
  const found = DEPARTMENTS.find(d => d.toLowerCase() === clean.toLowerCase() || clean.includes(d) || d.includes(clean));
  return found || 'คอมพิวเตอร์ธุรกิจ';
};

/**
 * Match level against known levels
 */
const normalizeLevel = (lvl: string): EducationLevel => {
  const clean = cleanStr(lvl);
  if (!clean) return 'ปวส.1';
  const found = EDUCATION_LEVELS.find(l => l.toLowerCase() === clean.toLowerCase() || clean.includes(l));
  return found || 'ปวส.1';
};

/**
 * Export student list to Excel (.xlsx) file
 */
export const exportStudentsToExcel = (students: User[], filename = 'รายชื่อนักศึกษา_ภาคสมทบ.xlsx') => {
  const data = students.map((student, index) => ({
    'ลำดับ': index + 1,
    'รหัสนักศึกษา': student.studentCode || '',
    'ชื่อ-นามสกุล': student.name || '',
    'ชื่อผู้ใช้ (Username)': student.username || '',
    'รหัสผ่าน (Password)': student.password || '1234',
    'ระดับชั้น': student.level || 'ปวส.1',
    'สาขาวิชา': student.department || 'คอมพิวเตอร์ธุรกิจ',
    'เบอร์โทรศัพท์': student.phone || '',
    'อีเมล': student.email || '',
    'วันที่สร้าง': student.createdAt || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // ลำดับ
    { wch: 16 }, // รหัสนักศึกษา
    { wch: 26 }, // ชื่อ-นามสกุล
    { wch: 20 }, // ชื่อผู้ใช้
    { wch: 18 }, // รหัสผ่าน
    { wch: 12 }, // ระดับชั้น
    { wch: 22 }, // สาขาวิชา
    { wch: 16 }, // เบอร์โทรศัพท์
    { wch: 26 }, // อีเมล
    { wch: 14 }, // วันที่สร้าง
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'รายชื่อนักศึกษา');

  XLSX.writeFile(workbook, filename);
};

/**
 * Export student list to CSV with UTF-8 BOM for Thai support in Microsoft Excel
 */
export const exportStudentsToCSV = (students: User[], filename = 'รายชื่อนักศึกษา_ภาคสมทบ.csv') => {
  const headers = ['ลำดับ', 'รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'ชื่อผู้ใช้ (Username)', 'รหัสผ่าน', 'ระดับชั้น', 'สาขาวิชา', 'เบอร์โทรศัพท์', 'อีเมล'];
  const rows = students.map((s, i) => [
    i + 1,
    `"${(s.studentCode || '').replace(/"/g, '""')}"`,
    `"${(s.name || '').replace(/"/g, '""')}"`,
    `"${(s.username || '').replace(/"/g, '""')}"`,
    `"${(s.password || '1234').replace(/"/g, '""')}"`,
    `"${(s.level || 'ปวส.1').replace(/"/g, '""')}"`,
    `"${(s.department || 'คอมพิวเตอร์ธุรกิจ').replace(/"/g, '""')}"`,
    `"${(s.phone || '').replace(/"/g, '""')}"`,
    `"${(s.email || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate and download a sample Excel template (.xlsx) for bulk importing students
 */
export const downloadStudentExcelTemplate = () => {
  const sampleData = [
    {
      'รหัสนักศึกษา': '6730402001',
      'ชื่อ-นามสกุล': 'นายณัฐวุฒิ สมใจ',
      'ชื่อผู้ใช้ (Username)': 'std6701',
      'รหัสผ่าน (Password)': '1234',
      'ระดับชั้น': 'ปวส.1',
      'สาขาวิชา': 'คอมพิวเตอร์ธุรกิจ',
      'เบอร์โทรศัพท์': '0812345678',
      'อีเมล': 'nuttawut@example.ac.th'
    },
    {
      'รหัสนักศึกษา': '6730402002',
      'ชื่อ-นามสกุล': 'นางสาวกานดา รุ่งเรือง',
      'ชื่อผู้ใช้ (Username)': 'std6702',
      'รหัสผ่าน (Password)': '1234',
      'ระดับชั้น': 'ปวส.1',
      'สาขาวิชา': 'การบัญชี',
      'เบอร์โทรศัพท์': '0898765432',
      'อีเมล': 'kanda@example.ac.th'
    },
    {
      'รหัสนักศึกษา': '6720101003',
      'ชื่อ-นามสกุล': 'นายธีรภัทร ชัยชนะ',
      'ชื่อผู้ใช้ (Username)': 'std6703',
      'รหัสผ่าน (Password)': '1234',
      'ระดับชั้น': 'ปวช.2',
      'สาขาวิชา': 'ช่างยนต์',
      'เบอร์โทรศัพท์': '0865554321',
      'อีเมล': 'theerapat@example.ac.th'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 18 }, // รหัสนักศึกษา
    { wch: 26 }, // ชื่อ-นามสกุล
    { wch: 22 }, // ชื่อผู้ใช้
    { wch: 20 }, // รหัสผ่าน
    { wch: 14 }, // ระดับชั้น
    { wch: 24 }, // สาขาวิชา
    { wch: 18 }, // เบอร์โทรศัพท์
    { wch: 28 }, // อีเมล
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'แบบฟอร์มนำเข้านักศึกษา');

  XLSX.writeFile(workbook, 'แบบฟอร์มนำเข้ารายชื่อนักศึกษา_template.xlsx');
};

/**
 * Parse an Excel file (.xlsx, .xls, .csv) and extract student rows with validation
 */
export const parseStudentExcelFile = async (
  file: File, 
  existingUsers: User[] = []
): Promise<{
  rows: ParsedStudentRow[];
  validCount: number;
  invalidCount: number;
  existingCount: number;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('ไม่พบข้อมูล Sheet ในไฟล์ Excel');
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('ไม่พบข้อมูลแถวในไฟล์ Excel กรุณาตรวจสอบไฟล์');
        }

        const existingCodes = new Set(
          existingUsers.filter(u => u.studentCode).map(u => u.studentCode!.trim().toLowerCase())
        );
        const existingUsernames = new Set(
          existingUsers.map(u => u.username.trim().toLowerCase())
        );

        const rows: ParsedStudentRow[] = rawJson.map((row) => {
          // Identify headers flexibly
          const getVal = (...keys: string[]): string => {
            for (const key of keys) {
              // Direct match
              if (row[key] !== undefined && String(row[key]).trim() !== '') {
                return String(row[key]).trim();
              }
              // Partial match in object keys
              const matchedKey = Object.keys(row).find(k => 
                k.trim().toLowerCase() === key.toLowerCase() ||
                k.includes(key)
              );
              if (matchedKey && row[matchedKey] !== undefined && String(row[matchedKey]).trim() !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const name = getVal('ชื่อ-นามสกุล', 'ชื่อ นามสกุล', 'ชื่อ', 'name', 'fullname', 'Student Name', 'FullName');
          let studentCode = getVal('รหัสนักศึกษา', 'รหัสนักเรียน', 'รหัสประจำตัว', 'studentCode', 'StudentCode', 'Student ID', 'ID');
          let username = getVal('ชื่อผู้ใช้', 'username', 'Username', 'user', 'ชื่อผู้ใช้งาน', 'User');
          const password = getVal('รหัสผ่าน', 'password', 'Password', 'Pass') || '1234';
          const rawLevel = getVal('ระดับชั้น', 'ชั้นปี', 'ระดับ', 'level', 'Level', 'Grade');
          const rawDept = getVal('สาขาวิชา', 'สาขา', 'แผนก', 'department', 'Department', 'Major');
          const phone = getVal('เบอร์โทรศัพท์', 'เบอร์โทร', 'โทร', 'phone', 'Phone', 'Tel', 'Telephone');
          const email = getVal('อีเมล', 'email', 'Email', 'E-mail', 'Mail');

          // Auto-generate username or student code if missing
          if (!username && studentCode) {
            username = `std${studentCode.slice(-4)}`;
          } else if (!username && name) {
            username = `std${Math.floor(1000 + Math.random() * 9000)}`;
          }

          if (!studentCode && username) {
            studentCode = username;
          }

          const level = normalizeLevel(rawLevel);
          const department = normalizeDepartment(rawDept);

          const errors: string[] = [];
          if (!name) errors.push('ไม่มีชื่อ-นามสกุล');
          if (!username) errors.push('ไม่มีชื่อผู้ใช้ (Username)');

          const isExisting = 
            (studentCode && existingCodes.has(studentCode.toLowerCase())) ||
            (username && existingUsernames.has(username.toLowerCase()));

          return {
            studentCode,
            name,
            username,
            password: password || '1234',
            level,
            department,
            phone,
            email,
            isValid: errors.length === 0,
            errors,
            isExisting: !!isExisting
          };
        });

        const validCount = rows.filter(r => r.isValid).length;
        const invalidCount = rows.filter(r => !r.isValid).length;
        const existingCount = rows.filter(r => r.isExisting).length;

        resolve({
          rows,
          validCount,
          invalidCount,
          existingCount
        });
      } catch (err: any) {
        reject(new Error(err.message || 'ไม่สามารถอ่านไฟล์ Excel ได้'));
      }
    };

    reader.onerror = () => {
      reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
    };

    reader.readAsArrayBuffer(file);
  });
};

// ============================================================================
// QUESTION & EXAM BANK EXCEL UTILITIES
// ============================================================================

export interface ParsedQuestionRow {
  questionNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: ChoiceKey;
  rawCorrectAnswer: string;
  explanation?: string;
  isValid: boolean;
  errors: string[];
}

/**
 * Convert thai or english choice letter/number to 'A' | 'B' | 'C' | 'D'
 */
export const normalizeChoiceKey = (
  raw: any, 
  optA = '', 
  optB = '', 
  optC = '', 
  optD = ''
): ChoiceKey | null => {
  if (raw === undefined || raw === null) return null;
  const str = String(raw).trim();
  if (!str) return null;

  const upper = str.toUpperCase();

  // Direct letter A, B, C, D
  if (upper === 'A' || upper.startsWith('A.') || upper.startsWith('A:') || upper === 'ก' || upper.startsWith('ก.') || upper.startsWith('ก:') || upper === '1' || upper === '1.') {
    return 'A';
  }
  if (upper === 'B' || upper.startsWith('B.') || upper.startsWith('B:') || upper === 'ข' || upper.startsWith('ข.') || upper.startsWith('ข:') || upper === '2' || upper === '2.') {
    return 'B';
  }
  if (upper === 'C' || upper.startsWith('C.') || upper.startsWith('C:') || upper === 'ค' || upper.startsWith('ค.') || upper.startsWith('ค:') || upper === '3' || upper === '3.') {
    return 'C';
  }
  if (upper === 'D' || upper.startsWith('D.') || upper.startsWith('D:') || upper === 'ง' || upper.startsWith('ง.') || upper.startsWith('ง:') || upper === '4' || upper === '4.') {
    return 'D';
  }

  // Check text prefix like "ตัวเลือก ก", "ข้อ ก", "Choice A", "Option 1"
  if (str.includes('ก') || str.includes('A') || str.includes('a') || str.includes('ข้อ 1') || str.includes('ตัวเลือก 1')) {
    return 'A';
  }
  if (str.includes('ข') || str.includes('B') || str.includes('b') || str.includes('ข้อ 2') || str.includes('ตัวเลือก 2')) {
    return 'B';
  }
  if (str.includes('ค') || str.includes('C') || str.includes('c') || str.includes('ข้อ 3') || str.includes('ตัวเลือก 3')) {
    return 'C';
  }
  if (str.includes('ง') || str.includes('D') || str.includes('d') || str.includes('ข้อ 4') || str.includes('ตัวเลือก 4')) {
    return 'D';
  }

  // Check if the answer text literally equals one of the options
  const cleanLower = str.toLowerCase();
  if (optA && cleanLower === optA.trim().toLowerCase()) return 'A';
  if (optB && cleanLower === optB.trim().toLowerCase()) return 'B';
  if (optC && cleanLower === optC.trim().toLowerCase()) return 'C';
  if (optD && cleanLower === optD.trim().toLowerCase()) return 'D';

  return null;
};

/**
 * Format choice key to Thai letter label
 */
export const choiceKeyToThai = (key: ChoiceKey | string): string => {
  switch (key?.toUpperCase()) {
    case 'A': return 'ก';
    case 'B': return 'ข';
    case 'C': return 'ค';
    case 'D': return 'ง';
    default: return key || '';
  }
};

/**
 * Download sample Excel template (.xlsx) for importing questions with choices & answers
 */
export const downloadQuestionExcelTemplate = (courseName = 'รายวิชา') => {
  const sampleQuestions = [
    {
      'ข้อที่': 1,
      'โจทย์คำถาม': 'ข้อใดคือวัตถุประสงค์หลักของการใช้เทคโนโลยีสารสนเทศในองค์กรธุรกิจ?',
      'ตัวเลือก ก': 'เพิ่มประสิทธิภาพในการทำงานและการตัดสินใจอย่างรวดเร็ว',
      'ตัวเลือก ข': 'เพิ่มจำนวนพนักงานในสายงานปฏิบัติการ',
      'ตัวเลือก ค': 'ลดการติดต่อสื่อสารระหว่างแผนกงาน',
      'ตัวเลือก ง': 'ยกเลิกการจัดเก็บเอกสารทางธุรกิจทั้งหมด',
      'เฉลย (ก/ข/ค/ง หรือ A/B/C/D)': 'ก',
      'คำอธิบายเฉลย (ไม่บังคับ)': 'เทคโนโลยีสารสนเทศช่วยประมวลผลข้อมูลและสนับสนุนการตัดสินใจของผู้บริหาร'
    },
    {
      'ข้อที่': 2,
      'โจทย์คำถาม': 'โปรโตคอลมาตรฐานที่ใช้สำหรับการรับส่งข้อมูลบนเวิลด์ไวด์เว็บ (WWW) คือข้อใด?',
      'ตัวเลือก ก': 'FTP (File Transfer Protocol)',
      'ตัวเลือก ข': 'HTTP / HTTPS (Hypertext Transfer Protocol)',
      'ตัวเลือก ค': 'SMTP (Simple Mail Transfer Protocol)',
      'ตัวเลือก ง': 'SSH (Secure Shell)',
      'เฉลย (ก/ข/ค/ง หรือ A/B/C/D)': 'ข',
      'คำอธิบายเฉลย (ไม่บังคับ)': 'HTTP/HTTPS เป็นโปรโตคอลหลักในการรับส่งเว็บเพจบนอินเทอร์เน็ต'
    },
    {
      'ข้อที่': 3,
      'โจทย์คำถาม': 'ภาษาคอมพิวเตอร์ใดที่ทำงานบนเว็บเบราว์เซอร์ฝั่งผู้ใช้งาน (Client-side) เป็นหลัก?',
      'ตัวเลือก ก': 'C++',
      'ตัวเลือก ข': 'SQL',
      'ตัวเลือก ค': 'JavaScript',
      'ตัวเลือก ง': 'COBOL',
      'เฉลย (ก/ข/ค/ง หรือ A/B/C/D)': 'ค',
      'คำอธิบายเฉลย (ไม่บังคับ)': 'JavaScript เป็นภาษามาตรฐานที่รันบน Browser ฝั่ง Client'
    },
    {
      'ข้อที่': 4,
      'โจทย์คำถาม': 'ข้อใดเป็นระบบจัดการฐานข้อมูลเชิงสัมพันธ์ (Relational Database Management System - RDBMS)?',
      'ตัวเลือก ก': 'MySQL / PostgreSQL',
      'ตัวเลือก ข': 'Redis (Key-Value)',
      'ตัวเลือก ค': 'MongoDB (Document Store)',
      'ตัวเลือก ง': 'Neo4j (Graph Database)',
      'เฉลย (ก/ข/ค/ง หรือ A/B/C/D)': 'A',
      'คำอธิบายเฉลย (ไม่บังคับ)': 'MySQL และ PostgreSQL เป็นตัวอย่างของ RDBMS ที่ใช้ภาษา SQL'
    },
    {
      'ข้อที่': 5,
      'โจทย์คำถาม': 'คำว่า "Responsive Web Design" หมายถึงข้อใด?',
      'ตัวเลือก ก': 'การเขียนเว็บที่ตอบสนองเฉพาะเครื่องคอมพิวเตอร์ PC เท่านั้น',
      'ตัวเลือก ข': 'การออกแบบเว็บไซต์ให้ปรับเปลี่ยนการแสดงผลตามขนาดหน้าจออุปกรณ์ต่างๆ ได้อย่างเหมาะสม',
      'ตัวเลือก ค': 'การใช้ภาพเคลื่อนไหวกราฟิก 3 มิติในทุกหน้าเว็บ',
      'ตัวเลือก ง': 'การส่งข้อมูลด้วยความเร็วสูงสุดโดยไม่แสดงผลรูปภาพ',
      'เฉลย (ก/ข/ค/ง หรือ A/B/C/D)': 'B',
      'คำอธิบายเฉลย (ไม่บังคับ)': 'Responsive Design ช่วยให้เว็บไซต์รองรับทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleQuestions);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // ข้อที่
    { wch: 45 }, // โจทย์คำถาม
    { wch: 35 }, // ตัวเลือก ก
    { wch: 35 }, // ตัวเลือก ข
    { wch: 35 }, // ตัวเลือก ค
    { wch: 35 }, // ตัวเลือก ง
    { wch: 28 }, // เฉลย
    { wch: 35 }, // คำอธิบายเฉลย
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'คลังข้อสอบ');

  const safeName = courseName.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
  XLSX.writeFile(workbook, `แบบฟอร์มนำเข้าข้อสอบ_${safeName}_template.xlsx`);
};

/**
 * Export questions list to Excel (.xlsx)
 */
export const exportQuestionsToExcel = (
  questions: Question[], 
  courseTitle = 'คลังข้อสอบ',
  courseCode = ''
) => {
  const data = questions.map((q, index) => ({
    'ข้อที่': q.questionNumber || index + 1,
    'โจทย์คำถาม': q.questionText || '',
    'ตัวเลือก ก': q.optionA || '',
    'ตัวเลือก ข': q.optionB || '',
    'ตัวเลือก ค': q.optionC || '',
    'ตัวเลือก ง': q.optionD || '',
    'เฉลย (A/B/C/D)': q.correctAnswer || 'A',
    'เฉลย (ก/ข/ค/ง)': choiceKeyToThai(q.correctAnswer),
    'คำอธิบายเฉลย': q.explanation || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 8 },  // ข้อที่
    { wch: 45 }, // โจทย์คำถาม
    { wch: 35 }, // ตัวเลือก ก
    { wch: 35 }, // ตัวเลือก ข
    { wch: 35 }, // ตัวเลือก ค
    { wch: 35 }, // ตัวเลือก ง
    { wch: 14 }, // เฉลย (A/B/C/D)
    { wch: 14 }, // เฉลย (ก/ข/ค/ง)
    { wch: 35 }, // คำอธิบายเฉลย
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ข้อสอบทั้งหมด');

  const filename = `คลังข้อสอบ_${courseCode ? `${courseCode}_` : ''}${courseTitle.replace(/[^a-zA-Z0-9ก-๙]/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

/**
 * Export questions list to CSV with UTF-8 BOM
 */
export const exportQuestionsToCSV = (
  questions: Question[], 
  courseTitle = 'คลังข้อสอบ',
  courseCode = ''
) => {
  const headers = ['ข้อที่', 'โจทย์คำถาม', 'ตัวเลือก ก', 'ตัวเลือก ข', 'ตัวเลือก ค', 'ตัวเลือก ง', 'เฉลย', 'คำอธิบายเฉลย'];
  const rows = questions.map((q, i) => [
    q.questionNumber || i + 1,
    `"${(q.questionText || '').replace(/"/g, '""')}"`,
    `"${(q.optionA || '').replace(/"/g, '""')}"`,
    `"${(q.optionB || '').replace(/"/g, '""')}"`,
    `"${(q.optionC || '').replace(/"/g, '""')}"`,
    `"${(q.optionD || '').replace(/"/g, '""')}"`,
    `"${q.correctAnswer || 'A'}"`,
    `"${(q.explanation || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `คลังข้อสอบ_${courseCode ? `${courseCode}_` : ''}${courseTitle.replace(/[^a-zA-Z0-9ก-๙]/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Parse an Excel file containing questions with choices and answer key
 */
export const parseQuestionExcelFile = async (
  file: File
): Promise<{
  rows: ParsedQuestionRow[];
  validCount: number;
  invalidCount: number;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('ไม่พบข้อมูล Sheet ในไฟล์ Excel');
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('ไม่พบข้อมูลแถวในไฟล์ Excel กรุณาตรวจสอบว่ามีข้อมูลข้อสอบ');
        }

        const rows: ParsedQuestionRow[] = rawJson.map((row, index) => {
          // Helper to find value from multiple possible header variations
          const getVal = (...keys: string[]): string => {
            for (const key of keys) {
              if (row[key] !== undefined && String(row[key]).trim() !== '') {
                return String(row[key]).trim();
              }
              const matchedKey = Object.keys(row).find(k => 
                k.trim().toLowerCase() === key.toLowerCase() ||
                k.includes(key)
              );
              if (matchedKey && row[matchedKey] !== undefined && String(row[matchedKey]).trim() !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const rawNumber = getVal('ข้อที่', 'ข้อ', 'ลำดับ', 'ลำดับข้อ', 'number', 'No', 'No.', 'Question Number', 'qNo');
          const questionNumber = Number(rawNumber) > 0 ? Number(rawNumber) : index + 1;

          const questionText = getVal('โจทย์คำถาม', 'โจทย์', 'คำถาม', 'ข้อสอบ', 'questionText', 'Question', 'question', 'Title', 'โจทย์ข้อสอบ');
          const optionA = getVal('ตัวเลือก ก', 'ตัวเลือก 1', 'ตัวเลือกA', 'ตัวเลือก A', 'ก', 'ก.', 'A', 'Option A', 'Choice A', 'optionA', 'choice1', '1');
          const optionB = getVal('ตัวเลือก ข', 'ตัวเลือก 2', 'ตัวเลือกB', 'ตัวเลือก B', 'ข', 'ข.', 'B', 'Option B', 'Choice B', 'optionB', 'choice2', '2');
          const optionC = getVal('ตัวเลือก ค', 'ตัวเลือก 3', 'ตัวเลือกC', 'ตัวเลือก C', 'ค', 'ค.', 'C', 'Option C', 'Choice C', 'optionC', 'choice3', '3');
          const optionD = getVal('ตัวเลือก ง', 'ตัวเลือก 4', 'ตัวเลือกD', 'ตัวเลือก D', 'ง', 'ง.', 'D', 'Option D', 'Choice D', 'optionD', 'choice4', '4');

          const rawAnswer = getVal('เฉลย', 'ข้อเฉลย', 'คำตอบที่ถูก', 'คำตอบ', 'คำตอบที่ถูกต้อง', 'correctAnswer', 'Answer', 'Correct Answer', 'Key', 'Answer Key', 'Ans', 'ถูกต้อง');
          const explanation = getVal('คำอธิบายเฉลย', 'คำอธิบาย', 'เหตุผล', 'explanation', 'Explanation', 'Note', 'หมายเหตุ');

          const normalizedAnswer = normalizeChoiceKey(rawAnswer, optionA, optionB, optionC, optionD);

          const errors: string[] = [];
          if (!questionText) errors.push('ไม่มีโจทย์คำถาม');
          if (!optionA) errors.push('ไม่มีตัวเลือก ก');
          if (!optionB) errors.push('ไม่มีตัวเลือก ข');
          if (!optionC) errors.push('ไม่มีตัวเลือก ค');
          if (!optionD) errors.push('ไม่มีตัวเลือก ง');
          if (!normalizedAnswer) {
            if (!rawAnswer) {
              errors.push('ไม่ได้ระบุข้อเฉลย');
            } else {
              errors.push(`ข้อเฉลย "${rawAnswer}" ไม่ถูกต้อง (ต้องเป็น ก, ข, ค, ง หรือ A, B, C, D หรือ 1, 2, 3, 4)`);
            }
          }

          return {
            questionNumber,
            questionText,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer: normalizedAnswer || 'A',
            rawCorrectAnswer: rawAnswer,
            explanation,
            isValid: errors.length === 0,
            errors
          };
        });

        const validCount = rows.filter(r => r.isValid).length;
        const invalidCount = rows.filter(r => !r.isValid).length;

        resolve({
          rows,
          validCount,
          invalidCount
        });
      } catch (err: any) {
        reject(new Error(err.message || 'ไม่สามารถอ่านไฟล์ Excel ได้'));
      }
    };

    reader.onerror = () => {
      reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel'));
    };

    reader.readAsArrayBuffer(file);
  });
};
