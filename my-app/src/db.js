const USERS_KEY   = "fv_users";
const SESSION_KEY = "fv_session";

/* ================= PASSWORD HASH ================= */

function hashPw(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  }
  return h.toString(16);
}

/* ================= STORAGE HELPERS ================= */

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* ================= AUTH ================= */

export function registerUser({ name, email, farm="", phone="", password }) {
  const users = getUsers();

  if (users.find(u => u.email === email.toLowerCase())) {
    return { ok:false, error:"An account with this email already exists." };
  }

  const user = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    farm: farm?.trim() || "",
    phone: phone?.trim() || "",
    passwordHash: hashPw(password),
    createdAt: new Date().toISOString()
  };

  users.push(user);
  saveUsers(users);

  const { passwordHash, ...safe } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe));

  return { ok:true, user:safe };
}

export function loginUser({ email, password }) {
  const users = getUsers();
  const user = users.find(u => u.email === email.toLowerCase());

  if (!user) return { ok:false, error:"No account found with this email." };
  if (user.passwordHash !== hashPw(password))
    return { ok:false, error:"Incorrect password." };

  const { passwordHash, ...safe } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe));

  return { ok:true, user:safe };
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

/* ================= PROFILE UPDATE ================= */

export function updateUser(fields) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === fields.id);

  if (idx === -1) {
    return { ok:false, error:"User not found." };
  }

  // Prevent email collision
  if (
    fields.email &&
    users.some(u => u.email === fields.email.toLowerCase() && u.id !== fields.id)
  ) {
    return { ok:false, error:"Email already in use by another account." };
  }

  // Safe update (never touch passwordHash here)
  users[idx] = {
    ...users[idx],
    name:  fields.name?.trim()  ?? users[idx].name,
    email: fields.email?.trim().toLowerCase() ?? users[idx].email,
    farm:  fields.farm?.trim()  ?? users[idx].farm,
    phone: fields.phone?.trim() ?? users[idx].phone
  };

  saveUsers(users);

  const { passwordHash, ...safe } = users[idx];
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe));

  return { ok:true, user:safe };
}

/* ================= PASSWORD CHANGE ================= */

export function changePassword(userId, currentPw, newPw) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);

  if (!user) return { ok:false, error:"User not found." };
  if (user.passwordHash !== hashPw(currentPw))
    return { ok:false, error:"Current password is incorrect." };

  user.passwordHash = hashPw(newPw);
  saveUsers(users);

  return { ok:true };
}