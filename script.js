import { supabase } from "./supabase.js";

console.log("EduFlow Supabase connected:", supabase);

/* =========================================
   ELEMENTS
========================================= */

const authScreen = document.getElementById("auth-screen");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("login");
const signupForm = document.getElementById("signup");

const loginContainer = document.getElementById("login-form");
const signupContainer = document.getElementById("signup-form");

const showSignup = document.getElementById("show-signup");
const showLogin = document.getElementById("show-login");

const loginMessage = document.getElementById("login-message");
const signupMessage = document.getElementById("signup-message");

const logoutButton = document.getElementById("logout-btn");


/* =========================================
   AUTH SWITCHING
========================================= */

showSignup.addEventListener("click", () => {
    loginContainer.classList.add("hidden");
    signupContainer.classList.remove("hidden");
    loginMessage.textContent = "";
});

showLogin.addEventListener("click", () => {
    signupContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
    signupMessage.textContent = "";
});


/* =========================================
   SIGN UP
========================================= */

signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    signupMessage.textContent = "Creating your account...";

    const name =
        document.getElementById("signup-name").value.trim();

    const email =
        document.getElementById("signup-email").value.trim();

    const password =
        document.getElementById("signup-password").value;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name
            }
        }
    });

    if (error) {
        signupMessage.textContent = error.message;
        return;
    }

    signupMessage.textContent =
        "Account created successfully. Check your email if confirmation is required.";

    signupForm.reset();
});


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    loginMessage.textContent = "Signing in...";

    const email =
        document.getElementById("login-email").value.trim();

    const password =
        document.getElementById("login-password").value;

    const { data, error } =
        await supabase.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        loginMessage.textContent = error.message;
        return;
    }

    loginMessage.textContent = "";

    await routeUser(data.user);
});


/* =========================================
   LOGOUT
========================================= */

logoutButton.addEventListener("click", async () => {

    await supabase.auth.signOut();

    showAuth();

});


/* =========================================
   SHOW AUTH
========================================= */

function showAuth() {

    authScreen.classList.remove("hidden");

    dashboard.classList.add("hidden");

}


/* =========================================
   SHOW DASHBOARD
========================================= */

function showDashboard() {

    authScreen.classList.add("hidden");

    dashboard.classList.remove("hidden");

}


/* =========================================
   GET USER PROFILE
========================================= */

async function getProfile(userId) {

    const { data, error } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

    if (error) {

        console.error(
            "Profile loading error:",
            error
        );

        return null;
    }

    return data;
}


/* =========================================
   ROUTE USER BY ROLE
========================================= */

async function routeUser(user) {

    const profile =
        await getProfile(user.id);

    if (!profile) {

        console.error(
            "No profile found for user."
        );

        alert(
            "Your account profile could not be found."
        );

        await supabase.auth.signOut();

        showAuth();

        return;
    }


    console.log(
        "EduFlow user role:",
        profile.role
    );


    switch (profile.role) {

        case "super_admin":

            await loadSuperAdmin(
                user,
                profile
            );

            break;


        case "admin":

            await loadAdmin(
                user,
                profile
            );

            break;


        case "teacher":

            await loadTeacher(
                user,
                profile
            );

            break;


        case "student":

            await loadStudent(
                user,
                profile
            );

            break;


        case "parent":

            await loadParent(
                user,
                profile
            );

            break;


        default:

            console.error(
                "Unknown role:",
                profile.role
            );

            alert(
                "Your account has an invalid role."
            );

            await supabase.auth.signOut();

            showAuth();
    }
}


/* =========================================
   SUPER ADMIN
========================================= */

async function loadSuperAdmin(
    user,
    profile
) {

    showDashboard();

    buildSuperAdminPanel(
        user,
        profile
    );

    await loadSuperAdminStats();

}


/* =========================================
   SUPER ADMIN UI
========================================= */

function buildSuperAdminPanel(
    user,
    profile
) {

    const firstName =
        profile.full_name
            ?.split(" ")[0] ||
        "Admin";


    document.getElementById(
        "user-name"
    ).textContent =
        profile.full_name || "Super Admin";


    document.getElementById(
        "user-email"
    ).textContent =
        user.email;


    document.getElementById(
        "avatar"
    ).textContent =
        firstName
            .charAt(0)
            .toUpperCase();


    document.getElementById(
        "welcome-title"
    ).textContent =
        `Good evening, ${firstName} 👋`;


    const main =
        document.querySelector(".main");


    main.innerHTML = `

        <header class="topbar">

            <div>

                <h1>
                    Super Admin Dashboard
                </h1>

                <p>
                    Complete control over EduFlow.
                </p>

            </div>

            <div class="profile">

                <div class="profile-info">

                    <strong>
                        ${escapeHTML(
                            profile.full_name ||
                            "Super Admin"
                        )}
                    </strong>

                    <small>
                        Super Administrator
                    </small>

                </div>

                <div class="avatar">
                    ${escapeHTML(
                        firstName
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

            </div>

        </header>


        <section class="admin-actions">

            <button
                class="admin-action primary-action"
                id="create-school-btn"
            >
                <span>＋</span>
                <div>
                    <strong>Create School</strong>
                    <small>Add a new school to EduFlow</small>
                </div>
            </button>


            <button
                class="admin-action"
                id="manage-users-btn"
            >
                <span>👥</span>
                <div>
                    <strong>Manage Users</strong>
                    <small>View all platform users</small>
                </div>
            </button>


            <button
                class="admin-action"
                id="manage-schools-btn"
            >
                <span>🏫</span>
                <div>
                    <strong>Manage Schools</strong>
                    <small>View and manage schools</small>
                </div>
            </button>

        </section>


        <section class="cards">

            <div class="card">
                <div class="stat-label">
                    Schools
                </div>

                <div
                    id="total-schools"
                    class="stat-value"
                >
                    0
                </div>
            </div>


            <div class="card">
                <div class="stat-label">
                    Users
                </div>

                <div
                    id="total-users"
                    class="stat-value"
                >
                    0
                </div>
            </div>


            <div class="card">
                <div class="stat-label">
                    Teachers
                </div>

                <div
                    id="total-teachers"
                    class="stat-value"
                >
                    0
                </div>
            </div>


            <div class="card">
                <div class="stat-label">
                    Students
                </div>

                <div
                    id="total-students"
                    class="stat-value"
                >
                    0
                </div>
            </div>

        </section>


        <section class="admin-section">

            <div class="section-header">

                <div>
                    <h2>
                        EduFlow Overview
                    </h2>

                    <p>
                        Platform-wide management.
                    </p>
                </div>

            </div>


            <div class="admin-grid">

                <div class="admin-card">
                    <div class="admin-card-icon">
                        🏫
                    </div>

                    <h3>
                        Schools
                    </h3>

                    <p>
                        Create and manage schools
                        on the EduFlow platform.
                    </p>
                </div>


                <div class="admin-card">
                    <div class="admin-card-icon">
                        👥
                    </div>

                    <h3>
                        Users
                    </h3>

                    <p>
                        Manage administrators,
                        teachers, students and parents.
                    </p>
                </div>


                <div class="admin-card">
                    <div class="admin-card-icon">
                        📚
                    </div>

                    <h3>
                        Subjects
                    </h3>

                    <p>
                        Monitor subjects across
                        all schools.
                    </p>
                </div>


                <div class="admin-card">
                    <div class="admin-card-icon">
                        📊
                    </div>

                    <h3>
                        Reports
                    </h3>

                    <p>
                        Platform-wide education
                        analytics and reports.
                    </p>
                </div>

            </div>

        </section>


        <div
            id="modal-container"
            class="modal-container hidden"
        ></div>

    `;


    document
        .getElementById("create-school-btn")
        .addEventListener(
            "click",
            openCreateSchoolModal
        );


    document
        .getElementById("manage-schools-btn")
        .addEventListener(
            "click",
            () => {
                alert(
                    "School management is coming next."
                );
            }
        );


    document
        .getElementById("manage-users-btn")
        .addEventListener(
            "click",
            () => {
                alert(
                    "User management is coming next."
                );
            }
        );
}


/* =========================================
   SUPER ADMIN STATISTICS
========================================= */

async function loadSuperAdminStats() {

    const { count: schools } =
        await supabase
            .from("schools")
            .select("*", {
                count: "exact",
                head: true
            });


    const { count: users } =
        await supabase
            .from("profiles")
            .select("*", {
                count: "exact",
                head: true
            });


    const { count: teachers } =
        await supabase
            .from("teachers")
            .select("*", {
                count: "exact",
                head: true
            });


    const { count: students } =
        await supabase
            .from("students")
            .select("*", {
                count: "exact",
                head: true
            });


    const schoolsElement =
        document.getElementById(
            "total-schools"
        );

    const usersElement =
        document.getElementById(
            "total-users"
        );

    const teachersElement =
        document.getElementById(
            "total-teachers"
        );

    const studentsElement =
        document.getElementById(
            "total-students"
        );


    if (schoolsElement)
        schoolsElement.textContent =
            schools || 0;


    if (usersElement)
        usersElement.textContent =
            users || 0;


    if (teachersElement)
        teachersElement.textContent =
            teachers || 0;


    if (studentsElement)
        studentsElement.textContent =
            students || 0;
}


/* =========================================
   CREATE SCHOOL MODAL
========================================= */

function openCreateSchoolModal() {

    const modal =
        document.getElementById(
            "modal-container"
        );


    modal.classList.remove("hidden");


    modal.innerHTML = `

        <div class="modal-backdrop">

            <div class="modal">

                <div class="modal-header">

                    <div>
                        <h2>
                            Create School
                        </h2>

                        <p>
                            Add a new school to EduFlow.
                        </p>
                    </div>

                    <button
                        id="close-modal"
                        class="modal-close"
                    >
                        ×
                    </button>

                </div>


                <form id="create-school-form">

                    <label>
                        School name
                    </label>

                    <input
                        id="school-name"
                        type="text"
                        placeholder="e.g. ABC Grammar School"
                        required
                    >


                    <label>
                        Address
                    </label>

                    <input
                        id="school-address"
                        type="text"
                        placeholder="School address"
                    >


                    <label>
                        Phone
                    </label>

                    <input
                        id="school-phone"
                        type="tel"
                        placeholder="+92..."
                    >


                    <label>
                        Email
                    </label>

                    <input
                        id="school-email"
                        type="email"
                        placeholder="school@example.com"
                    >


                    <p
                        id="school-message"
                        class="message"
                    ></p>


                    <button
                        type="submit"
                        class="primary-btn"
                    >
                        Create School
                    </button>

                </form>

            </div>

        </div>

    `;


    document
        .getElementById("close-modal")
        .addEventListener(
            "click",
            closeModal
        );


    document
        .getElementById("create-school-form")
        .addEventListener(
            "submit",
            createSchool
        );
}


/* =========================================
   CREATE SCHOOL
========================================= */

async function createSchool(event) {

    event.preventDefault();


    const message =
        document.getElementById(
            "school-message"
        );


    message.textContent =
        "Creating school...";


    const name =
        document
            .getElementById("school-name")
            .value
            .trim();


    const address =
        document
            .getElementById("school-address")
            .value
            .trim();


    const phone =
        document
            .getElementById("school-phone")
            .value
            .trim();


    const email =
        document
            .getElementById("school-email")
            .value
            .trim();


    const { error } =
        await supabase
            .from("schools")
            .insert({

                name,
                address,
                phone,
                email

            });


    if (error) {

        console.error(
            "Create school error:",
            error
        );


        message.textContent =
            error.message;


        return;
    }


    message.textContent =
        "School created successfully.";


    await loadSuperAdminStats();


    setTimeout(
        closeModal,
        1000
    );
}


/* =========================================
   CLOSE MODAL
========================================= */

function closeModal() {

    const modal =
        document.getElementById(
            "modal-container"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

        modal.innerHTML = "";

    }
}


/* =========================================
   OTHER PANELS
========================================= */

async function loadAdmin(
    user,
    profile
) {

    showDashboard();

    document.querySelector(".main").innerHTML = `

        <header class="topbar">

            <div>
                <h1>School Admin</h1>

                <p>
                    Manage your school.
                </p>
            </div>

        </header>


        <section class="welcome-panel">

            <h2>
                Admin Panel
            </h2>

            <p>
                Teacher, student and parent
                management will be added next.
            </p>

        </section>

    `;
}


async function loadTeacher(
    user,
    profile
) {

    showDashboard();

    document.querySelector(".main").innerHTML = `

        <header class="topbar">

            <div>
                <h1>Teacher Dashboard</h1>

                <p>
                    Manage your classes and students.
                </p>
            </div>

        </header>


        <section class="welcome-panel">

            <h2>
                Teacher Panel
            </h2>

            <p>
                Attendance, grades and student
                management will be added next.
            </p>

        </section>

    `;
}


async function loadStudent(
    user,
    profile
) {

    showDashboard();

    document.querySelector(".main").innerHTML = `

        <header class="topbar">

            <div>
                <h1>
                    Student Dashboard
                </h1>

                <p>
                    Welcome to EduFlow.
                </p>
            </div>

        </header>


        <section class="welcome-panel">

            <h2>
                Student Panel 🎓
            </h2>

            <p>
                Your subjects, attendance,
                assignments and grades will appear here.
            </p>

        </section>

    `;
}


async function loadParent(
    user,
    profile
) {

    showDashboard();

    document.querySelector(".main").innerHTML = `

        <header class="topbar">

            <div>
                <h1>
                    Parent Dashboard
                </h1>

                <p>
                    Monitor your children's education.
                </p>
            </div>

        </header>


        <section class="welcome-panel">

            <h2>
                Parent Panel 👨‍👩‍👧
            </h2>

            <p>
                Attendance, grades and academic
                information will appear here.
            </p>

        </section>

    `;
}


/* =========================================
   HTML SECURITY
========================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================
   SESSION CHECK
========================================= */

async function checkSession() {

    const {
        data: {
            session
        }
    } =
        await supabase.auth.getSession();


    if (session?.user) {

        await routeUser(
            session.user
        );

    } else {

        showAuth();

    }
}


/* =========================================
   AUTH STATE
========================================= */

supabase.auth.onAuthStateChange(
    async (event, session) => {

        if (
            event === "SIGNED_IN" &&
            session?.user
        ) {

            await routeUser(
                session.user
            );

        }


        if (
            event === "SIGNED_OUT"
        ) {

            showAuth();

        }

    }
);


/* =========================================
   START EDUFLOW
========================================= */

checkSession();