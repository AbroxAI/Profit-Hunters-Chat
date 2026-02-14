// app.js
document.addEventListener("DOMContentLoaded", () => {
  const pinBanner = document.getElementById("tg-pin-banner");
  const container = document.getElementById("tg-comments-container");
  const input = document.getElementById("tg-comment-input");
  const contactAdminLink = window.CONTACT_ADMIN_LINK || "https://t.me/your_admin";

  // ensure conversation memory and tickets exist
  window.identity = window.identity || {};
  window.identity.ConversationMemory = window.identity.ConversationMemory || {};
  window.identity.ConversationMemory.tickets = window.identity.ConversationMemory.tickets || [];

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
    const timestamp = new Date();
    const id = window.TGRenderer.appendMessage(admin, "Broadcast", { timestamp, type:"incoming", image, caption });
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

  function postPinNotice(){
    const systemPersona = { name: "System", avatar: "assets/admin.jpg" };
    window.TGRenderer.appendMessage(systemPersona, "Admin pinned a message", { timestamp: new Date(), type:"incoming" });
  }

  // helper ticket API
  window.sendAdminTicket = function(authorName, question, messageId=null){
    const ticket = { id: "ticket_" + Date.now() + "_" + Math.floor(Math.random()*9999), author: authorName, question, messageId, createdAt: Date.now(), status: "open" };
    window.identity.ConversationMemory.tickets.push(ticket);
    const admin = window.identity ? window.identity.Admin : { name:"Admin", avatar:"assets/admin.jpg", isAdmin:true };
    window.TGRenderer.appendMessage(admin, `New ticket from ${authorName}: ${question.split("\n")[0].slice(0,120)}`, { timestamp: new Date(), type: "incoming" });
    return ticket;
  };

  // small admin responder simulation
  function startAdminTicketResponder(){
    setInterval(()=>{
      const tickets = window.identity.ConversationMemory.tickets.filter(t => t.status === "open");
      if(tickets.length === 0) return;
      const t = tickets[Math.floor(Math.random()*tickets.length)];
      t.status = "in_progress";
      const admin = window.identity ? window.identity.Admin : { name:"Admin", avatar:"assets/admin.jpg", isAdmin:true };
      window.TGRenderer.showTyping(admin, 1400 + Math.random()*1200);
      setTimeout(()=>{
        const replyText = "Thanks — please contact via the pinned Contact Admin button for verification.";
        const replyToId = t.messageId || null;
        window.TGRenderer.appendMessage(admin, replyText, { timestamp: new Date(), type: "incoming", replyToId, replyToPreview: t.question });
        t.status = "closed";
      }, 1800 + Math.random()*1400);
    }, 25_000 + Math.random()*60_000);
  }

  // initial broadcast + pin
  const broadcast = postAdminBroadcast();
  setTimeout(()=>{
    postPinNotice();
    showPinBanner(broadcast.image, broadcast.caption);
  }, 2200);

  // sendMessage handling
  document.addEventListener("sendMessage", (ev) => {
    const text = ev.detail.text;
    const persona = window.identity ? window.identity.getRandomPersona() : { name:"You", avatar:"assets/default-avatar.jpg" };
    // persona cooldown guard
    if(persona.lastPostAt && Date.now() - persona.lastPostAt < 30_000){
      // throttle persona - continue; but still post as persona (kept intentionally simple)
    } else {
      persona.lastPostAt = Date.now();
    }
    window.TGRenderer.showTyping(persona, 1000 + Math.random()*1500);
    setTimeout(()=> {
      const msgId = window.TGRenderer.appendMessage(persona, text, { timestamp: new Date(), type:"outgoing" });
      if(text.toLowerCase().includes("admin") || text.toLowerCase().includes("contact")){
        const admin = window.identity ? window.identity.Admin : { name:"Admin", avatar:"assets/admin.jpg", isAdmin:true };
        window.TGRenderer.showTyping(admin, 1600 + Math.random()*1200);
        setTimeout(()=> {
          window.TGRenderer.appendMessage(admin, "Thanks — please contact via the button on the pinned message. We will respond there.", { timestamp: new Date(), type:"incoming", replyToId: msgId, replyToPreview: text });
        }, 1800 + Math.random()*1200);
      }
    }, 1200 + Math.random()*400);
  });

  document.addEventListener("autoReply", (ev) => {
    const { parentText, persona, text } = ev.detail;
    window.TGRenderer.showTyping(persona, 1000 + Math.random()*1200);
    setTimeout(()=> {
      window.TGRenderer.appendMessage(persona, text, { timestamp: new Date(), type:"incoming", replyToText: parentText });
    }, 1200 + Math.random()*800);
  });

  // start admin responder
  startAdminTicketResponder();
});
