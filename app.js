// app.js
document.addEventListener("DOMContentLoaded", () => {
  const pinBanner = document.getElementById("tg-pin-banner");
  const container = document.getElementById("tg-comments-container");
  const input = document.getElementById("tg-comment-input");
  const contactAdminLink = window.CONTACT_ADMIN_LINK || "https://t.me/your_admin";

  // helper: add admin broadcast (image+caption+CTA)
  function postAdminBroadcast(){
    const admin = window.identity ? window.identity.Admin : { name:"Admin", avatar:"assets/admin.jpg", isAdmin:true };
    const caption = `📌 Group Rules

- New members are read-only until verified
- Admins do NOT DM directly
- No screenshots in chat
- Ignore unsolicited messages

✅ To verify or contact admin, use the “Contact Admin” button below.`;
    const image = "assets/broadcast.jpg";
    const timestamp = new Date(2025,2,14,10,0,0); // March 14, 2025 10:00
    // append broadcast bubble (outgoing)
    const id = window.TGRenderer.appendMessage(admin, "Broadcast", { timestamp, type:"outgoing", image, caption });
    return { id, caption, image };
  }

  // show pin banner with CTA
  function showPinBanner(image, caption){
    pinBanner.innerHTML = "";
    const img = document.createElement("img");
    img.src = image;
    const text = document.createElement("div");
    text.className = "pin-text";
    text.textContent = (caption||"Pinned message").split("\n")[0] || "Pinned message";
    const btn = document.createElement("button");
    btn.className = "contact-admin-btn";
    btn.dataset.href = contactAdminLink;
    btn.style.marginLeft = "12px";
    btn.style.height = "36px";
    btn.style.borderRadius = "18px";
    btn.style.padding = "6px 12px";
    btn.style.background = "var(--tg-accent)";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.textContent = "Contact Admin";

    pinBanner.appendChild(img);
    pinBanner.appendChild(text);
    pinBanner.appendChild(btn);
    pinBanner.classList.remove("hidden");
  }

  // show pinned notice under the bubble
  function postPinNotice(){
    const systemPersona = { name: "System", avatar: "assets/admin.jpg" };
    window.TGRenderer.appendMessage(systemPersona, "Admin pinned a message", { timestamp: new Date(), type:"incoming" });
  }

  // flow: admin posts broadcast then pins after a short delay
  const broadcast = postAdminBroadcast();
  setTimeout(()=>{
    postPinNotice();
    showPinBanner(broadcast.image, broadcast.caption);
    // auto-hide banner after 12s (but keep for demo); keep sticky
    // comment out auto-hide to keep persistent
    // setTimeout(()=> pinBanner.classList.add("hidden"), 12000);
  }, 2200);

  // handle sendMessage event from interactions.js
  document.addEventListener("sendMessage", (ev) => {
    const text = ev.detail.text;
    // treat as user message (use synthetic persona)
    const persona = window.identity ? window.identity.getRandomPersona() : { name:"You", avatar:"assets/default-avatar.jpg" };
    // before posting show typing indicator then append
    window.TGRenderer.showTyping(persona, 1000 + Math.random()*1500);
    setTimeout(()=> {
      window.TGRenderer.appendMessage(persona, text, { timestamp: new Date(), type:"outgoing" });
      // admin may reply to questions (simulate admin monitoring)
      if(text.toLowerCase().includes("admin") || text.toLowerCase().includes("contact")){
        // admin types and publicly replies after a short delay
        const admin = window.identity ? window.identity.Admin : { name:"Admin", avatar:"assets/admin.jpg", isAdmin:true };
        window.TGRenderer.showTyping(admin, 1600 + Math.random()*1200);
        setTimeout(()=> {
          window.TGRenderer.appendMessage(admin, "Thanks — please contact via the button on the pinned message. We will respond there.", { timestamp: new Date(), type:"outgoing" });
        }, 1800 + Math.random()*1200);
      }
    }, 1200 + Math.random()*400);
  });

  // handle autoReply events from interactions (context menu flow)
  document.addEventListener("autoReply", (ev) => {
    const { parentText, persona, text } = ev.detail;
    window.TGRenderer.showTyping(persona, 1000 + Math.random()*1200);
    setTimeout(()=> {
      window.TGRenderer.appendMessage(persona, text, { timestamp: new Date(), type:"incoming", replyToText: parentText });
    }, 1200 + Math.random()*800);
  });

  // when realism triggers trending reaction, we can show replies (realism triggers appendMessage with replyToText)
  // message jumper handled by bubble-renderer

  // ensure message jumper behavior when user scrolls up (already handled by bubble-renderer)
});
