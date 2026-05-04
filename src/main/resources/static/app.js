// ===== MOCK COURSE DATA =====
const MOCK_COURSES = [
    { id: 1, name: 'Full Stack Java', duration: '12 weeks', icon: '💻', category: 'DEVELOPMENT', lessons: 12, video: 'https://www.youtube.com/embed/eIrMbAQSU34' },
    { id: 2, name: 'Data Science Pro', duration: '10 weeks', icon: '📊', category: 'DATA SCIENCE', lessons: 10, video: 'https://www.youtube.com/embed/ua-CiDNNj30' },
    { id: 3, name: 'UI/UX Mastery', duration: '8 weeks', icon: '🎨', category: 'UI/UX DESIGN', lessons: 8, video: 'https://www.youtube.com/embed/c9Wg6Cb_YlU' },
    { id: 4, name: 'Cyber Security Basics', duration: '7 weeks', icon: '🔐', category: 'SECURITY', lessons: 7, video: 'https://www.youtube.com/embed/inWWhr5tnEA' },
    { id: 5, name: 'Android Development', duration: '11 weeks', icon: '📱', category: 'MOBILE', lessons: 11, video: 'https://www.youtube.com/embed/EOfCEhWq8sg' }
];

// ===== PER-USER STORAGE HELPERS =====
function getUserEmail() {
    const user = JSON.parse(localStorage.getItem('skilloLoggedIn'));
    return user ? user.email : 'guest';
}

function getEnrolledCourses() {
    return JSON.parse(localStorage.getItem('enrolledCourses_' + getUserEmail())) || [];
}

function setEnrolledCourses(courses) {
    localStorage.setItem('enrolledCourses_' + getUserEmail(), JSON.stringify(courses));
}

function getCurrentCourse() {
    return JSON.parse(localStorage.getItem('currentCourse_' + getUserEmail()));
}

function setCurrentCourse(course) {
    localStorage.setItem('currentCourse_' + getUserEmail(), JSON.stringify(course));
}

// ===== ENROLLMENT LOGIC =====
function enrollCourse(name, duration, icon) {
    const user = JSON.parse(localStorage.getItem('skilloLoggedIn'));
    if (!user) {
        window.location.href = '/login';
        return;
    }

    let courses = getEnrolledCourses();

    let mock = MOCK_COURSES.find(c => c.name === name);
    let adminCourses = JSON.parse(localStorage.getItem('adminCourses')) || [];
    let adminCourse = adminCourses.find(c => c.title === name);

    const total = mock ? mock.lessons : (adminCourse ? adminCourse.lessons : 10);
    const video = mock ? mock.video : (adminCourse ? adminCourse.video : '');
    const category = mock ? mock.category : (adminCourse ? adminCourse.category : 'General');

    courses = courses.filter(c => c.name !== name);

    const newEnrollment = {
        name, duration, icon, progress: 0, completed: 0,
        total, video, category,
        checkboxStates: new Array(total).fill(false)
    };

    courses.push(newEnrollment);
    setEnrolledCourses(courses);
    setCurrentCourse(newEnrollment);

    alert(`🎯 Successfully Enrolled in ${name}! \n\nClick OK to start your learning journey.`);
    window.location.href = '/course-detail';
}

// ===== PROGRESS UPDATE =====
function updateProgress(checkbox, lessonIndex) {
    const checkboxes = document.querySelectorAll('.lesson-check');
    const total = checkboxes.length;
    let completedCount = 0;

    checkboxes.forEach(cb => { if (cb.checked) completedCount++; });
    const pct = Math.round((completedCount / total) * 100);

    if (document.getElementById('detail-pct')) document.getElementById('detail-pct').textContent = pct + '%';
    if (document.getElementById('detail-bar')) document.getElementById('detail-bar').style.width = pct + '%';

    const currentCourse = getCurrentCourse();
    if (currentCourse) {
        let enrolled = getEnrolledCourses();
        let course = enrolled.find(c => c.name === currentCourse.name);

        if (course) {
            course.progress = pct;
            course.completed = completedCount;
            course.checkboxStates = Array.from(checkboxes).map(cb => cb.checked);
            setEnrolledCourses(enrolled);
            setCurrentCourse(course);
        }

        if (pct === 100) {
            setTimeout(() => {
                if (confirm(`🎉 Congratulations! You finished ${currentCourse.name}! View your certificate`)) {
                    window.location.href = '/certificate';
                }
            }, 500);
        }
    }
}

// ===== LOAD COURSE DETAIL PAGE =====
function loadCourseDetail() {
    const current = getCurrentCourse();
    if (!current || !document.getElementById('detail-title')) return;

    document.getElementById('detail-title').textContent = current.name;

    if (document.getElementById('detail-category')) {
        document.getElementById('detail-category').textContent = current.category || 'Professional Track';
    }
    if (document.getElementById('detail-duration')) {
        document.getElementById('detail-duration').textContent = '⏱ ' + (current.duration || 'Flexible');
    }

    const videoFrame = document.getElementById('course-video');
    if (videoFrame && current.video) {
        videoFrame.src = current.video;
    }

    const container = document.getElementById('lessons-container');
    if (container) {
        let html = '';
        for (let i = 0; i < current.total; i++) {
            const isChecked = current.checkboxStates && current.checkboxStates[i];
            html += `
            <div class="lesson-item ${isChecked ? 'lesson-done' : ''}" style="display:flex; align-items:center; background:white; padding:18px; border-radius:12px; margin-bottom:12px; border:1px solid #edf2f7;">
                <input type="checkbox" class="lesson-check" ${isChecked ? 'checked' : ''} onchange="updateProgress(this, ${i})" style="width:20px; height:20px; margin-right:15px; cursor:pointer; accent-color:#f5a623;">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:600; color:#2d3748;">Lesson ${i + 1}</span>
                    <span style="font-size:12px; color:#a0aec0;">Core Concepts & Practice</span>
                </div>
            </div>`;
        }
        container.innerHTML = html;
    }

    if (current.progress !== undefined) {
        if (document.getElementById('detail-bar')) document.getElementById('detail-bar').style.width = current.progress + '%';
        if (document.getElementById('detail-pct')) document.getElementById('detail-pct').textContent = current.progress + '%';
    }
}

// ===== NAVBAR USER UPDATE =====
let _navbarDone = false;

function updateNavbar() {
    if (_navbarDone) return;
    _navbarDone = true;

    const user = JSON.parse(localStorage.getItem('skilloLoggedIn'));

    const adminLinks = document.querySelectorAll('a[href="/admin"]');
    adminLinks.forEach(link => {
        link.style.display = (user && user.role === 'admin') ? 'inline' : 'none';
    });

    const cta = document.querySelector('.nav-cta');
    if (!cta) return;

    if (!user) {
        cta.style.display = 'inline-block';
        return;
    }

    const userDisplay = document.createElement('div');
    userDisplay.className = 'nav-user';
    userDisplay.style.cssText = 'display:flex; align-items:center; gap:10px;';
    userDisplay.innerHTML = `
        <button class="nav-cta" style="background:#f5a623; color:#0d1b35; border:none; padding:10px 20px; border-radius:20px; font-weight:800; cursor:pointer;">
            👋 ${user.name.split(' ')[0]}
        </button>
        <button onclick="logoutUser()" style="background:transparent; color:#f5a623; border:1.5px solid #f5a623; padding:9px 16px; border-radius:20px; font-size:13px; font-weight:700; cursor:pointer;">
            Logout
        </button>
    `;
    cta.replaceWith(userDisplay);
}

function logoutUser() {
    localStorage.removeItem('skilloLoggedIn');
    window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', () => {
    loadCourseDetail();
    updateNavbar();
});
