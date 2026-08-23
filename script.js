import { supabase } from "./supabase.js";

console.log("EduFlow Supabase connected:", supabase);

/* =========================================
   EDUFLOW PHASE 2
========================================= */

const defaultState = {
    page: "dashboard",
    dark: false,

    user: {
        firstName: "Abdul",
        lastName: "Basit",
        email: "student@eduflow.demo",
        phone: "+92 300 0000000",
        bio: "Student learning technology, business and data."
    },

    completedLessons: [],

    submittedAssignments: [],

    notifications: [
        {
            title: "Assignment due tomorrow",
            text: "JavaScript Project needs your attention.",
            read: false
        },
        {
            title: "Great progress!",
            text: "You completed 5 lessons this week.",
            read: false
        },
        {
            title: "New grade available",
            text: "Your UI/UX Design grade is 95%.",
            read: false
        }
    ]
};

const savedState =
    JSON.parse(localStorage.getItem("eduflowState"));

const state = savedState || defaultState;

const courses = [
    {
        id: 1,
        title: "Web Development",
        description: "HTML, CSS & JavaScript",
        instructor: "Sarah Johnson",
        icon: "💻",
        progress: 72,
        lessons: [
            "HTML Fundamentals",
            "CSS Layouts",
            "Responsive Design",
            "JavaScript Basics",
            "DOM Manipulation",
            "JavaScript Project"
        ]
    },
    {
        id: 2,
        title: "Data Analytics",
        description: "Excel, SQL & Visualization",
        instructor: "Michael Chen",
        icon: "📊",
        progress: 48,
        lessons: [
            "Data Fundamentals",
            "Excel Basics",
            "Advanced Excel",
            "SQL Introduction",
            "Data Cleaning",
            "Visualization"
        ]
    },
    {
        id: 3,
        title: "Artificial Intelligence",
        description: "AI Fundamentals",
        instructor: "Dr. Emily Davis",
        icon: "🧠",
        progress: 31,
        lessons: [
            "Introduction to AI",
            "Machine Learning",
            "Neural Networks",
            "Training Models",
            "AI Applications",
            "AI Research"
        ]
    },
    {
        id: 4,
        title: "UI/UX Design",
        description: "Design Principles & Figma",
        instructor: "Alex Morgan",
        icon: "🎨",
        progress: 64,
        lessons: [
            "Design Principles",
            "Color Theory",
            "Typography",
            "Wireframing",
            "Figma Basics",
            "Design Challenge"
        ]
    },
    {
        id: 5,
        title: "Business Management",
        description: "Strategy & Leadership",
        instructor: "James Wilson",
        icon: "💼",
        progress: 25,
        lessons: [
            "Business Basics",
            "Strategy",
            "Leadership",
            "Operations",
            "Marketing",
            "Case Study"
        ]
    },
    {
        id: 6,
        title: "English Communication",
        description: "Writing & Communication",
        instructor: "Emma Williams",
        icon: "📚",
        progress: 85,
        lessons: [
            "Grammar",
            "Professional Writing",
            "Presentations",
            "Communication",
            "Reports",
            "Final Assessment"
        ]
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

const pageContent =
    document.getElementById("pageContent");

const breadcrumb =
    document.getElementById("breadcrumb");

const modalOverlay =
    document.getElementById("modalOverlay");

const modalContent =
    document.getElementById("modalContent");

const toast =
    document.getElementById("toast");

let toastTimer;

document.addEventListener("DOMContentLoaded", () => {

    applyTheme();

    updateUserUI();

    navigate(state.page);

    setupNavigation();

    setupSearch();

    setupMobileMenu();

    setupModal();

    document
        .getElementById("notificationBtn")
        .addEventListener(
            "click",
            showNotifications
        );

    document
        .getElementById("logoutBtn")
        .addEventListener(
            "click",
            () => {
                showToast(
                    "Demo logout — real authentication comes in Phase 3."
                );
            }
        );
});


function saveState() {

    localStorage.setItem(
        "eduflowState",
        JSON.stringify(state)
    );
}


function setupNavigation() {

    document.addEventListener("click", event => {

        const button =
            event.target.closest("[data-page]");

        if (!button) return;

        navigate(button.dataset.page);

        closeMobileMenu();
    });
}


function navigate(page) {

    if (!pageNames[page]) {
        page = "dashboard";
    }

    state.page = page;

    saveState();

    breadcrumb.textContent =
        pageNames[page];

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === page
            );

        });

    const renderers = {
        dashboard: renderDashboard,
        courses: renderCourses,
        assignments: renderAssignments,
        grades: renderGrades,
        calendar: renderCalendar,
        messages: renderMessages,
        profile: renderProfile,
        settings: renderSettings
    };

    renderers[page]();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   DASHBOARD
========================================= */

function renderDashboard() {

    const completed =
        state.completedLessons.length;

    const average =
        Math.round(
            grades.reduce(
                (sum, item) =>
                    sum + item.grade,
                0
            ) / grades.length
        );

    pageContent.innerHTML = `

        <div class="page-heading">

            <div class="page-heading-row">

                <div>
                    <h1>
                        Good evening,
                        ${state.user.firstName} 👋
                    </h1>

                    <p>
                        Here's what's happening
                        with your learning today.
                    </p>
                </div>

                <button
                    class="primary-button"
                    onclick="navigate('courses')">
                    Explore Courses
                </button>

            </div>

        </div>

        <div class="hero-card">

            <div>

                <h2>
                    Keep your learning streak alive 🔥
                </h2>

                <p>
                    You've completed
                    ${completed}
                    lesson${completed === 1 ? "" : "s"}
                    in this session.
                </p>

            </div>

            <button
                class="primary-button"
                onclick="continueLearning()">
                Continue Learning →
            </button>

        </div>

        <section class="stats">

            ${statCard(
                "▣",
                "Active Courses",
                "6",
                "Currently learning"
            )}

            ${statCard(
                "✓",
                "Completed",
                "24",
                "Lessons completed"
            )}

            ${statCard(
                "📝",
                "Assignments",
                "8",
                "4 need attention"
            )}

            ${statCard(
                "★",
                "Average Grade",
                `${average}%`,
                "↑ 4% this month"
            )}

        </section>

        <div class="quick-actions">

            <button
                class="quick-action"
                onclick="navigate('courses')">

                <div class="quick-action-icon">
                    📚
                </div>

                <div>
                    <strong>Browse Courses</strong>
                    <span>Continue studying</span>
                </div>

            </button>

            <button
                class="quick-action"
                onclick="navigate('assignments')">

                <div class="quick-action-icon">
                    ✓
                </div>

                <div>
                    <strong>Assignments</strong>
                    <span>View your tasks</span>
                </div>

            </button>

            <button
                class="quick-action"
                onclick="navigate('grades')">

                <div class="quick-action-icon">
                    ★
                </div>

                <div>
                    <strong>My Grades</strong>
                    <span>Check performance</span>
                </div>

            </button>

            <button
                class="quick-action"
                onclick="navigate('calendar')">

                <div class="quick-action-icon">
                    □
                </div>

                <div>
                    <strong>Calendar</strong>
                    <span>See upcoming events</span>
                </div>

            </button>

        </div>

        <section class="dashboard-grid">

            <div class="card">

                <div class="card-header">

                    <div>
                        <h2>Continue Learning</h2>
                        <p>
                            Pick up where you left off.
                        </p>
                    </div>

                    <button
                        class="text-button"
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
                        <p>
                            Your next deadlines.
                        </p>
                    </div>

                    <button
                        class="text-button"
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


function continueLearning() {

    const course = courses[0];

    openCourse(course.id);
}


function statCard(
    icon,
    label,
    value,
    note
) {

    return `
        <div class="stat-card">

            <div class="stat-top">

                <span class="stat-label">
                    ${label}
                </span>

                <div class="stat-icon">
                    ${icon}
                </div>

            </div>

            <h2>${value}</h2>

            <small>
                ${note}
            </small>

        </div>
    `;
}


function courseRow(course) {

    const progress =
        calculateProgress(course);

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
                        style="width:${progress}%">
                    </div>

                </div>

                <span class="course-percent">
                    ${progress}% complete
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


function calculateProgress(course) {

    const extra =
        state.completedLessons.filter(
            id => id.startsWith(`${course.id}-`)
        ).length;

    const base =
        course.progress;

    return Math.min(
        100,
        base + extra * 4
    );
}


function upcomingItem(item) {

    const parts =
        item.date.split(" ");

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

                    <p>
                        Manage and continue
                        your learning journey.
                    </p>
                </div>

                <button
                    class="primary-button"
                    onclick="showToast('Course discovery will connect to the backend in Phase 3.')">
                    + Find Courses
                </button>

            </div>

        </div>

        <div class="page-grid">

            ${courses.map(course => {

                const progress =
                    calculateProgress(course);

                return `

                    <div
                        class="card course-card">

                        <div
                            class="course-cover">

                            <div
                                class="course-cover-icon">
                                ${course.icon}
                            </div>

                            <small>
                                ${course.lessons.length}
                                lessons
                            </small>

                        </div>

                        <div
                            class="course-card-body">

                            <h3>
                                ${course.title}
                            </h3>

                            <p>
                                ${course.description}
                            </p>

                            <div
                                class="progress-line">

                                <div
                                    class="progress-fill"
                                    style="width:${progress}%">
                                </div>

                            </div>

                            <div
                                class="course-card-footer">

                                <span>
                                    ${progress}% complete
                                </span>

                                <button
                                    class="text-button"
                                    onclick="openCourse(${course.id})">
                                    Open →
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }).join("")}

        </div>
    `;
}


function openCourse(id) {

    const course =
        courses.find(
            item => item.id === id
        );

    if (!course) return;

    const progress =
        calculateProgress(course);

    modalContent.innerHTML = `

        <h2>
            ${course.icon}
            ${course.title}
        </h2>

        <p>
            ${course.description}
        </p>

        <p style="margin-top:7px">
            Instructor:
            <strong>${course.instructor}</strong>
        </p>

        <div style="margin-top:20px">

            <strong>
                Course Progress — ${progress}%
            </strong>

            <div
                class="progress-line">

                <div
                    class="progress-fill"
                    style="width:${progress}%">
                </div>

            </div>

        </div>

        <div class="lesson-list">

            ${course.lessons
                .map(
                    (lesson, index) =>
                        lessonItem(
                            course,
                            lesson,
                            index
                        )
                )
                .join("")}

        </div>

    `;

    modalOverlay.classList.add("show");
}


function lessonItem(
    course,
    lesson,
    index
) {

    const id =
        `${course.id}-${index}`;

    const done =
        state.completedLessons.includes(id);

    return `

        <div class="lesson-item">

            <div class="lesson-number">
                ${index + 1}
            </div>

            <div class="lesson-info">

                <strong>
                    ${lesson}
                </strong>

                <span>
                    Lesson ${index + 1}
                </span>

            </div>

            <button
                class="lesson-check ${done ? "done" : ""}"
                onclick="toggleLesson(
                    '${course.id}',
                    '${index}'
                )">

                ${done ? "✓" : "○"}

            </button>

        </div>
    `;
}


function toggleLesson(
    courseId,
    lessonIndex
) {

    const id =
        `${courseId}-${lessonIndex}`;

    const index =
        state.completedLessons.indexOf(id);

    if (index >= 0) {

        state.completedLessons.splice(
            index,
            1
        );

        showToast(
            "Lesson marked incomplete"
        );

    } else {

        state.completedLessons.push(id);

        showToast(
            "Lesson completed ✓"
        );
    }

    saveState();

    const course =
        courses.find(
            item => item.id == courseId
        );

    openCourse(course.id);
}


/* =========================================
   ASSIGNMENTS
========================================= */

function renderAssignments() {

    pageContent.innerHTML = `

        <div class="page-heading">

            <div>
                <h1>Assignments</h1>

                <p>
                    Stay on top of your coursework
                    and deadlines.
                </p>
            </div>

        </div>

        <div class="assignment-list">

            ${assignments
                .map(
                    item =>
                        assignmentCard(item)
                )
                .join("")}

        </div>
    `;
}


function assignmentCard(item) {

    const submitted =
        state.submittedAssignments.includes(
            item.id
        );

    let status =
        submitted
            ? "completed"
            : item.status;

    return `

        <div class="assignment-card">

            <div class="assignment-icon">
                ${item.icon}
            </div>

            <div class="assignment-info">

                <h3>
                    ${item.title}
                </h3>

                <p>
                    ${item.course}
                </p>

            </div>

            <div class="assignment-date">

                <strong>
                    ${item.date}
                </strong>

                <span>
                    ${submitted
                        ? "Submitted"
                        : item.due}
                </span>

            </div>

            <span
                class="status ${status}">
                ${capitalize(status)}
            </span>

            <button
                class="secondary-button"
                onclick="openAssignment(${item.id})">

                ${submitted
                    ? "View"
                    : "Open"}

            </button>

        </div>
    `;
}


function openAssignment(id) {

    const item =
        assignments.find(
            assignment =>
                assignment.id === id
        );

    if (!item) return;

    const submitted =
        state.submittedAssignments.includes(
            id
        );

    modalContent.innerHTML = `

        <h2>
            ${item.icon}
            ${item.title}
        </h2>

        <p style="margin-top:5px">
            ${item.course}
        </p>

        <div class="submit-box">

            <strong>
                Assignment submission
            </strong>

            <p style="margin-top:7px">
                Upload your work below.
            </p>

            <input
                id="assignmentFile"
                type="file">

            <div style="margin-top:15px">

                <button
                    class="primary-button"
                    onclick="submitAssignment(${id})">

                    ${
                        submitted
                            ? "Resubmit Assignment"
                            : "Submit Assignment"
                    }

                </button>

            </div>

        </div>
    `;

    modalOverlay.classList.add("show");
}


function submitAssignment(id) {

    const file =
        document.getElementById(
            "assignmentFile"
        );

    if (!file.files.length) {

        showToast(
            "Please choose a file first."
        );

        return;
    }

    if (
        !state.submittedAssignments.includes(id)
    ) {

        state.submittedAssignments.push(id);
    }

    saveState();

    closeModal();

    showToast(
        "Assignment submitted successfully ✓"
    );

    renderAssignments();
}


/* =========================================
   GRADES
========================================= */

function renderGrades() {

    const average =
        Math.round(
            grades.reduce(
                (sum, item) =>
                    sum + item.grade,
                0
            ) / grades.length
        );

    const highest =
        Math.max(
            ...grades.map(
                item => item.grade
            )
        );

    pageContent.innerHTML = `

        <div class="page-heading">

            <div>
                <h1>Grades</h1>

                <p>
                    Track your academic performance.
                </p>
            </div>

        </div>

        <div class="grade-summary">

            <div
                class="grade-summary-item">

                <span>
                    Overall Average
                </span>

                <strong>
                    ${average}%
                </strong>

            </div>

            <div
                class="grade-summary-item">

                <span>
                    Highest Grade
                </span>

                <strong>
                    ${highest}%
                </strong>

            </div>

            <div
                class="grade-summary-item">

                <span>
                    Graded Assignments
                </span>

                <strong>
                    ${grades.length}
                </strong>

            </div>

        </div>

        <div class="card table-card">

            <div class="card-header">

                <div>
                    <h2>Recent Grades</h2>

                    <p>
                        Your latest assessed work.
                    </p>
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

                        ${grades
                            .map(
                                gradeRow
                            )
                            .join("")}

                    </tbody>

                </table>

            </div>

        </div>
    `;
}


function gradeRow(item) {

    const className =
        item.grade >= 85
            ? "good"
            : item.grade >= 70
            ? "average"
            : "low";

    return `

        <tr>

            <td>
                ${item.course}
            </td>

            <td>
                ${item.assignment}
            </td>

            <td>
                <span
                    class="grade ${className}">
                    ${item.grade}%
                </span>
            </td>

            <td>
                ${item.feedback}
            </td>

        </tr>
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

                <p>
                    Keep track of classes,
                    deadlines and events.
                </p>
            </div>

        </div>

        <div class="card calendar-card">

            <div class="calendar-header">

                <h2>
                    August 2026
                </h2>

                <div
                    class="calendar-controls">

                    <button
                        onclick="showToast('Previous month')">
                        ‹
                    </button>

                    <button
                        onclick="showToast('Today')">
                        •
                    </button>

                    <button
                        onclick="showToast('Next month')">
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

    let html =
        `<div class="calendar-grid">`;

    days.forEach(day => {

        html += `
            <div class="calendar-day-name">
                ${day}
            </div>
        `;
    });

    for (let i = 0; i < 6; i++) {

        html += `
            <div
                class="calendar-day muted">
            </div>
        `;
    }

    for (let day = 1; day <= 31; day++) {

        const today =
            day === 23;

        let event = "";

        if (day === 24) {
            event = "JavaScript Project";
        }

        if (day === 26) {
            event = "Statistics Quiz";
        }

        if (day === 30) {
            event = "AI Research Paper";
        }

        html += `

            <div
                class="calendar-day ${today ? "today" : ""}"
                onclick="calendarDay(${day})">

                <span>
                    ${day}
                </span>

                ${
                    event
                        ? `
                            <div
                                class="calendar-event">
                                ${event}
                            </div>
                        `
                        : ""
                }

            </div>
        `;
    }

    html += `</div>`;

    return html;
}


function calendarDay(day) {

    const assignment =
        assignments.find(
            item =>
                item.date ===
                `Aug ${day}`
        );

    if (assignment) {

        openAssignment(
            assignment.id
        );

    } else {

        showToast(
            `August ${day}`
        );
    }
}


/* =========================================
   MESSAGES
========================================= */

function renderMessages() {

    pageContent.innerHTML = `

        <div class="page-heading">

            <div>
                <h1>Messages</h1>

                <p>
                    Communicate with your instructors.
                </p>
            </div>

        </div>

        <div class="message-list">

            ${messages
                .map(
                    (message, index) =>
                        messageCard(
                            message,
                            index
                        )
                )
                .join("")}

        </div>
    `;
}


function messageCard(
    message,
    index
) {

    return `

        <div
            class="message-card"
            onclick="openMessage(${index})">

            <div class="avatar">
                ${message.initials}
            </div>

            <div class="message-info">

                <h3>
                    ${message.name}
                </h3>

                <p>
                    ${message.message}
                </p>

            </div>

            <span
                class="message-time">
                ${message.time}
            </span>

        </div>
    `;
}


function openMessage(index) {

    const message =
        messages[index];

    if (!message) return;

    modalContent.innerHTML = `

        <h2>
            ${message.name}
        </h2>

        <p style="margin-top:15px">
            ${message.message}
        </p>

        <div class="reply-box">

            <textarea
                id="replyText"
                placeholder="Write a reply...">
            </textarea>

            <div class="reply-actions">

                <button
                    class="primary-button"
                    onclick="sendReply()">
                    Send Reply
                </button>

            </div>

        </div>
    `;

    modalOverlay.classList.add("show");
}


function sendReply() {

    const text =
        document.getElementById(
            "replyText"
        ).value.trim();

    if (!text) {

        showToast(
            "Write a message first."
        );

        return;
    }

    closeModal();

    showToast(
        "Reply sent successfully ✓"
    );
}


/* =========================================
   PROFILE
========================================= */

function renderProfile() {

    pageContent.innerHTML = `

        <div class="page-heading">

            <div>
                <h1>Profile</h1>

                <p>
                    Manage your student information.
                </p>
            </div>

        </div>

        <div class="profile-grid">

            <div
                class="card profile-card">

                <div
                    class="profile-avatar-edit">

                    <div
                        class="profile-large">
                        AB
                    </div>

                    <button
                        class="avatar-edit-button"
                        onclick="showToast('Avatar upload comes in Phase 3')">
                        ✎
                    </button>

                </div>

                <h2>
                    ${state.user.firstName}
                    ${state.user.lastName}
                </h2>

                <p>
                    Student
                </p>

                <div class="info-list">

                    <div class="info-row">

                        <span>Email</span>

                        <strong>
                            ${state.user.email}
                        </strong>

                    </div>

                    <div class="info-row">

                        <span>Member since</span>

                        <strong>
                            August 2026
                        </strong>

                    </div>

                    <div class="info-row">

                        <span>Courses</span>

                        <strong>
                            6 active
                        </strong>

                    </div>

                </div>

            </div>

            <div
                class="card form-card">

                <h2>
                    Personal Information
                </h2>

                <form id="profileForm">

                    <div class="form-grid">

                        <div class="form-group">

                            <label>
                                First Name
                            </label>

                            <input
                                id="firstName"
                                value="${state.user.firstName}"
                                required>

                        </div>

                        <div class="form-group">

                            <label>
                                Last Name
                            </label>

                            <input
                                id="lastName"
                                value="${state.user.lastName}"
                                required>

                        </div>

                        <div class="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value="${state.user.email}"
                                required>

                        </div>

                        <div class="form-group">

                            <label>
                                Phone
                            </label>

                            <input
                                id="phone"
                                value="${state.user.phone}">

                        </div>

                        <div
                            class="form-group full">

                            <label>
                                Bio
                            </label>

                            <textarea
                                id="bio">${state.user.bio}</textarea>

                        </div>

                    </div>

                    <div class="form-actions">

                        <button
                            class="primary-button"
                            type="submit">
                            Save Changes
                        </button>

                    </div>

                </form>

            </div>

        </div>
    `;

    document
        .getElementById("profileForm")
        .addEventListener(
            "submit",
            saveProfile
        );
}


function saveProfile(event) {

    event.preventDefault();

    state.user.firstName =
        document.getElementById(
            "firstName"
        ).value.trim();

    state.user.lastName =
        document.getElementById(
            "lastName"
        ).value.trim();

    state.user.email =
        document.getElementById(
            "email"
        ).value.trim();

    state.user.phone =
        document.getElementById(
            "phone"
        ).value.trim();

    state.user.bio =
        document.getElementById(
            "bio"
        ).value.trim();

    saveState();

    updateUserUI();

    showToast(
        "Profile saved successfully ✓"
    );
}


function updateUserUI() {

    const fullName =
        `${state.user.firstName} ${state.user.lastName}`;

    const top =
        document.getElementById(
            "topUserName"
        );

    const side =
        document.getElementById(
            "sidebarUserName"
        );

    if (top) {
        top.textContent = fullName;
    }

    if (side) {
        side.textContent = fullName;
    }
}


/* =========================================
   SETTINGS
========================================= */

function renderSettings() {

    pageContent.innerHTML = `

        <div class="page-heading">

            <div>
                <h1>Settings</h1>

                <p>
                    Customize your EduFlow experience.
                </p>
            </div>

        </div>

        <div class="card form-card">

            <h2>
                Preferences
            </h2>

            <div class="settings-list">

                <div class="setting-row">

                    <div class="setting-info">

                        <h3>
                            Dark Mode
                        </h3>

                        <p>
                            Use a darker appearance.
                        </p>

                    </div>

                    <button
                        id="darkToggle"
                        class="toggle
                        ${state.dark ? "active" : ""}">
                    </button>

                </div>

                <div class="setting-row">

                    <div class="setting-info">

                        <h3>
                            Email Notifications
                        </h3>

                        <p>
                            Receive learning updates.
                        </p>

                    </div>

                    <button
                        id="emailToggle"
                        class="toggle active">
                    </button>

                </div>

                <div class="setting-row">

                    <div class="setting-info">

                        <h3>
                            Assignment Reminders
                        </h3>

                        <p>
                            Get deadline reminders.
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
        .addEventListener(
            "click",
            toggleDark
        );

    document
        .getElementById("emailToggle")
        .addEventListener(
            "click",
            toggleSetting
        );

    document
        .getElementById("reminderToggle")
        .addEventListener(
            "click",
            toggleSetting
        );
}


function toggleDark() {

    state.dark =
        !state.dark;

    saveState();

    applyTheme();

    renderSettings();

    showToast(
        state.dark
            ? "Dark mode enabled"
            : "Dark mode disabled"
    );
}


function applyTheme() {

    document.body.classList.toggle(
        "dark",
        state.dark
    );
}


function toggleSetting(event) {

    event.currentTarget
        .classList.toggle("active");

    showToast(
        "Setting updated"
    );
}


/* =========================================
   SEARCH
========================================= */

function setupSearch() {

    const input =
        document.getElementById(
            "globalSearch"
        );

    input.addEventListener(
        "input",
        event => {

            const query =
                event.target.value
                    .trim()
                    .toLowerCase();

            removeSearchResults();

            if (!query) return;

            const results = [];

            courses.forEach(course => {

                if (
                    course.title
                        .toLowerCase()
                        .includes(query) ||
                    course.description
                        .toLowerCase()
                        .includes(query)
                ) {

                    results.push({
                        title: course.title,
                        type: "Course",
                        action:
                            () =>
                                openCourse(
                                    course.id
                                )
                    });
                }
            });

            assignments.forEach(item => {

                if (
                    item.title
                        .toLowerCase()
                        .includes(query) ||
                    item.course
                        .toLowerCase()
                        .includes(query)
                ) {

                    results.push({
                        title: item.title,
                        type: "Assignment",
                        action:
                            () =>
                                openAssignment(
                                    item.id
                                )
                    });
                }
            });

            if (!results.length) {

                showSearchResults([
                    {
                        title: "No results found",
                        type: "Try another search",
                        action: () => {}
                    }
                ]);

                return;
            }

            showSearchResults(
                results.slice(0, 6)
            );
        }
    );

    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                input.focus();
            }

            if (
                event.key === "Escape"
            ) {

                removeSearchResults();

                input.blur();
            }
        }
    );
}


function showSearchResults(
    results
) {

    const box =
        document.createElement(
            "div"
        );

    box.id =
        "searchResults";

    box.className =
        "search-results";

    results.forEach(result => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "search-result";

        item.innerHTML = `
            <strong>
                ${result.title}
            </strong>

            <span>
                ${result.type}
            </span>
        `;

        item.addEventListener(
            "click",
            () => {

                removeSearchResults();

                result.action();
            }
        );

        box.appendChild(item);
    });

    document.body.appendChild(box);
}


function removeSearchResults() {

    const existing =
        document.getElementById(
            "searchResults"
        );

    if (existing) {
        existing.remove();
    }
}


/* =========================================
   NOTIFICATIONS
========================================= */

function showNotifications() {

    modalContent.innerHTML = `

        <h2>
            Notifications
        </h2>

        <div style="margin-top:15px">

            ${state.notifications
                .map(
                    notification => `

                        <div
                            class="notification-item">

                            <div
                                class="notification-dot">
                            </div>

                            <div>

                                <strong>
                                    ${notification.title}
                                </strong>

                                <p>
                                    ${notification.text}
                                </p>

                            </div>

                        </div>
                    `
                )
                .join("")}

        </div>

        <div style="margin-top:20px">

            <button
                class="secondary-button"
                onclick="markNotificationsRead()">

                Mark all as read

            </button>

        </div>
    `;

    modalOverlay.classList.add(
        "show"
    );
}


function markNotificationsRead() {

    state.notifications.forEach(
        notification => {
            notification.read = true;
        }
    );

    saveState();

    closeModal();

    showToast(
        "Notifications marked as read"
    );
}


/* =========================================
   MOBILE
========================================= */

function setupMobileMenu() {

    const menu =
        document.getElementById(
            "mobileMenu"
        );

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "mobileOverlay"
        );

    menu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

            overlay.classList.toggle(
                "show"
            );
        }
    );

    overlay.addEventListener(
        "click",
        closeMobileMenu
    );
}


function closeMobileMenu() {

    document
        .getElementById("sidebar")
        .classList.remove("open");

    document
        .getElementById("mobileOverlay")
        .classList.remove("show");
}


/* =========================================
   MODAL
========================================= */

function setupModal() {

    document
        .getElementById("modalClose")
        .addEventListener(
            "click",
            closeModal
        );

    modalOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modalOverlay
            ) {

                closeModal();
            }
        }
    );

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeModal();
            }
        }
    );
}


function closeModal() {

    modalOverlay.classList.remove(
        "show"
    );
}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    clearTimeout(toastTimer);

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );
}


/* =========================================
   HELPERS
========================================= */

function capitalize(value) {

    return value.charAt(0).toUpperCase() +
        value.slice(1);
}