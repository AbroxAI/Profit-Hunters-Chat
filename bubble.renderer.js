// ===== bubble-renderer.js =====
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("tg-comments-container");
  const jumpIndicator = document.getElementById("tg-jump-indicator");
  let lastMessageDateKey = null;

  // simple hash for dedupe
  function djb2HashLocal(str){
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return (h >>> 0).toString(36);
  }
  const djb2 = (typeof djb2Hash === 'function') ? djb2Hash : djb2HashLocal;

  function rand(max = 9999){ return Math.floor(Math.random() * max); }

  function formatTime(date){
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDateKey(date){
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  }

  function insertDateSticker(dateObj){
    const key = formatDateKey(dateObj);
    if (key === lastMessageDateKey) return;
    lastMessageDateKey = key;
    const sticker = document.createElement("div");
    sticker.className = "tg-date-sticker";
    sticker.textContent = new Date(dateObj).toLocaleDateString([], { year:'numeric', month:'short', day:'numeric' });
    container.appendChild(sticker);
  }

  // ------------------ DEDUPE ------------------
  const DISPLAYED_MESSAGE_HASHES = new Set();
  const DISPLAYED_MESSAGE_HASH_QUEUE = [];
  const DISPLAYED_HASH_MAX = 10000;

  function recordDisplayedHash(h){
    if (DISPLAYED_MESSAGE_HASHES.has(h)) return;
    DISPLAYED_MESSAGE_HASHES.add(h);
    DISPLAYED_MESSAGE_HASH_QUEUE.push(h);
    if (DISPLAYED_MESSAGE_HASH_QUEUE.length > DISPLAYED_HASH_MAX){
      const old = DISPLAYED_MESSAGE_HASH_QUEUE.shift();
      DISPLAYED_MESSAGE_HASHES.delete(old);
    }
  }

  // ------------------ CREATE BUBBLE ------------------
  function createBubbleElement(persona, text, opts = {}){
    const { timestamp = new Date(), type = "incoming", replyToText = null, replyToId = null, replyToPreview = null, image = null, caption = null, id = null, pinned = false } = opts;
    insertDateSticker(timestamp);

    const wrapper = document.createElement("div");
    wrapper.className = `tg-bubble ${type}` + (pinned ? " pinned" : "");
    if (id) wrapper.dataset.id = id;
    if (replyToId) wrapper.dataset.replyToId = replyToId;

    const avatar = document.createElement("img");
    avatar.className = "tg-bubble-avatar";
    avatar.src = persona.avatar || "assets/default-avatar.jpg";
    avatar.alt = persona.name;

    const content = document.createElement("div");
    content.className = "tg-bubble-content";

    if (replyToPreview || replyToText){
      const rp = document.createElement("div");
      rp.className = "tg-reply-preview";
      rp.textContent = (replyToPreview || replyToText).length > 120 ? (replyToPreview || replyToText).substring(0,117)+"..." : (replyToPreview || replyToText);
      rp.style.cursor = 'pointer';
      rp.title = replyToText || '';
      rp.addEventListener('click', () => {
        const targetId = wrapper.dataset.replyToId;
        let target = null;
        if (targetId) target = container.querySelector(`[data-id="${targetId}"]`);
        if (!target && replyToText){
          const nodes = Array.from(container.querySelectorAll('.tg-bubble-text'));
          target = nodes.find(n => n.textContent && n.textContent.includes((replyToText || '').slice(0,30)));
        }
        if (target){
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const elBox = target.closest('.tg-bubble') || target;
          elBox.style.outline = '3px solid rgba(255,215,0,0.6)';
          setTimeout(() => elBox.style.outline = '', 2600);
        }
      });
      content.appendChild(rp);
    }

    const sender = document.createElement("div");
    sender.className = "tg-bubble-sender";
    sender.textContent = persona.name;
    content.appendChild(sender);

    if (image){
      const img = document.createElement("img");
      img.className = "tg-bubble-image";
      img.src = image;
      content.appendChild(img);
    }

    const textEl = document.createElement("div");
    textEl.className = "tg-bubble-text";
    textEl.textContent = text;
    content.appendChild(textEl);

    if (caption){
      const cap = document.createElement("div");
      cap.className = "tg-bubble-text";
      cap.style.marginTop = "6px";
      cap.textContent = caption;
      content.appendChild(cap);
    }

    const meta = document.createElement("div");
    meta.className = "tg-bubble-meta";
    const timeSpan = document.createElement("span");
    timeSpan.textContent = formatTime(timestamp);
    meta.appendChild(timeSpan);

    if (type === "outgoing"){
      const seen = document.createElement("div");
      seen.className = "seen";
      seen.innerHTML = `<i data-lucide="eye"></i> 1`;
      meta.appendChild(seen);
    }

    content.appendChild(meta);

    const reactions = document.createElement("div");
    reactions.className = "tg-reactions";
    content.appendChild(reactions);

    wrapper.appendChild(avatar);
    wrapper.appendChild(content);

    wrapper.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const event = new CustomEvent("messageContext", { detail: { id, persona, text } });
      document.dispatchEvent(event);
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    return wrapper;
  }

  // ------------------ UNSEEN / JUMP ------------------
  let unseenCount = 0;
  function isAtBottom(){ return (container.scrollTop + container.clientHeight) >= (container.scrollHeight - 120); }
  function updateJumpLabel(){
    if (!jumpIndicator) return;
    jumpIndicator.innerHTML = `<i data-lucide="chevron-down"></i><span>New messages · ${unseenCount}</span>`;
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }
  function resetJump(){ unseenCount = 0; if(jumpIndicator) jumpIndicator.classList.add('hidden'); }
  function showJumpIndicator(){ if(jumpIndicator && jumpIndicator.classList.contains("hidden")) jumpIndicator.classList.remove("hidden"); updateJumpLabel(); }

  // ------------------ APPEND MESSAGE ------------------
  const TYPING_MAP = new Map(); // persona.name -> {dom, timeoutId}

  function appendMessage(persona, text, opts = {}){
    const timestamp = opts.timestamp ? new Date(opts.timestamp) : new Date();
    const raw = `${persona.name}||${text}||${timestamp.getTime()}`;
    const hash = djb2(raw);

    if (DISPLAYED_MESSAGE_HASHES.has(hash)) return null;
    recordDisplayedHash(hash);

    const id = opts.id || ("m_" + Date.now() + "_" + Math.floor(Math.random() * 9999));
    opts.id = id;

    const el = createBubbleElement(persona, text, opts);
    el.dataset.id = id;
    container.appendChild(el);

    const atBottom = isAtBottom();
    if (atBottom){ container.scrollTop = container.scrollHeight; resetJump(); }
    else { unseenCount++; showJumpIndicator(); }

    el.style.opacity = 0;
    el.style.transform = "translateY(6px)";
    requestAnimationFrame(()=>{ el.style.transition="all 220ms ease"; el.style.opacity=1; el.style.transform="translateY(0)"; });

    return id;
  }

  // ------------------ TYPING ------------------
  function showTypingIndicator(persona, duration=2000){
    const key = persona.name;
    if(TYPING_MAP.has(key)){
      const rec=TYPING_MAP.get(key);
      clearTimeout(rec.timeoutId);
      if(rec.dom && rec.dom.parentNode) rec.dom.parentNode.removeChild(rec.dom);
      TYPING_MAP.delete(key);
    }
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
    const tid = setTimeout(()=>{
      if(wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
      TYPING_MAP.delete(key);
    }, duration);
    TYPING_MAP.set(key,{dom:wrap,timeoutId:tid});
  }

  // ------------------ SCROLL / JUMP ------------------
  if(jumpIndicator) jumpIndicator.addEventListener("click", ()=>{ container.scrollTop=container.scrollHeight; resetJump(); });
  container.addEventListener("scroll", ()=>{
    const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if(scrollBottom > 100) showJumpIndicator(); else resetJump();
  });

  // ------------------ EXPORT TGRenderer ------------------
  window.TGRenderer = {
    appendMessage: (persona,text,opts={})=>appendMessage(persona,text,opts),
    showTyping: (persona,duration=2000)=>showTypingIndicator(persona,duration),
    hasMessageId: (id)=>!!container.querySelector(`[data-id="${id}"]`)
  };

  if(window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
});
