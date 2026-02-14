// realism-engine-v11.js
// Ultra-Realism Engine V11 (integrated)

const GENERATED_TEXTS_V11 = new Set();
const LONG_TERM_POOL_V11 = [];

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

function random(arr){return arr[Math.floor(Math.random()*arr.length)];}
function maybe(p){return Math.random()<p;}
function rand(max=9999){return Math.floor(Math.random()*max);}

function generateTimestamp(offsetDays=0){
  // Returns a Date object (used to place historical messages)
  const now = new Date();
  if(offsetDays !== 0){
    const d = new Date(now);
    d.setDate(now.getDate() - offsetDays);
    d.setHours(9 + rand(8), rand(60), rand(60));
    return d;
  }
  // recent
  const recent = new Date(now - Math.floor(Math.random()*1000*60*60*24));
  return recent;
}

function getRandomPersonaFromIdentity(){ return window.identity ? window.identity.getRandomPersona() : {name:"User", avatar:"assets/default-avatar.jpg", isAdmin:false}; }

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
  // typos
  if(maybe(0.6)){
    text = text.replace(/\w{4,}/g, word => {
      if(maybe(0.45)){
        const i = rand(word.length-1);
        return word.substring(0,i)+word[i+1]+word[i]+word.substring(i+2);
      } else if(maybe(0.2)){
        const i = rand(word.length);
        return word.substring(0,i)+word.substring(i+1);
      }
      return word;
    });
  }
  if(maybe(0.55)){
    const emojiCount = rand(3);
    for(let i=0;i<emojiCount;i++) text += " " + random(window.identity ? window.identity.EMOJIS || ["💸"] : ["💸"]);
  }

  // avoid duplicates
  let attempts = 0;
  while(GENERATED_TEXTS_V11.has(text) && attempts < 30){
    text += " " + rand(999);
    attempts++;
  }
  GENERATED_TEXTS_V11.add(text);

  return { persona, text, timestamp: generateTimestamp() };
}

// fill pool
function ensurePoolV11(minSize=100){
  while(LONG_TERM_POOL_V11.length < minSize){
    LONG_TERM_POOL_V11.push(generateTradingCommentV11());
  }
}

function postFromPoolV11(count=1){
  ensurePoolV11(count);
  for(let i=0;i<count;i++){
    const item = LONG_TERM_POOL_V11.shift();
    // dispatch to renderer with a small delay to keep UI responsive
    setTimeout(()=> {
      if(window.TGRenderer && window.TGRenderer.appendMessage){
        window.TGRenderer.appendMessage(item.persona, item.text, { timestamp: item.timestamp, type: "incoming" });
      }
    }, i*80);
  }
}

// replies & reactions
function triggerTrendingReactionV11(baseText){
  if(!baseText) return;
  const repliesCount = rand(5)+1;
  for(let i=0;i<repliesCount;i++){
    setTimeout(()=>{
      const comment = generateTradingCommentV11();
      // render as reply by passing parentId as baseText (use baseText as an identifier)
      if(window.TGRenderer && window.TGRenderer.appendMessage){
        window.TGRenderer.appendMessage(comment.persona, comment.text, { timestamp: comment.timestamp, type: "incoming", replyToText: baseText });
      }
    }, 700*(i+1) + rand(500));
  }
}

// continuous chatter
let _crowdInterval = null;
function simulateRandomCrowdV11(interval=10000){
  if(_crowdInterval) clearInterval(_crowdInterval);
  _crowdInterval = setInterval(()=>{
    postFromPoolV11(1);
  }, interval + rand(20000));
}

// export hooks
window.realism = {
  postFromPoolV11, triggerTrendingReactionV11, simulateRandomCrowdV11, ensurePoolV11, LONG_TERM_POOL_V11
};

// autostart initial content
ensurePoolV11(300);
postFromPoolV11(50);
simulateRandomCrowdV11(8000);
