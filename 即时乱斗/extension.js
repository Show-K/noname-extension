game.import("extension",function(lib,game,ui,get,ai,_status){
	return {
		name:"即时乱斗",
		content:function(config,pack){},
		precontent:function(realtime){
			if(realtime.enable){
				/*
				var filePath,ok;
				var scripts=["pinyin_dict_notone","pinyin_dict_polyphone","pinyinUtil"];
				var onload=function(){
					this.remove();
				};
				var onerror=function(){
					console.error(this.src+"not found");
					this.remove();
				};
				for(var i=0;i<scripts.length;i++){
					ok=false;
					filePath=lib.assetURL+"/extension/即时乱斗/"+scripts[i]+".js";
					try {
						var script=document.createElement("script");
						script.addEventListener("load",onload);
						script.addEventListener("error",onerror);
						script.src=filePath;
						document.head.appendChild(script);
						ok=true;
					}
					finally {
						if(!ok) console.error("script error");
					}
				}
				*/
				if(!window.pinyin_dict_notone) require("./extension/即时乱斗/pinyin_dict_notone.js");
				if(!window.pinyin_dict_polyphone) require("./extension/即时乱斗/pinyin_dict_polyphone.js");
				if(!window.pinyinUtil) require("./extension/即时乱斗/pinyinUtil.js");
				lib.element.content.phaseLoop=function(){
					"step 0"
					game.delayx();
					"step 1"
					for(var i=0;i<lib.onphase.length;i++){
						lib.onphase[i]();
					}
					player.phase();
					"step 2"
					_status.phasePrevious=event.player;
					if(_status.phaseNext&&_status.phaseNext.isAlive()){
						event.player=_status.phaseNext;
						delete _status.phaseNext;
					}
					else{
						if(!game.players.contains(event.player.next)){
							event.player=game.findNext(event.player.next);
						}
						else{
							event.player=event.player.next;
						}
					}
					event.goto(1);
				};
				lib.element.content.phase=function(){
					"step 0"
					var str="<span data-nature=\"water\">第</span><span data-nature=\"wood\">"+get.cnNumber(game.roundNumber,true)+"</span><span data-nature=\"water\">轮</span><br>";
					str+="<span style=\"font-size:48px\">";
					str+="<span data-nature=\"water\">ROUND</span> <span data-nature=\"wood\">"+game.roundNumber+"</span><span data-nature=\"water\">!</span></span>";
					player.$fullscreenpop(str);
					game.delayx();
					"step 1"
					var str=event.skill?"<span data-nature=\"wood\">额外</span>":"<span data-nature=\"water\">第</span><span data-nature=\"wood\">"+get.cnNumber(game.phaseNumber,true)+"</span>";
					str+="<span data-nature=\"water\">回合</span> <span data-nature=\"fire\">开始</span><br>";
					str+="<span style=\"font-size:48px\">";
					str+=event.skill?"<span data-nature=\"wood\">EXTRA</span> <span data-nature=\"water\">TURN</span>":"<span data-nature=\"water\">TURN</span> <span data-nature=\"wood\">"+game.phaseNumber+"</span>";
					str+=" <span data-nature=\"fire\">STARTS</span><span data-nature=\"water\">!</span></span>";
					player.$fullscreenpop(str);
					game.delayx();
					"step 2"
					var str="<span data-nature=\"soil\">"+get.translation(player)+"</span> <span data-nature=\"thunder\">先手</span><br>";
					str+="<span style=\"font-size:48px\"><span data-nature=\"soil\">";
					if(lib.translateEnglish&&lib.translateEnglish[player.name]){
						str+=lib.translateEnglish[player.name].toUpperCase();
					}
					else{
						//str+=player.name.toUpperCase();
						str+=window.pinyinUtil.getPinyin(get.translation(player),"").toUpperCase();
					}
					str+="</span> <span data-nature=\"thunder\">FIRST!</span></span>";
					player.$fullscreenpop(str);
					game.delayx();
					"step 3"
					player.phaseZhunbei();
					"step 4"
					player.phaseJudge();
					"step 5"
					player.phaseDraw();
					if(!player.noPhaseDelay){
						if(player==game.me){
							game.delay();
						}
						else{
							game.delayx();
						}
					}
					"step 6"
					player.phaseUse();
					"step 7"
					game.broadcastAll(function(){
						if(ui.tempnowuxie){
							ui.tempnowuxie.close();
							delete ui.tempnowuxie;
						}
					});
					player.phaseDiscard();
					if(!player.noPhaseDelay) game.delayx();
					//delete player.using;
					delete player._noSkill;
					"step 8"
					player.phaseJieshu();
				};
				lib.element.content.phaseDraw=function(){
					"step 0"
					event.trigger("phaseDrawBegin1");
					"step 1"
					event.trigger("phaseDrawBegin2");
					"step 2"
					if(game.modPhaseDraw){
						game.modPhaseDraw(player,event.num);
					}
					else{
						if(event.num>0){
							var num=event.num;
							if(event.attachDraw){
								for(var i=0;i<event.attachDraw.length;i++){
									ui.cardPile.insertBefore(event.attachDraw[i],ui.cardPile.firstChild);
								}
								num+=event.attachDraw.length;
							}
							var next=player.draw(num,"nodelay");
							if(event.attachDraw){
								next.minnum=event.attachDraw.length;
							}
						}
					}
					"step 3"
					if(!event.cards) event.cards=[];
					if(Array.isArray(result)){
						event.cards=event.cards.addArray(result);
					}
					if(!game.players.contains(event.player.next)){
						event.player=game.findNext(event.player.next);
					}
					else{
						event.player=event.player.next;
					}
					if(event.player!=event.source){
						event.num=2;
						if((get.config("first_less")||_status.connectMode||_status.first_less_forced)&&game.phaseNumber==1&&_status.first_less){
							event.num--;
						}
						event.goto(0);
					}
				};
				lib.element.content.phaseUse=function(){
					"step 0"
					//if(event.playerPrevious) event.playerPrevious.line(player,{color:[255,255,68]});
					var next=player.chooseToUse();
					if(!lib.config.show_phaseuse_prompt){
						next.set("prompt",false);
					}
					next.set("type","phase");
					"step 1"
					if(!event.skipped){
						event.playerPrevious=player;
						if(result.bool){
							player.removeSkill("choose_to_use_skip");
							game.broadcastAll(function(player){
								delete player.chooseToUseFinish;
							},player);
						}
						else{
							if(!player.chooseToUseFinish){
								game.log(player,"跳过出牌");
								player.popup("跳过出牌");
								game.broadcastAll(function(player){
									player.chooseToUseFinish="skip";
								},player);
								player.addTempSkill("choose_to_use_skip","phaseUseAfter");
							}
							else if(player.chooseToUseFinish=="skip"){
								player.removeSkill("choose_to_use_skip");
								var evt=event.getParent("phase");
								if((evt&&!evt.skill)&&(!_status.phaseNext||!_status.phaseNext.isAlive())){
									_status.phaseNext=player;
									game.log(player,"首先结束出牌");
									player.popup("首先结束","thunder");
									player.addTempSkill("choose_to_use_finish_first","phaseUseAfter");
								}
								else{
									game.log(player,"结束出牌");
									player.popup("结束出牌");
								}
								game.broadcastAll(function(player){
									player.chooseToUseFinish="finish";
								},player);
								player.addTempSkill("choose_to_use_finish","phaseUseAfter");
							}
							game.delayx();
						}
					}
					game.broadcastAll(function(){
						if(ui.tempnowuxie){
							ui.tempnowuxie.close();
							delete ui.tempnowuxie;
						}
					});
					"step 2"
					if(!game.players.contains(event.player.next)){
						event.player=game.findNext(event.player.next);
					}
					else{
						event.player=event.player.next;
					}
					var goon=false;
					for(var i of game.players){
						if(i.chooseToUseFinish!="finish"){
							goon=true;
							break;
						}
					}
					if(goon){
						if(event.player.chooseToUseFinish=="finish"){
							event.redo();
						}
						else{
							event.goto(0);
						}
					}
					"step 3"
					var stat=player.getStat();
					for(var i in stat.skill){
						var bool=false;
						var info=lib.skill[i];
						if(!info) continue;
						if(info.enable!=undefined){
							if(typeof info.enable=="string"&&info.enable=="phaseUse") bool=true;
							else if(typeof info.enable=="object"&&info.enable.contains("phaseUse")) bool=true;
						}
						if(bool) stat.skill[i]=0;
					}
					for(var i in stat.card){
						var bool=false;
						var info=lib.card[i];
						if(!info) continue;
						if(info.updateUsable=="phaseUse") stat.card[i]=0;
					}
				};
				lib.element.content.phaseDiscard=function(){
					"step 0"
					event.num=player.needsToDiscard();
					if(event.num<=0) event.goto(2);
					else{
						if(lib.config.show_phase_prompt){
							player.popup("弃牌阶段");
						}
					}
					event.trigger("phaseDiscard");
					"step 1"
					player.chooseToDiscard(num,true).set("delay",false);
					"step 2"
					if(!event.cards) event.cards=[];
					if(result&&result.cards) event.cards=event.cards.addArray(result.cards);
					if(!game.players.contains(event.player.next)){
						event.player=game.findNext(event.player.next);
					}
					else{
						event.player=event.player.next;
					}
					if(event.player!=event.source){
						event.goto(0);
					}
				};
				lib.element.player.phase=function(skill){
					var next=game.createEvent("phase");
					next.player=this;
					next.current=next.player;
					next.setContent("phase");
					if(!_status.roundStart){
						_status.roundStart=this;
					}
					if(skill){
						next.skill=skill;
					}
					return next;
				};
				lib.element.player.phaseDraw=function(){
					var next=game.createEvent("phaseDraw");
					next.player=this;
					next.source=next.player;
					next.num=2;
					if((get.config("first_less")||_status.connectMode||_status.first_less_forced)&&game.phaseNumber==1&&_status.first_less){
						next.num--;
					}
					next.setContent("phaseDraw");
					return next;
				};
				lib.element.player.phaseUse=function(){
					var next=game.createEvent("phaseUse");
					next.player=this;
					//next.current=next.player;
					next.setContent("phaseUse");
					var next2=game.createEvent("phaseUseClear");
					_status.event.next.remove(next2);
					next.after.push(next2);
					next2.setContent(function(){
						game.broadcastAll(function(){
							for(var i of game.players){
								delete i.chooseToUseFinish;
							}
						});
					});
					return next;
				};
				lib.element.player.phaseDiscard=function(){
					var next=game.createEvent("phaseDiscard");
					next.player=this;
					next.source=next.player;
					next.setContent("phaseDiscard");
					return next;
				};
				lib.skill._turnover={
					trigger:{player:"phaseBefore"},
					forced:true,
					priority:100,
					popup:false,
					firstDo:true,
					content:function(){
						// for(var i=0;i<game.players.length;i++){
						// 	game.players[i].in();
						// }
						if(player.isTurnedOver()){
							trigger.cancel();
							player.turnOver();
							player.phaseSkipped=true;
						}
						else{
							player.phaseSkipped=false;
						}
						var players=game.players.slice(0)
						if(_status.roundStart) players.sortBySeat(_status.roundStart);
						var positionPlayer=players.indexOf(player);
						var positionPhasePrevious=players.indexOf(_status.phasePrevious);
						if(((!_status.phasePrevious)||(positionPlayer!=-1&&positionPhasePrevious!=-1&&positionPlayer<=positionPhasePrevious)||_status.roundSkipped)&&!trigger.skill){
						//if((player==_status.roundStart||_status.roundSkipped)&&!trigger.skill){
							delete _status.roundSkipped;
							game.roundNumber++;
							trigger._roundStart=true;
							game.updateRoundNumber();
							for(var i=0;i<game.players.length;i++){
								if(game.players[i].isOut()&&game.players[i].outCount>0){
									game.players[i].outCount--;
									if(game.players[i].outCount==0&&!game.players[i].outSkills){
										game.players[i].in();
									}
								}
							}
							event.trigger("roundStart");
						}
					},
				};
				lib.skill.choose_to_use_skip={
					mark:true,
					charlotte:true,
					superCharlotte:true,
					ruleSkill:true,
					intro:{
						name:"出牌跳过",
						content:"跳过了上一次出牌"
					}
				};
				lib.skill.choose_to_use_finish={
					mark:true,
					charlotte:true,
					superCharlotte:true,
					ruleSkill:true,
					intro:{
						name:"出牌结束",
						content:"本回合出牌结束"
					}
				};
				lib.skill.choose_to_use_finish_first={
					mark:true,
					charlotte:true,
					superCharlotte:true,
					ruleSkill:true,
					intro:{
						name:"首先出牌结束",
						content:"本回合首先出牌结束"
					}
				};
				lib.translate.choose_to_use_skip="跳过";
				lib.translate.choose_to_use_finish="结束";
				lib.translate.choose_to_use_finish_first="首先";
			}
		},
		config:{},
		help:{},
		package:{
			intro:"实验：（伪）即时回合制玩法",
			author:"Show-K",
			diskURL:"",
			forumURL:"",
			version:"1.2",
		},
		files:{}
	}
})