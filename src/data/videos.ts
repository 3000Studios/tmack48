import {
  youtubeEmbedUrl,
  youtubeShortsUrl,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/lib/youtubeUrls";

export type VideoCategory =
  | "official"
  | "single"
  | "anthem"
  | "street"
  | "classic"
  | "featured"
  | "short";

export interface Video {
  id: string;
  videoId: string;
  title: string;
  embedUrl: string;
  watchUrl: string;
  thumbnailUrl: string;
  thumbnailHqUrl: string;
  thumbnailMaxUrl: string;
  category: VideoCategory;
  tags: string[];
  featured: boolean;
  order: number;
  blurb?: string;
}

interface SeedEntry {
  videoId: string;
  title: string;
  category: VideoCategory;
  tags: string[];
  featured: boolean;
  blurb?: string;
}

/**
 * Catalog synced from @TaylorMadeHits (TaylorMade Hits, channel
 * UCVlBvVymaIh7DQRYM410d-w) — harvest 2026-11-06.
 * Long-form first (newest first), then Shorts. Watch URL =
 * https://www.youtube.com/watch?v=<id>; thumbnail =
 * https://i.ytimg.com/vi/<id>/hqdefault.jpg (via youtubeUrls helpers).
 */
const SEED: SeedEntry[] = [
  {
    videoId: "z0bAIMtrjOQ",
    title: "Save Me Wonder Woman - (OFFICIAL VIDEO)",
    category: "featured",
    tags: ["official", "music video", "taylormade-hits"],
    featured: true,
  },
  {
    videoId: "sZCfeTn_yS0",
    title: "Nobody To Save - (OFFICIAL VISUALIZER)",
    category: "featured",
    tags: ["official", "music video", "taylormade-hits"],
    featured: true,
  },
  {
    videoId: "RWKxL2SxM-I",
    title: "State Of Deep - (OFFICIAL VISUALIZER)",
    category: "featured",
    tags: ["official", "music video", "taylormade-hits"],
    featured: true,
  },
  {
    videoId: "BzYNS9XtuZI",
    title: "They Call Me Mr. BIGNUTTS- (OFFICIAL VISUALIZER)",
    category: "featured",
    tags: ["official", "music video", "taylormade-hits"],
    featured: true,
  },
  {
    videoId: "ypCZQ4e81Fo",
    title: "Hip Hop - (OFFICIAL VIDEO)",
    category: "featured",
    tags: ["official", "music video", "taylormade-hits"],
    featured: true,
  },
  {
    videoId: "-nwt-T1B5V8",
    title: "Music Drugs Love - (OFFICIAL VIDEO)",
    category: "featured",
    tags: ["official", "music video", "taylormade-hits"],
    featured: true,
  },
  {
    videoId: "J5YzZ1h3o9s",
    title: "Oh God Why Oh Why - (OFFICIAL VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "8fi6HMaYZL0",
    title: "I Don't Wanna Grow Up Anymore - (OFFICIAL VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "RFFlWGKg9Y0",
    title: "State of DEEP - (OFFICIAL VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "OVzbZp4B2AE",
    title: "Sonny's Got A Fat Lip - (OFFICIAL VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "km2ZVstvcdM",
    title: "THEY CALL ME MR.BIGNUTTS - (OFFICIAL VISUALIZER)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "4BqOZfMuC6U",
    title: "AWAKE - (OFFICIAL MUSIC VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "Pnb2fYgRwHc",
    title: "RED, WHITE, AND BLUE - (OFFICIAL  VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "jjhxAU7wueA",
    title: "NOBODY TO SAVE - (OFFICIAL VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "gY3hpMhbt4g",
    title: "BOOTY BROWN - (OFFICIAL VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "KRLF3zsnia8",
    title: "DRAKE-POPSTAR REMIX (CLIP) ‼️",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "8g7IzNorG5k",
    title: "Oh Hell Naw...😂😂 #WTF #justno",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "JV2WosPwm6c",
    title: "HOLLER 2 DA WHAT (OFFICIAL MUSIC VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "jXmTY2rq2Vk",
    title: "Mr. BigNUTTS (OFFICIAL MUSIC VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "QgfNpCJSKp8",
    title: "MEET ME IN THE SKY - (OFFICIAL MUSIC VIDEO )",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "7Sy9JYqqcLg",
    title: "DOWN=UP - (OFFICIAL MUSIC VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "BD-cOfBMjXk",
    title: "WOOSHYBOO - (OFFICIAL MUSIC VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "I8Z8BPd1DaQ",
    title: "HELD MY BREATH IN THE RAIN - (OFFICIAL MUSIC VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "McttTHez6nE",
    title: "CRUISIN THE STREETS OF THE A L P - (OFFICIAL MUSIC VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "6K-DXJgXpNo",
    title: "WARNING SIGN - (OFFICIAL MUSIC VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "MAlbdUnZ4qU",
    title: "THE WORLD TODAY - (OFFICIAL MUSIC VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "QMSTouwZxBs",
    title: "PAPER CUP CROWN - (OFFICIAL MUSIC VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "da1kpiC6fPQ",
    title: "THE HAZE - (OFFICIAL MUSIC VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "a17mLxWD3b4",
    title: "BABY BOO BLUES - (OFFICIAL VISUALIZER)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "_V9bGFT3dyQ",
    title: "A B C D E - (OFFICIAL MUSIC VIDEO)",
    category: "official",
    tags: ["official", "music video", "taylormade-hits"],
    featured: false,
  },
  {
    videoId: "Zs8fSkDUM1k",
    title: "50 CENT G-UNIT (Just a 'Lil Bit) JUST BROKE 1K SUBS / THANK YOU!! 🙏 😊☝️🤯💯",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "JCu4CIJti5k",
    title: "Drake-Burning Bridges remix Mr. BigNuts Sample Clips",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "tsTBFuf4IZ8",
    title: "NOW THAT'S WHAT YOU CALL A WINGMAN💯💯🔥🔥😂🤣😝 #wingman #pitbullife #mrbignuts",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "byHXKsyNip0",
    title: "ATM Danny \"2 Much\" remix #pitbullife #thatsthething #2much",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "c_gCKrdvSsk",
    title: "\"I Wanna Know One Thing...\" Headliner #countrydubstep #remix #theothersideofmakebelieve",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "dgwiEJp7-2g",
    title: "She's From Texas I Can Tell #remix #southernrockvibes",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "YsnlK_MPQdE",
    title: "Nicole Kidman Pole Swing #nicolekidman #pitbull #hilarious",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "81ocDQHDFQA",
    title: "CASE DISMISSED!  Beat the Case and Walked Out a Legend 🐾⚖️🔥#freeatlast #casedismissed",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "JqPWtQgvlyM",
    title: "The System Being Built Makes It Look Like Progress @thelaststand01 #redpill",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "S1g3z5C3Mwg",
    title: "The System Being Built Makes It Look Like Progress  #redpill @thelaststand01",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "LcStoHsb2eM",
    title: "Super Fly in my RayBans & Fur #itsallofthem #eattherich",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "8lauvYytPKk",
    title: "I'll take that, thank you very much... #itsallofthem #karmainspired",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "0SvwcZZNwI8",
    title: "Susan Dell & Nala Just Hijacked ‘Thriller’ 😳🐶🧟‍♀️ #susandell #thrillershorts #halloween2026",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "PxsRHYW3mgY",
    title: "“Nala’s Checkup: Dodge, Duck, BOOM!” #pitbullife #funnyaf",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "8iokvfbkbyY",
    title: "MOP OF THE DEAD ☠️ Susan Dell: ZOMBIE MODE 🎃👻💀",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "fwq6mtEdsYA",
    title: "This One's For You 🥳💯☝️",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "EITnTe4qO44",
    title: "Hip Hop - (OFFICIAL SHORT) #classicsongs #hiphopmusic",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "nLZ-aBmmZIo",
    title: "Cats On Broadway #besties #diedlaughing #cutekittys",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "itSyYfq6bSU",
    title: "It's a certain,\"I Don't Know What.\" #gettinit #smalltownboy",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "-bn-JNgT3-g",
    title: "Susan Dell: \"Oh yeah, can a lizard do this?\" #itsallofthem #lizardmopdance",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "SyVpfUxjju4",
    title: "How I feel EVERY time💯💯❤️❤️ #subscribers #subs",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "duJ1-iQGvH0",
    title: "Oh God Why Oh Why - (OFFICIAL SHORT) #halloween2026",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "S7GopYlGBU0",
    title: "I Don't Wanna Grow Up Anymore - (OFFICIAL SHORT) #lifestoofast",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "W4OhNr1KO2E",
    title: "STATE OF DEEP -(OFFICIAL SHORT) #itsallofthem #deepstate",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "sKFKJifdDCc",
    title: "Sonny's Got A Fat Lip - (OFFICIAL SHORT) #countrydubstep #sorrynotsorry",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "N0c09guFDQY",
    title: "Susan Dells \"THRILLER\"😱😱 #michaeljacksonthriller #thedellofthedead",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "2wDRWkUOZ9o",
    title: "AWAKE - (OFFICIAL SHORT) #theothersideofmakebelieve",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "DZ-CgboJfiE",
    title: "“I Caught My Dog Watching Her Phone at 2AM… She Played Dead 😂” #dogsbehavingverybadly",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "8Z5C3dsu1gA",
    title: "4 Unlikely Carpoolers Sing “Walk It Like I Talk It”—That SUV Never Stood a Chance 😂 #walkittalkit",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "nANEANBJJCQ",
    title: "Vivek’s Baby Lift Goes Sideways… Then Trump & Vance Show Up in Drag?! 💀 #wakeupamerica",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "AihoqKtd1Oc",
    title: "RED, WHITE, and BLUE - (OFFICIAL SHORT) #oldglory #americanmade",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "L5aCqYk4OB0",
    title: "When The GOLDEN GIRLS Pull Up Playing MIGOS 🔥 🔥  #GoldenGirls #WalkItTalkIt #Migos #FunnyShorts",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "nACxB0CxaLk",
    title: "NOBODY TO SAVE - (OFFICIAL SHORT)",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "9qgN9u0zfNE",
    title: "BOOTY BROWN - (OFFICIAL SHORT) #atl #bigfacts",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "Az9OoQ45-Lg",
    title: "I'm JUST THAYIN.. 🤣 LMAO 🤣 #funny #pitbull",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "7Xhip2Qed18",
    title: "#1 RULE When interacting with PitBulls 💯💯#BIGFACTS #funny",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "J7-X9eoDGlE",
    title: "This Is What We've Trained For... #NinjaPitbull #BigBarkBigBite",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "DykoeaIslUM",
    title: "Holler 2 Da What (Official Music Short)",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "CM61gip5yhE",
    title: "What Freaking Song Is This?? It's Killing Me!! #funny #pitbullsinger #Alf",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "24Ydhx8Ohkg",
    title: "What The Hell Am I Looking At?...",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "0eNRF643cpY",
    title: "I'm not so sure about these remixes...",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "_nWRVjayUMo",
    title: "Sugar Boo For Real!! #imlevitating #dualipa",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "zoxmDx5md20",
    title: "When the Algorithm blesses you with new subscribers....  #doggykittydance",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "3pEuoPwsWBI",
    title: "They Call Me Mr. BIGNUTTS (OFFICIAL SHORT)",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "HIsPG8ksAAI",
    title: "Yo Dookay, Pick Up The Phone!!",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "lL5291wIeSA",
    title: "\"So Much For Humanity My Friend\" Trick or Treat with the Elite 2026 #ItsAllofThem #savethekids",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "olJEoMfvYiY",
    title: "Millionaires Mindset, That's My Dawg!",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
  {
    videoId: "cxTG6rqFTJ4",
    title: "ChatGBT, ChatGBT!!",
    category: "short",
    tags: ["short", "vertical", "taylormade-hits"],
    featured: false,
    blurb: "TaylorMade Hits Short — watch it on YouTube.",
  },
];

// Probed live 2026-11-07: these videos have NO maxres thumbnail on YouTube
// (i.ytimg returns 404), so a maxres URL renders as a broken/blank card.
// Their thumbnailMaxUrl falls back to the hq thumbnail, which always exists.
const NO_MAXRES_THUMB = new Set([
  "-nwt-T1B5V8", "7Sy9JYqqcLg", "8fi6HMaYZL0", "BD-cOfBMjXk",
  "J5YzZ1h3o9s", "KRLF3zsnia8", "OVzbZp4B2AE", "Pnb2fYgRwHc",
  "QgfNpCJSKp8", "RFFlWGKg9Y0", "RWKxL2SxM-I", "jXmTY2rq2Vk",
  "km2ZVstvcdM", "sZCfeTn_yS0", "ypCZQ4e81Fo", "z0bAIMtrjOQ",
]);

export const videos: Video[] = SEED.map((v, i) => ({
  id: `taylormade-${v.videoId}`,
  videoId: v.videoId,
  title: v.title,
  embedUrl: youtubeEmbedUrl(v.videoId),
  watchUrl: v.category === "short" ? youtubeShortsUrl(v.videoId) : youtubeWatchUrl(v.videoId),
  thumbnailUrl: youtubeThumbnailUrl(v.videoId, "mq"),
  thumbnailHqUrl: youtubeThumbnailUrl(v.videoId, "hq"),
  thumbnailMaxUrl: NO_MAXRES_THUMB.has(v.videoId)
    ? youtubeThumbnailUrl(v.videoId, "hq")
    : youtubeThumbnailUrl(v.videoId, "max"),
  category: v.category,
  tags: v.tags,
  featured: v.featured,
  order: i + 1,
  blurb: v.blurb,
}));

export const featuredVideos = videos.filter((v) => v.featured);

export const videoCategories: { id: VideoCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "featured", label: "Featured" },
  { id: "official", label: "Official" },
  { id: "short", label: "Shorts" },
  { id: "anthem", label: "Anthems" },
  { id: "single", label: "Singles" },
  { id: "street", label: "Street" },
  { id: "classic", label: "Classics" },
];

export function getVideoById(id: string): Video | undefined {
  return videos.find((v) => v.videoId === id || v.id === id);
}

export function getRandomFeatured(): Video {
  const pool = featuredVideos.length ? featuredVideos : videos;
  return pool[Math.floor(Math.random() * pool.length)];
}
