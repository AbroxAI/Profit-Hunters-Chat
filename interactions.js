// interactions.js
document.addEventListener("DOMContentLoaded", ()=> {
  const input = document.getElementById("tg-comment-input");
  const sendBtn = document.getElementById("tg-send-btn");
  const emojiBtn = document.getElementById("tg-emoji-btn");
  const cameraBtn = document.getElementById("tg-camera-btn");
  const contactAdminLink = window.CONTACT_ADMIN_LINK || "https://t.me/your_admin"; // set by you

  const metaLine = document.getElementById("tg-meta-line");

  if(metaLine) metaLine.textContent = `${(window.MEMBER_COUNT||1284).toLocaleString()} members, ${window.ONLINE_COUNT||128} online`;

  function toggleSendButton(){
    const hasText = input && input.value && input.value.trim().length > 0;
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

  if(input) input.addEventListener("input", toggleSendButton);

  function doSendMessage(){
    const text = input.value.trim();
    if(!text) return;
    const ev = new CustomEvent("sendMessage", { detail: { text } });
    document.dispatchEvent(ev);
    input.value = "";
    toggleSendButton();
  }

  if(sendBtn) sendBtn.addEventListener("click", doSendMessage);
  if(input) input.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      doSendMessage();
    }
  });

  // Contact Admin button handling
  document.addEventListener("click", (e) => {
    const el = (e.target && e.target.closest) ? e.target.closest(".contact-admin-btn") : null;
    if(el){
      // try ticketing if available: reference last message id
      const lastBubble = document.querySelector('#tg-comments-container .tg-bubble[data-id]:last-child');
      const lastId = lastBubble ? lastBubble.dataset.id : null;
      const name = "Guest";
      const q = "User requests contact";
      if(typeof window.sendAdminTicket === 'function'){
        window.sendAdminTicket(name, q, lastId);
      } else {
        const href = el.dataset.href || contactAdminLink;
        window.open(href, "_blank");
      }
      e.preventDefault();
    }
  });

  // messageContext event (right click on message) default actions
  document.addEventListener("messageContext", (ev)=>{
    const info = ev.detail || {};
    const persona = window.identity ? window.identity.getRandomPersona() : {name:"User", avatar:"assets/default-avatar.jpg"};
    window.setTimeout(()=>{
      const replyText = window.identity ? window.identity.generateHumanComment(persona, "Nice point!") : "Nice!";
      const replyEv = new CustomEvent("autoReply", { detail: { parentText: info.text, persona, text: replyText } });
      document.dispatchEvent(replyEv);
    }, 800 + Math.random()*1200);
  });
});
