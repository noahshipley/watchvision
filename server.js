const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let users = JSON.parse(fs.readFileSync("users.json", "utf8"));
let videos = JSON.parse(fs.readFileSync("videos.json", "utf8"));

function save() {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
  fs.writeFileSync("videos.json", JSON.stringify(videos, null, 2));
}

/* AUTH */
app.post("/signup", (req, res) => {
  const { username, password, age } = req.body;
  if (!username || !password) return res.json({ error: "Missing fields" });
  if (users[username]) return res.json({ error: "User exists" });

  users[username] = { password, age, role: "user" };
  save();
  res.json({ success: true });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!users[username] || users[username].password !== password)
    return res.json({ error: "Invalid login" });

  res.json({ success: true, user: users[username] });
});

/* VIDEOS */
app.post("/upload", (req, res) => {
  const { title, url, username } = req.body;
  if (!title || !url) return res.json({ error: "Missing data" });

  videos.push({
    id: crypto.randomUUID(),
    title,
    url,
    username,
    approved: false,
    likes: 0,
    views: 0,
    comments: []
  });

  save();
  res.json({ success: true });
});

app.get("/videos", (req, res) => {
  res.json(videos);
});

app.post("/approve", (req, res) => {
  const video = videos.find(v => v.id === req.body.id);
  if (!video) return res.json({ error: "Not found" });
  video.approved = true;
  save();
  res.json({ success: true });
});

/* INTERACTIONS */
app.post("/like", (req, res) => {
  const video = videos.find(v => v.id === req.body.id);
  if (!video) return res.json({ error: "Not found" });
  video.likes++;
  save();
  res.json({ likes: video.likes });
});

app.post("/view", (req, res) => {
  const video = videos.find(v => v.id === req.body.id);
  if (!video) return res.json({ error: "Not found" });
  video.views++;
  save();
  res.json({ views: video.views });
});

app.post("/comment", (req, res) => {
  const { id, user, text } = req.body;
  const video = videos.find(v => v.id === id);
  if (!video) return res.json({ error: "Not found" });

  video.comments.push({ user, text, time: Date.now() });
  save();
  res.json({ success: true });
});

app.listen(port, () => console.log("WatchVision running"));
