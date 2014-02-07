(function() {
  var $, Timer, Vapor, VaporAnimation, jQueryPlugin, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = jQuery;

  jQueryPlugin = (function() {
    jQueryPlugin.prototype.name = 'plugin-name';

    jQueryPlugin.prototype.default_method = 'start';

    jQueryPlugin.prototype.defaults = {};

    function jQueryPlugin(target, options) {
      var obj;
      this.$target = $(target);
      this.options = this.defaults;
      obj = this.$target.data(this.name);
      if (!obj) {
        this.$target.data(this.name, obj = this);
      }
      obj._called(options);
    }

    jQueryPlugin.prototype._called = function(options) {
      var method;
      if (options == null) {
        options = {};
      }
      method = this.default_method;
      if (typeof options === 'string') {
        method = options;
      } else {
        this.options = $.extend({}, this.options, options);
      }
      return this[method]();
    };

    return jQueryPlugin;

  })();

  VaporAnimation = (function(_super) {
    __extends(VaporAnimation, _super);

    function VaporAnimation() {
      this.updateVapors = __bind(this.updateVapors, this);
      this.drawFrame = __bind(this.drawFrame, this);
      this.startAnimation = __bind(this.startAnimation, this);
      this.imageLoaded = __bind(this.imageLoaded, this);
      this.start = __bind(this.start, this);
      _ref = VaporAnimation.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    VaporAnimation.prototype.name = 'vapors';

    VaporAnimation.prototype.defaults = {
      count_multiplier: 1,
      min_speed: 60,
      max_speed: 120,
      src: false
    };

    VaporAnimation.prototype._vapors = [];

    VaporAnimation.prototype.defaultCount = function() {
      return this.options.count || Math.floor(this.viewSize() / (this.options.image.width * this.options.image.height) * this.options.count_multiplier);
    };

    VaporAnimation.prototype.viewSize = function() {
      return this.leastOf(this.boxSize($(window)), this.boxSize(this.$target));
    };

    VaporAnimation.prototype.boxSize = function($box) {
      return $box.outerWidth() * $box.outerHeight();
    };

    VaporAnimation.prototype.leastOf = function(first, second) {
      if (first < second) {
        return first;
      } else {
        return second;
      }
    };

    VaporAnimation.prototype.start = function() {
      this.ready = false;
      this.$canvas = $("<canvas>").css({
        position: 'absolute',
        top: 0,
        left: 0,
        'z-index': 0
      });
      this.$target.append(this.$canvas);
      this.canvas = this.$canvas[0];
      this.context = this.canvas.getContext("2d");
      this.options.image = new Image();
      this.options.image.onload = this.startAnimation;
      this.loadImage();
      return this.timer = new Timer();
    };

    VaporAnimation.prototype.loadImage = function() {
      this.req = new XMLHttpRequest();
      this.req.open('GET', this.options.src, true);
      this.req.responseType = 'blob';
      this.req.onload = this.imageLoaded;
      this.req.onerror = this.error;
      return this.req.send();
    };

    VaporAnimation.prototype.imageLoaded = function() {
      return this.options.image.src = window.URL.createObjectURL(this.req.response);
    };

    VaporAnimation.prototype.startAnimation = function() {
      window.URL.revokeObjectURL(this.options.image.src);
      this.scene_buff = document.createElement('canvas');
      this.scene_buff_ctx = this.scene_buff.getContext('2d');
      this.options.scene_buff_ctx = this.scene_buff_ctx;
      this.buff = document.createElement('canvas');
      this.buff.width = this.options.image.width;
      this.buff.height = this.options.image.height;
      this.buff.getContext('2d').drawImage(this.options.image, 0, 0);
      this.options.buff = this.buff;
      this.options.context = this.context;
      this.updateVapors();
      $(window).on('resize', this.updateVapors);
      return window.requestAnimationFrame(this.drawFrame);
    };

    VaporAnimation.prototype.drawFrame = function(timestep) {
      var vapor, _i, _len, _ref1;
      window.requestAnimationFrame(this.drawFrame);
      this.scene_buff_ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.scene_buff_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      _ref1 = this._vapors;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        vapor = _ref1[_i];
        vapor.draw(timestep);
      }
      this.context.drawImage(this.scene_buff, 0, 0);
      return this.timer.tick(timestep);
    };

    VaporAnimation.prototype.updateVapors = function() {
      var i, newvapes, start, _i, _j, _ref1;
      this.canvas.width = this.$target.outerWidth();
      this.canvas.height = this.$target.outerHeight();
      this.scene_buff.width = this.$target.outerWidth();
      this.scene_buff.height = this.$target.outerHeight();
      newvapes = this.defaultCount() - this._vapors.length;
      if (newvapes > 0) {
        for (i = _i = 0; 0 <= newvapes ? _i < newvapes : _i > newvapes; i = 0 <= newvapes ? ++_i : --_i) {
          this._vapors.push(new Vapor(this.canvas, this.options));
        }
      }
      if (newvapes < 0) {
        start = this._vapors.length + newvapes;
        for (i = _j = start, _ref1 = this._vapors.length; start <= _ref1 ? _j < _ref1 : _j > _ref1; i = start <= _ref1 ? ++_j : --_j) {
          this._vapors[i].destroy();
        }
        return this._vapors = this._vapors.slice(0, start);
      }
    };

    VaporAnimation.prototype.stop = function() {
      var v, _i, _len, _ref1;
      _ref1 = this._vapors;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        v.destroy();
      }
      return this._vapors = [];
    };

    return VaporAnimation;

  })(jQueryPlugin);

  Vapor = (function() {
    function Vapor(canvas, options) {
      this.options = options;
      this.canvas = canvas;
      this.context = options.context;
    }

    Vapor.prototype.reset = function(t) {
      this.starttime = t;
      this.angle = Math.floor(Math.random() * 360);
      this.rotation_speed = Math.random();
      this.start_scale = Math.random() + 1;
      this.xpos = this.startLeft();
      this.starty = this.startTop();
      return this.speed = this.randomPPS();
    };

    Vapor.prototype.delta = function(t) {
      return t - this.starttime;
    };

    Vapor.prototype.ypos = function(t) {
      return this.starty - this.speed * this.delta(t) / 700;
    };

    Vapor.prototype.rotation_angle = function(t) {
      return this.angle + this.rotation_speed * this.delta(t) / 50;
    };

    Vapor.prototype.rotation_rads = function(t) {
      return this.rotation_angle(t) * Math.PI / 180;
    };

    Vapor.prototype.rotation_sin = function(t) {
      return Math.sin(this.rotation_rads(t));
    };

    Vapor.prototype.rotation_cos = function(t) {
      return Math.cos(this.rotation_rads(t));
    };

    Vapor.prototype.scale = function(t) {
      return this.start_scale + this.delta(t) / 10000;
    };

    Vapor.prototype.randomPPS = function() {
      return Math.floor(Math.random() * (this.options.max_speed - this.options.min_speed) + this.options.min_speed);
    };

    Vapor.prototype.startTop = function(t) {
      return this.canvas.height + this.height(t);
    };

    Vapor.prototype.endTop = function(t) {
      return 0 - this.height(t);
    };

    Vapor.prototype.maxLeft = function() {
      return this.canvas.width;
    };

    Vapor.prototype.startLeft = function() {
      return Math.floor(this.maxLeft() * Math.random());
    };

    Vapor.prototype.width = function(t) {
      return this.options.image.width * this.scale(t);
    };

    Vapor.prototype.height = function(t) {
      return this.options.image.height * this.scale(t);
    };

    Vapor.prototype.draw = function(t) {
      if (this.ypos(t) < this.endTop(t) || !this.starttime) {
        this.reset(t);
      }
      this.options.scene_buff_ctx.setTransform(this.rotation_cos(t), this.rotation_sin(t), -this.rotation_sin(t), this.rotation_cos(t), this.xpos, this.ypos(t));
      return this.options.scene_buff_ctx.drawImage(this.options.buff, -this.width(t) / 2, -this.height(t) / 2, this.width(t), this.height(t));
    };

    Vapor.prototype.destroy = function() {};

    return Vapor;

  })();

  Timer = (function() {
    function Timer() {
      this.start_time = false;
      this.frame_count = 0;
    }

    Timer.prototype.tick = function(t) {
      this.start_time || (this.start_time = t);
      this.frame_count++;
      if (t - this.start_time > 1000) {
        this.frame_rate(t);
        this.start_time = t;
        return this.frame_count = 0;
      }
    };

    Timer.prototype.frame_rate = function(t) {
      var elapsed, rate;
      elapsed = (t - this.start_time) / 1000;
      return rate = this.frame_count / elapsed;
    };

    return Timer;

  })();

  $.fn.vapors = function(options) {
    return this.each(function() {
      return new VaporAnimation(this, options);
    });
  };

  $('.floaters').vapors({
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/84194/cbeas_logo_1.png',
    count_multiplier: 1
  });

}).call(this);
