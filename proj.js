"use strict";

/* ============================================================
   LOGIN PAGE
   ============================================================ */
(function () {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const togglePwBtn   = document.getElementById("togglePw");
  const eyeIcon       = document.getElementById("eyeIcon");
  const loginBtn      = document.getElementById("loginBtn");
  const btnLoader     = document.getElementById("btnLoader");
  const btnText       = loginBtn.querySelector(".btn-text");
  const usernameError = document.getElementById("usernameError");
  const passwordError = document.getElementById("passwordError");
  const formError     = document.getElementById("formError");

  togglePwBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    eyeIcon.innerHTML = isPassword
      ? `<path d="M17.94 17.94A10.08 10.08 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
         <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
         <line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
         <circle cx="12" cy="12" r="3"/>`;
  });

  function clearErrors() {
    usernameError.textContent = "";
    passwordError.textContent = "";
    formError.textContent     = "";
    usernameInput.classList.remove("input-invalid");
    passwordInput.classList.remove("input-invalid");
  }

  function setLoading(loading) {
    loginBtn.disabled   = loading;
    btnText.textContent = loading ? "Logging in…" : "Log in";
    btnLoader.classList.toggle("active", loading);
  }

  usernameInput.addEventListener("input", () => {
    usernameError.textContent = "";
    usernameInput.classList.remove("input-invalid");
    formError.textContent = "";
  });

  passwordInput.addEventListener("input", () => {
    passwordError.textContent = "";
    passwordInput.classList.remove("input-invalid");
    formError.textContent = "";
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const username  = usernameInput.value.trim();
    const password  = passwordInput.value;
    const nameParts = username.split(/\s+/).filter(Boolean);
    let valid = true;

    if (!username) {
      usernameError.textContent = "Full name is required.";
      usernameInput.classList.add("input-invalid");
      valid = false;
    } else if (nameParts.length < 2) {
      usernameError.textContent = "Please enter your first and last name.";
      usernameInput.classList.add("input-invalid");
      valid = false;
    }

    if (!password) {
      passwordError.textContent = "Password is required.";
      passwordInput.classList.add("input-invalid");
      valid = false;
    } else if (password.length < 6) {
      passwordError.textContent = "Password must be at least 6 characters.";
      passwordInput.classList.add("input-invalid");
      valid = false;
    }
    if (!valid) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    sessionStorage.setItem("userName", username.trim());
    btnText.textContent       = "✓ Welcome!";
    loginBtn.style.background = "#28a745";
    setTimeout(() => { window.location.href = "dashboard.html"; }, 900);
  });

  [usernameInput, passwordInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") loginForm.requestSubmit();
    });
  });
})();

/* ============================================================
   SHARED: topbar user info + active nav + logout
   (runs on dashboard, notebooks, tasks — any page with .sidebar)
   ============================================================ */
(function () {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  // Active nav highlight
  const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.getAttribute("href") === currentPage);
  });

  // Topbar user name + avatar initials
  const userName = sessionStorage.getItem("userName") || "";
  if (userName) {
    const nameParts = userName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0];
    const initials  = nameParts.map(p => p[0].toUpperCase()).slice(0, 2).join("");

    const welcomeEl = document.querySelector(".welcome-card h2");
    if (welcomeEl) welcomeEl.textContent = `Welcome back, ${firstName}! 👋`;

    const userNameEl = document.querySelector(".user-name");
    if (userNameEl) userNameEl.textContent = userName;

    const avatarEl = document.querySelector(".user-avatar");
    if (avatarEl) avatarEl.textContent = initials;
  }

  // Logout
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("profileData");
    sessionStorage.removeItem("userPassword");
    sessionStorage.removeItem("profilePhoto");
    window.location.href = "index.html";
  });
})();

/* ============================================================
   PROFILE PAGE
   ============================================================ */
(function () {
  if (!document.getElementById("infoCard")) return;

  function showToast(msg, duration = 2800) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), duration);
  }

  function loadProfile() {
    return JSON.parse(sessionStorage.getItem("profileData") || "{}");
  }

  function saveProfile(data) {
    sessionStorage.setItem("profileData", JSON.stringify(data));
  }

  const userName  = sessionStorage.getItem("userName") || "";
  const nameParts = userName.trim().split(/\s+/).filter(Boolean);
  const initials  = nameParts.map(p => p[0].toUpperCase()).slice(0, 2).join("");

  const profileNameEl = document.getElementById("profileName");
  if (profileNameEl) profileNameEl.textContent = userName || "—";

  const avatarInitialsEl = document.getElementById("avatarInitials");
  if (avatarInitialsEl) avatarInitialsEl.textContent = initials;

  // Profile photo
  const avatarPhoto     = document.getElementById("avatarPhoto");
  const avatarInitials  = document.getElementById("avatarInitials");
  const avatarInput     = document.getElementById("avatarInput");
  const avatarUploadBtn = document.getElementById("avatarUploadBtn");

  const savedPhoto = sessionStorage.getItem("profilePhoto");
  if (savedPhoto && avatarPhoto) {
    avatarPhoto.src = savedPhoto;
    avatarPhoto.style.display = "block";
    if (avatarInitials) avatarInitials.style.display = "none";
  }

  if (avatarUploadBtn) avatarUploadBtn.addEventListener("click", () => avatarInput.click());

  if (avatarInput) {
    avatarInput.addEventListener("change", () => {
      const file = avatarInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        avatarPhoto.src = dataUrl;
        avatarPhoto.style.display = "block";
        if (avatarInitials) avatarInitials.style.display = "none";
        sessionStorage.setItem("profilePhoto", dataUrl);
        showToast("✓ Profile photo updated");
      };
      reader.readAsDataURL(file);
    });
  }

  // Info fields
  const fields = ["name", "id", "contact", "email", "gender", "section"];

  function renderValues() {
    const data = loadProfile();
    const nameVal = userName || "—";
    const valName = document.getElementById("val-name");
    const inpName = document.getElementById("inp-name");
    if (valName) valName.textContent = nameVal;
    if (inpName) inpName.value = nameVal;

    fields.filter(f => f !== "name").forEach(f => {
      const val   = data[f] || "";
      const valEl = document.getElementById(`val-${f}`);
      const inpEl = document.getElementById(`inp-${f}`);
      if (!valEl || !inpEl) return;

      if (val) {
        valEl.textContent = val;
        valEl.classList.remove("empty");
      } else {
        valEl.textContent = "Not set — click Edit to add";
        valEl.classList.add("empty");
      }
      inpEl.value = val;
    });
  }

  renderValues();

  const infoCard = document.getElementById("infoCard");
  const editBtn  = document.getElementById("editBtn");
  const saveBtn  = document.getElementById("saveBtn");

  if (editBtn) editBtn.addEventListener("click", () => infoCard.classList.add("editing"));

  if (saveBtn) saveBtn.addEventListener("click", () => {
    const data = loadProfile();
    fields.filter(f => f !== "name").forEach(f => {
      const inpEl = document.getElementById(`inp-${f}`);
      if (inpEl) data[f] = inpEl.value.trim();
    });
    saveProfile(data);
    infoCard.classList.remove("editing");
    renderValues();
    showToast("✓ Profile saved");
  });

  // Change Password Modal
  const pwModal    = document.getElementById("pwModal");
  const pwCurrent  = document.getElementById("pwCurrent");
  const pwNew      = document.getElementById("pwNew");
  const pwConfirm  = document.getElementById("pwConfirm");
  const errCurrent = document.getElementById("err-current");
  const errNew     = document.getElementById("err-new");
  const errConfirm = document.getElementById("err-confirm");

  const changePwBtn = document.getElementById("changePwBtn");
  if (changePwBtn) changePwBtn.addEventListener("click", () => {
    pwCurrent.value = ""; pwNew.value = ""; pwConfirm.value = "";
    [errCurrent, errNew, errConfirm].forEach(e => e.textContent = "");
    [pwCurrent, pwNew, pwConfirm].forEach(i => i.classList.remove("invalid"));
    pwModal.classList.add("open");
  });

  const pwCancel = document.getElementById("pwCancel");
  if (pwCancel) pwCancel.addEventListener("click", () => pwModal.classList.remove("open"));

  if (pwModal) pwModal.addEventListener("click", (e) => {
    if (e.target === pwModal) pwModal.classList.remove("open");
  });

  document.querySelectorAll(".modal-eye").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      if (input) input.type = input.type === "password" ? "text" : "password";
    });
  });

  const pwSave = document.getElementById("pwSave");
  if (pwSave) pwSave.addEventListener("click", () => {
    let valid = true;
    [errCurrent, errNew, errConfirm].forEach(e => e.textContent = "");
    [pwCurrent, pwNew, pwConfirm].forEach(i => i.classList.remove("invalid"));

    const stored = sessionStorage.getItem("userPassword") || "";
    if (stored && pwCurrent.value !== stored) {
      errCurrent.textContent = "Current password is incorrect.";
      pwCurrent.classList.add("invalid");
      valid = false;
    }
    if (pwNew.value.length < 6) {
      errNew.textContent = "New password must be at least 6 characters.";
      pwNew.classList.add("invalid");
      valid = false;
    }
    if (pwNew.value !== pwConfirm.value) {
      errConfirm.textContent = "Passwords do not match.";
      pwConfirm.classList.add("invalid");
      valid = false;
    }
    if (!valid) return;
    sessionStorage.setItem("userPassword", pwNew.value);
    pwModal.classList.remove("open");
    showToast("✓ Password changed successfully");
  });
})();

/* ============================================================
   NOTEBOOKS PAGE
   ============================================================ */
(function () {
  if (!document.getElementById("classGrid")) return;

  const CLASSES = [
    { subject: "Drama Club",                        year: "2025-2026", teacher: "Club Adviser",          banner: "banner-red"    },
    { subject: "East High Basketball Team",         year: "2025-2026", teacher: "Club Adviser",          banner: "banner-indigo" },
    { subject: "East High Scholastic Decathlon Team", year: "2025-2026", teacher: "Club Adviser",        banner: "banner-purple" },
    { subject: "Art Club",                          year: "2025-2026", teacher: "Club Adviser",          banner: "banner-peach"  },
    { subject: "Science Club",                      year: "2025-2026", teacher: "Club Adviser",          banner: "banner-teal"   },
    { subject: "Garden Club",                       year: "2025-2026", teacher: "Club Adviser",          banner: "banner-green"  },
    { subject: "Newspaper Club",                    year: "2025-2026", teacher: "Club Adviser",          banner: "banner-olive"  },
    { subject: "Marching Band",                     year: "2025-2026", teacher: "Club Adviser",          banner: "banner-yellow" },
    { subject: "G.S.A. Club",                       year: "2025-2026", teacher: "Club Adviser",          banner: "banner-sky"    },
  ];

  const grid        = document.getElementById("classGrid");
  const countEl     = document.getElementById("classCount");
  const searchInput = document.getElementById("classSearch");
  const yearFilter  = document.getElementById("yearFilter");
  const sortSelect  = document.getElementById("sortBy");
  const joinModal   = document.getElementById("joinModal");
  const toastEl     = document.getElementById("toast");

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  function renderGrid() {
    const query = searchInput.value.trim().toLowerCase();
    const year  = yearFilter.value;
    const sort  = sortSelect.value;

    let list = CLASSES.filter(c => {
      const matchYear   = !year || c.year === year;
      const matchSearch = !query || c.subject.toLowerCase().includes(query) || c.teacher.toLowerCase().includes(query);
      return matchYear && matchSearch;
    });

    if (sort === "name")    list.sort((a, b) => a.subject.localeCompare(b.subject));
    if (sort === "teacher") list.sort((a, b) => a.teacher.localeCompare(b.teacher));

    countEl.textContent = `${list.length} club${list.length !== 1 ? "s" : ""}`;

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="nb-empty">
          <div class="nb-empty-icon">📚</div>
          <div class="nb-empty-text">No clubs found.</div>
        </div>`;
      return;
    }

    grid.innerHTML = list.map(c => `
      <div class="class-card">
        <div class="card-banner">
          <div class="card-banner-inner ${c.banner}">
            <div class="card-school-badge">🐯</div>
          </div>
        </div>
        <div class="card-body">
          <div class="card-subject">${c.subject}</div>
          <div class="card-year">${c.year}</div>
          <div class="card-divider">—</div>
          <div class="card-teacher">Adviser: ${c.teacher}</div>
        </div>
      </div>
    `).join("");
  }

  searchInput.addEventListener("input", renderGrid);
  yearFilter.addEventListener("change", renderGrid);
  sortSelect.addEventListener("change", renderGrid);

  // Tab switch
  document.querySelectorAll(".nb-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".nb-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderGrid();
    });
  });

  // Join Class Modal
  const joinClassBtn = document.getElementById("joinClassBtn");
  if (joinClassBtn) joinClassBtn.addEventListener("click", () => {
    document.getElementById("classCodeInput").value = "";
    joinModal.classList.add("open");
  });

  const joinCancel = document.getElementById("joinCancel");
  if (joinCancel) joinCancel.addEventListener("click", () => joinModal.classList.remove("open"));

  if (joinModal) joinModal.addEventListener("click", e => {
    if (e.target === joinModal) joinModal.classList.remove("open");
  });

  const joinSave = document.getElementById("joinSave");
  if (joinSave) joinSave.addEventListener("click", () => {
    const code = document.getElementById("classCodeInput").value.trim();
    if (!code) { document.getElementById("classCodeInput").focus(); return; }
    joinModal.classList.remove("open");
    showToast(`✓ Request sent for club code: ${code}`);
  });

  renderGrid();
})();
/* ============================================================
   TASKS PAGE
   ============================================================ */
(function () {
  if (!document.getElementById("tasksGrid")) return;

  const TASKS = [
    {
      subject: "East High Basketball Team",
      short:   "BASKETBALL TEAM",
      dot:     "#e8a020",
      tasks: [
        { name: "Basketball Tryouts",                         deadline: "May 15, 2026 | 3:00 P.M.",   status: "upcoming", btn: "Submit",             btnClass: "btn-submit"   },
      ]
    },
    {
      subject: "Drama Club",
      short:   "DRAMA",
      dot:     "#e8a020",
      tasks: [
        { name: "HSM Audition – Vocal Performance",           deadline: "May 13, 2026 | 3:00 P.M.",   status: "upcoming", btn: "Submit",             btnClass: "btn-submit"   },
        { name: "HSM Audition – Dance Choreography",          deadline: "May 13, 2026 | 3:00 P.M.",   status: "upcoming", btn: "Submit",             btnClass: "btn-submit"   },
      ]
    },
  ];

  const STATUS_LABELS = { ongoing: "ONGOING", overdue: "OVERDUE", upcoming: "UPCOMING", submitted: "SUBMITTED" };
  const STATUS_CLASS  = { ongoing: "status-ongoing", overdue: "status-overdue", upcoming: "status-upcoming", submitted: "status-submitted" };

  const grid        = document.getElementById("tasksGrid");
  const subjectList = document.getElementById("subjectList");
  const toastEl     = document.getElementById("toast");

  let activeSubject = "All";

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  function buildSubjectList() {
    const allSubjects = ["All", ...TASKS.map(s => s.subject)];
    subjectList.innerHTML = allSubjects.map(s => {
      const subj  = TASKS.find(t => t.subject === s);
      const dot   = subj ? subj.dot : "transparent";
      const count = s === "All"
        ? TASKS.reduce((n, t) => n + t.tasks.length, 0)
        : (subj ? subj.tasks.length : 0);
      const label = s === "All" ? "All Subjects" : s;
      return `
        <div class="tasks-subject-item${s === activeSubject ? " active" : ""}" data-subject="${s}">
          <span class="tasks-subject-dot" style="background:${dot}"></span>
          ${label}
          <span class="tasks-subject-count">${count}</span>
        </div>`;
    }).join("");

    subjectList.querySelectorAll(".tasks-subject-item").forEach(item => {
      item.addEventListener("click", () => {
        activeSubject = item.dataset.subject;
        buildSubjectList();
        renderTasks();
      });
    });
  }

  function renderTasks() {
    const filtered = activeSubject === "All"
      ? TASKS
      : TASKS.filter(s => s.subject === activeSubject);

    const allCards = filtered.flatMap(s => s.tasks.map(t => ({ ...t, subject: s.subject })));

    if (allCards.length === 0) {
      grid.innerHTML = `<div class="tasks-empty"><div class="tasks-empty-icon">📋</div><div class="tasks-empty-text">No tasks found.</div></div>`;
      return;
    }

    grid.innerHTML = allCards.map(t => `
      <div class="task-card">
        <div class="task-card-subject">${t.subject}</div>
        <div class="task-card-body">
          <div class="task-card-name">${t.name}</div>
          <div class="task-card-deadline${t.status === "overdue" ? " overdue" : ""}">Deadline: ${t.deadline}</div>
          <div class="task-card-status ${STATUS_CLASS[t.status] || ""}">${STATUS_LABELS[t.status] || t.status.toUpperCase()}</div>
        </div>
        <button class="task-card-btn ${t.btnClass}" data-task="${t.name}">${t.btn}</button>
      </div>
    `).join("");

    grid.querySelectorAll(".task-card-btn").forEach(btn => {
      btn.addEventListener("click", () => showToast(`Opened: ${btn.dataset.task}`));
    });
  }

  buildSubjectList();
  renderTasks();
})();