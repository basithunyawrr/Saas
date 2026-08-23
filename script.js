import { supabase } from "./supabase.js";

console.log("EduFlow Supabase connected:", supabase);


/* ========================= */
/* ELEMENTS */
/* ========================= */

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


/* ========================= */
/* AUTH SWITCHING */
/* ========================= */

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


/* ========================= */
/* SIGN UP */
/* ========================= */

signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    signupMessage.textContent =
        "Creating your account...";

    const name =
        document.getElementById("signup-name").value.trim();

    const email =
        document.getElementById("signup-email").value.trim();

    const password =
        document.getElementById("signup-password").value;


    const { data, error } =
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
        "Account created successfully. Check your email if confirmation is required.";

    signupForm.reset();
});


/* ========================= */
/* LOGIN */
/* ========================= */

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    loginMessage.textContent =
        "Signing in...";


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

        loginMessage.textContent =
            error.message;

        return;
    }


    loginMessage.textContent = "";

    await loadDashboard(data.user);
});


/* ========================= */
/* LOGOUT */
/* ========================= */

logoutButton.addEventListener("click", async () => {

    await supabase.auth.signOut();

    showAuth();
});


/* ========================= */
/* SHOW AUTH */
/* ========================= */

function showAuth() {

    authScreen.classList.remove("hidden");

    dashboard.classList.add("hidden");

}


/* ========================= */
/* SHOW DASHBOARD */
/* ========================= */

function showDashboard() {

    authScreen.classList.add("hidden");

    dashboard.classList.remove("hidden");

}


/* ========================= */
/* LOAD PROFILE */
/* ========================= */

async function loadProfile(user) {

    const { data: profile, error } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();


    if (error) {

        console.error(
            "Profile error:",
            error
        );

        return null;
    }


    return profile;
}


/* ========================= */
/* LOAD DASHBOARD */
/* ========================= */

async function loadDashboard(user) {

    showDashboard();


    const profile =
        await loadProfile(user);


    const name =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        "Student";


    document.getElementById(
        "user-name"
    ).textContent = name;


    document.getElementById(
        "user-email"
    ).textContent = user.email;


    document.getElementById(
        "avatar"
    ).textContent =
        name.charAt(0).toUpperCase();


    document.getElementById(
        "welcome-title"
    ).textContent =
        `Good evening, ${name.split(" ")[0]} 👋`;


    await loadStats(user.id);
}


/* ========================= */
/* LOAD STATS */
/* ========================= */

async function loadStats(userId) {


    /* ACTIVE COURSES */

    const { count: activeCourses } =
        await supabase
            .from("course_enrollments")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("student_id", userId);


    document.getElementById(
        "active-courses"
    ).textContent =
        activeCourses || 0;


    /* COMPLETED LESSONS */

    const { count: completed } =
        await supabase
            .from("lesson_progress")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("student_id", userId)
            .eq("completed", true);


    document.getElementById(
        "completed-courses"
    ).textContent =
        completed || 0;


    /* ASSIGNMENTS */

    const { data: enrollments } =
        await supabase
            .from("course_enrollments")
            .select("course_id")
            .eq("student_id", userId);


    if (enrollments?.length) {

        const courseIds =
            enrollments.map(
                item => item.course_id
            );


        const { count: assignments } =
            await supabase
                .from("assignments")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .in("course_id", courseIds);


        document.getElementById(
            "assignments-count"
        ).textContent =
            assignments || 0;

    } else {

        document.getElementById(
            "assignments-count"
        ).textContent = "0";

    }


    /* GRADES */

    const { data: grades } =
        await supabase
            .from("grades")
            .select("score")
            .eq("student_id", userId);


    if (grades?.length) {

        const scores =
            grades
                .map(g => Number(g.score))
                .filter(
                    score => !Number.isNaN(score)
                );


        if (scores.length) {

            const average =
                scores.reduce(
                    (a, b) => a + b,
                    0
                ) / scores.length;


            document.getElementById(
                "average-grade"
            ).textContent =
                `${Math.round(average)}%`;

        }

    }
}


/* ========================= */
/* CHECK CURRENT SESSION */
/* ========================= */

async function checkSession() {

    const {
        data: {
            session
        }
    } =
        await supabase.auth.getSession();


    if (session?.user) {

        await loadDashboard(
            session.user
        );

    } else {

        showAuth();

    }
}


/* ========================= */
/* AUTH STATE LISTENER */
/* ========================= */

supabase.auth.onAuthStateChange(
    async (event, session) => {

        if (
            event === "SIGNED_IN" &&
            session?.user
        ) {

            await loadDashboard(
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


/* ========================= */
/* START EDUFLOW */
/* ========================= */

checkSession();