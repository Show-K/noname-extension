game.import("extension",function(lib,game,ui,get,ai,_status){
	return {
		name:"即时乱斗",
		content:function(config,pack){},
		precontent:function(realtime){
			if(realtime.enable){
				lib.element.content.phaseLoop=function(){
					"step 0"
					game.delayx();
					"step 1"
					for(var i=0;i<lib.onphase.length;i++){
						lib.onphase[i]();
					}
					game.me.$fullscreenpop("<span style=\"font-family:fzhtk\"><span data-nature=\"water\">第</span> <span data-nature=\"wood\">"+get.cnNumber(game.phaseNumber+1,true)+"</span> <span data-nature=\"water\">回合</span> <span data-nature=\"fire\">开始</span> <span data-nature=\"water\">第</span> <span data-nature=\"wood\">"+get.cnNumber(game.roundNumber+1,true)+"</span> <span data-nature=\"water\">轮</span><br><span data-nature=\"soil\">"+get.translation(player)+"</span> <span data-nature=\"thunder\">先手</span></span>",null,null,false);
					player.phase();
					game.delayx();
					"step 2"
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
				/*
				lib.element.content.phase=function(){
					"step 0"
					player.phaseZhunbei();
					"step 1"
					player.phaseJudge();
					"step 2"
					player.phaseDraw();
					if(!player.noPhaseDelay){
						if(player==game.me){
							game.delay();
						}
						else{
							game.delayx();
						}
					}
					"step 3"
					player.phaseUse();
					"step 4"
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
					"step 5"
					player.phaseJieshu();
				};
				*/
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
						event.goto(0);
					}
				};
				lib.element.content.phaseUse=function(){
					"step 0"
					player.popup("开始出牌");
					var next=player.chooseToUse();
					if(!lib.config.show_phaseuse_prompt){
						next.set("prompt",false);
					}
					next.set("type","phase");
					"step 1"
					if(!event.skipped){
						if(result.bool){
							player.removeSkill("sst_choose_to_use_skip");
						}
						else{
							if(!player.hasSkill("sst_choose_to_use_skip")){
								game.log(player,"跳过出牌");
								player.popup("跳过出牌");
								player.addTempSkill("sst_choose_to_use_skip","phaseUseAfter");
							}
							else{
								player.removeSkill("sst_choose_to_use_skip");
								if(!_status.phaseNext||!_status.phaseNext.isAlive()){
									_status.phaseNext=player;
									game.log(player,"首先结束出牌");
									player.popup("首先结束","thunder");
									player.addTempSkill("sst_choose_to_use_finish_first","phaseUseAfter");
								}
								else{
									game.log(player,"结束出牌");
									player.popup("结束出牌");
								}
								player.addTempSkill("sst_choose_to_use_finish","phaseUseAfter");
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
						if(!i.hasSkill("sst_choose_to_use_finish")){
							goon=true;
							break;
						}
					}
					if(goon){
						if(event.player.hasSkill("sst_choose_to_use_finish")){
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
					if(event.num<=0) event.finish();
					else{
						if(lib.config.show_phase_prompt){
							player.popup('弃牌阶段');
						}
					}
					event.trigger('phaseDiscard');
					"step 1"
					player.chooseToDiscard(num,true).set("delay",false);
					"step 2"
					if(!event.cards) event.cards=[];
					event.cards=event.cards.addArray(result.cards);
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
					var next=game.createEvent('phaseDraw');
					next.player=this;
					next.source=next.player;
					next.num=2;
					if((get.config('first_less')||_status.connectMode||_status.first_less_forced)&&game.phaseNumber==1&&_status.first_less){
						next.num--;
					}
					next.setContent('phaseDraw');
					return next;
				};
				lib.element.player.phaseUse=function(){
					var next=game.createEvent("phaseUse");
					next.player=this;
					//next.current=next.player;
					next.setContent("phaseUse");
					return next;
				};
				lib.element.player.phaseDiscard=function(){
					var next=game.createEvent('phaseDiscard');
					next.player=this;
					next.source=next.player;
					next.setContent('phaseDiscard');
					return next;
				};
				lib.skill.sst_choose_to_use_skip={
					mark:true,
					charlotte:true,
					superCharlotte:true,
					ruleSkill:true,
					intro:{
						name:"出牌跳过",
						content:"跳过了上一次出牌"
					}
				};
				lib.skill.sst_choose_to_use_finish={
					mark:true,
					charlotte:true,
					superCharlotte:true,
					ruleSkill:true,
					intro:{
						name:"出牌结束",
						content:"本回合出牌结束"
					}
				};
				lib.skill.sst_choose_to_use_finish_first={
					mark:true,
					charlotte:true,
					superCharlotte:true,
					ruleSkill:true,
					intro:{
						name:"首先出牌结束",
						content:"本回合首先出牌结束"
					}
				};
				lib.translate.sst_choose_to_use_skip="跳过";
				lib.translate.sst_choose_to_use_finish="结束";
				lib.translate.sst_choose_to_use_finish_first="<span class=\"thundertext\">首先</span>";
			}
		},
		config:{},
		help:{},
		package:{
			intro:"实验：即时回合制玩法",
			author:"Show-K",
			diskURL:"",
			forumURL:"",
			version:"1.0",
		},
		files:{}
	}
})