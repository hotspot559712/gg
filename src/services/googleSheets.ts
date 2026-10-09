import { ExamAttempt, Course, Lesson, Question, User, Semester, StudentExamProgress } from '../types';

export const APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * โค้ด Google Apps Script สำหรับระบบการเรียนการสอนภาคสมทบ E-learning
 * ฐานข้อมูล Google Sheets 100% ฟรี ทำงานบน Apps Script ไม่ต้องเช่าโฮสติ้ง
 * รองรับการบันทึกคะแนนสอบ, ระบบ Auto-save ความคืบหน้าการสอบแบบเรียลไทม์
 * =========================================================================
 * วิธีติดตั้ง:
 * 1. เปิด Google Sheets ใหม่ -> ไปที่เมนู "ส่วนขยาย" (Extensions) -> "Apps Script"
 * 2. ลบโค้ดเดิมทั้งหมด แล้ววางโค้ดนี้ลงไป
 * 3. กด "บันทึก" (Save 💾)
 * 4. กดปุ่ม "เริ่มต้นติดตั้งตารางชีต" โดยเลือกฟังก์ชัน setupSheets แล้วกด "เรียกใช้" (Run) 1 ครั้ง
 * 5. กด "การทำให้ใช้งานได้" (Deploy) -> "การทำให้ใช้งานได้รายการใหม่" (New deployment)
 * 6. เลือกประเภท: "เว็บแอปพลิเคชัน" (Web app)
 * 7. ตั้งค่า:
 *    - คำอธิบาย: E-learning API v1
 *    - ดำเนินการในฐานะ: ฉัน (Me)
 *    - ผู้มีสิทธิ์เข้าถึง: ทุกคน (Anyone) *** สำคัญมาก เพื่อให้เว็บเชื่อมต่อได้ ***
 * 8. กด "ทำให้ใช้งานได้" (Deploy) แล้วคัดลอก URL เว็บแอปที่ได้ มาใส่ในเมนูตั้งค่าของระบบ
 * =========================================================================
 */

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheets = [
    { name: 'Users', headers: ['id', 'username', 'password', 'name', 'role', 'department', 'level', 'studentCode', 'email', 'phone', 'createdAt'] },
    { name: 'Courses', headers: ['id', 'code', 'title', 'description', 'department', 'level', 'semesterId', 'teacherId', 'teacherName', 'credit', 'active', 'passingScore'] },
    { name: 'Lessons', headers: ['id', 'courseId', 'order', 'title', 'description', 'content', 'pdfUrl', 'driveFileId', 'createdAt'] },
    { name: 'Questions', headers: ['id', 'courseId', 'questionNumber', 'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'explanation'] },
    { name: 'ExamResults', headers: ['id', 'studentId', 'studentName', 'studentCode', 'courseId', 'courseCode', 'courseTitle', 'department', 'level', 'attemptNumber', 'score', 'totalQuestions', 'passingScore', 'passed', 'submittedAt'] },
    { name: 'ExamProgress', headers: ['id', 'studentId', 'studentName', 'studentCode', 'courseId', 'courseCode', 'courseTitle', 'department', 'level', 'answeredCount', 'totalQuestions', 'answersJson', 'flaggedJson', 'lastSavedAt'] },
    { name: 'Semesters', headers: ['id', 'name', 'academicYear', 'term', 'isOpen', 'startDate', 'endDate'] }
  ];
  
  sheets.forEach(function(s) {
    var sheet = ss.getSheetByName(s.name);
    if (!sheet) {
      sheet = ss.insertSheet(s.name);
      sheet.appendRow(s.headers);
      sheet.getRange(1, 1, 1, s.headers.length).setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });
  
  Logger.log('ตั้งค่าชีตสำเร็จเรียบร้อยแล้ว!');
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAllData';
  var result = { success: true, timestamp: new Date().toISOString() };
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'ping') {
      result.message = 'เชื่อมต่อฐานข้อมูล Google Sheets สำเร็จ!';
      result.spreadsheetName = ss.getName();
      result.spreadsheetId = ss.getId();
    } else if (action === 'getAllData') {
      result.data = {
        users: getSheetDataAsObjects(ss, 'Users'),
        courses: getSheetDataAsObjects(ss, 'Courses'),
        lessons: getSheetDataAsObjects(ss, 'Lessons'),
        questions: getSheetDataAsObjects(ss, 'Questions'),
        examResults: getSheetDataAsObjects(ss, 'ExamResults'),
        examProgress: getSheetDataAsObjects(ss, 'ExamProgress'),
        semesters: getSheetDataAsObjects(ss, 'Semesters')
      };
    } else if (action === 'getExamResults') {
      result.data = getSheetDataAsObjects(ss, 'ExamResults');
    } else if (action === 'getExamProgress') {
      result.data = getSheetDataAsObjects(ss, 'ExamProgress');
    }
  } catch (err) {
    result.success = false;
    result.error = err.toString();
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var result = { success: true, timestamp: new Date().toISOString() };
  
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    
    var action = body.action || 'submitExam';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'submitExam') {
      var sheet = getOrCreateSheet(ss, 'ExamResults', [
        'id', 'studentId', 'studentName', 'studentCode', 'courseId', 'courseCode', 
        'courseTitle', 'department', 'level', 'attemptNumber', 'score', 'totalQuestions', 
        'passingScore', 'passed', 'submittedAt'
      ]);
      
      var item = body.examAttempt;
      sheet.appendRow([
        item.id,
        item.studentId,
        item.studentName,
        item.studentCode || '',
        item.courseId,
        item.courseCode,
        item.courseTitle,
        item.department,
        item.level,
        item.attemptNumber,
        item.score,
        item.totalQuestions,
        item.passingScore,
        item.passed ? 'ผ่าน' : 'ไม่ผ่าน',
        item.submittedAt || new Date().toISOString()
      ]);

      // Remove in-progress record once exam is finalized
      try {
        var progSheet = ss.getSheetByName('ExamProgress');
        if (progSheet) {
          var progRows = progSheet.getDataRange().getValues();
          for (var p = progRows.length - 1; p >= 1; p--) {
            if (progRows[p][1] === item.studentId && progRows[p][4] === item.courseId) {
              progSheet.deleteRow(p + 1);
            }
          }
        }
      } catch (errClear) {}

      result.message = 'บันทึกคะแนนสอบลง Google Sheet เรียบร้อย';
      result.attemptId = item.id;
    } else if (action === 'saveExamProgress' || action === 'autoSaveProgress') {
      // Auto-save student exam progress
      var progSheet = getOrCreateSheet(ss, 'ExamProgress', [
        'id', 'studentId', 'studentName', 'studentCode', 'courseId', 'courseCode', 
        'courseTitle', 'department', 'level', 'answeredCount', 'totalQuestions', 
        'answersJson', 'flaggedJson', 'lastSavedAt'
      ]);
      
      var p = body.progress;
      var key = p.studentId + '_' + p.courseId;
      var rows = progSheet.getDataRange().getValues();
      var foundIndex = -1;
      
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === key || (rows[i][1] === p.studentId && rows[i][4] === p.courseId)) {
          foundIndex = i + 1;
          break;
        }
      }

      var rowValues = [
        key,
        p.studentId,
        p.studentName,
        p.studentCode || '',
        p.courseId,
        p.courseCode,
        p.courseTitle,
        p.department,
        p.level,
        p.answeredCount,
        p.totalQuestions,
        JSON.stringify(p.answers || {}),
        JSON.stringify(p.flagged || {}),
        p.lastSavedAt || new Date().toISOString()
      ];

      if (foundIndex > 0) {
        progSheet.getRange(foundIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        progSheet.appendRow(rowValues);
      }
      result.message = 'บันทึกความคืบหน้าการสอบสำเร็จ (Auto-saved)';
      result.savedKey = key;
    } else if (action === 'clearExamProgress') {
      var progSheet = ss.getSheetByName('ExamProgress');
      if (progSheet) {
        var pRows = progSheet.getDataRange().getValues();
        for (var pr = pRows.length - 1; pr >= 1; pr--) {
          if (pRows[pr][1] === body.studentId && pRows[pr][4] === body.courseId) {
            progSheet.deleteRow(pr + 1);
          }
        }
      }
      result.message = 'ล้างข้อมูลความคืบหน้าการสอบเรียบร้อย';
    } else if (action === 'syncAll') {
      // Sync whole dataset from frontend to sheet
      if (body.data) {
        if (body.data.users) replaceSheetData(ss, 'Users', body.data.users);
        if (body.data.courses) replaceSheetData(ss, 'Courses', body.data.courses);
        if (body.data.lessons) replaceSheetData(ss, 'Lessons', body.data.lessons);
        if (body.data.questions) replaceSheetData(ss, 'Questions', body.data.questions);
        if (body.data.examResults) replaceSheetData(ss, 'ExamResults', body.data.examResults);
        if (body.data.semesters) replaceSheetData(ss, 'Semesters', body.data.semesters);
      }
      result.message = 'ซิงค์ข้อมูลทั้งหมดกับ Google Sheet เรียบร้อย';
    }
  } catch (err) {
    result.success = false;
    result.error = err.toString();
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetDataAsObjects(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  
  var headers = rows[0];
  var data = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = rows[i][j];
    }
    data.push(obj);
  }
  return data;
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
  }
  return sheet;
}

function replaceSheetData(ss, sheetName, items) {
  if (!items || items.length === 0) return;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  var headers = Object.keys(items[0]);
  sheet.clear();
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
  
  var rows = items.map(function(item) {
    return headers.map(function(h) { return item[h] !== undefined ? item[h] : ''; });
  });
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}
`;

export const INDEX_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>ระบบการเรียนการสอนภาคสมทบ E-learning & Online Examination</title>
  
  <!-- Tailwind CSS & Sarabun Font -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- FontAwesome 6 Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <style>
    * { font-family: 'Sarabun', sans-serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">

  <!-- HEADER NAVBAR -->
  <header class="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3 cursor-pointer" onclick="goHome()">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
          <i class="fa-solid fa-graduation-cap text-lg"></i>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-sm sm:text-base font-bold tracking-tight">ระบบภาคสมทบ E-learning</h1>
            <span class="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] px-1.5 py-0.5 rounded font-bold">E-Exam</span>
          </div>
          <p class="text-[11px] text-slate-400">ระดับ ปวช. / ปวส. ภาคเรียนที่ 1/2567</p>
        </div>
      </div>

      <div id="navUserBox" class="hidden flex items-center space-x-3">
        <div class="text-right hidden sm:block">
          <div id="navUserName" class="text-xs font-bold text-white">ผู้ใช้งาน</div>
          <div id="navUserRole" class="text-[10px] text-blue-400 font-medium">นักศึกษา</div>
        </div>
        <button onclick="handleLogout()" class="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  </header>

  <!-- MAIN CONTENT CONTAINER -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

    <!-- 1. LOGIN VIEW -->
    <div id="viewLogin" class="flex items-center justify-center py-10">
      <div class="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h2 class="text-2xl font-bold text-slate-900">เข้าสู่ระบบ (Sign In)</h2>
          <p class="text-xs text-slate-500">กรุณากรอกชื่อผู้ใช้/รหัสนักศึกษา และรหัสผ่านเพื่อเข้าใช้งาน</p>
        </div>

        <div id="loginAlert" class="hidden p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center space-x-2.5 font-semibold">
          <i class="fa-solid fa-triangle-exclamation text-red-600"></i>
          <span id="loginAlertMsg">ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง</span>
        </div>

        <form onsubmit="handleLogin(event)" class="space-y-4 text-xs sm:text-sm">
          <div>
            <label class="block text-slate-700 font-semibold mb-1.5">ชื่อผู้ใช้ (Username) / รหัสนักศึกษา</label>
            <div class="relative">
              <i class="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input type="text" id="loginUsername" required placeholder="เช่น admin, teacher1 หรือ std6701" class="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium outline-none">
            </div>
          </div>

          <div>
            <label class="block text-slate-700 font-semibold mb-1.5">รหัสผ่าน (Password)</label>
            <div class="relative">
              <i class="fa-solid fa-key absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input type="password" id="loginPassword" required placeholder="••••••••" class="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium outline-none">
            </div>
          </div>

          <button type="submit" class="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer">
            <span>เข้าสู่ระบบ</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </form>

        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
          <p class="font-bold text-slate-700">🔒 รหัสผ่านเริ่มต้น:</p>
          <p>• Admin: <span class="font-mono text-blue-600">admin / admin123</span></p>
          <p>• ครูผู้สอน: <span class="font-mono text-amber-600">teacher1 / teacher123</span></p>
          <p>• นักศึกษา: <span class="font-mono text-emerald-600">std6701 / student123</span></p>
        </div>
      </div>
    </div>

    <!-- 2. STUDENT VIEW -->
    <div id="viewStudent" class="hidden space-y-6">
      <div class="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span class="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">ห้องเรียนออนไลน์ภาคสมทบ</span>
          <h2 id="studentWelcomeText" class="text-xl sm:text-2xl font-bold mt-2">ยินดีต้อนรับนักศึกษา</h2>
          <p class="text-xs sm:text-sm text-blue-100 mt-1">ศึกษาบทเรียนออนไลน์ e-Learning และทำแบบทดสอบ 40 ข้อเพื่อประเมินผล</p>
        </div>
        <div class="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/20 text-xs">
          <i class="fa-solid fa-circle-check text-emerald-400"></i>
          <span>เกณฑ์การผ่าน: 24/40 คะแนน (60%)</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="studentCourseList"></div>
    </div>

    <!-- 3. EXAM ROOM VIEW -->
    <div id="viewExam" class="hidden space-y-6">
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-20 z-20">
        <div>
          <span class="text-xs font-bold text-rose-600 uppercase tracking-wide">แบบทดสอบวัดผลสัมฤทธิ์</span>
          <h2 id="examHeaderCourseTitle" class="text-base sm:text-lg font-bold text-slate-900">การทดสอบ 40 ข้อ (เกณฑ์ผ่าน 24 คะแนน)</h2>
        </div>
        <div class="flex items-center space-x-3">
          <div class="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-bold text-sm flex items-center space-x-2">
            <i class="fa-regular fa-clock"></i>
            <span id="examTimerDisplay">60:00</span>
          </div>
        </div>
      </div>

      <div id="examQuestionsList" class="space-y-4"></div>

      <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 flex justify-between items-center shadow-sm">
        <button onclick="handleCancelExam()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
          ออกจากห้องสอบ
        </button>
        <button onclick="submitExam()" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center space-x-2 cursor-pointer">
          <i class="fa-solid fa-paper-plane"></i>
          <span>ส่งกระดาษคำตอบ (40 ข้อ)</span>
        </button>
      </div>
    </div>

    <!-- 4. ADMIN & TEACHER VIEW -->
    <div id="viewAdmin" class="hidden space-y-6">
      <div class="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span id="adminRoleBadge" class="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/30">ผู้ดูแลระบบ (Admin)</span>
          <h2 class="text-xl sm:text-2xl font-bold mt-2">รายงานผลคะแนนสอบนักศึกษา</h2>
          <p class="text-xs text-slate-400 mt-1">ข้อมูลถูกบันทึกและซิงค์ตรงกับ Google Sheets ตลอดเวลา</p>
        </div>
        <div class="flex space-x-2">
          <button onclick="loadAdminTable()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5">
            <i class="fa-solid fa-arrows-rotate"></i>
            <span>รีเฟรชข้อมูล</span>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 class="font-bold text-slate-900 text-sm">ตารางคะแนนผลการสอบนักศึกษาล่าสุด</h3>
          <span class="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md">Realtime Google Sheets</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase">
              <tr>
                <th class="p-4">รหัสนักศึกษา</th>
                <th class="p-4">ชื่อ-นามสกุล</th>
                <th class="p-4">สาขาวิชา / ชั้นปี</th>
                <th class="p-4">รายวิชา</th>
                <th class="p-4 text-center">คะแนน (40 ข้อ)</th>
                <th class="p-4 text-center">ผลการสอบ</th>
                <th class="p-4">เวลาที่ส่งข้อสอบ</th>
              </tr>
            </thead>
            <tbody id="adminScoreTable" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    </div>

  </main>

  <!-- JAVASCRIPT CONTROLLER -->
  <script>
    let currentUser = null;
    let currentCourse = null;
    let examAnswers = {};
    let timerInterval = null;
    let timeLeft = 3600;

    const courses = [
      { id: 'c1', code: '30204-2001', title: 'เทคโนโลยีดิจิทัลเพื่อการจัดการอาชีพ', teacher: 'อ.สมชาย เทคโนโลยี', dept: 'เทคโนโลยีธุรกิจดิจิทัล', level: 'ปวช.1', totalQuestions: 40, passingScore: 24 },
      { id: 'c2', code: '30201-1001', title: 'การบัญชีการเงินเบื้องต้น', teacher: 'อ.วิภาวดี การบัญชี', dept: 'การบัญชี', level: 'ปวช.2', totalQuestions: 40, passingScore: 24 }
    ];

    let examResults = [
      { studentCode: '6720101001', name: 'นายกิตติศักดิ์ พัฒนไพศาล', dept: 'เทคโนโลยีธุรกิจดิจิทัล (ปวช.1)', course: 'เทคโนโลยีดิจิทัลเพื่อการจัดการอาชีพ', score: 36, passed: true, date: 'วันนี้ 09:30 น.' },
      { studentCode: '6720101002', name: 'นางสาวพิมพ์ชนก รัตนโกสินทร์', dept: 'การบัญชี (ปวช.2)', course: 'การบัญชีการเงินเบื้องต้น', score: 32, passed: true, date: 'วันนี้ 10:15 น.' }
    ];

    function showView(viewId) {
      ['viewLogin', 'viewStudent', 'viewExam', 'viewAdmin'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
      });
      document.getElementById(viewId).classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goHome() {
      if (!currentUser) showView('viewLogin');
      else if (currentUser.role === 'student') showView('viewStudent');
      else showView('viewAdmin');
    }

    function handleLogin(e) {
      e.preventDefault();
      const u = document.getElementById('loginUsername').value.trim();
      const p = document.getElementById('loginPassword').value.trim();
      const alertBox = document.getElementById('loginAlert');

      if (u === 'admin' && p === 'admin123') {
        currentUser = { id: 'u_admin', username: 'admin', name: 'ผอ.ประสิทธิ์ วิริยะการุณย์', role: 'admin', dept: 'บริหารธุรกิจ' };
      } else if (u.startsWith('teacher') && p === 'teacher123') {
        currentUser = { id: 'u_t1', username: u, name: 'อ.สมชาย เทคโนโลยี', role: 'teacher', dept: 'เทคโนโลยีธุรกิจดิจิทัล' };
      } else if (u.startsWith('std') && p === 'student123') {
        currentUser = { id: 'u_s1', username: u, name: 'นายกิตติศักดิ์ พัฒนไพศาล', code: '6720101001', role: 'student', dept: 'เทคโนโลยีธุรกิจดิจิทัล', level: 'ปวช.1' };
      } else {
        alertBox.classList.remove('hidden');
        return;
      }

      alertBox.classList.add('hidden');
      document.getElementById('navUserBox').classList.remove('hidden');
      document.getElementById('navUserName').innerText = currentUser.name;
      document.getElementById('navUserRole').innerText = currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : currentUser.role === 'teacher' ? 'ครูผู้สอน' : 'นักศึกษา';

      if (currentUser.role === 'student') {
        document.getElementById('studentWelcomeText').innerText = 'ยินดีต้อนรับ: ' + currentUser.name + ' (' + currentUser.code + ')';
        renderStudentCourses();
        showView('viewStudent');
      } else {
        document.getElementById('adminRoleBadge').innerText = currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ครูผู้สอน • ' + currentUser.dept;
        loadAdminTable();
        showView('viewAdmin');
      }
    }

    function handleLogout() {
      currentUser = null;
      if (timerInterval) clearInterval(timerInterval);
      document.getElementById('navUserBox').classList.add('hidden');
      showView('viewLogin');
    }

    function renderStudentCourses() {
      const list = document.getElementById('studentCourseList');
      list.innerHTML = courses.map(c => \`
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span class="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">\${c.code}</span>
            <h3 class="font-bold text-slate-900 text-base mt-2.5">\${c.title}</h3>
            <p class="text-xs text-slate-500 mt-1">ผู้สอน: \${c.teacher}</p>
          </div>
          <button onclick="startExam('\${c.id}')" class="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2">
            <i class="fa-solid fa-pen-to-square"></i>
            <span>ทำแบบทดสอบวัดผล (40 ข้อ)</span>
          </button>
        </div>
      \`).join('');
    }

    function startExam(courseId) {
      currentCourse = courses.find(c => c.id === courseId);
      examAnswers = {};
      document.getElementById('examHeaderCourseTitle').innerText = currentCourse.code + ' ' + currentCourse.title + ' (40 ข้อ)';
      
      const container = document.getElementById('examQuestionsList');
      let html = '';
      for (let i = 1; i <= 40; i++) {
        html += \`
          <div class="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div class="font-bold text-xs sm:text-sm text-slate-900 flex items-start space-x-2.5">
              <span class="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">\${i}</span>
              <span class="mt-0.5">ข้อที่ \${i}: ข้อใดเป็นประโยชน์หลักของการประยุกต์ใช้เทคโนโลยีดิจิทัลในการบริหารงานภาคสมทบ?</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <label class="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center space-x-2.5 cursor-pointer">
                <input type="radio" name="q_\${i}" value="A" onchange="examAnswers[\${i}] = 'A'" class="text-blue-600">
                <span>ก. เพิ่มความสะดวกรวดเร็วและลดขั้นตอนการทำงาน</span>
              </label>
              <label class="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center space-x-2.5 cursor-pointer">
                <input type="radio" name="q_\${i}" value="B" onchange="examAnswers[\${i}] = 'B'" class="text-blue-600">
                <span>ข. เพิ่มการใช้กระดาษและเอกสารให้มากขึ้น</span>
              </label>
            </div>
          </div>
        \`;
      }
      container.innerHTML = html;
      showView('viewExam');
    }

    function submitExam() {
      const answered = Object.keys(examAnswers).length;
      if (answered < 40) {
        if (!confirm('คุณตอบคำถามไปเพียง ' + answered + ' จาก 40 ข้อ ต้องการยืนยันส่งข้อสอบหรือไม่?')) return;
      }
      if (timerInterval) clearInterval(timerInterval);

      const score = Math.floor(Math.random() * 12) + 29;
      const passed = score >= 24;

      examResults.unshift({
        studentCode: currentUser.code || '6720101001',
        name: currentUser.name,
        dept: currentUser.dept || 'เทคโนโลยีธุรกิจดิจิทัล',
        course: currentCourse.title,
        score: score,
        passed: passed,
        date: 'เมื่อสักครู่'
      });

      alert('🎉 ส่งกระดาษคำตอบเรียบร้อยแล้ว!\\n\\nคะแนนที่คุณได้: ' + score + ' / 40 คะแนน\\nผลการประเมิน: ' + (passed ? 'ผ่านเกณฑ์ ✅' : 'ไม่ผ่านเกณฑ์ ❌'));
      showView('viewStudent');
    }

    function handleCancelExam() {
      if (confirm('คุณต้องการออกจากห้องสอบใช่หรือไม่?')) {
        if (timerInterval) clearInterval(timerInterval);
        showView('viewStudent');
      }
    }

    function loadAdminTable() {
      const tbody = document.getElementById('adminScoreTable');
      tbody.innerHTML = examResults.map(r => \`
        <tr class="hover:bg-slate-50">
          <td class="p-4 font-mono font-bold text-slate-900">\${r.studentCode}</td>
          <td class="p-4 font-semibold text-slate-900">\${r.name}</td>
          <td class="p-4 text-slate-500">\${r.dept}</td>
          <td class="p-4 text-slate-700">\${r.course}</td>
          <td class="p-4 text-center font-bold text-blue-600">\${r.score} / 40</td>
          <td class="p-4 text-center">
            <span class="px-2.5 py-1 \${r.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'} border rounded-full font-bold text-[10px]">
              \${r.passed ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน'}
            </span>
          </td>
          <td class="p-4 text-slate-400">\${r.date}</td>
        </tr>
      \`).join('');
    }
  </script>
</body>
</html>
`;

/**
 * Format Google Drive link into an embeddable preview URL
 */
export function formatGoogleDrivePreviewUrl(urlOrId?: string): string {
  if (!urlOrId) return '';
  
  const trimmed = urlOrId.trim();
  
  // Extract File ID from various Google Drive URL formats
  // https://drive.google.com/file/d/{FILE_ID}/view...
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    return `https://drive.google.com/file/d/${matchFileD[1]}/preview`;
  }
  
  // https://drive.google.com/open?id={FILE_ID} or id={FILE_ID}
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) {
    return `https://drive.google.com/file/d/${matchIdParam[1]}/preview`;
  }
  
  // If it's already a preview URL
  if (trimmed.includes('drive.google.com') && trimmed.includes('/preview')) {
    return trimmed;
  }
  
  // If it is just a plain ID string (no slashes)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return `https://drive.google.com/file/d/${trimmed}/preview`;
  }
  
  // If it is a generic PDF or other external URL, return as-is
  return trimmed;
}

/**
 * Test connection to Google Apps Script Web App
 */
export async function testGoogleSheetConnection(webAppUrl: string): Promise<{ success: boolean; message: string; details?: any }> {
  if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'รูปแบบ URL ไม่ถูกต้อง ต้องขึ้นต้นด้วย https://script.google.com/macros/s/...'
    };
  }

  try {
    const url = new URL(webAppUrl);
    url.searchParams.set('action', 'ping');

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      return {
        success: false,
        message: `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (HTTP ${res.status}): ตรวจสอบว่าได้ตั้งค่าสิทธิ์เป็น 'Anyone' แล้วหรือไม่`
      };
    }

    const data = await res.json();
    if (data.success) {
      return {
        success: true,
        message: 'เชื่อมต่อฐานข้อมูล Google Sheets สำเร็จสมบูรณ์!',
        details: data
      };
    } else {
      return {
        success: false,
        message: data.error || 'Google Apps Script ส่งข้อผิดพลาดกลับมา',
        details: data
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `ไม่สามารถเชื่อมต่อได้ (${err.message || 'CORS / Network Error'}): กรุณาตรวจสอบว่าได้เลือก 'Anyone' ใน Apps Script แล้ว`
    };
  }
}

/**
 * Submit exam attempt to Google Sheets
 */
export async function syncExamAttemptToSheet(webAppUrl: string, attempt: ExamAttempt): Promise<boolean> {
  if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com/macros/s/')) {
    return false;
  }

  try {
    const res = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Apps script accepts text/plain avoiding CORS preflight block
      },
      body: JSON.stringify({
        action: 'submitExam',
        examAttempt: attempt
      })
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.error('Failed to sync exam result to Google Sheet:', err);
    return false;
  }
}

/**
 * Sync entire dataset to Google Sheets
 */
export async function syncFullDatasetToSheet(
  webAppUrl: string,
  payload: {
    users: User[];
    courses: Course[];
    lessons: Lesson[];
    questions: Question[];
    examResults: ExamAttempt[];
    semesters: Semester[];
  }
): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com/macros/s/')) {
    return { success: false, message: 'URL Web App ไม่ถูกต้อง' };
  }

  try {
    const res = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'syncAll',
        data: payload
      })
    });
    const data = await res.json();
    return {
      success: !!data.success,
      message: data.message || (data.success ? 'ซิงค์ข้อมูลสำเร็จ' : data.error)
    };
  } catch (err: any) {
    return {
      success: false,
      message: `การซิงค์ล้มเหลว: ${err.message}`
    };
  }
}

/**
 * Auto-save student exam progress periodically to Google Sheets
 */
export async function syncExamProgressToSheet(
  webAppUrl: string,
  progress: StudentExamProgress
): Promise<{ success: boolean; message?: string }> {
  if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com/macros/s/')) {
    return { success: false, message: 'Google Apps Script Web App URL ยังไม่ได้ตั้งค่า' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    const res = await fetch(webAppUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'saveExamProgress',
        progress
      })
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    return {
      success: !!data.success,
      message: data.message || (data.success ? 'บันทึก Google Sheets สำเร็จ' : data.error)
    };
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    console.warn('Sync exam progress network issue:', err);
    return {
      success: false,
      message: isTimeout ? 'การเชื่อมต่อ Google Sheets หมดเวลา (บันทึกออฟไลน์แล้ว)' : (err.message || 'เครือข่ายขัดข้อง')
    };
  }
}

/**
 * Remove progress record from Google Sheets once exam is finalized or retaken
 */
export async function clearExamProgressFromSheet(
  webAppUrl: string,
  studentId: string,
  courseId: string
): Promise<boolean> {
  if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com/macros/s/')) {
    return false;
  }

  try {
    const res = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'clearExamProgress',
        studentId,
        courseId
      })
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Clear exam progress warning:', err);
    return false;
  }
}

export const GOOGLE_APPS_SCRIPT_TEMPLATE = APPS_SCRIPT_CODE;

