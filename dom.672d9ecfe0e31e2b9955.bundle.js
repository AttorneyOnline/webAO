"use strict";(self.webpackChunkwebao=self.webpackChunkwebao||[]).push([[996],{1104:function(e,t,n){window.toggleEffect=function(e){e.classList.contains("dark")?e.className="client_button":e.className="client_button dark"}},5556:function(e,t,n){window.toggleElement=function(e){var t=document.getElementById(e);"none"!==t.style.display?t.style.display="none":t.style.display="block"}},6652:function(e,t,n){var c=n(8376),i=n(744);window.addEvidence=function(){var e=document.getElementById("evi_select");c.client.sender.sendPE(document.getElementById("evi_name").value,document.getElementById("evi_desc").value,0===e.selectedIndex?document.getElementById("evi_filename").value:e.options[e.selectedIndex].text),(0,i.cancelEvidence)()}},1608:function(e,t,n){var c=n(8376);window.addHPD=function(){c.client.sender.sendHP(1,c.client.hp[0]+1)}},84:function(e,t,n){var c=n(8376);window.addHPP=function(){c.client.sender.sendHP(2,c.client.hp[1]+1)}},9688:function(e,t,n){var c=n(8376);window.callMod=function(){var e;c.extrafeatures.includes("modcall_reason")&&(e=prompt("Please enter the reason for the modcall","")),null==e||""===e||c.client.sender.sendZZ(e)}},744:function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.cancelEvidence=void 0;var c=n(8376),i=n(260),o=n(332);function l(){c.client.selectedEvidence>0&&(document.getElementById("evi_".concat(c.client.selectedEvidence)).className="evi_icon"),c.client.selectedEvidence=0,document.getElementById("evi_select").selectedIndex=0,(0,i.updateEvidenceIcon)(),document.getElementById("evi_filename").value="",document.getElementById("evi_name").value="",document.getElementById("evi_desc").value="",document.getElementById("evi_preview").src="".concat(o.AO_HOST,"misc/empty.png"),document.getElementById("evi_add").className="client_button hover_button",document.getElementById("evi_edit").className="client_button hover_button inactive",document.getElementById("evi_cancel").className="client_button hover_button inactive",document.getElementById("evi_del").className="client_button hover_button inactive"}t.cancelEvidence=l,window.cancelEvidence=l},7236:function(e,t,n){var c=n(9260),i=n(8376),o=(0,c.default)().mode;window.changeBackgroundOOC=function(){var e,t=document.getElementById("bg_select"),n=document.getElementById("bg_filename");e=0===t.selectedIndex?n.value:t.value,"join"===o?i.client.sender.sendOOC("/".concat("bg $1".replace("$1",e))):"replay"===o&&i.client.sender.sendSelf("BN#".concat(e,"#%"))}},3159:function(e,t,n){var c=n(8376),i=n(4700);window.changeCallwords=function(){c.client.callwords=document.getElementById("client_callwords").value.split("\n"),(0,i.default)("callwords",c.client.callwords.join("\n"))}},8460:function(e,t){window.changeCharacter=function(e){document.getElementById("client_waiting").style.display="block",document.getElementById("client_charselect").style.display="block",document.getElementById("client_emo").innerHTML=""}},4236:function(e,t,n){var c=n(7328),i=n(8376);window.changeRoleOOC=function(){var e=document.getElementById("role_select");i.client.sender.sendOOC("/pos ".concat(e.value)),i.client.sender.sendServer("SP#".concat(e.value,"#%")),(0,c.updateActionCommands)(e.value)}},2388:function(e,t,n){var c=n(5048);window.charError=function(e){return console.warn("".concat(e.src," is missing from webAO")),e.src=c.default,!0}},2973:function(e,t,n){var c=n(8376);window.chartable_filter=function(e){var t=document.getElementById("client_charactersearch").value;c.client.chars.forEach((function(e,n){var c=document.getElementById("demo_".concat(n));-1===e.name.toLowerCase().indexOf(t.toLowerCase())?c.style.display="none":c.style.display="inline-block"}))}},3424:function(e,t,n){var c=n(8376),i=n(744);window.deleteEvidence=function(){var e=c.client.selectedEvidence-1;c.client.sender.sendDE(e),(0,i.cancelEvidence)()}},3476:function(e,t,n){var c=n(8376),i=n(744);window.editEvidence=function(){var e=document.getElementById("evi_select"),t=c.client.selectedEvidence-1;c.client.sender.sendEE(t,document.getElementById("evi_name").value,document.getElementById("evi_desc").value,0===e.selectedIndex?document.getElementById("evi_filename").value:e.options[e.selectedIndex].text),(0,i.cancelEvidence)()}},9908:function(e,t,n){var c=n(8376);window.guilty=function(){c.client.sender.sendRT("judgeruling#1")}},3056:function(e,t){window.imgError=function(e){return e.onerror=null,e.src="",!0}},6228:function(e,t,n){var c=this&&this.__awaiter||function(e,t,n,c){return new(n||(n=Promise))((function(i,o){function l(e){try{d(c.next(e))}catch(e){o(e)}}function a(e){try{d(c.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(l,a)}d((c=c.apply(e,t||[])).next())}))},i=this&&this.__generator||function(e,t){var n,c,i,o,l={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function a(a){return function(d){return function(a){if(n)throw new TypeError("Generator is already executing.");for(;o&&(o=0,a[0]&&(l=0)),l;)try{if(n=1,c&&(i=2&a[0]?c.return:a[0]?c.throw||((i=c.return)&&i.call(c),0):c.next)&&!(i=i.call(c,a[1])).done)return i;switch(c=0,i&&(a=[2&a[0],i.value]),a[0]){case 0:case 1:i=a;break;case 4:return l.label++,{value:a[1],done:!1};case 5:l.label++,c=a[1],a=[0];continue;case 7:a=l.ops.pop(),l.trys.pop();continue;default:if(!((i=(i=l.trys).length>0&&i[i.length-1])||6!==a[0]&&2!==a[0])){l=0;continue}if(3===a[0]&&(!i||a[1]>i[0]&&a[1]<i[3])){l.label=a[1];break}if(6===a[0]&&l.label<i[1]){l.label=i[1],i=a;break}if(i&&l.label<i[2]){l.label=i[2],l.ops.push(a);break}i[2]&&l.ops.pop(),l.trys.pop();continue}a=t.call(e,l)}catch(e){a=[6,e],c=0}finally{n=i=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,d])}}};Object.defineProperty(t,"__esModule",{value:!0}),t.iniedit=void 0;var o=n(8376),l=n(2324),a=n(6524);function d(){return c(this,void 0,void 0,(function(){var e,t,n,c;return i(this,(function(i){switch(i.label){case 0:return e=document.getElementById("client_iniselect"),t=document.getElementById("client_ininame"),n=o.client.charID,c=0===e.selectedIndex?t.value:e.value,[4,(0,l.handleCharacterInfo)(c.split("&"),n)];case 1:return i.sent(),a.packetHandler.get("PV")("PV#0#CID#".concat(n).split("#")),[2]}}))}))}t.iniedit=d,window.iniedit=d},3460:function(e,t,n){var c=n(8376);window.initCE=function(){c.client.sender.sendRT("testimony2")}},3380:function(e,t,n){var c=n(8376);window.initWT=function(){c.client.sender.sendRT("testimony1")}},6744:function(e,t,n){var c=n(6524);window.modcall_test=function(){c.packetHandler.get("ZZ")("test#test".split("#"))}},5224:function(e,t,n){var c=n(8376);window.musiclist_click=function(e){var t=document.getElementById("client_musiclist").value;c.client.sender.sendMusicChange(t);for(var n=document.getElementById("client_musiclist").selectedOptions,i=0;i<n.length;i++)n[i].selected=!1}},9076:function(e,t,n){var c=this&&this.__values||function(e){var t="function"==typeof Symbol&&Symbol.iterator,n=t&&e[t],c=0;if(n)return n.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&c>=e.length&&(e=void 0),{value:e&&e[c++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")};Object.defineProperty(t,"__esModule",{value:!0}),t.musiclist_filter=void 0;var i=n(8376);function o(e){var t,n,o=document.getElementById("client_musiclist"),l=document.getElementById("client_musicsearch").value;o.innerHTML="";try{for(var a=c(i.client.musics),d=a.next();!d.done;d=a.next()){var u=d.value;if(-1!==u.toLowerCase().indexOf(l.toLowerCase())){var r=document.createElement("OPTION");r.text=u,o.options.add(r)}}}catch(e){t={error:e}}finally{try{d&&!d.done&&(n=a.return)&&n.call(a)}finally{if(t)throw t.error}}}t.musiclist_filter=o,window.musiclist_filter=o},2832:function(e,t,n){var c=n(8376);window.mutelist_click=function(e){var t=document.getElementById("mute_select"),n=t.options[t.selectedIndex];!1===c.client.chars[n.value].muted?(c.client.chars[n.value].muted=!0,n.text="".concat(c.client.chars[n.value].name," (muted)"),console.info("muted ".concat(c.client.chars[n.value].name))):(c.client.chars[n.value].muted=!1,n.text=c.client.chars[n.value].name)}},9772:function(e,t,n){var c=n(8376);window.notguilty=function(){c.client.sender.sendRT("judgeruling#0")}},3905:function(e,t,n){var c=n(8376),i=n(5948);window.onEnter=function(e){if(13===e.keyCode){var t=c.client.character,n=c.client.emote,o=c.client.evidence,l=Boolean(document.getElementById("button_flip").classList.contains("dark")),a=Boolean(document.getElementById("button_flash").classList.contains("dark")),d=Boolean(document.getElementById("button_shake").classList.contains("dark")),u=Boolean(document.getElementById("check_nonint").checked),r=Boolean(document.getElementById("check_loopsfx").checked),s=Number(document.getElementById("textcolor").value),m=(0,i.escapeChat)(document.getElementById("ic_chat_name").value),f=document.getElementById("client_inputbox").value,v=document.getElementById("pair_select").value,y=Number(document.getElementById("pair_offset").value),h=Number(document.getElementById("pair_y_offset").value),w=document.getElementById("role_select").value?document.getElementById("role_select").value:t.side,_=Boolean(document.getElementById("check_additive").checked),p=document.getElementById("effect_select").value,g="0",E=0,b=n.zoom;document.getElementById("sendsfx").checked&&(g=n.sfx,E=n.sfxdelay),document.getElementById("sendpreanim").checked?0===b&&(b=1):1===b&&(b=0),c.client.sender.sendIC(n.deskmod,n.preanim,t.name,n.emote,f,w,g,b,E,c.selectedShout,o,l,a,s,m,v,y,h,u,r,d,"-","-","-",_,p)}return!1}},5704:function(e,t,n){var c=n(8376);window.onOOCEnter=function(e){13===e.keyCode&&(c.client.sender.sendOOC(document.getElementById("client_oocinputbox").value),document.getElementById("client_oocinputbox").value="")}},5576:function(e,t,n){var c=n(8376);window.pickChar=function(e){-1===e&&(document.getElementById("client_waiting").style.display="none",document.getElementById("client_charselect").style.display="none"),c.client.sender.sendCharacter(e)}},92:function(e,t,n){var c=n(8376),i=n(744),o=n(260),l=n(8268);window.pickEvidence=function(e){if(c.client.selectedEvidence!==e){c.client.selectedEvidence>0&&(document.getElementById("evi_".concat(c.client.selectedEvidence)).className="evi_icon"),document.getElementById("evi_".concat(e)).className="evi_icon dark",c.client.selectedEvidence=e,document.getElementById("evi_name").value=c.client.evidences[e-1].name,document.getElementById("evi_desc").value=c.client.evidences[e-1].desc;var t=(0,l.getIndexFromSelect)("evi_select",c.client.evidences[e-1].filename);document.getElementById("evi_select").selectedIndex=t,0===t&&(document.getElementById("evi_filename").value=c.client.evidences[e-1].filename),(0,o.updateEvidenceIcon)(),document.getElementById("evi_add").className="client_button hover_button inactive",document.getElementById("evi_edit").className="client_button hover_button",document.getElementById("evi_cancel").className="client_button hover_button",document.getElementById("evi_del").className="client_button hover_button"}else(0,i.cancelEvidence)()}},236:function(e,t,n){var c=n(8376);window.randomCharacterOOC=function(){c.client.sender.sendOOC("/randomchar")}},3320:function(e,t,n){var c=n(8376),i=(0,n(9260).default)().ip;window.ReconnectButton=function(){c.client.cleanup(),(0,c.setClient)(new c.default(i)),c.client&&(document.getElementById("client_error").style.display="none")}},2184:function(e,t,n){var c=n(8376);window.redHPD=function(){c.client.sender.sendHP(1,c.client.hp[0]-1)}},9051:function(e,t,n){var c=n(8376);window.redHPP=function(){c.client.sender.sendHP(2,c.client.hp[1]-1)}},2392:function(e,t){window.resetOffset=function(e){document.getElementById("pair_offset").value="0",document.getElementById("pair_y_offset").value="0"}},8324:function(e,t){var n=this&&this.__awaiter||function(e,t,n,c){return new(n||(n=Promise))((function(i,o){function l(e){try{d(c.next(e))}catch(e){o(e)}}function a(e){try{d(c.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(l,a)}d((c=c.apply(e,t||[])).next())}))},c=this&&this.__generator||function(e,t){var n,c,i,o,l={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function a(a){return function(d){return function(a){if(n)throw new TypeError("Generator is already executing.");for(;o&&(o=0,a[0]&&(l=0)),l;)try{if(n=1,c&&(i=2&a[0]?c.return:a[0]?c.throw||((i=c.return)&&i.call(c),0):c.next)&&!(i=i.call(c,a[1])).done)return i;switch(c=0,i&&(a=[2&a[0],i.value]),a[0]){case 0:case 1:i=a;break;case 4:return l.label++,{value:a[1],done:!1};case 5:l.label++,c=a[1],a=[0];continue;case 7:a=l.ops.pop(),l.trys.pop();continue;default:if(!((i=(i=l.trys).length>0&&i[i.length-1])||6!==a[0]&&2!==a[0])){l=0;continue}if(3===a[0]&&(!i||a[1]>i[0]&&a[1]<i[3])){l.label=a[1];break}if(6===a[0]&&l.label<i[1]){l.label=i[1],i=a;break}if(i&&l.label<i[2]){l.label=i[2],l.ops.push(a);break}i[2]&&l.ops.pop(),l.trys.pop();continue}a=t.call(e,l)}catch(e){a=[6,e],c=0}finally{n=i=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,d])}}};function i(){return n(this,void 0,void 0,(function(){var e,t;return c(this,(function(n){return e=document.getElementById("client_gamewindow"),t=document.getElementById("client_hdviewport_offset"),document.getElementById("client_hdviewport").checked?(e.style.paddingBottom="56.25%",t.disabled=!1):(e.style.paddingBottom="75%",t.disabled=!0),[2]}))}))}Object.defineProperty(t,"__esModule",{value:!0}),t.switchAspectRatio=void 0,t.switchAspectRatio=i,window.switchAspectRatio=i},6636:function(e,t){var n=this&&this.__awaiter||function(e,t,n,c){return new(n||(n=Promise))((function(i,o){function l(e){try{d(c.next(e))}catch(e){o(e)}}function a(e){try{d(c.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(l,a)}d((c=c.apply(e,t||[])).next())}))},c=this&&this.__generator||function(e,t){var n,c,i,o,l={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function a(a){return function(d){return function(a){if(n)throw new TypeError("Generator is already executing.");for(;o&&(o=0,a[0]&&(l=0)),l;)try{if(n=1,c&&(i=2&a[0]?c.return:a[0]?c.throw||((i=c.return)&&i.call(c),0):c.next)&&!(i=i.call(c,a[1])).done)return i;switch(c=0,i&&(a=[2&a[0],i.value]),a[0]){case 0:case 1:i=a;break;case 4:return l.label++,{value:a[1],done:!1};case 5:l.label++,c=a[1],a=[0];continue;case 7:a=l.ops.pop(),l.trys.pop();continue;default:if(!((i=(i=l.trys).length>0&&i[i.length-1])||6!==a[0]&&2!==a[0])){l=0;continue}if(3===a[0]&&(!i||a[1]>i[0]&&a[1]<i[3])){l.label=a[1];break}if(6===a[0]&&l.label<i[1]){l.label=i[1],i=a;break}if(i&&l.label<i[2]){l.label=i[2],l.ops.push(a);break}i[2]&&l.ops.pop(),l.trys.pop();continue}a=t.call(e,l)}catch(e){a=[6,e],c=0}finally{n=i=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,d])}}};function i(){return n(this,void 0,void 0,(function(){var e;return c(this,(function(t){return e=document.getElementById("client_chatcontainer"),document.getElementById("client_hdviewport_offset").checked?(e.style.width="80%",e.style.left="10%"):(e.style.width="100%",e.style.left="0"),[2]}))}))}Object.defineProperty(t,"__esModule",{value:!0}),t.switchChatOffset=void 0,t.switchChatOffset=i,window.switchChatOffset=i},4276:function(e,t){var n=this&&this.__awaiter||function(e,t,n,c){return new(n||(n=Promise))((function(i,o){function l(e){try{d(c.next(e))}catch(e){o(e)}}function a(e){try{d(c.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(l,a)}d((c=c.apply(e,t||[])).next())}))},c=this&&this.__generator||function(e,t){var n,c,i,o,l={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function a(a){return function(d){return function(a){if(n)throw new TypeError("Generator is already executing.");for(;o&&(o=0,a[0]&&(l=0)),l;)try{if(n=1,c&&(i=2&a[0]?c.return:a[0]?c.throw||((i=c.return)&&i.call(c),0):c.next)&&!(i=i.call(c,a[1])).done)return i;switch(c=0,i&&(a=[2&a[0],i.value]),a[0]){case 0:case 1:i=a;break;case 4:return l.label++,{value:a[1],done:!1};case 5:l.label++,c=a[1],a=[0];continue;case 7:a=l.ops.pop(),l.trys.pop();continue;default:if(!((i=(i=l.trys).length>0&&i[i.length-1])||6!==a[0]&&2!==a[0])){l=0;continue}if(3===a[0]&&(!i||a[1]>i[0]&&a[1]<i[3])){l.label=a[1];break}if(6===a[0]&&l.label<i[1]){l.label=i[1],i=a;break}if(i&&l.label<i[2]){l.label=i[2],l.ops.push(a);break}i[2]&&l.ops.pop(),l.trys.pop();continue}a=t.call(e,l)}catch(e){a=[6,e],c=0}finally{n=i=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,d])}}};function i(){return n(this,void 0,void 0,(function(){var e;return c(this,(function(t){return e=document.getElementById("client_fullview"),document.getElementById("client_pantilt").checked?e.style.transition="0.5s ease-in-out":e.style.transition="none",[2]}))}))}Object.defineProperty(t,"__esModule",{value:!0}),t.switchPanTilt=void 0,t.switchPanTilt=i,window.switchPanTilt=i},5404:function(e,t,n){var c=n(8376);window.toggleMenu=function(e){e!==c.selectedMenu&&(document.getElementById("menu_".concat(e)).className="menu_button active",document.getElementById("content_".concat(e)).className="menu_content active",document.getElementById("menu_".concat(c.selectedMenu)).className="menu_button",document.getElementById("content_".concat(c.selectedMenu)).className="menu_content",(0,c.setSelectedMenu)(e))}},7804:function(e,t,n){var c=n(8376);window.toggleShout=function(e){e===c.selectedShout?(document.getElementById("button_".concat(e)).className="client_button",(0,c.setSelectedShout)(0)):(document.getElementById("button_".concat(e)).className="client_button dark",c.selectedShout&&(document.getElementById("button_".concat(c.selectedShout)).className="client_button"),(0,c.setSelectedShout)(e))}},4588:function(e,t,n){var c=n(8376),i=n(4700);window.hcallback=function(e){(0,i.default)("hdid",c.client.hdid),c.client.sender.sendServer("2T#".concat(e,"#%")),location.reload()}},260:function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.updateEvidenceIcon=void 0;var c=n(332);function i(){var e=document.getElementById("evi_select"),t=document.getElementById("evi_filename"),n=document.getElementById("evi_preview");0===e.selectedIndex?(t.style.display="initial",n.src="".concat(c.AO_HOST,"evidence/").concat(encodeURI(t.value.toLowerCase()))):(t.style.display="none",n.src="".concat(c.AO_HOST,"evidence/").concat(encodeURI(e.value.toLowerCase())))}t.updateEvidenceIcon=i,window.updateEvidenceIcon=i},4536:function(e,t){window.updateIniswap=function(){var e=document.getElementById("client_iniselect"),t=document.getElementById("client_ininame");0===e.selectedIndex?t.style.display="initial":t.style.display="none"}},552:function(e,t){}},function(e){var t=function(t){return e(e.s=t)};t(6652),t(1608),t(84),t(6976),t(9688),t(744),t(7236),t(2572),t(3159),t(8460),t(2668),t(4236),t(4128),t(2388),t(2973),t(3424),t(3476),t(8268),t(9908),t(3056),t(6228),t(3460),t(3380),t(6744),t(5224),t(9076),t(2832),t(9772),t(3905),t(5704),t(7348),t(9736),t(5576),t(1944),t(92),t(236),t(3320),t(2184),t(9051),t(128),t(2392),t(7732),t(8900),t(8508),t(8324),t(6636),t(4276),t(1104),t(5556),t(5404),t(7804),t(4588),t(7328),t(924),t(260),t(4536),t(552)}]);
//# sourceMappingURL=dom.672d9ecfe0e31e2b9955.bundle.js.map