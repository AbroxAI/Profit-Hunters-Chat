// bubble-renderer.js
(function(){
  const waitForContainer = () => {
    const container = document.getElementById("tg-comments-container");
    if (!container) return setTimeout(waitForContainer, 50);

    let lastMessageDateKey = null;

    function djb2HashLocal(str){
      let h = 5381;
      for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
      return (h >>> 0).toString(36);
    }
    const djb2 = (typeof djb2Hash === 'function') ? djb2Hash : djb2HashLocal;
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
      const d = new Date(dateObj);
      sticker.textContent = d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
      container.appendChild(sticker);
    }

    function createBubbleElement(persona, text, opts = {}){
      const { timestamp = new Date(), type = "incoming", replyToText = null, image = null, caption = null, id = null, pinned = false } = opts;
      insertDateSticker(timestamp);

      const wrapper = document.createElement("div");
      wrapper.className = `tg-bubble ${type}` + (pinned ? " pinned" : "");
      if (id) wrapper.dataset.id = id;

      const avatar = document.createElement("img");
      avatar.className = "tg-bubble-avatar";
      avatar.src = persona.avatar || "assets/default-avatar.jpg";
      avatar.alt = persona.name;

      const content = document.createElement("div");
      content.className = "tg-bubble-content";

      if (replyToText){
        const rp = document.createElement("div");
        rp.className = "tg-reply-preview";
        rp.textContent = replyToText.length > 120 ? replyToText.substring(0,117) + "..." : replyToText;
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
      content.appendChild(meta);

      const reactions = document.createElement("div");
      reactions.className = "tg-reactions";
      content.appendChild(reactions);

      wrapper.appendChild(avatar);
      wrapper.appendChild(content);
      return wrapper;
    }

    let unseenCount = 0;
    function isAtBottom(){ return (container.scrollTop + container.clientHeight) >= (container.scrollHeight - 120); }
    function resetJump(){ unseenCount = 0; }
    function appendMessage(persona, text, opts={}){
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

      if (isAtBottom()) container.scrollTop = container.scrollHeight; else unseenCount++;
      el.style.opacity = 0;
      el.style.transform = "translateY(6px)";
      requestAnimationFrame(()=>{ el.style.transition="all 220ms ease"; el.style.opacity=1; el.style.transform="translateY(0)"; });
      return id;
    }

    function showTyping(persona, duration=1500){
      const wrap = document.createElement("div");
      wrap.className="tg-bubble incoming typing";
      const avatar=document.createElement("img");
      avatar.className="tg-bubble-avatar";
      avatar.src=persona.avatar||"assets/default-avatar.jpg";
      wrap.appendChild(avatar);
      const bubble=document.createElement("div");
      bubble.className="tg-bubble-content";
      bubble.innerHTML=`<div class="tg-reply-preview">${persona.name} is typing…</div>`;
      wrap.appendChild(bubble);
      container.appendChild(wrap);
      container.scrollTop=container.scrollHeight;
      setTimeout(()=>{ if(wrap.parentNode) wrap.parentNode.removeChild(wrap); }, duration);
    }

    // **define TGRenderer immediately**
    window.TGRenderer = { appendMessage, showTyping };
  };
  waitForContainer();
})();
