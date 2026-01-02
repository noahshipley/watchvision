const API = ""; // empty = same domain on Render
let currentUser = null;

// Elements
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const authMessage = document.getElementById("auth-message");
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");

// Navigation
const homeBtn = document.getElementById("home-btn");
const uploadNavBtn = document.getElementById("upload-nav-btn");
const modNavBtn = document.getElementById("mod-nav-btn");

// Panels
const videoFeed = document.getElementById("video-feed");
const uploadPanel = document.getElementById("upload-panel");
const modPanel = document.getElementById("mod-panel");

// Video upload
const videoTitle = document.getElementById("video-title");
const videoURL = document.getElementById("video-url");
const uploadBtn = document.getElementById("upload-btn");

// Moderator list
const modVideosList = document.getElementById("mod-videos-list");

// Logout
const logoutBtn = document.getElementById("logout-btn");

// --- Signup ---
document.getElementById("signup-btn").addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const res = await fetch(`${API}/signup`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username,password,age:12})
    });
    const data = await res.json();
    authMessage.textContent = data.error || "Account created! Login now.";
});

// --- Login ---
document.getElementById("login-btn").addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const res = await fetch(`${API}/login`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username,password})
    });
    const data = await res.json();
    if(data.error) return authMessage.textContent=data.error;
    currentUser = username;
    authSection.style.display="none";
    dashboardSection.style.display="flex";
    loadVideos();
    if(data.user.role==="mod") modNavBtn.style.display="block";
});

// --- Logout ---
logoutBtn.addEventListener("click",()=>{
    currentUser=null;
    dashboardSection.style.display="none";
    authSection.style.display="block";
});

// --- Upload video ---
uploadBtn.addEventListener("click", async ()=>{
    const title = videoTitle.value.trim();
    const url = videoURL.value.trim();
    if(!title || !url) return alert("Fill both fields!");
    const res = await fetch(`${API}/upload`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username:currentUser,title,url})
    });
    const data = await res.json();
    if(data.success){
        alert("Uploaded! Awaiting approval.");
        videoTitle.value=""; videoURL.value="";
        loadVideos();
    }
});

// --- Load videos ---
async function loadVideos(){
    const res = await fetch(`${API}/videos`);
    const data = await res.json();
    videoFeed.innerHTML="";
    modVideosList.innerHTML="";
    data.videos.forEach(v=>{
        if(v.approved){
            const div = document.createElement("div");
            div.className="video-card";
            div.innerHTML=`<img src="https://img.youtube.com/vi/${getYouTubeID(v.url)}/0.jpg" onclick="watchVideo('${v.url}')">
                             <div class="video-info"><h4 onclick="watchVideo('${v.url}')">${v.title}</h4><p>by ${v.username}</p></div>`;
            videoFeed.appendChild(div);
        } else if(currentUser==="mod"){
            const li = document.createElement("li");
            li.innerHTML=`${v.title} by ${v.username} <button onclick="approveVideo('${v.id}')">Approve</button>`;
            modVideosList.appendChild(li);
        }
    });
}

// --- Approve video ---
async function approveVideo(id){
    const res = await fetch(`${API}/approve`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id})
    });
    const data = await res.json();
    loadVideos();
}

// --- Navigation ---
homeBtn.addEventListener("click", ()=>{
    videoFeed.style.display="block";
    uploadPanel.style.display="none";
    modPanel.style.display="none";
});
uploadNavBtn.addEventListener("click", ()=>{
    videoFeed.style.display="none";
    uploadPanel.style.display="block";
    modPanel.style.display="none";
});
modNavBtn.addEventListener("click", ()=>{
    videoFeed.style.display="none";
    uploadPanel.style.display="none";
    modPanel.style.display="block";
});

// --- Watch video function ---
function watchVideo(url){ window.open(url,"_blank"); }

// --- Get YouTube thumbnail ID ---
function getYouTubeID(url){
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length===11)? match[2] : null;
}
