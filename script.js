import {
    supabase,
    SUPABASE_URL
} from "./supabase.js";


/* =========================================
   EDUFLOW
   Authentication + Role Routing
========================================= */

console.log(
    "EduFlow application starting..."
);


/* =========================================
   ELEMENTS
========================================= */

const authScreen =
    document.getElementById("auth-screen");

const dashboard =
    document.getElementById("dashboard");

const loginForm =
    document.getElementById("login");

const signupForm =
    document.getElementById("signup");

const loginContainer =
    document.getElementById("login-form");

const signupContainer =
    document.getElementById("signup-form");

const showSignup =
    document.getElementById("show-signup");

const showLogin =
    document.getElementById("show-login");

const loginMessage =
    document.getElementById("login-message");

const signupMessage =
    document.getElementById("signup-message");

const logoutButton =
    document.getElementById("logout-btn");


/* =========================================
   AUTH SCREEN SWITCH
========================================= */

if (showSignup) {

    showSignup.addEventListener(
        "click",
        () => {

            loginContainer
                ?.classList
                .add("hidden");

            signupContainer
                ?.classList
                .remove("hidden");

            if (loginMessage) {
                loginMessage.textContent = "";
            }
        }
    );
}


if (showLogin) {

    showLogin.addEventListener(
        "click",
        () => {

            signupContainer
                ?.classList
                .add("hidden");

            loginContainer
                ?.classList
                .remove("hidden");

            if (signupMessage) {
                signupMessage.textContent = "";
            }
        }
    );
}


/* =========================================
   SIGN UP
========================================= */

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            signupMessage.textContent =
                "Creating your account...";


            const name =
                document
                    .getElementById(
                        "signup-name"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "signup-email"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "signup-password"
                    )
                    .value;


            const {
                error
            } =
                await supabase.auth.signUp({

                    email,

                    password,

                    options: {

                        data: {
                            full_name: name
                        }

                    }

                });


            if (error) {

                signupMessage.textContent =
                    error.message;

                return;
            }


            signupMessage.textContent =
                "Account created successfully.";


            signupForm.reset();

        }
    );
}


/* =========================================
   LOGIN
========================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            loginMessage.textContent =
                "Signing in...";


            const email =
                document
                    .getElementById(
                        "login-email"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "login-password"
                    )
                    .value;


            const {
                data,
                error
            } =
                await supabase.auth
                    .signInWithPassword({

                        email,

                        password

                    });


            if (error) {

                loginMessage.textContent =
                    error.message;

                return;
            }


            loginMessage.textContent = "";

            await routeUser(
                data.user
            );

        }
    );
}


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            await supabase.auth.signOut();

            showAuth();

        }
    );
}


/* =========================================
   AUTH SCREEN
========================================= */

function showAuth() {

    authScreen
        ?.classList
        .remove("hidden");

    dashboard
        ?.classList
        .add("hidden");
}


/* =========================================
   DASHBOARD
========================================= */

function showDashboard() {

    authScreen
        ?.classList
        .add("hidden");

    dashboard
        ?.classList
        .remove("hidden");
}


/* =========================================
   GET PROFILE
========================================= */

async function getProfile(
    userId
) {

    const {
        data,
        error
    } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();


    if (error) {

        console.error(
            "Profile error:",
            error
        );

        return null;
    }


    return data;
}


/* =========================================
   ROUTE USER
========================================= */

async function routeUser(
    user
) {

    if (!user) {

        showAuth();

        return;
    }


    const profile =
        await getProfile(
            user.id
        );


    if (!profile) {

        console.error(
            "No profile found."
        );


        alert(
            "Your EduFlow profile could not be found."
        );


        await supabase.auth.signOut();

        showAuth();

        return;
    }


    console.log(
        "EduFlow role:",
        profile.role
    );


    switch (
        profile.role
    ) {

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

            alert(
                "Invalid EduFlow role."
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
   SUPER ADMIN PANEL
========================================= */

function buildSuperAdminPanel(
    user,
    profile
) {

    const main =
        document.querySelector(
            ".main"
        );


    const firstName =
        profile.full_name
            ?.split(" ")[0] ||
        "Admin";


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
                id="create-admin-btn"
            >

                <span>＋</span>

                <div>

                    <strong>
                        Create Admin
                    </strong>

                    <small>
                        Create a school administrator
                    </small>

                </div>

            </button>


            <button
                class="admin-action"
                id="create-school-btn"
            >

                <span>🏫</span>

                <div>

                    <strong>
                        Create School
                    </strong>

                    <small>
                        Add a school to EduFlow
                    </small>

                </div>

            </button>


            <button
                class="admin-action"
                id="manage-users-btn"
            >

                <span>👥</span>

                <div>

                    <strong>
                        Manage Users
                    </strong>

                    <small>
                        View platform users
                    </small>

                </div>

            </button>


            <button
                class="admin-action"
                id="manage-schools-btn"
            >

                <span>🏫</span>

                <div>

                    <strong>
                        Manage Schools
                    </strong>

                    <small>
                        View all schools
                    </small>

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

            <h2>
                Platform Management
            </h2>

            <p>
                Manage every part of EduFlow.
            </p>


            <div class="admin-grid">


                <div class="admin-card">

                    <div class="admin-card-icon">
                        🏫
                    </div>

                    <h3>
                        Schools
                    </h3>

                    <p>
                        Manage schools across EduFlow.
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
                        Monitor subjects across schools.
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
                        View platform-wide reports.
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
        .getElementById(
            "create-admin-btn"
        )
        .addEventListener(
            "click",
            openCreateAdminModal
        );


    document
        .getElementById(
            "create-school-btn"
        )
        .addEventListener(
            "click",
            openCreateSchoolModal
        );


    document
        .getElementById(
            "manage-users-btn"
        )
        .addEventListener(
            "click",
            () => {

                alert(
                    "User management will be added next."
                );

            }
        );


    document
        .getElementById(
            "manage-schools-btn"
        )
        .addEventListener(
            "click",
            () => {

                alert(
                    "School management will be added next."
                );

            }
        );
}


/* =========================================
   SUPER ADMIN STATS
========================================= */

async function loadSuperAdminStats() {

    const {
        count: schools
    } =
        await supabase
            .from("schools")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            );


    const {
        count: users
    } =
        await supabase
            .from("profiles")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            );


    const {
        count: teachers
    } =
        await supabase
            .from("teachers")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            );


    const {
        count: students
    } =
        await supabase
            .from("students")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            );


    document.getElementById(
        "total-schools"
    ).textContent =
        schools || 0;


    document.getElementById(
        "total-users"
    ).textContent =
        users || 0;


    document.getElementById(
        "total-teachers"
    ).textContent =
        teachers || 0;


    document.getElementById(
        "total-students"
    ).textContent =
        students || 0;
}


/* =========================================
   CREATE SCHOOL
========================================= */

function openCreateSchoolModal() {

    const modal =
        document.getElementById(
            "modal-container"
        );


    modal.classList.remove(
        "hidden"
    );


    modal.innerHTML = `

        <div class="modal-backdrop">

            <div class="modal">

                <div class="modal-header">

                    <div>

                        <h2>
                            Create School
                        </h2>

                        <p>
                            Add a school to EduFlow.
                        </p>

                    </div>


                    <button
                        id="close-modal"
                        class="modal-close"
                    >
                        ×
                    </button>

                </div>


                <form
                    id="create-school-form"
                >

                    <label>
                        School name
                    </label>

                    <input
                        id="school-name"
                        type="text"
                        placeholder="ABC School"
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
        .getElementById(
            "close-modal"
        )
        .addEventListener(
            "click",
            closeModal
        );


    document
        .getElementById(
            "create-school-form"
        )
        .addEventListener(
            "submit",
            createSchool
        );
}


/* =========================================
   SAVE SCHOOL
========================================= */

async function createSchool(
    event
) {

    event.preventDefault();


    const message =
        document.getElementById(
            "school-message"
        );


    message.textContent =
        "Creating school...";


    const name =
        document
            .getElementById(
                "school-name"
            )
            .value
            .trim();


    const address =
        document
            .getElementById(
                "school-address"
            )
            .value
            .trim();


    const phone =
        document
            .getElementById(
                "school-phone"
            )
            .value
            .trim();


    const email =
        document
            .getElementById(
                "school-email"
            )
            .value
            .trim();


    const {
        error
    } =
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
        1200
    );
}


/* =========================================
   CREATE ADMIN MODAL
========================================= */

function openCreateAdminModal() {

    const modal =
        document.getElementById(
            "modal-container"
        );


    modal.classList.remove(
        "hidden"
    );


    modal.innerHTML = `

        <div class="modal-backdrop">

            <div class="modal">

                <div class="modal-header">

                    <div>

                        <h2>
                            Create Admin
                        </h2>

                        <p>
                            This admin will create
                            and own their school.
                        </p>

                    </div>


                    <button
                        id="close-admin-modal"
                        class="modal-close"
                    >
                        ×
                    </button>

                </div>


                <form
                    id="create-admin-form"
                >

                    <label>
                        Full name
                    </label>

                    <input
                        id="admin-name"
                        type="text"
                        placeholder="Ahmed Khan"
                        required
                    >


                    <label>
                        Email
                    </label>

                    <input
                        id="admin-email"
                        type="email"
                        placeholder="admin@example.com"
                        required
                    >


                    <label>
                        Temporary password
                    </label>

                    <input
                        id="admin-password"
                        type="password"
                        minlength="8"
                        placeholder="Minimum 8 characters"
                        required
                    >


                    <p
                        id="admin-message"
                        class="message"
                    ></p>


                    <button
                        type="submit"
                        class="primary-btn"
                    >
                        Create Admin
                    </button>

                </form>

            </div>

        </div>

    `;


    document
        .getElementById(
            "close-admin-modal"
        )
        .addEventListener(
            "click",
            closeModal
        );


    document
        .getElementById(
            "create-admin-form"
        )
        .addEventListener(
            "submit",
            createAdmin
        );
}


/* =========================================
   CREATE ADMIN
========================================= */

async function createAdmin(
    event
) {

    event.preventDefault();


    const message =
        document.getElementById(
            "admin-message"
        );


    message.textContent =
        "Creating admin account...";


    const fullName =
        document
            .getElementById(
                "admin-name"
            )
            .value
            .trim();


    const email =
        document
            .getElementById(
                "admin-email"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "admin-password"
            )
            .value;


    try {

        const {
            data: {
                session
            }
        } =
            await supabase
                .auth
                .getSession();


        if (!session) {

            message.textContent =
                "Your session has expired. Log in again.";

            return;
        }


        const response =
            await fetch(

                `${SUPABASE_URL}/functions/v1/create-user`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${session.access_token}`

                    },

                    body: JSON.stringify({

                        full_name:
                            fullName,

                        email:
                            email,

                        password:
                            password

                    })

                }

            );


        const result =
            await response.json();


        if (!response.ok) {

            message.textContent =
                result.error ||
                "Unable to create admin.";

            return;
        }


        message.textContent =
            "Admin account created successfully.";


        document
            .getElementById(
                "create-admin-form"
            )
            .reset();


        setTimeout(
            closeModal,
            1500
        );


    } catch (error) {

        console.error(
            "Create admin error:",
            error
        );


        message.textContent =
            "Unable to connect to the account creation service.";

    }
}


/* =========================================
   CLOSE MODAL
========================================= */

function closeModal() {

    const modal =
        document.getElementById(
            "modal-container"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );


    modal.innerHTML = "";
}


/* =========================================
   OTHER PANELS
========================================= */

async function loadAdmin(
    user,
    profile
) {

    showDashboard();


    document.querySelector(
        ".main"
    ).innerHTML = `

        <header class="topbar">

            <div>

                <h1>
                    School Admin
                </h1>

                <p>
                    Welcome to EduFlow.
                </p>

            </div>

        </header>


        <section class="welcome-panel">

            <h2>
                Admin Panel
            </h2>

            <p>
                Your school setup will appear here.
            </p>

        </section>

    `;
}


async function loadTeacher(
    user,
    profile
) {

    showDashboard();


    document.querySelector(
        ".main"
    ).innerHTML = `

        <header class="topbar">

            <div>

                <h1>
                    Teacher Dashboard
                </h1>

                <p>
                    Manage your students.
                </p>

            </div>

        </header>


        <section class="welcome-panel">

            <h2>
                Teacher Panel
            </h2>

            <p>
                Attendance, grades and assignments
                will be added here.
            </p>

        </section>

    `;
}


async function loadStudent(
    user,
    profile
) {

    showDashboard();


    document.querySelector(
        ".main"
    ).innerHTML = `

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
                Your subjects, grades,
                attendance and assignments
                will appear here.
            </p>

        </section>

    `;
}


async function loadParent(
    user,
    profile
) {

    showDashboard();


    document.querySelector(
        ".main"
    ).innerHTML = `

        <header class="topbar">

            <div>

                <h1>
                    Parent Dashboard
                </h1>

                <p>
                    Monitor your children.
                </p>

            </div>

        </header>


        <section class="welcome-panel">

            <h2>
                Parent Panel 👨‍👩‍👧
            </h2>

            <p>
                Your children's academic
                information will appear here.
            </p>

        </section>

    `;
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
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
        await supabase
            .auth
            .getSession();


    if (
        session?.user
    ) {

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
    async (
        event,
        session
    ) => {

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
   START
========================================= */

checkSession();