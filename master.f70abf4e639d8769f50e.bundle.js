!function(){"use strict";var e={164:function(e,t){function n(e){return e.replaceAll("<num>","#").replaceAll("<and>","&").replaceAll("<percent>","%").replaceAll("<dollar>","$")}function r(e){return e?e.replaceAll(">","＞").replaceAll("<","＜"):""}function o(e){return e.replace(/\\u([\d\w]{1,})/gi,(function(e,t){return String.fromCharCode(parseInt(t,16))}))}Object.defineProperty(t,"__esModule",{value:!0}),t.prepChat=t.decodeChat=t.safeTags=t.unescapeChat=t.escapeChat=void 0,t.escapeChat=function(e){return e.replaceAll("#","<num>").replaceAll("&","<and>").replaceAll("%","<percent>").replaceAll("$","<dollar>")},t.unescapeChat=n,t.safeTags=r,t.decodeChat=o,t.prepChat=function(e){return r(n(o(e)))}},8647:function(e,t,n){var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,a){function c(e){try{i(r.next(e))}catch(e){a(e)}}function s(e){try{i(r.throw(e))}catch(e){a(e)}}function i(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(c,s)}i((r=r.apply(e,t||[])).next())}))},o=this&&this.__generator||function(e,t){var n,r,o,a,c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return a={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function s(s){return function(i){return function(s){if(n)throw new TypeError("Generator is already executing.");for(;a&&(a=0,s[0]&&(c=0)),c;)try{if(n=1,r&&(o=2&s[0]?r.return:s[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,s[1])).done)return o;switch(r=0,o&&(s=[2&s[0],o.value]),s[0]){case 0:case 1:o=s;break;case 4:return c.label++,{value:s[1],done:!1};case 5:c.label++,r=s[1],s=[0];continue;case 7:s=c.ops.pop(),c.trys.pop();continue;default:if(!((o=(o=c.trys).length>0&&o[o.length-1])||6!==s[0]&&2!==s[0])){c=0;continue}if(3===s[0]&&(!o||s[1]>o[0]&&s[1]<o[3])){c.label=s[1];break}if(6===s[0]&&c.label<o[1]){c.label=o[1],o=s;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(s);break}o[2]&&c.ops.pop(),c.trys.pop();continue}s=t.call(e,c)}catch(e){s=[6,e],r=0}finally{n=o=0}if(5&s[0])throw s[1];return{value:s[0]?s[1]:void 0,done:!0}}([s,i])}}},a=this&&this.__values||function(e){var t="function"==typeof Symbol&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")};Object.defineProperty(t,"__esModule",{value:!0}),t.setServ=void 0;var c=n(164),s="servers.aceattorneyonline.com",i=window.location.protocol,l="masterlist",u=[];function p(e){var t=u[e],n=t.online,r=(0,c.safeTags)(t.description);document.getElementById("serverdescription_content").innerHTML="<b>".concat(n,"</b><br>").concat(r)}function f(e){var t=new URL(window.location.href);t.protocol=e;var n=t.pathname.split("/");return n.pop(),t.pathname=n.join("/"),"/"!==t.pathname[t.pathname.length-1]&&(t.pathname+="/"),t.pathname+="client.html",t.href}u[-2]={name:"Singleplayer",description:"Build cases, try out new things",ip:"127.0.0.1",port:50001,assets:"",online:"Online: 0/1",players:0},u[-1]={name:"Localhost",description:"This is your computer on port 50001",ip:"127.0.0.1",port:50001,assets:"",online:"Offline",players:0},function(){return r(this,void 0,void 0,(function(){var e,t,n,r,c,u,p,f,h,d;return o(this,(function(o){switch(o.label){case 0:return e="".concat(i,"//").concat(s,"/servers"),[4,fetch(e)];case 1:return(t=o.sent()).ok?[4,t.json()]:(console.error("Bad status code from masterserver. status: ".concat(t.status,", body: ").concat(t.body)),document.getElementById("ms_error").style.display="block",[2,(v=localStorage.getItem(l)||"[]",JSON.parse(v))]);case 2:n=o.sent(),r=[];try{for(c=a(n),u=c.next();!u.done;u=c.next())(p=u.value).name?p.ip?p.description?(f={name:p.name,description:p.description,ip:p.ip,players:p.players||0},p.ws_port&&(f.ws_port=p.ws_port),p.wss_port&&(f.wss_port=p.wss_port),(f.ws_port||f.wss_port)&&r.push(f)):console.warn("Server ".concat(p.name," has no description, skipping")):console.warn("Server ".concat(p.name," has no ip, skipping")):console.warn("Server ".concat(p," has no name, skipping"))}catch(e){h={error:e}}finally{try{u&&!u.done&&(d=c.return)&&d.call(c)}finally{if(h)throw h.error}}return localStorage.setItem(l,JSON.stringify(r)),[2,r]}var v}))}))}().then((function(e){!function(e){for(var t=0;t<e.length;t++){var n=e[t],r=0,o="",a="";if(n.ws_port&&(r=n.ws_port,o="ws",a="http"),n.wss_port&&(r=n.wss_port,o="wss",a="https"),0!==r&&""!==o&&""!==a){var s=f(a),i="".concat(o,"://").concat(n.ip,":").concat(r),l=n.name,p="".concat(s,"?mode=watch&connect=").concat(i,"&serverName=").concat(l),h="".concat(s,"?mode=join&connect=").concat(i,"&serverName=").concat(l);n.online="Players: ".concat(n.players),u.push(n),document.getElementById("masterlist").innerHTML+='<li id="server'.concat(t,'" onmouseover="setServ(').concat(t,')"><p>').concat((0,c.safeTags)(n.name)," (").concat(n.players,")</p>")+'<a class="button" href="'.concat(p,'" target="_blank">Watch</a>')+'<a class="button" href="'.concat(h,'" target="_blank">Join</a></li>')}else console.warn("Server ".concat(n.name," has no websocket port, skipping"))}}(e)})),document.getElementById("clientinfo").innerHTML="Client version: ".concat("2.8.0"),function(){return r(this,void 0,void 0,(function(){var e,t;return o(this,(function(n){switch(n.label){case 0:return e="".concat(i,"//").concat(s,"/version"),[4,fetch(e)];case 1:return(t=n.sent()).ok?[4,t.text()]:(console.error("Bad status code from masterserver version check. status: ".concat(t.status,", body: ").concat(t.body)),[2,"Unknown"]);case 2:return[2,n.sent()]}}))}))}().then((function(e){!function(e){document.getElementById("serverinfo").innerHTML="Master server version: ".concat(e)}(e)})),t.setServ=p,window.setServ=p}},t={};!function n(r){var o=t[r];if(void 0!==o)return o.exports;var a=t[r]={exports:{}};return e[r].call(a.exports,a,a.exports,n),a.exports}(8647)}();
//# sourceMappingURL=master.f70abf4e639d8769f50e.bundle.js.map