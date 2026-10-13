// Browser-only fixtures: intercepted responses never reach a live API.
// Run against a dedicated Chromium test profile with --remote-debugging-port=9222.
// This script controls the first page and clears its local test authentication on exit.
// Start a dev server, then run node scripts/verify-ui.mjs. Never point it at your personal browser profile.
import fs from "node:fs/promises";
const origin = process.env.UI_ORIGIN || "http://localhost:5174";
const debugOrigin = process.env.UI_DEBUG_ORIGIN || "http://127.0.0.1:9222";
const output = process.env.UI_SCREENSHOT_DIR || "/tmp";
const tabs = await (await fetch(`${debugOrigin}/json/list`)).json();
const tab = tabs.find((t) => t.type === "page");
if (!tab) throw new Error("No browser page is available.");
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve) =>
  ws.addEventListener("open", resolve, { once: true }),
);
let sequence = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id);
    if (request) {
      pending.delete(message.id);
      message.error
        ? request.reject(message.error)
        : request.resolve(message.result);
    }
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails)
    throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  console.log("PASS", message);
};
const click = async (selector) => {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await wait(80);
};
const capture = async (name) => {
  if (process.env.UI_CAPTURE && !new RegExp(process.env.UI_CAPTURE).test(name))
    return;
  const result = await send("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(
    `${output}/slint-${name}.png`,
    Buffer.from(result.data, "base64"),
  );
};
let role = "Mentee",
  status = "approved",
  errorMode = false,
  empty = false,
  apiRequests = 0;
const errors = [];
const now = "2026-10-01T12:00:00Z";
const person = {
  id: "ui-person",
  fullName: "Amina Mensah",
  email: "amina@example.test",
  role: "Mentee",
  status: "approved",
  membershipCategory: "Student",
  careerPath: "Frontend Development",
  specialization: "Frontend Development",
  membershipEnabled: false,
  membershipAmount: "30",
  membershipPaid: false,
  createdAt: now,
  updatedAt: now,
  joinedDate: now,
  contractFileUrl: null,
};
const mentor = {
  ...person,
  id: "ui-mentor",
  fullName: "Kwame Asante",
  email: "kwame@example.test",
  role: "Mentor",
  specialization: "Frontend Development",
  assignedDate: now,
  enrolledCoursesCount: 2,
  notes: "Building skills through practical projects.",
};
const course = {
  id: "ui-course",
  name: "Build your first web application",
  description:
    "Turn your ideas into a responsive, accessible website. Learn by building with HTML, CSS, and React.",
  duration: "8 weeks",
  status: "active",
  createdAt: now,
  enrolledMentees: 4,
  progressPercentage: 40,
  progress: 40,
  enrolledAt: now,
  enrolledDate: now,
  mentor: { id: mentor.id, name: mentor.fullName, email: mentor.email },
  completedLessons: 2,
  totalLessons: 5,
  approvedTasks: 1,
  totalTasks: 3,
};
const lesson = {
  id: "ui-lesson",
  title: "Designing your first responsive layout",
  description:
    "Explore grids, flexible layouts, and thoughtful mobile experiences.",
  link: "https://example.test/lesson",
  orderIndex: 1,
  status: "active",
  createdAt: now,
  completed: false,
  completedAt: null,
  course: { id: course.id, name: course.name },
  mentor: { id: mentor.id, name: mentor.fullName },
};
const task = {
  id: "ui-task",
  title: "Build a personal portfolio",
  description: "Bring your skills together in a website that tells your story.",
  requirements: [
    "Create a responsive layout",
    "Include an accessible contact section",
  ],
  deadline: "2026-11-01T12:00:00Z",
  status: "active",
  createdAt: now,
  course: { id: course.id, name: course.name },
  mentor: { id: mentor.id, name: mentor.fullName },
  submission: null,
};
const stats = {
  totalLessons: 5,
  completedLessons: 2,
  completedTasks: 1,
  totalTasks: 3,
  approvedTasks: 1,
  pendingTasks: 1,
  submittedTasks: 1,
};
const enrollment = {
  ...course,
  courseId: course.id,
  courseName: course.name,
  courseDescription: course.description,
  mentorId: mentor.id,
  mentorName: mentor.fullName,
  mentorEmail: mentor.email,
  mentorSpecialization: mentor.specialization,
  enrollmentStatus: "active",
  lessonsCount: 5,
  tasksCount: 3,
  stats,
};
const mentee = {
  ...person,
  menteeId: person.id,
  assignedDate: now,
  progressPercentage: 40,
  progress: 40,
  lastActive: now,
  notes: "Working on a portfolio project.",
  courses: [course],
};
const submission = {
  id: "ui-submission",
  taskId: task.id,
  taskTitle: task.title,
  taskDescription: task.description,
  taskRequirements: "Create a responsive layout.",
  deadline: task.deadline,
  menteeId: person.id,
  menteeName: person.fullName,
  menteeEmail: person.email,
  courseId: course.id,
  courseName: course.name,
  submissionLink: "https://example.test/portfolio",
  submissionNotes: "My first portfolio is ready for review.",
  submittedAt: now,
  status: "submitted",
  mentorFeedback: null,
  reviewedAt: null,
};
let createdCourse = null;
let fixtureLessons = [lesson];
function profile() {
  return {
    ...(role === "Mentor" ? mentor : person),
    role,
    status,
    fullName:
      role === "Admin"
        ? "Community Admin"
        : role === "Mentor"
          ? mentor.fullName
          : person.fullName,
    membershipEnabled: status === "payment",
    status: status === "payment" ? "approved" : status,
  };
}
function response(path) {
  const list = (x) => (empty ? [] : x);
  if (path === "/auth/me") return { profile: profile() };
  if (path === "/mentee/dashboard")
    return {
      mentorAssignments: list([
        { mentorId: mentor.id, mentorName: mentor.fullName },
      ]),
      lessonsData: { total: 5, completed: 2 },
      tasksData: { total: 3, approved: 1 },
      announcements: list([
        {
          id: "ui-news",
          title: "Make something you’re proud of",
          message: "Bring your questions to your next mentorship session.",
          createdAt: now,
        },
      ]),
    };
  if (path === "/mentor/dashboard")
    return {
      stats: {
        totalMentees: 4,
        activeMentees: 3,
        totalCourses: 2,
        pendingSubmissions: 1,
      },
      recentCourses: list([course]),
    };
  if (path === "/mentee/mentors")
    return {
      assignedMentors: list([mentor]),
      activeCourses: list([
        enrollment,
        {
          ...enrollment,
          courseId: "ui-course-2",
          courseName: "JavaScript foundations",
          progressPercentage: 65,
        },
      ]),
    };
  if (path === "/mentee/mentors/courses")
    return { mentor, courses: list([enrollment]) };
  if (path === "/mentee/mentors/detail")
    return {
      ...mentor,
      courseName: course.name,
      courseDescription: course.description,
      duration: course.duration,
      progressPercentage: 40,
      relationshipId: "ui-relation",
      courses: list([enrollment]),
      lessons: list(fixtureLessons),
      tasks: list([task]),
      stats,
      assignment: { assignedDate: now, notes: "Practice and build together." },
    };
  if (path === "/mentee/courses/detail")
    return { course, lessons: list([lesson]), tasks: list([task]), stats };
  if (path === "/mentee/lessons")
    return {
      lessons: list([
        lesson,
        {
          ...lesson,
          id: "ui-lesson-2",
          title: "Building with reusable components",
        },
      ]),
    };
  if (path === "/mentee/tasks") return { tasks: list([task]) };
  if (path === "/mentee/tasks/detail") return task;
  if (path === "/mentor/courses")
    return {
      courses: list([
        ...(createdCourse ? [createdCourse] : []),
        course,
        { ...course, id: "ui-course-2", name: "JavaScript foundations" },
      ]),
      stats: { totalCourses: 2, activeCourses: 2, totalEnrollments: 6 },
    };
  if (path === "/mentor/courses/detail")
    return { ...course, lessons: list(fixtureLessons), tasks: list([task]) };
  if (path === "/mentor/mentees")
    return {
      mentees: list([mentee]),
      stats: {
        totalMentees: 4,
        activeMentees: 3,
        completedMentees: 1,
        avgProgress: 40,
      },
    };
  if (path === "/mentor/mentees/detail") return mentee;
  if (path === "/mentor/mentees/assigned")
    return { mentees: list([{ ...mentee, isEnrolled: false }]) };
  if (path === "/mentor/submissions")
    return {
      submissions: list([submission]),
      stats: { total: 1, pending: 1, approved: 0, rejected: 0 },
    };
  if (path === "/admin/stats")
    return { total: 12, approved: 8, pending: 3, rejected: 1 };
  if (path === "/admin/mentors") return [mentor];
  if (path === "/admin/users")
    return {
      users: list([
        person,
        mentor,
        {
          ...person,
          id: "ui-pending",
          fullName: "Kofi Owusu",
          status: "pending",
        },
      ]),
      totalCount: empty ? 0 : 3,
      totalPages: 1,
    };
  if (path === "/admin/mentor-assignments") return { assignments: [] };
  if (["/auth/login", "/mentor/login", "/admin/login"].includes(path))
    return { error: "The email or password is incorrect. Please try again." };
  return { success: true };
}
const setValue = async (selector, value) => {
  await evaluate(
    `(() => { const field = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(field, ${JSON.stringify(value)}); field.dispatchEvent(new Event('input', { bubbles: true })); })()`,
  );
  await wait(80);
};
const waitFor = async (expression) => {
  for (let i = 0; i < 100; i++) {
    if (await evaluate(expression)) return;
    await wait(100);
  }
  throw new Error("Timed out: " + expression);
};
const buttonText = async (text, scope = "body") => {
  await evaluate(
    `(() => { const button = [...document.querySelectorAll(${JSON.stringify(scope + " button")})].find(button => button.textContent.trim() === ${JSON.stringify(text)}); if(!button) throw new Error('Button missing: '+${JSON.stringify(text)}); button.focus(); button.click(); })()`,
  );
  await wait(100);
};
await send("Page.enable");
await send("Runtime.enable");
await send("Fetch.enable", {
  patterns: [{ urlPattern: "*", requestStage: "Request" }],
});
ws.addEventListener("message", async (event) => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.exceptionThrown")
    errors.push(
      message.params.exceptionDetails.exception?.description ||
        message.params.exceptionDetails.text,
    );
  if (message.method !== "Fetch.requestPaused") return;
  const { requestId, request } = message.params;
  const url = new URL(request.url);
  try {
    if (url.pathname.includes("/api/")) {
      apiRequests++;
      if (request.method !== "OPTIONS" && !errorMode) {
        const body = JSON.parse(request.postData || "{}");
        if (url.pathname.endsWith("/mentor/courses/create"))
          createdCourse = {
            ...course,
            id: "ui-created",
            name: body.name,
            description: body.description,
            duration: body.duration,
          };
        if (url.pathname.endsWith("/mentor/lessons/update"))
          fixtureLessons = fixtureLessons.map((item) =>
            item.id === body.lesson_id ? { ...item, ...body } : item,
          );
        if (url.pathname.endsWith("/mentor/lessons/delete"))
          fixtureLessons = fixtureLessons.filter(
            (item) => item.id !== url.searchParams.get("lessonId"),
          );
      }

      const path = url.pathname.slice(url.pathname.indexOf("/api") + 4);
      const failure = errorMode && path !== "/auth/me";
      const login = path.endsWith("/login");
      const body = failure
        ? { error: "Test service unavailable. Please try again." }
        : response(path);
      await send("Fetch.fulfillRequest", {
        requestId,
        responseCode:
          request.method === "OPTIONS"
            ? 200
            : failure
              ? 503
              : login
                ? 401
                : 200,
        responseHeaders: [
          { name: "Content-Type", value: "application/json" },
          { name: "Access-Control-Allow-Origin", value: "*" },
          { name: "Access-Control-Allow-Headers", value: "*" },
          {
            name: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          },
        ],
        body: Buffer.from(JSON.stringify(body)).toString("base64"),
      });
    } else if (
      /paystack|google-analytics|googletagmanager/.test(url.hostname)
    ) {
      await send("Fetch.fulfillRequest", {
        requestId,
        responseCode: 200,
        body: "",
      });
    } else await send("Fetch.continueRequest", { requestId });
  } catch (error) {
    errors.push(String(error));
  }
});
await send("Page.navigate", { url: origin });
await wait(1000);
const navigate = async (path, accountRole = null) => {
  role = accountRole || "Mentee";
  await evaluate(
    `localStorage.removeItem('token');localStorage.removeItem('authToken');localStorage.removeItem('currentUser');${accountRole ? `localStorage.setItem('token','isolated-ui-fixture');localStorage.setItem('currentUser',${JSON.stringify(JSON.stringify(profile()))});` : ""}`,
  );
  await send("Page.navigate", { url: origin + path });
  await wait(650);
  for (let i = 0; i < 60; i++) {
    if (
      await evaluate(
        "!!document.querySelector('h1') && !document.querySelector('.animate-pulse, vite-error-overlay')",
      )
    )
      break;
    await wait(150);
  }
  await evaluate("document.fonts.ready.then(()=>true)");
  await wait(120);
};
try {
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  const routes = [
    ["/", null],
    ["/login", null],
    ["/signup", null],
    ["/mentor/login", null],
    ["/admin/login", null],
    ["/dashboard", "Mentee"],
    ["/courses", "Mentee"],
    ["/mentors", "Mentee"],
    ["/lessons", "Mentee"],
    ["/tasks", "Mentee"],
    ["/task/ui-task", "Mentee"],
    ["/mentor-course-detail?mentorId=ui-mentor&courseId=ui-course", "Mentee"],
    ["/mentor-courses?mentorId=ui-mentor", "Mentee"],
    ["/mentor/ui-mentor", "Mentee"],
    ["/profile", "Mentee"],
    ["/mentor/dashboard", "Mentor"],
    ["/mentor/courses", "Mentor"],
    ["/mentor/course/ui-course", "Mentor"],
    ["/mentor/mentees", "Mentor"],
    ["/mentor/mentee/ui-person", "Mentor"],
    ["/mentor/submissions", "Mentor"],
    ["/mentor/profile", "Mentor"],
    ["/admin/dashboard", "Admin"],
    ["/not-a-page", null],
  ];
  for (const [path, accountRole] of process.env.UI_PHASE === "interactions"
    ? []
    : routes) {
    await navigate(path, accountRole);
    const state = await evaluate(
      "({heading:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth,pathname:location.pathname,title:document.title})",
    );
    console.log("ROUTE", path, state);
    assert(state.pathname === path.split("?")[0], `Route preserved: ${path}`);
    assert(!!state.heading, `Page rendered: ${path}`);
    assert(!state.overflow, `Desktop layout: ${path}`);
    await capture(path.split("?")[0].replaceAll("/", "-"));
  }
  if (process.env.UI_PHASE !== "interactions")
    assert(apiRequests > 15, "Private routes use isolated API fixtures");
  if (process.env.UI_PHASE !== "routes") {
    await navigate("/login");
    await click(".auth-submit");
    assert(
      await evaluate(
        "document.querySelectorAll('[aria-invalid=true]').length===2 && document.activeElement.id==='login-email'",
      ),
      "Login validation and first-error focus",
    );
    await click('button[aria-label="Show password"]');
    assert(
      await evaluate("document.querySelector('#login-password').type==='text'"),
      "Password visibility toggle",
    );
    await click('button[aria-label="Hide password"]');
    await setValue("#login-email", "amina@example.test");
    await setValue("#login-password", "test-password");
    await click(".auth-submit");
    await waitFor(
      "document.querySelector('.app-form-error')?.textContent.includes('incorrect')",
    );
    assert(
      await evaluate(
        "document.querySelector('#login-email').value==='amina@example.test' && !document.querySelector('.auth-submit').disabled",
      ),
      "Login failure keeps input and allows retry",
    );
    await navigate("/mentor/courses", "Mentor");
    await evaluate(
      "[...document.querySelectorAll('button')].find(b=>/Create.*Course/.test(b.textContent)).click()",
    );
    await wait(200);
    assert(
      await evaluate("!!document.querySelector('dialog[open]')"),
      "Course creation dialog opens",
    );
    await capture("course-dialog");
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
    });
    await wait(100);
    assert(
      await evaluate("!document.querySelector('dialog[open]')"),
      "Escape closes dialog",
    );
    await buttonText("Create New Course");
    await buttonText("Create Course", "dialog");
    assert(
      await evaluate("!!document.querySelector('dialog [role=alert]')"),
      "Modal validation remains visible in the top layer",
    );
    await setValue("dialog input[type=text]", "UI verification course");
    await setValue("dialog input[type=number]", "6");
    await setValue("dialog textarea", "An isolated browser fixture.");
    errorMode = true;
    await buttonText("Create Course", "dialog");
    await waitFor(
      "document.querySelector('dialog [role=alert]')?.textContent.includes('unavailable')",
    );
    assert(
      await evaluate(
        "document.querySelector('dialog input[type=text]').value==='UI verification course'",
      ),
      "Failed create preserves the draft",
    );
    errorMode = false;
    await buttonText("Create Course", "dialog");
    await waitFor(
      "!document.querySelector('dialog[open]') && document.body.innerText.includes('UI verification course')",
    );
    assert(
      true,
      "Create succeeds and refreshes the course list with fixture data",
    );
    await navigate("/mentor/course/ui-course", "Mentor");
    await click('button[title="Edit lesson"]');
    await waitFor("!!document.querySelector('dialog[open]')");
    await setValue("dialog input[type=text]", "Updated fixture lesson");
    await evaluate(
      "[...document.querySelectorAll('dialog button')].find(b=>/Save Changes|Update Lesson/.test(b.textContent)).click()",
    );
    await waitFor(
      "!document.querySelector('dialog[open]') && document.body.innerText.includes('Updated fixture lesson')",
    );
    assert(true, "Edit saves and refreshes the lesson");
    await click('button[title="Delete lesson"]');
    assert(
      await evaluate("document.activeElement.textContent.trim()==='Cancel'"),
      "Delete dialog focuses the safe action",
    );
    await evaluate(
      "[...document.querySelectorAll('dialog button')].find(b=>b.textContent.trim()==='Delete').click()",
    );
    await waitFor(
      "!document.querySelector('dialog[open]') && !document.body.innerText.includes('Updated fixture lesson')",
    );
    assert(true, "Confirmed delete refreshes the lesson list");
    await navigate("/lessons", "Mentee");
    await setValue("input[type=search]", "nothing-matches-this");
    assert(
      await evaluate("/no.*lessons/i.test(document.body.innerText)"),
      "Search shows a no-results state",
    );
    await click('button[aria-label="Clear search"]');
    assert(
      await evaluate(
        "document.activeElement.type==='search' && document.activeElement.value===''",
      ),
      "Clear search resets and restores input focus",
    );
    errorMode = true;
    await navigate("/courses", "Mentee");
    assert(
      await evaluate(
        "document.querySelector('h1').textContent.includes('couldn’t load')",
      ),
      "Load failure has an explicit recovery state",
    );
    errorMode = false;
    await buttonText("Try again");
    await waitFor(
      "document.body.innerText.includes('Build your first web application')",
    );
    assert(true, "Retry restores the course list");
    for (const [path, accountRole] of [
      ["/login", null],
      ["/signup", null],
      ["/dashboard", "Mentee"],
      ["/courses", "Mentee"],
      ["/mentor/dashboard", "Mentor"],
      ["/mentor/courses", "Mentor"],
      ["/admin/dashboard", "Admin"],
      ["/profile", "Mentee"],
    ]) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      await navigate(path, accountRole);
      assert(
        await evaluate("document.documentElement.scrollWidth<=innerWidth"),
        `Mobile layout: ${path}`,
      );
      await capture("mobile" + path.replaceAll("/", "-"));
    }
    await navigate("/dashboard", "Mentee");
    await click('button[aria-label="Open navigation"]');
    assert(
      await evaluate("!!document.querySelector('#workspace-mobile-nav')"),
      "Mobile navigation opens",
    );
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
    });
    await wait(100);
    assert(
      await evaluate(
        "!document.querySelector('#workspace-mobile-nav')&&document.activeElement.getAttribute('aria-label')==='Open navigation'",
      ),
      "Mobile Escape and focus restoration",
    );
    await click('button[aria-label="Switch to dark mode"]');
    assert(
      await evaluate("document.documentElement.classList.contains('dark')"),
      "Shared dark theme",
    );
    await wait(400);
    await capture("mobile-dashboard-dark");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await navigate("/mentor/dashboard", "Mentor");
    await capture("mentor-dashboard-dark");
    await click('button[aria-label="Switch to light mode"]');
    empty = true;
    await navigate("/courses", "Mentee");
    assert(
      await evaluate(
        "/no.*courses|not.*enrolled/i.test(document.body.innerText)",
      ),
      "Empty course state",
    );
    empty = false;
    status = "pending";
    await navigate("/pending-approval", "Mentee");
    await capture("pending");
    assert(
      await evaluate("document.body.innerText.includes('under review')"),
      "Pending approval state",
    );
    status = "payment";
    await navigate("/payment-wall", "Mentee");
    await capture("membership");
    assert(
      await evaluate("document.body.innerText.includes('30.00')"),
      "Membership amount preserved",
    );
    status = "approved";
  }
  await navigate("/signup");
  await evaluate("document.querySelector('#signup-role').focus()");
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "ArrowDown",
    code: "ArrowDown",
    windowsVirtualKeyCode: 40,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  await wait(150);
  assert(
    await evaluate(
      "document.querySelector('#signup-role').value==='Mentor' && document.body.innerText.includes('Your specialization')",
    ),
    "Native role selection updates the form with the keyboard",
  );
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await navigate("/");
  assert(
    await evaluate(
      "document.documentElement.scrollWidth<=innerWidth && !document.querySelector('vite-error-overlay')",
    ),
    "Homepage regression under reduced motion",
  );
  await capture("homepage-final");
  await send("Emulation.setEmulatedMedia", { features: [] });
  assert(
    errors.length === 0,
    `No browser runtime errors: ${errors.join("; ")}`,
  );
  console.log("All product UI checks passed.");
} finally {
  await evaluate(
    "localStorage.removeItem('token');localStorage.removeItem('authToken');localStorage.removeItem('currentUser')",
  );
  await send("Fetch.disable");
  await send("Page.navigate", { url: origin + "/login" });
  ws.close();
}
