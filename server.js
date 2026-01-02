const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

let users = JSON.parse(fs.readFileSync("users.json"));
let videos = JSON.parse(fs.readFileSync("videos.json"));

function save() {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
  fs.writeFileSync("videos.json", JSON.stringify(videos, null, 2));
}

// AUTH
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ error: "Missing fields" });
  if (users[username]) return res.json({ error: "User exists" });

  users[username] = { password, role: "user" };
  save();
  res.json({ success: true });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!users[username] || users[username].password !== password)
    return res.json({ error: "Invalid login" });

  res.json({ success: true, user: { username, role: users[username].role } });
});

// VIDEOS
app.post("/upload", (req, res) => {
  const { title, url, author } = req.body;
  videos.push({
    id: Date.now().toString(),
    title,
    url,
    author,
    approved: false,
    likes: [],
    dislikes: [],
    comments: []
  });
  save();
  res.json({ success: true });
});

app.get("/videos", (req, res) => {
  res.json(videos.filter(v => v.approved));
});

// LIKE / DISLIKE
app.post("/react", (req, res) => {
  const { id, user, type } = req.body;
  const video = videos.find(v => v.id === id);
  if (!video) return res.json({ error: "Not found" });

  video.likes = video.likes.filter(u => u !== user);
  video.dislikes = video.dislikes.filter(u => u !== user);

  if (type === "like") video.likes.push(user);
  if (type === "dislike") video.dislikes.push(user);

  save();
  res.json({ success: true });
});

// COMMENT
app.post("/comment", (req, res) => {
  const { id, user, text } = req.body;
  const video = videos.find(v => v.id === id);
  video.comments.push({ user, text });
  save();
  res.json({ success: true });
});

// MODERATION
app.post("/approve", (req, res) => {
  const { id } = req.body;
  const video = videos.find(v => v.id === id);
  if (video) video.approved = true;
  save();
  res.json({ success: true });
});

app.listen(PORT, () => console.log("WatchVision running"));
