
const PASS = "06072025";
function initPassword(){
  const ok = localStorage.getItem("auth_ok");
  if(ok === "1"){
    document.getElementById("lockScreen").style.display = "none";
    document.getElementById("siteContent").style.display = "block";
  } else {
    document.getElementById("lockScreen").style.display = "flex";
    document.getElementById("siteContent").style.display = "none";
  }
}
function checkPassword(){
  const v = document.getElementById("passInput").value;
  if(v === PASS){
    localStorage.setItem("auth_ok","1");
    document.getElementById("lockScreen").style.display = "none";
    document.getElementById("siteContent").style.display = "block";
  } else {
    const msg = document.getElementById("passMsg");
    msg.innerText = "Incorrect password";
    msg.style.color = "#ff6b88";
  }
}
function passwordGate(){ if(localStorage.getItem("auth_ok") !== "1"){ window.location = "index.html"; } }
