// realism-engine-v11.js
// Ultra-Realism Engine V11 (patched for TGRenderer readiness + dedupe + bounded pools)

// light helpers
function random(arr){return arr[Math.floor(Math.random()*arr.length)];}
function maybe(p){return Math.random()<p;}
function rand(max=9999){return Math.floor(Math.random()*max);}

// simple djb2 hash for dedupe
function djb2Hash(str){
  let h = 5381;
  for(let i=0;i<str.length;i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return (h >>> 0).toString(36);
}

/* data / templates */
const ASSETS = ["EUR/USD","USD/JPY","GBP/USD","AUD/USD","BTC/USD","ETH/USD","USD/CHF","EUR/JPY","NZD/USD","US30","NAS100"];
const BROKERS = ["IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade"];
const TIMEFRAMES = ["M1","M5","M15","M30","H1","H4"];
const RESULT_WORDS = ["green","red","profit","loss","win","missed entry","recovered","swing trade success","scalped nicely","small win","big win","moderate loss","loss recovered","double profit","consistent profit","partial win","micro win","entry late but profitable","stopped loss","hedged correctly","full green streak","partial loss"];
const TESTIMONIALS = [
  "Made $450 in 2 hours using Abrox",
  "Closed 3 trades, all green today ✅",
  "Recovered a losing trade thanks to Abrox",
  "7 days straight of consistent profit 💹",
  "Abrox saved me from a $200 loss",
  "50% ROI in a single trading session 🚀",
  "Signal timing was perfect today",
  "Never had such accurate entries before",
  "My manual losses turned into profits using Abrox",
  "Day trading USD/JPY with this bot has been a game-changer"
];

/* Bounded dedupe/pool settings */
const GENERATED_TEXTS_MAX = 50000;
const RECENT_MESSAGE_HASHES_MAX = 5000;
const POOL_MIN = 150;
const POOL_MAX = 2000;

const GENERATED_ORDER_V11 = [];
const GENERATED_TEXTS_V11 = new Set();

const RECENT_MESSAGE_HASHES = new Set();
const RECENT_MESSAGE_HASH_QUEUE = [];

function recordGeneratedText(key){
  GENERATED_TEXTS_V11.add(key);
  GENERATED_ORDER_V11.push(key);
  if(GENERATED_ORDER_V11.length > GENERATED_TEXTS_MAX){
    const old = GENERATED_ORDER_V11.shift();
    GENERATED_TEXTS_V11.delete(old);
  }
}
function recordRecentHash(h){
  RECENT_MESSAGE_HASHES.add(h);
  RECENT_MESSAGE_HASH_QUEUE.push(h);
  if(RECENT_MESSAGE_HASH_QUEUE.length > RECENT_MESSAGE_HASHES_MAX){
    const old = RECENT_MESSAGE_HASH_QUEUE.shift();
    RECENT_MESSAGE_HASHES.delete(old);
  }
}

/* timestamp generator */
function generateTimestamp(offsetDays=0){
  const now = new Date();
  if(offsetDays !== 0){
    const d = new Date(now);
    d.setDate(now.getDate() - offsetDays);
    d.setHours(9 + rand(8), rand(60), rand(60));
    return d;
  }
  return new Date(now - Math.floor(Math.random()*1000*60*60*24));
}

/* persona helper */
function getRandomPersonaFromIdentity(){ 
  return window.identity ? window.identity.getRandomPersona() : {name:"User", avatar:"assets/default-avatar.jpg", isAdmin:false}; 
}

/* generate trading message (dedupe-aware) */
function generateTradingCommentV11(){
  const persona = getRandomPersonaFromIdentity();
  const templates = [
    () => `Guys, ${random(TESTIMONIALS)}`,
    () => `Anyone trading ${random(ASSETS)} on ${random(BROKERS)}?`,
    () => `Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} is ${random(RESULT_WORDS)}`,
    () => `Abrox bot is insane, ${random(TESTIMONIALS)}`,
    () => `Waiting for ${random(ASSETS)} news impact`,
    () => `Did anyone catch ${random(ASSETS)} reversal?`,
    () => `FOMOing or waiting for pullback on ${random(ASSETS)}?`,
    () => `My last trade on ${random(ASSETS)} was ${random(RESULT_WORDS)}`,
    () => `Scalped ${random(ASSETS)} on ${random(BROKERS)}, result ${random(RESULT_WORDS)}`
  ];
  let text = random(templates)();

  // typos + emoji
  if(maybe(0.6)){
    text = text.replace(/\w{4,}/g, word => {
      if(maybe(0.45)){
        const i = rand(Math.max(1, word.length-1));
        return word.substring(0,i)+word[i+1]+word[i]+word.substring(i+2);
      } else if(maybe(0.2)){
        const i = rand(word.length);
        return word.substring(0,i)+word.substring(i+1);
      }
      return word;
    });
  }
  if(maybe(0.55)){
    const emojiPool = (window.identity && window.identity.EMOJIS) ? window.identity.EMOJIS : ["💸"];
    const emojiCount = rand(3);
    for(let i=0;i<emojiCount;i++) text += " " + random(emojiPool);
  }

  let key = text.trim().slice(0,400);
  let attempts = 0;
  while(GENERATED_TEXTS_V11.has(key) && attempts < 25){
    key = key + " " + rand(9999);
    attempts++;
  }
  if(GENERATED_TEXTS_V11.has(key)){
    key = key + "_" + Date.now();
  }
  recordGeneratedText(key);
  const timestamp = generateTimestamp();
  return { persona, text: key, timestamp };
}

/* pool */
const LONG_TERM_POOL_V11 = [];
function ensurePoolV11(minSize = POOL_MIN){
  while(LONG_TERM_POOL_V11.length < Math.min(minSize, POOL_MAX)){
    LONG_TERM_POOL_V11.push(generateTradingCommentV11());
  }
  if(LONG_TERM_POOL_V11.length > POOL_MAX){
    LONG_TERM_POOL_V11.splice(0, LONG_TERM_POOL_V11.length - POOL_MAX);
  }
}

/* post from pool with dedupe on message hash */
function postFromPoolV11(count=1){
  ensurePoolV11(count);
  for(let i=0;i<count;i++){
    if(LONG_TERM_POOL_V11.length === 0) break;
    const item = LONG_TERM_POOL_V11.shift();
    const raw = `${item.persona.name}||${item.text}||${item.timestamp.getTime()}`;
    const h = djb2Hash(raw);
    if(RECENT_MESSAGE_HASHES.has(h)) continue;
    (function(localItem, idx, hash){
      setTimeout(()=> {
        if(window.TGRenderer && window.TGRenderer.appendMessage){
          window.TGRenderer.appendMessage(localItem.persona, localItem.text, { timestamp: localItem.timestamp, type: "incoming" });
          recordRecentHash(hash);
        } else {
          LONG_TERM_POOL_V11.push(localItem);
        }
      }, i*80 + rand(120));
    })(item, i, h);
  }
}

/* trending reactions */
function triggerTrendingReactionV11(baseText){
  if(!baseText) return;
  const repliesCount = rand(5)+1;
  for(let i=0;i<repliesCount;i++){
    setTimeout(()=>{
      const comment = generateTradingCommentV11();
      if(window.TGRenderer && window.TGRenderer.appendMessage){
        window.TGRenderer.appendMessage(comment.persona, comment.text, { timestamp: comment.timestamp, type: "incoming", replyToText: baseText });
      }
    }, 700*(i+1) + rand(500));
  }
}

/* continuous chatter with visibility backoff */
let _crowdInterval = null;
function simulateRandomCrowdV11(baseInterval=8000){
  if(_crowdInterval) clearTimeout(_crowdInterval);
  const schedule = ()=>{
    const interval = baseInterval + rand(12000);
    _crowdInterval = setTimeout(()=>{
      postFromPoolV11(1);
      if(document.hidden){
        simulateRandomCrowdV11(Math.max(30_000, baseInterval*4));
      } else {
        simulateRandomCrowdV11(baseInterval);
      }
    }, interval);
  };
  schedule();
}

/* export hooks */
window.realism = {
  postFromPoolV11, triggerTrendingReactionV11, simulateRandomCrowdV11, ensurePoolV11, LONG_TERM_POOL_V11
};

/* start logic waiting for TGRenderer safely */
function startRealismIfReady(){
  const check = () => {
    if(window.TGRenderer && typeof window.TGRenderer.appendMessage === "function"){
      ensurePoolV11(300);
      postFromPoolV11(50);
      simulateRandomCrowdV11(8000);
    } else {
      setTimeout(check, 200); // retry until TGRenderer exists
    }
  };
  check();
}

if(document.readyState === "complete" || document.readyState === "interactive"){
  setTimeout(startRealismIfReady, 50);
} else {
  document.addEventListener("DOMContentLoaded", ()=> setTimeout(startRealismIfReady, 50));
}
