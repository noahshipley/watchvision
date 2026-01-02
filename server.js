const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Serve frontend
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Load users/videos
let users = JSON.parse(fs.readFileSync("users.json"));
let videos = JSON.parse(fs.readFileSync("videos.json"));

// Signup
app.post("/signup", (req, res) => {
  const { username, password, age } = req.body;
  if (users[username]) return res.json({ error: "Username exists" });
  users[username] = { password, age, role: "user" };
  fs.writeFileSync("users.json", JSON.stringify(users));
  res.json({ success: true });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!users[username] || users[username].password !== password)
    return res.json({ error: "Invalid credentials" });
  res.json({ user: users[username] });
});

// Upload video
app.post("/upload", (req, res) => {
  const { username, title, url } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  videos.push({ id, username, title, url, approved: false });
  fs.writeFileSync("videos.json", JSON.stringify(videos));
  res.json({ success: true });
});

// Approve video (moderator)
app.post("/approve", (req, res) => {
  const { id } = req.body;
  const video = videos.find((v) => v.id === id);
  if (video) video.approved = true;
  fs.writeFileSync("videos.json", JSON.stringify(videos));
  res.json({ success: true });
});

// Get videos
app.get("/videos", (req, res) => res.json({ videos }));

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
