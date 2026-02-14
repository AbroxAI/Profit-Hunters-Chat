// identity-personas.js
// Persona engine v2 (tuned) + avatar pool with debug/logging

const Admin = {
  name: "Profit Hunter 🌐",
  avatar: "assets/admin.jpg",
  isAdmin: true,
  gender: "male",
  country: "GLOBAL",
  personality: "authority",
  tone: "direct",
  timezoneOffset: 0,
  rhythm: 1,
  memory: []
};

const COUNTRY_GROUPS = {
  US:"western", UK:"western", CA:"western", AU:"western",
  DE:"western", FR:"western", IT:"western", ES:"western",
  NL:"western", SE:"western", CH:"western", BE:"western",
  NG:"african", ZA:"african",
  IN:"asian", JP:"asian", KR:"asian",
  BR:"latin", MX:"latin",
  RU:"eastern"
};
const COUNTRIES = Object.keys(COUNTRY_GROUPS);

const MALE_FIRST=["Alex","John","Max","Leo","Sam","David","Liam","Noah","Ethan","James","Ryan","Michael","Daniel","Kevin","Oliver","William","Henry","Jack","Mason","Lucas","Elijah","Benjamin","Sebastian","Logan","Jacob","Wyatt","Carter","Julian","Luke","Isaac","Nathan","Aaron","Adrian","Victor","Caleb","Dominic","Xavier","Evan","Connor","Jason"];
const FEMALE_FIRST=["Maria","Lily","Emma","Zoe","Ivy","Sophia","Mia","Olivia","Ava","Charlotte","Amelia","Ella","Grace","Chloe","Hannah","Aria","Scarlett","Luna","Ruby","Sofia","Emily","Layla","Nora","Victoria","Aurora","Isabella","Madison","Penelope","Camila","Stella","Hazel","Violet","Savannah","Bella","Claire"];
const LAST_NAMES=["Smith","Johnson","Brown","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Garcia","Martinez","Robinson","Clark","Rodriguez","Lewis","Walker","Hall","Allen","Young","King","Wright","Scott","Green","Baker","Adams","Nelson","Hill","Campbell"];
const CRYPTO_ALIASES=["BlockKing","PumpMaster","CryptoWolf","FomoKing","Hodler","MoonWalker","TraderJoe","BitHunter","AltcoinAce","ChainGuru","DeFiLord","MetaWhale","CoinSniper","YieldFarmer","NFTDegen","ChartWizard","TokenShark","AirdropKing","WhaleHunter","BullRider"];
const TITLES=["Trader","Investor","HODLer","Analyst","Whale","Shark","Mooner","Scalper","SwingTrader","DeFi","Miner","Blockchain","NFT","Quant","Signals","Mentor"];
const EMOJIS=["💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑","🎯","🏆","🤖","🎉","🍀","📊","⚡","💎","👑","🦄","🧠","🔮","🪙","🥂","💡","🛸","📉","💲","📱","💬"];

/* ---------- AVATAR POOL (40+ mixed avatar urls) ---------- */
const AVATAR_POOL = [
  "https://randomuser.me/api/portraits/men/1.jpg",
  "https://randomuser.me/api/portraits/men/12.jpg",
  "https://randomuser.me/api/portraits/men/14.jpg",
  "https://randomuser.me/api/portraits/men/21.jpg",
  "https://randomuser.me/api/portraits/men/31.jpg",
  "https://randomuser.me/api/portraits/men/45.jpg",
  "https://randomuser.me/api/portraits/women/2.jpg",
  "https://randomuser.me/api/portraits/women/11.jpg",
  "https://randomuser.me/api/portraits/women/18.jpg",
  "https://randomuser.me/api/portraits/women/26.jpg",
  "https://i.pravatar.cc/300?img=5",
  "https://i.pravatar.cc/300?img=10",
  "https://i.pravatar.cc/300?img=15",
  "https://i.pravatar.cc/300?img=20",
  "https://i.pravatar.cc/300?img=25",
  "https://i.pravatar.cc/300?img=30",
  "https://ui-avatars.com/api/?name=Alex&background=random&size=256",
  "https://ui-avatars.com/api/?name=Maria&background=random&size=256",
  "https://ui-avatars.com/api/?name=Sam&background=random&size=256",
  "https://ui-avatars.com/api/?name=Priya&background=random&size=256",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=alpha",
  "https://api.dicebear.com/7.x/bottts/svg?seed=bravo",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=charlie",
  "https://api.dicebear.com/7.x/identicon/svg?seed=delta",
  "https://robohash.org/community_01.png",
  "https://robohash.org/community_02.png",
  "https://api.multiavatar.com/John.png",
  "https://api.multiavatar.com/Maria.png",
  "https://joeschmoe.io/api/v1/random",
  "https://joeschmoe.io/api/v1/female/2",
  "https://joeschmoe.io/api/v1/male/3",
  "https://avatars.dicebear.com/api/initials/JK.svg?background=%23b4cde6",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=foxtrot",
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=golf",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=hotel",
  "https://api.dicebear.com/7.x/shapes/svg?seed=india",
  "https://thispersondoesnotexist.com/image",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=juliet",
  "https://api.dicebear.com/7.x/identicon/svg?seed=kilo",
  "https://ui-avatars.com/api/?name=User+01&background=random&size=256"
];

/* ---------- SLANG ---------- */
const SLANG = {
  western:["bro","ngl","lowkey","fr","tbh","wild","solid move","bet","dope","lit","clutch","savage","meme","cheers","respect","hype","flex","mad","cap","no cap","real talk","yo","fam","legit","sick","bangin","cringe"],
  african:["my guy","omo","chai","no wahala","sharp move","gbam","yawa","sweet","jollof","palava","chop","fine boy","hustle","ehen","kolo","sisi","big man","on point","correct","wahala no","naija","bros","guyz","mumu","gbosa","vibe"],
  asian:["lah","brother","steady","respect","solid one","ok lah","si","good move","shi","ganbatte","wa","neat","ke","nice one","yah","bro lah","cool","steady bro","solid bro","aiyo","yah lah","okey","ma","ganbatte ne","broshi","good bro"],
  latin:["amigo","vamos","muy bueno","fuerte move","dale","epa","buenisimo","chevere","que pasa","vamo","oye","pura vida","mano","buena","apta","vamos ya","olé","sí","bacano","rico","tranquilo","hermano","qué tal","vale","sí pues","chido","vamos amigo"],
  eastern:["comrade","strong move","not bad","serious play","da","top","okey","nu","excellent","good work","correct","bravo","fine","nice move","pro","cheers","well done","solid play","serious one","good lad","da bro","top move","excellent play"]
};

/* ---------- Synthetic Persona Pool ---------- */
const TOTAL_PERSONAS = 250;
const SyntheticPool = [];
const UsedNames = new Set();
const UsedAvatarURLs = new Set();
const PostComments = {};
const ConversationMemory = {};

/* ---------- helpers ---------- */
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function maybe(p){ return Math.random() < p; }
function rand(max=9999){ return Math.floor(Math.random()*max); }

function buildUniqueName(gender){
  let base;
  if(maybe(0.7)) base = (gender==="male"?random(MALE_FIRST):random(FEMALE_FIRST)) + " " + random(LAST_NAMES);
  else base = random(CRYPTO_ALIASES);
  if(maybe(0.5)) base += " " + random(TITLES);
  if(maybe(0.7)) base += rand(999);
  if(maybe(0.5)) base = base.replace(/\s+/g, maybe(0.5) ? "_" : ".");
  if(maybe(0.6)) base += " " + random(EMOJIS);
  return base.trim();
}

function buildUniqueAvatar(name,gender){
  const unused = AVATAR_POOL.filter(u => !UsedAvatarURLs.has(u));
  if(unused.length){
    const pick = random(unused);
    UsedAvatarURLs.add(pick);
    return pick;
  }
  let avatar;
  let attempts = 0;
  do{
    const source = random([
      {type:"randomuser"}, {type:"pravatar"}, {type:"robohash"}, {type:"multiavatar"},
      {type:"dicebear",style:"avataaars"}, {type:"dicebear",style:"bottts"},
      {type:"dicebear",style:"identicon"}, {type:"dicebear",style:"open-peeps"},
      {type:"dicebear",style:"pixel-art"}, {type:"ui-avatars"}
    ]);
    switch(source.type){
      case "randomuser": avatar = `https://randomuser.me/api/portraits/${gender==="male"?"men":"women"}/${rand(99)}.jpg`; break;
      case "pravatar": avatar = `https://i.pravatar.cc/300?img=${rand(70)}`; break;
      case "robohash": avatar = `https://robohash.org/${encodeURIComponent(name+rand())}.png`; break;
      case "multiavatar": avatar = `https://api.multiavatar.com/${encodeURIComponent(name+rand())}.png`; break;
      case "dicebear": avatar = `https://api.dicebear.com/7.x/${source.style}/svg?seed=${encodeURIComponent(name+rand())}`; break;
      case "ui-avatars": avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`; break;
      default: avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`; break;
    }
    attempts++;
    if(attempts>10) break;
  } while(UsedAvatarURLs.has(avatar));
  UsedAvatarURLs.add(avatar);
  return avatar;
}

function generateSyntheticPersona(){
  const gender = maybe(0.5) ? "male" : "female";
  const country = random(COUNTRIES);
  const region = COUNTRY_GROUPS[country];
  let name;
  do { name = buildUniqueName(gender); } while(UsedNames.has(name));
  UsedNames.add(name);
  const persona = {
    name,
    avatar: buildUniqueAvatar(name,gender),
    isAdmin: false,
    gender,
    country,
    region,
    personality: random(["hype","analytical","casual","quiet","aggressive"]),
    tone: random(["short","normal","long"]),
    timezoneOffset: rand(24)-12,
    rhythm: Math.random()*2,
    lastSeen: Date.now()-rand(6000000),
    memory: [],
    sentiment: random(["bullish","neutral","bearish"]),
    lastPostAt: 0
  };
  ConversationMemory[persona.name] = persona.memory;
  return persona;
}

/* ---------- populate pool ---------- */
for(let i=0;i<TOTAL_PERSONAS;i++){ SyntheticPool.push(generateSyntheticPersona()); }

/* ---------- persona getters ---------- */
function getRandomPersona(){ return random(SyntheticPool); }
function getPersona(opts={}){ return opts.type==="admin" ? Admin : getRandomPersona(); }

/* ---------- generate human comment ---------- */
function generateHumanComment(persona, baseText, targetName=null){
  let text = baseText;
  if(maybe(0.5)){
    const slangWords=[]; const count = rand(3)+1;
    for(let i=0;i<count;i++) slangWords.push(random(SLANG[persona.region]||[]));
    text = slangWords.join(" ") + " " + text;
  }
  if(persona.tone==="short") text = text.split(" ").slice(0,6).join(" ");
  if(persona.tone==="long") text += " honestly this setup looks strong if volume confirms.";
  if(maybe(0.4)) text += " " + random(EMOJIS);
  if(targetName && maybe(0.3)) text = "@" + targetName + " " + text;
  persona.memory.push(text);
  return text;
}

function getLastSeenStatus(persona){
  const diff = Date.now() - persona.lastSeen;
  if(diff < 300000) return "online";
  if(diff < 3600000) return "last seen recently";
  if(diff < 86400000) return "last seen today";
  return "last seen long ago";
}

function simulateCrowdReaction(baseText){
  const replies = [];
  const count = rand(5)+1;
  for(let i=0;i<count;i++){
    const p = getRandomPersona();
    replies.push(generateHumanComment(p, baseText));
  }
  return replies;
}

/* ---------- export ---------- */
window.identity = {
  Admin, getRandomPersona, getPersona, generateHumanComment, getLastSeenStatus, simulateCrowdReaction, ConversationMemory,
  EMOJIS
};

/* ---------- DEBUG ---------- */
console.log("Identity engine loaded. Personas:", SyntheticPool.length, "Admin ready:", Admin.name);
console.log("Avatar pool ready:", AVATAR_POOL.length, "Used avatars:", UsedAvatarURLs.size);
