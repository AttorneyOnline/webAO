if(!self.define){let e,s={};const c=(c,i)=>(c=new URL(c+".js",i).href,s[c]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=c,e.onload=s,document.head.appendChild(e)}else e=c,importScripts(c),s()})).then((()=>{let e=s[c];if(!e)throw new Error(`Module ${c} didn’t register its module`);return e})));self.define=(i,a)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(s[r])return;let l={};const d=e=>c(e,r),b={module:{uri:r},exports:l,require:d};s[r]=Promise.all(i.map((e=>b[e]||d(e)))).then((e=>(a(...e),l)))}}define(["./workbox-ec81a2a1"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"client.24f1f796994b61cd63d4.bundle.js",revision:null},{url:"client.html",revision:"02dcf46c08da490eb4c1fb0420c3d2d0"},{url:"desc.png",revision:"67a0eedb45c24f72b860f64493594881"},{url:"dom.9e0fd7de19a388a243b8.bundle.js",revision:null},{url:"favicon.ico",revision:"c45eb83cab86786181c38143f4885dc1"},{url:"golden/LICENSE.txt",revision:"c492b99b8597d6c45b59fbdf12d82f04"},{url:"golden/css/goldenlayout.css",revision:"7d753cc032bac50c62cddc4937a3cc97"},{url:"golden/js/goldenlayout.js",revision:"1df40e11aa2f9872c147de1c37661bfb"},{url:"index.html",revision:"9872dc68e661eb79204ef1c59d653645"},{url:"lib/gify.min.js",revision:"8a03a3c610bf12a1cb0c3489ccdcd809"},{url:"lib/jdataview.min.js",revision:"a5a65e906b202fa86664cfab653536f5"},{url:"lib/jquery.ui.touch-punch.min.js",revision:"47e994d1c7456d2a67985ee3475abe84"},{url:"lib/jquery.ui.touch-punch.min.js.LICENSE.txt",revision:"53c18dc1ea56f2f66690561377d905b8"},{url:"logo-new-512.png",revision:"64ef637f499d476b665903b318151eed"},{url:"logo-new.png",revision:"be91edf391662c20d5e66acf5445d6e0"},{url:"manifest.json",revision:"fdb168a4286842963d9fdf8e29174dd2"},{url:"master.36d374c3bc6109fc3a4f.bundle.js",revision:null},{url:"styles/ace-attorney.woff",revision:"3a05d5cb73899a2cdca9be85b561ba6c"},{url:"styles/ace-attorney.woff2",revision:"e4fb6df5464abcd9006578ab16efb7a9"},{url:"styles/chatbox/aa.css",revision:"745c20ad9245a91de67e70ae86516b09"},{url:"styles/chatbox/ace-name.ttf",revision:"5fca94d6e5348a5ae95b804a5054b8be"},{url:"styles/chatbox/acww.css",revision:"fce5d5bcc2aff79aa70876051c33ac67"},{url:"styles/chatbox/acww.svg",revision:"57b3cce731570f8795f6771ba2f14e24"},{url:"styles/chatbox/chat999.css",revision:"53a31bb1a10cde6d262a08c56343c623"},{url:"styles/chatbox/chatboxes.js",revision:"495783429cec1028ff6d168fc546bb39"},{url:"styles/chatbox/chatdd.css",revision:"b5e422b9c48192d940ef16d719e29370"},{url:"styles/chatbox/chatdr2.css",revision:"5bddbcb587cf8521b1d9d1e0eb686860"},{url:"styles/chatbox/chatfuture.css",revision:"88a773c5e8d15df5cc88801b19680e98"},{url:"styles/chatbox/chatp3.css",revision:"06d8d8645c58b2caa6cb88a90f0e69c9"},{url:"styles/chatbox/chatplvsaa.css",revision:"e0f11e11b026421e5e7d85d5a3d1fb41"},{url:"styles/chatbox/chatwaiting_acww.svg",revision:"aa9251ee0e757ead403b335281de4c2f"},{url:"styles/chatbox/chatwaiting_dr1.svg",revision:"3d508011028fb6c4b7ef851c00e4fcac"},{url:"styles/chatbox/chatwaiting_triology.svg",revision:"f3722f35c08208f8189884974745a2a2"},{url:"styles/chatbox/chatwaiting_whentheycry.png",revision:"55d0820f755ae17798d3c0c64bbb3347"},{url:"styles/chatbox/dd.svg",revision:"bb273e1e28e434fc77908d1f94df48be"},{url:"styles/chatbox/ddlc.css",revision:"69a3fe59052677d045b89d3fb8f1eb0e"},{url:"styles/chatbox/dgs.css",revision:"c31be986850089bcd0909c92c86e88c2"},{url:"styles/chatbox/dgs_chat_bg.png",revision:"c39624ae54e8e480a775aecff316a079"},{url:"styles/chatbox/dr1.css",revision:"42719ac52f3e4f9622e8f81d5f44a464"},{url:"styles/chatbox/drae.css",revision:"44a4078024e960e8561fedd48e7c461e"},{url:"styles/chatbox/drv3.css",revision:"a48e3db1a78430ba8521e7f00c023ec8"},{url:"styles/chatbox/drv3chatbox.png",revision:"2939924d84f399a897fbf969decfe1d4"},{url:"styles/chatbox/ff.css",revision:"e55152a094ac435104358b0fea55b8f3"},{url:"styles/chatbox/halla.css",revision:"932c41368d6d2497c6f586331df0a64c"},{url:"styles/chatbox/homestuck.css",revision:"6805a5d49cc1eaf46ba2c13afbf192ec"},{url:"styles/chatbox/key.css",revision:"49ec4d708674f629d1f3501e730f74cf"},{url:"styles/chatbox/legacy.css",revision:"6dcf5170328d61c2656e0aaa17428c44"},{url:"styles/chatbox/n64zelda.css",revision:"74197bc2ebdd43b69d2000a883be70b5"},{url:"styles/chatbox/p4.css",revision:"469c4a497056debad9f102076c453998"},{url:"styles/chatbox/p5.css",revision:"ff631c72fe0f005d44c1f8f68bb0827d"},{url:"styles/chatbox/p5.svg",revision:"9c9c5bdbba84b2fa1a457a295fdb51d2"},{url:"styles/chatbox/p5_template.svg",revision:"a413a522d1e05de5991c2c289d97c2f7"},{url:"styles/chatbox/papermario.css",revision:"ecd3191ca977f6bf1ac9600b03be11ad"},{url:"styles/chatbox/trilogy.css",revision:"49d2037ce32b84d8a1a3c171137ddc84"},{url:"styles/chatbox/whentheycry.css",revision:"0355f3b4d899b4e1d5610a70de80d57b"},{url:"styles/chatbox/x_button.svg",revision:"bdd1929b4fecbf38fee849fc5d85a7e9"},{url:"styles/chatbox/yakuza.css",revision:"6075c5888b39ceaa6b3e3458d07dfae8"},{url:"styles/chatbox/yttd.css",revision:"c98dc516852e821d220072be3011682f"},{url:"styles/classic.css",revision:"c4120d75474477286359b9c868a3dcf8"},{url:"styles/client.css",revision:"65eda0076da430f84a0b8e1fe330edd2"},{url:"styles/cyber.css",revision:"8116b557d50cbd150761555571787048"},{url:"styles/default.css",revision:"042410e0a47787ebfeacb682788e01af"},{url:"styles/igiari/Igiari.eot",revision:"09d2e416311875dd4b8ccf1def24c68d"},{url:"styles/igiari/Igiari.otf",revision:"d9fbea5f64295736d614039206b6a25f"},{url:"styles/igiari/Igiari.svg",revision:"64c04680e8e60523a6bd9e9fcae81539"},{url:"styles/igiari/Igiari.ttf",revision:"a3069869cfbf984e2cf00c1d55056e6d"},{url:"styles/igiari/Igiari.woff",revision:"3ef410e0ba4c91e478b032c80b73cb39"},{url:"styles/igiari/igiari-cyrillic.ttf",revision:"2d0cfbf626f3dff71b3090f91a74cdfa"},{url:"styles/igiari/license.txt",revision:"1a2f97f542368549a80642c9f03bab69"},{url:"styles/igiari/readme.txt",revision:"3e0e84944d03b8939e75dac7cf3745cb"},{url:"styles/igiari/webfont.css",revision:"6a6179658910fb00294209b47180a5cd"},{url:"styles/inferior.css",revision:"1ead675fccd798f707f45374934ff71d"},{url:"styles/master.css",revision:"3800567683ba156929db624bbb823fd4"},{url:"styles/nameplates.css",revision:"a7fa5eb036926ce97730079133a26601"},{url:"styles/shownames.css",revision:"9038e5b5eda9cb7e350161b3869a9f58"},{url:"styles/soj.css",revision:"2fd09770be8256c01303c6689607748e"},{url:"styles/trilogy.css",revision:"89e56b252415dc386a359d094c89f31c"},{url:"styles/trilogy_bg.png",revision:"c34831dcca7d7d2b34aa1219419e9a0e"},{url:"ui.5e3f579664e51f0d2f35.bundle.js",revision:null},{url:"ui.5e3f579664e51f0d2f35.bundle.js.LICENSE.txt",revision:"fc73241165b46df46ef18b47f9e1ed7c"}],{})}));
//# sourceMappingURL=service-worker.js.map
