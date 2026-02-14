// interactions.js
document.addEventListener("DOMContentLoaded", ()=> {
  const input = document.getElementById("tg-comment-input");
  const sendBtn = document.getElementById("tg-send-btn");
  const emojiBtn = document.getElementById("tg-emoji-btn");
  const cameraBtn = document.getElementById("tg-camera-btn");
  const contactAdminLink = window.CONTACT_ADMIN_LINK || "https://t.me/your_admin"; // set by you

  const metaLine = document.getElementById("tg-meta-line");

  // initialize meta (these values can be updated dynamically)
  if(metaLine) metaLine.textContent = `${(window.MEMBER_COUNT||1284).toLocaleString()} members, ${window.ONLINE_COUNT||128} online`;

  function toggleSendButton(){
    const hasText = input.value.trim().length > 0;
    if(hasText){
      sendBtn.classList.remove("hidden");
      emojiBtn.classList.add("hidden");
      cameraBtn.classList.add("hidden");
    } else {
      sendBtn.classList.add("hidden");
      emojiBtn.classList.remove("hidden");
      cameraBtn.classList.remove("hidden");
    }
  }

  input.addEventListener("input", toggleSendButton);

  // send event dispatch
  function doSendMessage(){
    const text = input.value.trim();
    if(!text) return;
    const ev = new CustomEvent("sendMessage", { detail: { text } });
    document.dispatchEvent(ev);
    input.value = "";
    toggleSendButton();
  }

  sendBtn.addEventListener("click", doSendMessage);
  input.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      doSendMessage();
    }
  });

  // Contact Admin button handling: when Contact Admin is clicked in pin banner we'll open link
  document.addEventListener("click", (e) => {
    const target = e.target.closest && e.target.closest(".contact-admin-btn");
    if(target){
      const href = target.dataset.href || contactAdminLink;
      window.open(href, "_blank");
      e.preventDefault();
    }
  });

  // messageContext event (right click on message) default actions
  document.addEventListener("messageContext", (ev)=>{
    const info = ev.detail;
    // simple default: respond with a reply (simulate user choosing reply)
    // create a prompt flow: show input prefilled with @username or trigger reply UI
    const persona = window.identity ? window.identity.getRandomPersona() : {name:"User", avatar:"assets/default-avatar.jpg"};
    // simulate thinking then reply via realism/tracking
    window.setTimeout(()=>{
      // create reply via event for app.js to handle
      const replyText = window.identity ? window.identity.generateHumanComment(persona, "Nice point!") : "Nice!";
      const replyEv = new CustomEvent("autoReply", { detail: { parentText: info.text, persona, text: replyText } });
      document.dispatchEvent(replyEv);
    }, 800 + Math.random()*1200);
  });
});
