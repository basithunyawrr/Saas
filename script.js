/* =========================================
   EDUFLOW PHASE 1
   Lightweight frontend application
========================================= */

const appState = {
    currentPage: localStorage.getItem("eduFlowPage") || "dashboard",
    darkMode: localStorage.getItem("eduFlowDark") === "true",
    notifications: true
};

const courses = [
    {
        id: 1,
        title: "Web Development",
        description: "HTML, CSS & JavaScript",
        instructor: "Sarah Johnson",
        progress: 72,
        lessons: 42,
        completed: 30,
        icon: "💻",
        color: ""
    },
    {
        id: 2,
        title: "Data Analytics",
        description: "Excel, SQL & Visualization",
        instructor: "Michael Chen",
        progress: 48,
        lessons: 36,
        completed: 17,
        icon: "📊",
        color: "orange"
    },
    {
        id: 3,
        title: "Artificial Intelligence",
        description: "AI Fundamentals",
        instructor: "Dr. Emily Davis",
        progress: 31,
        lessons: 40,
        completed: 12,
        icon: "🧠",
        color: "green"
    },
    {
        id: 4,
        title: "UI/UX Design",
        description: "Design Principles & Figma",
        instructor: "Alex Morgan",
        progress: 64,
        lessons: 30,
        completed: 19,
        icon: "🎨",
        color: "blue"
    },
    {
        id: 5,
        title: "Business Management",
        description: "Strategy & Leadership",
        instructor: "James Wilson",
        progress: 25,
        lessons: 28,
        completed: 7,
        icon: "💼",
        color: "pink"
    },
    {
        id: 6,
        title: "English Communication",
        description: "Writing & Communication",
        instructor: "Emma Williams",
        progress: 85,
        lessons: 24,
        completed: 20,
        icon: "📚",
        color: "dark"
    }
];

const assignments = [
    {
        id: 1,
        title: "JavaScript Project",
        course: "Web Development",
        due: "Tomorrow",
        date: "Aug 24",
        status: "pending",
        icon: "💻"
    },
    {
        id: 2,
        title: "Statistics Quiz",
        course: "Data Analytics",
        due: "In 3 days",
        date: "Aug 26",
        status: "pending",
        icon: "📊"
    },
    {
        id: 3,
        title: "AI Research Paper",
        course: "Artificial Intelligence",
        due: "Next week",
        date: "Aug 30",
        status: "pending",
        icon: "🧠"
    },
    {
        id: 4,
        title: "Figma Landing Page",
        course: "UI/UX Design",
        due: "Completed",
        date: "Aug 20",
        status: "completed",
        icon: "🎨"
    },
    {
        id: 5,
        title: "Business Case Study",
        course: "Business Management",
        due: "Overdue",
        date: "Aug 18",
        status: "overdue",
        icon: "💼"
    }
];

const grades = [
    {
        course: "Web Development",
        assignment: "JavaScript Project",
        grade: 92,
        feedback: "Excellent"
    },
    {
        course: "Data Analytics",
        assignment: "Excel Assessment",
        grade: 88,
        feedback: "Very Good"
    },
    {
        course: "Artificial Intelligence",
        assignment: "AI Fundamentals",
        grade: 81,
        feedback: "Good"
    },
    {
        course: "UI/UX Design",
        assignment: "Design Challenge",
        grade: 95,
        feedback: "Excellent"
    },
    {
        course: "Business Management",
        assignment: "Case Study",
        grade: 74,
        feedback: "Good"
    }
];

const messages = [
    {
        name: "Sarah Johnson",
        initials: "SJ",
        message: "Your JavaScript project is looking great. Don't forget to submit it.",
        time: "10 min ago"
    },
    {
        name: "Michael Chen",
        initials: "MC",
        message: "The new statistics resources are now available.",
        time: "1 hour ago"
    },
    {
        name: "EduFlow",
        initials: "EF",
        message: "Your weekly learning report is ready.",
        time: "Yesterday"
    },
    {
        name: "Emily Davis",
        initials: "ED",
        message: "Reminder: AI class starts at 10:00 AM tomorrow.",
        time: "Yesterday"
    }
];

const pageNames = {
    dashboard: "Dashboard",
    courses: "My Courses",
    assignments: "Assignments",
    grades: "Grades",
    calendar: "Calendar",
    messages: "Messages",
    profile: "Profile",
    settings: "Settings"
};

const pageContent = document.getElementById("pageContent");
const breadcrumb = document.getElementById("breadcrumb");
const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");
const toast = document.getElementById("toast");

document.addEventListener("DOMContentLoaded", () => {

    if (appState.darkMode) {
        document.body.classList.add("dark");
    }

    navigate(appState.currentPage);

    setupNavigation();
    setupSearch();
    setupMobileMenu();
    setupModal();

    document
        .getElementById("notificationBtn")
        .addEventListener("click", showNotifications);

    document
        .getElementById("logoutBtn")
        .addEventListener("click", () => {
            showToast("Demo logout clicked");
        });
});


/* =========================================
   NAVIGATION
========================================= */

function setupNavigation() {

    document.addEventListener("click", event => {

        const navButton = event.target.closest("[data-page]");

        if (!navButton) return;

        const page = navButton.dataset.page;

        if (page) {
            navigate(page);
            closeMobileMenu();
        }
    });
}


function navigate(page) {

    if (!pageContent) return;

    if (!pageNames[page]) {
        page = "dashboard";
    }

    appState.currentPage = page;

    localStorage.setItem("eduFlowPage", page);

    breadcrumb.textContent = pageNames[page];

    document.querySelectorAll(".nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    switch (page) {

        case "dashboard":
            renderDashboard();
            break;

        case "courses":
            renderCourses();
            break;

        case "assignments":
            renderAssignments();
            break;

        case "grades":
            renderGrades();
            break;

        case "calendar":
            renderCalendar();
            break;

        case "messages":
            renderMessages();
            break;

        case "profile":
            renderProfile();
            break;

        case "settings":
            renderSettings();
            break;

        default:
            renderDashboard();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   DASHBOARD
========================================= */

function renderDashboard() {

    pageContent.innerHTML = `

        <div class="page-heading">
            <div class="page-heading-row">
                <div>
                    <h1>Good evening, Abdul 👋</h1>
                    <p>Here's what's happening with your learning today.</p>
                </div>

                <button class="primary-button"
                    onclick="navigate('courses')">
                    Explore Courses
                </button>
            </div>
        </div>

        <section class="stats">

            ${statCard("▣", "Active Courses", "6", "Currently learning")}
            ${statCard("✓", "Completed", "24", "Lessons completed")}
            ${statCard("📝", "Assignments", "8", "4 need attention")}
            ${statCard("★", "Average Grade", "87%", "↑ 4% this month")}

        </section>

        <section class="dashboard-grid">

            <div class="card">

                <div class="card-header">
                    <div>
                        <h2>Continue Learning</h2>
                        <p>Pick up where you left off.</p>
                    </div>

                    <button class="text-button"
                        onclick="navigate('courses')">
                        View all
                    </button>
                </div>

                <div class="course-list">

                    ${courses
                        .slice(0, 3)
                        .map(courseRow)
                        .join("")}

                </div>

            </div>


            <div class="card">

                <div class="card-header">
                    <div>
                        <h2>Upcoming</h2>
                        <p>Your next deadlines.</p>
                    </div>

                    <button class="text-button"
                        onclick="navigate('assignments')">
                        View all
                    </button>
                </div>

                <div class="upcoming-list">

                    ${assignments
                        .slice(0, 3)
                        .map(upcomingItem)
                        .join("")}

                </div>

            </div>

        </section>
    `;
}


function statCard(icon, label, value, note) {

    return `
        <div class="stat-card">

            <div class="stat-top">

                <span class="stat-label">${label}</span>

                <div class="stat-icon">
                    ${icon}
                </div>

            </div>

            <h2>${value}</h2>

            <small class="${note.includes("↑") ? "stat-up" : ""}">
                ${note}
            </small>

        </div>
    `;
}


function courseRow(course) {

    return `
        <div class="course-row">

            <div class="course-icon">
                ${course.icon}
            </div>

            <div class="course-info">

                <h3>${course.title}</h3>

                <p>${course.description}</p>

                <div class="progress-line">
                    <div
                        class="progress-fill"
                        style="width:${course.progress}%">
                    </div>
                </div>

                <span class="course-percent">
                    ${course.progress}% complete
                </span>

            </div>

            <button
                class="continue-btn"
                onclick="openCourse(${course.id})">
                Continue
            </button>

        </div>
    `;
}


function upcomingItem(item) {

    const parts = item.date.split(" ");

    return `
        <div class="upcoming-item">

            <div class="date-box">
                <strong>${parts[1]}</strong>
                <span>${parts[0]}</span>
            </div>

            <div class="upcoming-info">

                <h3>${item.title}</h3>

                <p>${item.course}</p>

                <span class="due">
                    ${item.due}
                </span>

            </div>

        </div>
    `;
}


/* =========================================
   COURSES
========================================= */

function renderCourses() {

    pageContent.innerHTML = `

        <div class="page-heading">

            <div class="page-heading-row">

                <div>
                    <h1>My Courses</h1>
                    <p>Manage and continue your learning journey.</p>
                </div>

                <button
                    class="primary-button"
                    onclick="showToast('Course discovery coming soon')">
                    + Find Courses
                </button>

            </div>

        </div>

        <div class="page-grid">

            ${courses.map(course => `

                <div class="card course-card">

                    <div class="course-cover ${course.color}">

                        <div class="course-cover-icon">
                            ${course.icon}
                        </div>

                        <small>
                            ${course.lessons} lessons
                        </small>

                    </div>

                    <div class="course-card-body">

                        <h3>${course.title}</h3>

                        <p>${course.description}</p>

                        <div class="progress-line">
                            <div
                                class="progress-fill"
                                style="width:${course.progress}%">
                            </div>
                        </div>

                        <div class="course-card-footer">

                            <span>
                                ${course.completed}/${course.lessons}
                                lessons
                            </span>

                            <button
                                class="text-button"
                                onclick="openCourse(${course.id})">
                                Continue →
                            </button>

                        </div>

                    </div>

                </div>

            `).join("")}

        </div>
    `;
}


function openCourse(id) {

    const course = courses.find(item => item.id === id);

    if (!course) return;

    openModal(`
        <h2>${course.icon} ${course.title}</h2>

        <p>
            ${course.description}
        </p>

        <div style="margin-top:20px">

            <strong>Instructor</strong>

            <p>
                ${course.instructor}
            </p>

        </div>

        <div style="margin-top:20px">

            <strong>Course Progress</strong>

            <div class="progress-line">
                <div
                    class="progress-fill"
                    style="width:${course.progress}%">
                </div>
            </div>

            <p>
                ${course.progress}% complete —
                ${course.completed} of ${course.lessons} lessons completed.
            </p>

        </div>

        <div style="margin-top:25px">

            <button
                class="primary-button"
                onclick="closeModal(); showToast('Lesson opened')">
                Start Next Lesson
            </button>

        </div>
    `);
}


/* =========================================
   ASSIGNMENTS
========================================= */

function renderAssignments() {

    pageContent.innerHTML = `

        <div class="page-heading">

            <div class="page-heading-row">

                <div>
                    <h1>Assignments</h1>
                    <p>Stay on top of your coursework and deadlines.</p>
                </div>

                <button
                    class="primary-button"
                    onclick="showToast('Assignment creation is for teachers')">
                    + New Assignment
                </button>

            </div>

        </div>

        <div class="assignment-list">

            ${assignments.map(item => `

                <div class="assignment-card">

                    <div class="assignment-icon">
                        ${item.icon}
                    </div>

                    <div class="assignment-info">

                        <h3>${item.title}</h3>

                        <p>${item.course}</p>

                    </div>

                    <div class="assignment-date">

                        <strong>${item.date}</strong>

                        <span>${item.due}</span>

                    </div>

                    <span class="status ${item.status}">
                        ${capitalize(item.status)}
                    </span>

                    <button
                        class="secondary-button"
                        onclick="openAssignment(${item.id})">
                        ${item.status === "completed"
                            ? "Review"
                            : "Open"}
                    </button>

                </div>

            `).join("")}

        </div>
    `;
}


function openAssignment(id) {

    const item = assignments.find(a => a.id === id);

    if (!item) return;

    openModal(`
        <h2>${item.icon} ${item.title}</h2>

        <p>
            Course: <strong>${item.course}</strong>
        </p>

        <p style="margin-top:10px">
            Due date: <strong>${item.date}</strong>
        </p>

        <div style="margin-top:20px">

            <p>
                This is a Phase 1 demo assignment.
                The real submission system will be connected
                when we build the backend.
            </p>

        </div>

        <div style="margin-top:25px">

            <button
                class="primary-button"
                onclick="closeModal(); showToast('Assignment opened')">
                ${item.status === "completed"
                    ? "View Submission"
                    : "Start Assignment"}
            </button>

        </div>
    `);
}


/* =========================================
   GRADES
========================================= */

function renderGrades() {

    const average = Math.round(
        grades.reduce((sum, item) => sum + item.grade, 0) /
        grades.length
    );

    pageContent.innerHTML = `

        <div class="page-heading">

            <div>
                <h1>Grades</h1>
                <p>Track your academic performance.</p>
            </div>

        </div>

        <section class="stats">

            ${statCard("★", "Overall Average", `${average}%`, "Strong performance")}
            ${statCard("🏆", "Highest Grade", "95%", "UI/UX Design")}
            ${statCard("📈", "Improvement", "+4%", "Compared to last month")}
            ${statCard("✓", "Graded Work", "5", "Assignments")}

        </section>

        <div class="card table-card">

            <div class="card-header">

                <div>
                    <h2>Recent Grades</h2>
                    <p>Your latest assessed work.</p>
                </div>

            </div>

            <div class="table-wrap">

                <table>

                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Assignment</th>
                            <th>Grade</th>
                            <th>Feedback</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${grades.map(item => `

                            <tr>

                                <td>${item.course}</td>

                                <td>${item.assignment}</td>

                                <td>
                                    <span class="grade ${
                                        item.grade >= 85
                                            ? "good"
                                            : item.grade >= 70
                                            ? "average"
                                            : "low"
                                    }">
                                        ${item.grade}%
                                    </span>
                                </td>

                                <td>${item.feedback}</td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        </div>
    `;
}


/* =========================================
   CALENDAR
========================================= */

function renderCalendar() {

    pageContent.innerHTML = `

        <div class="page-heading">

            <div>
                <h1>Calendar</h1>
                <p>Keep track of classes, deadlines and events.</p>
            </div>

        </div>

        <div class="card calendar-card">

            <div class="calendar-header">

                <h2>August 2026</h2>

                <div class="calendar-controls">

                    <button onclick="showToast('Previous month')">
                        ‹
                    </button>

                    <button onclick="showToast('Today')">
                        •
                    </button>

                    <button onclick="showToast('Next month')">
                        ›
                    </button>

                </div>

            </div>

            ${calendarMarkup()}

        </div>
    `;
}


function calendarMarkup() {

    const days = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];

    let html = `<div class="calendar-grid">`;

    days.forEach(day => {
        html += `
            <div class="calendar-day-name">
                ${day}
            </div>
        `;
    });

    const firstDay = 6;
    const totalDays = 31;

    for (let i = 0; i < firstDay; i++) {

        html += `
            <div class="calendar-day muted"></div>
        `;
    }

    for (let day = 1; day <= totalDays; day++) {

        const today = day === 23;

        let event = "";

        if (day === 24) {
            event = "JavaScript Project";
        }

        if (day === 26) {
            event = "Statistics Quiz";
        }

        if (day === 30) {
            event = "AI Paper";
        }

        html += `
            <div class="calendar-day ${today ? "today" : ""}">

                <span>${day}</span>

                ${
                    event
                        ? `<div class="calendar-event">${event}</div>`
                        : ""
                }

            </div>
        `;
    }

    html += `</div>`;

    return html;
}


/* =========================================
   MESSAGES
========================================= */

function renderMessages() {

    pageContent.innerHTML = `

        <div class="page-heading">

            <div>
                <h1>Messages</h1>
                <p>Communicate with your instructors and EduFlow.</p>
            </div>

        </div>

        <div class="message-list">

            ${messages.map((message, index) => `

                <div
                    class="message-card"
                    onclick="openMessage(${index})">

                    <div class="avatar">
                        ${message.initials}
                    </div>

                    <div class="message-info">

                        <h3>${message.name}</h3>

                        <p>${message.message}</p>

                    </div>

                    <span class="message-time">
                        ${message.time}
                    </span>

                </div>

            `).join("")}

        </div>
    `;
}


function openMessage(index) {

    const message = messages[index];

    if (!message) return;

    openModal(`
        <h2>${message.name}</h2>

        <p style="margin-top:15px">
            ${message.message}
        </p>

        <div style="margin-top:25px">

            <button
                class="primary-button"
                onclick="closeModal()">
                Reply
            </button>

        </div>
    `);
}


/* =========================================
   PROFILE
========================================= */

function renderProfile() {

    pageContent.innerHTML = `

        <div class="page-heading">

            <div>
                <h1>Profile</h1>
                <p>Manage your student information.</p>
            </div>

        </div>

        <div class="profile-grid">

            <div class="card profile-card">

                <div class="profile-large">
                    AB
                </div>

                <h2>Abdul Basit</h2>

                <p>Student</p>

                <div class="info-list">

                    <div class="info-row">
                        <span>Email</span>
                        <strong>student@eduflow.demo</strong>
                    </div>

                    <div class="info-row">
                        <span>Member since</span>
                        <strong>August 2026</strong>
                    </div>

                    <div class="info-row">
                        <span>Courses</span>
                        <strong>6 active</strong>
                    </div>

                </div>

            </div>


            <div class="card form-card">

                <h2>Personal Information</h2>

                <form id="profileForm">

                    <div class="form-grid">

                        <div class="form-group">

                            <label>First Name</label>

                            <input
                                type="text"
                                value="Abdul"
                                required>

                        </div>

                        <div class="form-group">

                            <label>Last Name</label>

                            <input
                                type="text"
                                value="Basit"
                                required>

                        </div>

                        <div class="form-group">

                            <label>Email</label>

                            <input
                                type="email"
                                value="student@eduflow.demo"
                                required>

                        </div>

                        <div class="form-group">

                            <label>Phone</label>

                            <input
                                type="tel"
                                value="+92 300 0000000">

                        </div>

                        <div class="form-group full">

                            <label>Bio</label>

                            <textarea>Student learning technology, business and data.</textarea>

                        </div>

                    </div>

                    <div class="form-actions">

                        <button
                            type="submit"
                            class="primary-button">
                            Save Changes
                        </button>

                    </div>

                </form>

            </div>

        </div>
    `;

    document
        .getElementById("profileForm")
        .addEventListener("submit", event => {

            event.preventDefault();

            showToast("Profile saved successfully");
        });
}


/* =========================================
   SETTINGS
========================================= */

function renderSettings() {

    pageContent.innerHTML = `

        <div class="page-heading">

            <div>
                <h1>Settings</h1>
                <p>Customize your EduFlow experience.</p>
            </div>

        </div>

        <div class="card form-card">

            <h2>Preferences</h2>

            <div class="settings-list">

                <div class="setting-row">

                    <div class="setting-info">

                        <h3>Dark Mode</h3>

                        <p>
                            Use a darker appearance across EduFlow.
                        </p>

                    </div>

                    <button
                        id="darkToggle"
                        class="toggle ${appState.darkMode ? "active" : ""}">
                    </button>

                </div>


                <div class="setting-row">

                    <div class="setting-info">

                        <h3>Email Notifications</h3>

                        <p>
                            Receive updates about assignments and grades.
                        </p>

                    </div>

                    <button
                        id="emailToggle"
                        class="toggle active">
                    </button>

                </div>


                <div class="setting-row">

                    <div class="setting-info">

                        <h3>Assignment Reminders</h3>

                        <p>
                            Get reminders before deadlines.
                        </p>

                    </div>

                    <button
                        id="reminderToggle"
                        class="toggle active">
                    </button>

                </div>

            </div>

        </div>

    `;

    document
        .getElementById("darkToggle")
        .addEventListener("click", toggleDarkMode);

    document
        .getElementById("emailToggle")
        .addEventListener("click", toggleElement);

    document
        .getElementById("reminderToggle")
        .addEventListener("click", toggleElement);
}


function toggleDarkMode() {

    appState.darkMode = !appState.darkMode;

    document.body.classList.toggle(
        "dark",
        appState.darkMode
    );

    localStorage.setItem(
        "eduFlowDark",
        appState.darkMode
    );

    renderSettings();

    showToast(
        appState.darkMode
            ? "Dark mode enabled"
            : "Dark mode disabled"
    );
}


function toggleElement(event) {

    event.currentTarget.classList.toggle("active");

    showToast("Setting updated");
}


/* =========================================
   SEARCH
========================================= */

function setupSearch() {

    const search = document.getElementById("globalSearch");

    search.addEventListener("input", event => {

        const query = event.target.value
            .trim()
            .toLowerCase();

        if (!query) return;

        const foundCourse = courses.find(course =>
            course.title.toLowerCase().includes(query) ||
            course.description.toLowerCase().includes(query)
        );

        const foundAssignment = assignments.find(item =>
            item.title.toLowerCase().includes(query) ||
            item.course.toLowerCase().includes(query)
        );

        if (foundCourse) {

            showToast(`Course found: ${foundCourse.title}`);

        } else if (foundAssignment) {

            showToast(`Assignment found: ${foundAssignment.title}`);

        }
    });

    document.addEventListener("keydown", event => {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            search.focus();
        }
    });
}


/* =========================================
   NOTIFICATIONS
========================================= */

function showNotifications() {

    openModal(`

        <h2>Notifications</h2>

        <div style="margin-top:20px">

            <div class="message-card">

                <div class="assignment-icon">
                    📝
                </div>

                <div class="message-info">

                    <h3>Assignment due tomorrow</h3>

                    <p>
                        JavaScript Project needs your attention.
                    </p>

                </div>

            </div>

            <div class="message-card" style="margin-top:10px">

                <div class="assignment-icon">
                    🎉
                </div>

                <div class="message-info">

                    <h3>Great progress!</h3>

                    <p>
                        You completed 5 lessons this week.
                    </p>

                </div>

            </div>

            <div class="message-card" style="margin-top:10px">

                <div class="assignment-icon">
                    📊
                </div>

                <div class="message-info">

                    <h3>New grade available</h3>

                    <p>
                        Your UI/UX Design grade is 95%.
                    </p>

                </div>

            </div>

        </div>

    `);
}


/* =========================================
   MOBILE
========================================= */

function setupMobileMenu() {

    const menu = document.getElementById("mobileMenu");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("mobileOverlay");

    menu.addEventListener("click", () => {

        sidebar.classList.toggle("open");
        overlay.classList.toggle("show");

    });

    overlay.addEventListener("click", closeMobileMenu);
}


function closeMobileMenu() {

    document
        .querySelector(".sidebar")
        .classList.remove("open");

    document
        .getElementById("mobileOverlay")
        .classList.remove("show");
}


/* =========================================
   MODALS
========================================= */

function setupModal() {

    document
        .getElementById("modalClose")
        .addEventListener("click", closeModal);

    modalOverlay.addEventListener("click", event => {

        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeModal();
        }
    });
}


function openModal(content) {

    modalContent.innerHTML = content;

    modalOverlay.classList.add("show");
}


function closeModal() {

    modalOverlay.classList.remove("show");
}


/* =========================================
   TOAST
========================================= */

let toastTimer;

function showToast(message) {

    clearTimeout(toastTimer);

    toast.textContent = message;

    toast.classList.add("show");

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


/* =========================================
   HELPERS
========================================= */

function capitalize(value) {

    return value.charAt(0).toUpperCase() +
        value.slice(1);
}