/************************************************************************************************************************
 * US Consent判定用（US地域のディレクトリかどうかと、Cookie同意状況確認）
 ************************************************************************************************************************/
window.ConsentUtil = window.ConsentUtil || (function () {

  var YOUTUBE_TARGET_DIRS = ['/en_US/', '/es_LA/', '/fr_CA/'];

  function getCookie(name) {
    var escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function getCurrentPathname() {
    return (typeof location !== 'undefined' && location.pathname) ? location.pathname : '';
  }

  function isInTargetDirectories(pathname, dirs) {
    pathname = pathname || '';
    dirs = dirs || [];
    for (var i = 0; i < dirs.length; i++) {
      if (pathname.indexOf(dirs[i]) !== -1) return true;
    }
    return false;
  }

  function isInYoutubeTargetDirectory(pathname) {
    return isInTargetDirectories(pathname || getCurrentPathname(), YOUTUBE_TARGET_DIRS);
  }

  function isOptedOut() {
    return !(
      getCookie('GA-OptOut') === 'false' &&
      getCookie('GTM-OptOut') === 'false'
    );
  }

  function shouldUseStandardIframe(opts) {
	opts = opts || {};
	var pathname = opts.pathname || getCurrentPathname();
	return isInYoutubeTargetDirectory(pathname) && isOptedOut();
  }

  return {
    YOUTUBE_TARGET_DIRS: YOUTUBE_TARGET_DIRS,
    getCookie: getCookie,
    getCurrentPathname: getCurrentPathname,
    isInTargetDirectories: isInTargetDirectories,
    isInYoutubeTargetDirectory: isInYoutubeTargetDirectory,
    isOptedOut: isOptedOut,
    shouldUseStandardIframe: shouldUseStandardIframe
  };

})();

/************************************************************************************************************************
 * 抽象メディアインターフェース
 ************************************************************************************************************************/

window.Media = (function() {

	var Media = function(src, option) {
		this.src = src;
		this.media = null;

		this.$volume = $('<p></p>').css({top:0});

		if (option.volume !== undefined) {
			this.defaultVolume = option.volume;
		} else {
			this.defaultVolume = 100;
		}
	};

	Media.extends = function(subConstructor) {
		if (typeof Object.create !== 'function') {
			Object.create = function(o) {
				var F = function(){};
				F.prototype = o;
				return new F();
			};
		}
		subConstructor.prototype = Object.create(Media.prototype);
		subConstructor.prototype.constructor = subConstructor;
		subConstructor.prototype.__super__ = Media.prototype;
		subConstructor.prototype.__super__.constructor = Media;
		subConstructor.prototype['super'] = function(){
			this.__super__.constructor.apply(this, arguments);
		};
		return subConstructor;
	};

	Media.prototype.load = function(onprogress) {
		var def = new jQuery.Deferred();
		var xhr = new XMLHttpRequest();
		var self = this;

		xhr.onload = function(e) {
			if (self.media) {
				self.media.src = self.src;
			}
			def.resolve();
		};

		xhr.onerror = function() {
			def.resolve();
		};

		xhr.onprogress = onprogress;

		xhr.open('GET', this.src);
		xhr.send();

		return def.promise();
	};


	Media.prototype.play = function() {
		if (this.media) {
			this.media.play();
		}
	};

	Media.prototype.pause = function() {
		if (this.media) {
			this.media.pause();
		}
	};

	Media.prototype.seek = function(sec) {
		if (this.media) {
			if (sec === undefined) sec = 0;
			this.media.currentTime = sec;
		}
	};

	Media.prototype.mute = function() {
		if (this.media) {
			this.media.muted = true;
		}
	};

	Media.prototype.unmute = function() {
		if (this.media) {
			this.media.muted = false;
		}
	};

	Media.prototype.setVolume = function(val) {
		if (this.media) {
			this.media.volume = val / 100;
		}
	};

	// 音量をフェードさせながら再生開始
	Media.prototype.fadeStart = function(duration) {
		this.media.volume = 0;
		this.media.play();

		var media = this.media;

		var step = function(v) {
			media.volume = v / 100;
		};

		this.$volume.stop().css({top:0}).animate({top:this.defaultVolume}, {duration:duration, easing:'linear', step:step});
	};

	// 音量をフェードさせながら再生停止
	Media.prototype.fadePause = function(duration) {
		var media = this.media;

		var step = function(v) {
			media.volume = v / 100;
		};

		var complete = function() {
			media.pause();
		};

		this.$volume.stop().animate({top:0}, {duration:duration, easing:'linear', step:step, complete:complete});
	};

	// 音量をフェードさせながらミュート
	Media.prototype.fadeMute = function(duration) {
		var media = this.media;

		var step = function(v) {
			media.volume = v / 100;
		};
		var complete = function() {
			media.muted = true;
		};

		this.$volume.stop().animate({top:0}, {duration:duration, easing:'linear', step:step, complete:complete});
	};

	// 音量をフェードさせながらミュート解除
	Media.prototype.fadeUnmute = function(duration) {
		this.media.muted = false;

		var media = this.media;

		var step = function(v) {
			media.volume = v / 100;
		};
		this.$volume.stop().css({top:0}).animate({top:this.defaultVolume}, {duration:duration, easing:'linear', step:step});
	};

	Media.prototype.onEnded = function(callback) {
		this.media.addEventListener('ended', callback, false);
	};

	Media.prototype.onPause = function(callback) {
		this.media.addEventListener('pause', callback, false);
	};

	Media.prototype.onTimeupdate = function(callback) {
		this.media.addEventListener('timeupdate', function(e) {
			callback({
				currentTime : e.target.currentTime * 1000,
				duration    : e.target.duration    * 1000
			});
		}, false);
	};

	Media.prototype.beforeEnd = function(msec, callback) {
		var fired = false;

		this.onTimeupdate(function(param) {
			if (param.currentTime > param.duration - msec) {
				if (!fired) {
					fired = true;
					callback();
				}
			} else {
				fired = false;
			}
		});
	};


	return Media;

})();


/************************************************************************************************************************
 * ローディング管理
 ************************************************************************************************************************/

window.Loader = (function() {

	var Loader = function() {
		this.loadables = [];
	};

	Loader.prototype.addMedia = function(media) {
		this.loadables.push(media);
	};

	Loader.prototype.start = function(progress) {
		var total = [];
		var loaded = [];
		var promises = [];
		var length = this.loadables.length;

		this.loadables.forEach(function(media, i) {

			promises.push(media.load(function(e) {
				total[i] = e.total;
				loaded[i] = e.loaded;

				if (total.length === length) {
					var t = 0;
					var l = 0;
					for (var j=0; j<total.length; j++) t += total[j];
					for (var j=0; j<loaded.length; j++) l += loaded[j];

					// 進捗コールバック
					if (progress) progress(l/t);
				}
			}));

		}, this);

		return jQuery.when.apply(this, promises);
	};

	return Loader;
})();



/************************************************************************************************************************
 * 音量管理
 ************************************************************************************************************************/

window.MediaManager = (function() {

	var MediaManager = function() {

		//this.off = Polaris.cookie.read('bgm-off', false);
		this.off = true;

		this.media = [];

		this.track = 0;
		this.currentTrack = this.track;
		this.selectedTrack = this.track;

		if (Shared.ua.tablet || Shared.ua.mobile ) {
			this.off = true;
		}


	};


	MediaManager.prototype.addMedia = function(media) {
		this.media.push(media);
		this.update();
	};


	MediaManager.prototype.mute = function() {
		for (var i=0; i<this.media.length; i++) {
			if (this.media[i] instanceof Sound) {
				//this.media[i].mute();
				this.media[i].fadeMute(500);
			} else{
				this.media[i].mute();
			}
		}

	};

	MediaManager.prototype.bgmMute = function() {
		for (var i=0; i<this.media.length; i++) {
			if (this.media[i] instanceof Sound) {
				//this.media[i].mute();
				this.media[i].fadeMute(500);
			}
		}
	};

	MediaManager.prototype.unmute = function() {
		for (var i=0; i<this.media.length; i++) {
			if (this.media[i] instanceof Sound) {
				//this.media[i].unmute();
				this.media[i].fadeUnmute(1000);
			}else{
				this.media[i].unmute();
			}
		}
	};

	MediaManager.prototype.bgmUnmute = function() {
		for (var i=0; i<this.media.length; i++) {
			if (this.media[i] instanceof Sound) {
				//this.media[i].unmute();
				this.media[i].fadeUnmute(1000);
			}
		}
	};

	MediaManager.prototype.start = function() {
		this.off = true;
		this.update(true);
	};

	MediaManager.prototype.update = function(click) {

		//Polaris.cookie.write('bgm-off', this.off, {path:'/nintendolabo/'});

		if (this.off) {
			this.mute();
		} else {

			if(this.currentTrack === this.selectedTrack){
				this.unmute();
				// 音声再生開始
				if (click) {
					for (var i=0; i<this.media.length; i++) {
						if (this.media[i] instanceof Sound) {
							if(i===this.currentTrack){
								this.media[i].play();
							}
						}
					}
				}
			}else{
				this.mute();
				var _this = this;

				setTimeout(function() {
					if (click) {
						_this.media[_this.currentTrack].pause();
						_this.media[_this.currentTrack].seek(0);
						_this.media[_this.selectedTrack].play();
						_this.currentTrack = _this.selectedTrack;
						_this.unmute();
					}
				}, 500);
			}

		}
	};


	return MediaManager;
})();


/************************************************************************************************************************
 * 動画再生
 ************************************************************************************************************************/

window.Movie = (function() {

	var Movie = Media.extends(function(src, option) {

		var self = this;

		this.super(src, option);

		this.media = document.createElement('video');

		this.container = $(option.container);

		this.container.append(this.media);

		this.el = $(this.media);

		this.media.loop = !!option.loop;

		if (option.controls) {
			this.media.setAttribute('controls', 'controls');
		}

		if (option.volume !== undefined) {
			self.setVolume(option.volume);
		}

	});

	Movie.prototype.skipLoad = function() {
		this.media.src = this.src;
	};

	return Movie;
})();



/************************************************************************************************************************
 * 音声再生
 ************************************************************************************************************************/

window.Sound = (function() {

	var Sound = Media.extends(function(src, option) {

		this.super(src, option);

		this.media = new Audio();

		this.ended = false;

		this.media.loop = !!option.loop;

		if (Shared.ua.ios) {
			this.muted = false;
		}

		this.media.addEventListener('ended', (function(_this) {
			return function () {
				_this.ended = true;
			}
		})(this));
	});

	// iOSのバグ対策
	Sound.prototype.mute = function() {
		if (Shared.ua.ios) {
			this.media.pause();
			this.muted = true;
		} else {
			this.media.muted = true;
		}
	};

	// iOSのバグ対策
	Sound.prototype.unmute = function() {
		if (Shared.ua.ios) {
			this.media.play();
			this.muted = false;
		} else {
			this.media.muted = false;
		}
	};

	Sound.prototype.resume = function() {
		if (!this.ended) {
			if (Shared.ua.ios) {
				if (!this.muted) {
					this.media.play();
				}
			} else {
				this.media.play();
			}
		}
	};

	return Sound;

})();




/************************************************************************************************************************
 * Youtube再生
 * Consent判定がtrueの場合は iframe_api を読み込まず、標準 iframe で再生
 ************************************************************************************************************************/

window.Youtube = (function() {

	var Youtube = function(options) {
		options = options || {};

		this.useStandardIframe = (
			window.ConsentUtil &&
			typeof window.ConsentUtil.shouldUseStandardIframe === 'function'
		) ? window.ConsentUtil.shouldUseStandardIframe(options) : false;

		var def = new jQuery.Deferred();

		if (this.useStandardIframe) {
			def.resolve();
			this.ready = def.promise();
			return;
		}

		var prevReady = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = function() {
			if (typeof prevReady === 'function') {
				try { prevReady(); } catch (e) {}
			}
			def.resolve();
		};

		if (!window.YT || !window.YT.Player) {
			jQuery.ajax({ dataType: 'script', url: 'https://www.youtube.com/iframe_api', cache: true });
		} else {
			def.resolve();
		}

		this.ready = def.promise();
	};

	Youtube.prototype.create = function(id, option) {
		option = option || {};

		if (!option.host) {
			option.host = 'https://www.youtube-nocookie.com';
		}

		if (this.useStandardIframe) {
			return new StandardYoutubePlayer(id, option, this.ready);
		}

		return new YoutubePlayer(id, option, this.ready);
	};

	return Youtube;

})();

var StandardYoutubePlayer = (function() {

	var Player = Media.extends(function(src, option, apiReady) {
		var def = new jQuery.Deferred();
		var self = this;

		this.super(src, option);

		this.container = $(option.container);
		this.container.append('<div class="ytvideo"></div>');
		this.el = this.container.children('.ytvideo').last();

		this.ready = def.promise();
		this.pauseListeners = [];
		this.endListeners = [];
		this.updateListeners = [];
		this.currentId = src || '';
		this.currentTime = 0;

		this.media = document.createElement('iframe');
		this.media.setAttribute('frameborder', '0');
		this.media.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
		this.media.setAttribute('allowfullscreen', 'allowfullscreen');

		if (option.width) this.media.width = option.width;
		if (option.height) this.media.height = option.height;

		this.el.append(this.media);

		apiReady.then(function() {
			if (self.currentId) {
				self._render(self.currentId, false, 0);
			}
			def.resolve();
		});
	});

	Player.prototype._buildSrc = function(videoId, autoplay, startSeconds) {
		var params = {
			autoplay: autoplay ? 1 : 0,
			rel: 0,
			controls: 1,
			//controls: this.option && this.option.controls ? 1 : 0,
			playsinline: this.option && this.option.playsinline ? 1 : 0
		};

		if (startSeconds) {
			params.start = startSeconds;
		}

		var query = [];
		for (var key in params) {
			if (params.hasOwnProperty(key)) {
				query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
			}
		}

		return 'https://www.youtube-nocookie.com/embed/' + videoId + '?' + query.join('&');
	};

	Player.prototype._render = function(videoId, autoplay, startSeconds) {
		if (!videoId) return;
		this.currentId = videoId;
		this.currentTime = startSeconds || 0;
		this.media.src = this._buildSrc(videoId, autoplay, startSeconds);
	};

	Player.prototype.load = function(onprogress) {
		var def = new jQuery.Deferred();
		if (onprogress) {
			onprogress({ total: 10000, loaded: 10000 });
		}
		this.ready.then(function() {
			def.resolve();
		});
		return def.promise();
	};

	Player.prototype.skipLoad = function() {};

	Player.prototype.seek = function(sec) {
		if (sec === undefined) sec = 0;
		var self = this;
		this.ready.then(function() {
			if (self.currentId) {
				self._render(self.currentId, false, sec);
			}
		});
	};

	Player.prototype.play = function() {
		var self = this;
		this.ready.then(function() {
			if (self.currentId) {
				self._render(self.currentId, true, self.currentTime);
			}
		});
	};

	Player.prototype.pause = function() {
		var self = this;
		this.ready.then(function() {
			if (self.currentId) {
				self._render(self.currentId, false, self.currentTime);
			}
			self.pauseListeners.forEach(function(callback) {
				callback();
			});
		});
	};

	Player.prototype.fadeStart = function() {
		this.play();
	};

	Player.prototype.fadePause = function() {
		this.pause();
	};

	Player.prototype.mute = function() {};
	Player.prototype.unmute = function() {};
	Player.prototype.setVolume = function() {};
	Player.prototype.fadeMute = function() {};
	Player.prototype.fadeUnmute = function() {};

	Player.prototype.onEnded = function(callback) {
		this.endListeners.push(callback);
	};

	Player.prototype.onPause = function(callback) {
		this.pauseListeners.push(callback);
	};

	Player.prototype.onTimeupdate = function(callback) {
		this.updateListeners.push(callback);
	};

	Player.prototype.loadVideoById = function(vid) {
		var self = this;
		this.ready.then(function() {
			self._render(vid, false, 0);
		});
	};

	return Player;
})();

var YoutubePlayer = (function() {

	var Player = Media.extends(function(src, option, apiReady) {

		var uid = Shared.util.uniqueString(10);
		var def = new jQuery.Deferred();
		var self = this;

		this.super(src, option);
		this.option = option;
		this.container = $(option.container);
		this.container.append('<div class="ytvideo"><div id="'+uid+'"></div></div>');
		this.el = $('#'+uid).parent();
		this.ready = def.promise();

		this.state = -1;
		this.endListeners = [];
		this.updateListeners = [];
		this.pauseListeners = [];

		apiReady.then(function() {
			self.media = new YT.Player(uid, {
				host : option.host,
				videoId : src,
				width : option.width,
				height : option.height,
				playerVars : {
					showinfo : option.showinfo ? 1 : 0,
					controls : option.controls ? 1 : 0,
					loop     : option.loop ? 1 : 0,
					rel      : 0,
					playsinline: option.playsinline ? 1 : 0,
					vq       : option.vq ? option.vq : 'hd720',
					wmode    : 'transparent'
				},
				events : {
					onReady : function() {
						self.media.setPlaybackQuality(option.vq ? option.vq : 'hd720');
						def.resolve();
					},
					onStateChange : function(e) {
						self.state = e.data;

						if (e.data === 0 && option.loop) {
							self.media.playVideo();
						}

						if (e.data === 0) {
							self.endListeners.forEach(function(callback) {
								callback();
							});
						}
						if (e.data === 2) {
							self.pauseListeners.forEach(function(callback) {
								callback();
							});
						}
						if (e.data === 1) {
							if (!option.controls) {
								self.media.setPlaybackQuality(option.vq ? option.vq : 'hd720');
							}
						}
					}
				}
			});

			if (option.volume !== undefined) {
				self.setVolume(option.volume);
			}

			setInterval(function() {
				if (self.state === 1) {
					self.updateListeners.forEach(function(callback) {
						callback({
							currentTime : self.media.getCurrentTime() * 1000,
							duration    : self.media.getDuration()    * 1000
						});
					});
				}
			}, 200);
		});
	});

	Player.prototype.load = function(onprogress) {
		var def = new jQuery.Deferred();
		var self = this;

		if (onprogress) {
			var index = 0;
			var timer = setInterval(function() {
				onprogress({total:10000, loaded:(++index)*1000});
				if (index === 10) {
					self.ready.then(function() {
						def.resolve();
					});
					clearInterval(timer);
				}
			}, 300);
		} else {
			self.ready.then(function() {
				def.resolve();
			});
		}
		return def.promise();
	};

	Player.prototype.skipLoad = function() {};

	Player.prototype.seek = function(sec) {
		if (sec === undefined) sec = 0;
		this.ready.then((function(_this) {
			return function() {
				_this.media.seekTo(sec);
			};
		})(this));
	};

	Player.prototype.play = function() {
		var self = this;
		this.ready.then(function() {
			self.media.playVideo();
		});
	};

	Player.prototype.pause = function() {
		var self = this;
		this.ready.then(function() {
			self.media.pauseVideo();
		});
	};

	Player.prototype.fadeStart = function(duration) {
		var self = this;
		this.ready.then(function() {
			self.media.playVideo();
			self.media.setVolume(0);
			var step = function(v) {
				self.media.setVolume(v);
			};
			self.$volume.stop().css({top:0}).animate({top:self.defaultVolume}, {duration:duration, easing:'linear', step:step});
		});
	};

	Player.prototype.fadePause = function(duration) {
		var self = this;
		this.ready.then(function() {
			var step = function(v) {
				self.media.setVolume(v);
			};
			var complete = function() {
				self.media.pauseVideo();
			};
			self.$volume.stop().animate({top:0}, {duration:duration, easing:'linear', step:step, complete:complete});
		});
	};

	Player.prototype.mute = function() {
		var self = this;
		this.ready.then(function() {
			self.media.mute();
		});
	};

	Player.prototype.unmute = function() {
		var self = this;
		this.ready.then(function() {
			self.media.unMute();
		});
	};

	Player.prototype.setVolume = function(val) {
		var self = this;
		this.ready.then(function() {
			self.media.setVolume(val);
		});
	};

	Player.prototype.fadeMute = function() {
		this.mute();
	};

	Player.prototype.fadeUnmute = function() {
		this.unmute();
	};

	Player.prototype.onEnded = function(callback) {
		this.endListeners.push(callback);
	};

	Player.prototype.onPause = function(callback) {
		this.pauseListeners.push(callback);
	};

	Player.prototype.onTimeupdate = function(callback) {
		this.updateListeners.push(callback);
	};

	Player.prototype.loadVideoById = function(vid) {
		var self = this;
		this.ready.then(function() {
			self.media.loadVideoById(vid);
		});
	};

	return Player;
})();
