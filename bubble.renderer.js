// bubble-renderer.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("tg-comments-container");
  const jumpIndicator = document.getElementById("tg-jump-indicator");
  let lastMessageDateKey = null;

  function formatTime(date){
    const d = new Date(date);
    return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  }
  function formatDateKey(date){
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  }

  function insertDateSticker(dateObj){
    const key = formatDateKey(dateObj);
    if(key === lastMessageDateKey) return;
    lastMessageDateKey = key;
    const sticker = document.createElement("div");
    sticker.className = "tg-date-sticker";
    const d = new Date(dateObj);
    sticker.textContent = d.toLocaleDateString([], {year:'numeric', month:'short', day:'numeric'});
    container.appendChild(sticker);
  }

  function showTypingIndicator(persona, duration=2000){
    // small typing bubble without avatar name
    const wrap = document.createElement("div");
    wrap.className = "tg-bubble incoming typing";
    const avatar = document.createElement("img");
    avatar.className = "tg-bubble-avatar";
    avatar.src = persona.avatar || "assets/default-avatar.jpg";
    wrap.appendChild(avatar);
    const bubble = document.createElement("div");
    bubble.className = "tg-bubble-content";
    bubble.innerHTML = `<div class="tg-reply-preview">${persona.name} is typing…</div>`;
    wrap.appendChild(bubble);
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
    setTimeout(()=>{ if(wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap); }, duration);
  }

  function createBubbleElement(persona, text, opts={}){
    // opts: timestamp (Date obj), type: incoming/outgoing, replyToText, image, caption, id, pinned
    const { timestamp=new Date(), type="incoming", replyToText=null, image=null, caption=null, id=null, pinned=false } = opts;
    // date sticker
    insertDateSticker(timestamp);

    const wrapper = document.createElement("div");
    wrapper.className = `tg-bubble ${type}` + (pinned ? " pinned" : "");
    if(id) wrapper.dataset.id = id;

    const avatar = document.createElement("img");
    avatar.className = "tg-bubble-avatar";
    avatar.src = persona.avatar || "assets/default-avatar.jpg";
    avatar.alt = persona.name;

    const content = document.createElement("div");
    content.className = "tg-bubble-content";

    if(replyToText){
      const rp = document.createElement("div");
      rp.className = "tg-reply-preview";
      rp.textContent = (replyToText.length>120? replyToText.substring(0,117)+"..." : replyToText);
      content.appendChild(rp);
    }

    const sender = document.createElement("div");
    sender.className = "tg-bubble-sender";
    sender.textContent = persona.name;
    content.appendChild(sender);

    if(image){
      const img = document.createElement("img");
      img.className = "tg-bubble-image";
      img.src = image;
      content.appendChild(img);
    }

    const textEl = document.createElement("div");
    textEl.className = "tg-bubble-text";
    textEl.textContent = text;
    content.appendChild(textEl);

    if(caption){
      const cap = document.createElement("div");
      cap.className = "tg-bubble-text";
      cap.style.marginTop = "6px";
      cap.textContent = caption;
      content.appendChild(cap);
    }

    // meta row
    const meta = document.createElement("div");
    meta.className = "tg-bubble-meta";
    const timeSpan = document.createElement("span");
    timeSpan.textContent = formatTime(timestamp);
    meta.appendChild(timeSpan);

    // seen / eye for outgoing
    if(type === "outgoing"){
      const seen = document.createElement("div");
      seen.className = "seen";
      seen.innerHTML = `<i data-lucide="eye"></i> 1`;
      meta.appendChild(seen);
    }

    content.appendChild(meta);

    // reactions placeholder
    const reactions = document.createElement("div");
    reactions.className = "tg-reactions";
    // optionally populate later
    content.appendChild(reactions);

    wrapper.appendChild(avatar);
    wrapper.appendChild(content);

    // click to open reply menu / pin etc (simple)
    wrapper.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      // custom event: request actions (reply/pin)
      const event = new CustomEvent("messageContext", { detail: { id, persona, text } });
      document.dispatchEvent(event);
    });

    lucide.createIcons(); // (ensures icons inside are created)
    return wrapper;
  }

  function appendMessage(persona, text, opts={}){
    // expose appendMessage
    const id = "m_" + Date.now() + "_" + rand(9999);
    opts.id = id;
    const el = createBubbleElement(persona, text, opts);
    container.appendChild(el);

    // auto-scroll / jump indicator logic
    const atBottom = (container.scrollTop + container.clientHeight) > (container.scrollHeight - 120);
    if(atBottom){
      container.scrollTop = container.scrollHeight;
      hideJumpIndicator();
    } else {
      showJumpIndicator();
    }

    // tiny fade-in
    el.style.opacity = 0;
    el.style.transform = "translateY(6px)";
    requestAnimationFrame(()=>{ el.style.transition = "all 220ms ease"; el.style.opacity = 1; el.style.transform = "translateY(0)"; });

    return id;
  }

  function showJumpIndicator(){
    if(jumpIndicator.classList.contains("hidden")) jumpIndicator.classList.remove("hidden");
  }
  function hideJumpIndicator(){ if(!jumpIndicator.classList.contains("hidden")) jumpIndicator.classList.add("hidden"); }

  // clicking jump scrolls to bottom
  jumpIndicator.addEventListener("click", ()=>{
    container.scrollTop = container.scrollHeight;
    hideJumpIndicator();
  });

  // scroll event hides/shows jump
  container.addEventListener("scroll", ()=>{
    const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if(scrollBottom > 100) showJumpIndicator(); else hideJumpIndicator();
  });

  // expose renderer API
  window.TGRenderer = {
    appendMessage: (persona, text, opts={}) => appendMessage(persona, text, opts),
    showTyping: (persona, duration=2000) => showTypingIndicator(persona,duration)
  };

  // ensure icons created
  lucide.createIcons();
});
