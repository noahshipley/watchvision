const API = ""; // SAME DOMAIN
let currentUser = null;

async function api(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

/* AUTH */
async function signup() {
  const u = username.value, p = password.value;
  const r = await api("/signup", { username: u, password: p, age: 12 });
  alert(r.error || "Account created");
}

async function login() {
  const u = username.value, p = password.value;
  const r = await api("/login", { username: u, password: p });
  if (r.error) return alert(r.error);

  currentUser = u;
  auth.style.display = "none";
  app.style.display = "block";
  loadVideos();
}

/* VIDEOS */
async function loadVideos(query = "") {
  const res = await fetch("/videos");
  const data = await res.json();
  feed.innerHTML = "";

  data
    .filter(v => v.approved)
    .filter(v => v.title.toLowerCase().includes(query.toLowerCase()))
    .forEach(v => renderVideo(v));
}

function renderVideo(v) {
  const d = document.createElement("div");
  d.className = "video";

  d.innerHTML = `
    <h3>${v.title}</h3>
    <p>by ${v.username}</p>
    <p>${v.views} views • ${v.likes} likes</p>
    <button onclick="watch('${v.id}','${v.url}')">Watch</button>
    <button onclick="like('${v.id}')">👍</button>
    <div>
      <input placeholder="Comment..." id="c-${v.id}">
      <button onclick="comment('${v.id}')">Send</button>
    </div>
    <div>${v.comments.map(c => `<p><b>${c.user}:</b> ${c.text}</p>`).join("")}</div>
  `;

  feed.appendChild(d);
}

async function upload() {
  const r = await api("/upload", {
    title: vtitle.value,
    url: vurl.value,
    username: currentUser
  });
  alert(r.error || "Uploaded (pending approval)");
}

/* INTERACTIONS */
async function like(id) {
  await api("/like", { id });
  loadVideos();
}

async function watch(id, url) {
  await api("/view", { id });
  window.open(url, "_blank");
}

async function comment(id) {
  const text = document.getElementById("c-" + id).value;
  if (!text) return;
  await api("/comment", { id, user: currentUser, text });
  loadVideos();
}

/* SEARCH */
searchBtn.onclick = () => loadVideos(search.value);
