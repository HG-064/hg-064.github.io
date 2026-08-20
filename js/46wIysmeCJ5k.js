!function($,Handlebars) {


  //さまざまなしかけ
  var vid01 = 'XfPDxSLrIvg';
  var vid02 = '39YjleJCTas';
  var vid03 = 'JhC0KRc-rik';
  var vid04 = 'nOhRgR85wCc';

  //ステージ変化
  var vid05 = 'ix6OaWOaICA';


  //US Consent判定
  function shouldShowMovieFallback() {
    return !!(
      window.ConsentUtil &&
      typeof window.ConsentUtil.isInYoutubeTargetDirectory === 'function' &&
      typeof window.ConsentUtil.isOptedOut === 'function' &&
      window.ConsentUtil.isInYoutubeTargetDirectory() &&
      window.ConsentUtil.isOptedOut()
    );
  }

  /*****************************************************************************************************************
   * 初期化
   *****************************************************************************************************************/
  function documentReady(){
    var def = new $.Deferred();

  $(function(){

    // US Consent判定時、Youtubeプレーヤーの生成をブロックする
    var isBlocked = shouldShowMovieFallback();
    if (isBlocked) {
      $('html').addClass('is-youtube-blocked');
    }

    def.resolve();

    /* --------------------------------------------------------------------------
     ITEM SLIDE
     ----------------------------------------------------------------------- */
      //slideRandomize();
      var $stageMainSlide = $('#js-stage-mainslide');
      var $slideName = $('#js-stage-name');
      var $stageBox = $('#js-stage-box');

      var $stageMainSlideItem = $stageMainSlide.find('.stage-mainslide__item');
      var len = $stageMainSlideItem.length;

      //var n = Math.floor(Math.random()*len);
      var n = 0;

      function startSlide(num){
        console.log()
        var $itemSlide = $stageMainSlideItem.eq(num).find('.stage-mainslide__item-inner');

        var $frontSlideItem2 = $itemSlide.find('.stage-mainslide__img').not('.js-anime-fade-out').eq(-1);
        $frontSlideItem2.find('.stage-mainslide__img-thumb').addClass('js-anime-move');

        setTimeout(function(){
          $frontSlideItem2.addClass('js-anime-fade-out');
          setTimeout(function(){
            $itemSlide.prepend($frontSlideItem2);
            $frontSlideItem2.removeClass('js-anime-fade-out').find('.stage-mainslide__img-thumb').removeClass('js-anime-move');
          },1000);

          var $frontSlideItem1 = $itemSlide.find('.stage-mainslide__img').not('.js-anime-fade-out').eq(-1);
          $frontSlideItem1.find('.stage-mainslide__img-thumb').addClass('js-anime-move');

          setTimeout(function(){
            $frontSlideItem1.addClass('js-anime-fade-out');
            setTimeout(function(){
              $itemSlide.prepend($frontSlideItem1);
              $frontSlideItem1.removeClass('js-anime-fade-out').find('.stage-mainslide__img-thumb').removeClass('js-anime-move');
            },1000);
          },9000);

        },9000);

      }


      $stageMainSlide.on('init', function(slick){
        startSlide(n);
      });
      $stageMainSlide.slick({
        autoplay: true,
        autoplaySpeed: 17000,
        speed: 10,
        cssEase: 'ease-in',
        dots: true,
        dotsClass: 'stage-dot',
        appendDots: $(".stage__dot"),
        draggable: false,
        arrows: true,
        prevArrow: '<div class="stage-slide-ui__prev"><button class="stage-slide-ui__prev-btn"><i><svg role="img" title=""><use xlink:href="/assets_v2/img/common/sprite.svg#arrow_prev"/></svg></i></button></div>',
        nextArrow: '<div class="stage-slide-ui__next"><button class="stage-slide-ui__next-btn"><i><svg role="img" title=""><use xlink:href="/assets_v2/img/common/sprite.svg#arrow_next"/></svg></i></button></div>',
        infinite: true,
        initialSlide: n,
        pauseOnFocus: false,
        pauseOnHover: false,
        pauseOnDotsHover: false,
        waitForAnimate: false,
        fade:true,
        slidesToShow: 1,
        slidesToScroll: 1,
        swipe: true,
        asNavFor: $slideName
      });

      $stageMainSlide.on('beforeChange', function(event, slick, currentSlide, nextSlide){
        startSlide(nextSlide);
      });
      $stageMainSlide.on('afterChange', function(event, slick, currentSlide, nextSlide){
        startSlide(currentSlide);
       // mainSlideAnime();
      });

      $slideName.slick({
        autoplay: false,
        speed: 10,
        pauseOnHover: false,
        pauseOnDotsHover: false,
        cssEase: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        dots: false,
        draggable: false,
        arrows: false,
        infinite: true,
        initialSlide: n,
        pauseOnHover: false,
        fade: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        swipe: false
      });

      $stageBox.slick({
        autoplay: false,
        speed: 1,
        pauseOnHover: false,
        pauseOnDotsHover: false,
        cssEase: 'liner',
        dots: false,
        draggable: false,
        arrows: false,
        infinite: false,
        initialSlide: 0,
        pauseOnHover: false,
        fade:true,
        slidesToShow: 1,
        slidesToScroll: 1,
        swipe: false
      });

      function boxAnime(){
        $.when(
          $stageBox.find('.slick-slide').removeClass('is--slide-animate'),
          $stageBox.find('.slick-current').addClass('is--slide-ready')
        ).done(function () {
          $stageBox.find('.slick-slide').not('.slick-current').removeClass('is--slide-ready');
          $stageBox.find('.slick-current').addClass('is--slide-animate');
        })
      }
      $stageBox.on('afterChange', function(event, slick, currentSlide, nextSlide){
        boxAnime();
      });

      var $stageList = $('#js-stage-list').find('.stage-list__item');
      var slideIndex = 0;

      $stageList.eq(slideIndex).addClass('stage-list__item--current');

      $stageList.on('click',function(e){
        e.preventDefault();
        slideIndex = $(this).index();
        $stageBox.slick('slickGoTo', slideIndex);
        $stageList.removeClass('stage-list__item--current');
        $(this).addClass('stage-list__item--current');
      });

      /* sp用*/
      var $stageAdditionSlide = $('#js-stage-addition-slide');
      var $stageAdditionName = $('#js-stage-addition-name');
      var isInitStageAdditionSlide = false;

      var callback = function (w,h){
        if( w < 760) {
          if(!isInitStageAdditionSlide){
            $stageAdditionSlide.slick({
              autoplay: false,
              speed: 600,
              pauseOnHover: true,
              pauseOnDotsHover: true,
              cssEase: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
              dots: true,
              dotsClass: 'stage-addition-slide-dot',
              draggable: true,
              arrows: false,
              infinite: true,
              initialSlide: 0,
              pauseOnHover: true,
              slidesToShow: 1,
              slidesToScroll: 1,
              swipe: true,
              centerMode: true,
              asNavFor: $stageAdditionName,
              responsive: [{
                breakpoint:759,
                settings: {
                  centerPadding: '11.2%'
                }
              }]
            });
            $stageAdditionName.slick({
              autoplay: false,
              speed: 600,
              pauseOnHover: false,
              pauseOnDotsHover: false,
              cssEase: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
              dots: false,
              draggable: false,
              arrows: false,
              infinite: true,
              initialSlide: 0,
              pauseOnHover: false,
              fade: true,
              slidesToShow: 1,
              slidesToScroll: 1,
              swipe: false
            });
            isInitStageAdditionSlide = true;
          }
        }else{
          isInitStageAdditionSlide = false;
          if($stageAdditionSlide.hasClass('slick-initialized')){
            $stageAdditionSlide.slick('unslick');
          }
          if($stageAdditionName.hasClass('slick-initialized')){
            $stageAdditionName.slick('unslick');
          }
        }

      };
      Shared.util.addResizeListener(_.throttle(callback, 16, { trailing: false, leading: true }));

      var $slidelist = $('.stage-detail__img-slide');

      $slidelist.slick({
        autoplay: false,
        autoplaySpeed: 2400,
        speed: 600,
        pauseOnHover: true,
        pauseOnDotsHover: true,
        cssEase: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        dots: true,
        dotsClass: 'stage-detail-list-dot',
        draggable: true,
        arrows: false,
        infinite: true,
        initialSlide: 0,
        pauseOnHover: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        swipe: true
      });

      var $stageListWrap = $('.stage-list-wrap');
      var $stageAdditionWrap = $('.stage-addition-wrap');
      var $stageDetailWrap = $('.stage-detail-wrap');

      var $stageBoxInner = $stageListWrap.find('.stage-box');

      var $html = $('html');

      var isInitStageList = false;

      var callback = function (w,h){
        if (w < 760) {
          if (!isInitStageList){
            isInitStageList = true;
          }
        } else {
          isInitStageList = false;
        }
      };

      Shared.util.addResizeListener(_.throttle(callback, 16, { trailing: false, leading: true }));

      var callbackBg = function (t, b) {
        if(isInitStageList){
          var stageListWrapTop = $stageListWrap.offset().top;
          var stageAdditionWrapTop = $stageAdditionWrap.offset().top;
          var stageDetailWrapTop = $stageDetailWrap.offset().top;
          if (t > stageListWrapTop) {
            $html.addClass('is-inview-stage-list-wrap');
            if (b > stageDetailWrapTop) {
              var pos = stageDetailWrapTop - b + t - stageListWrapTop;
              $html.removeClass('is-inview-stage-list-wrap');
              $stageBoxInner.css({'top':pos});
            } else {
              $stageBoxInner.removeAttr('style');
            }
          } else {
            $html.removeClass('is-inview-stage-list-wrap');
            $stageBoxInner.removeAttr('style');
          }
        } else {
          $html.removeClass('is-inview-stage-list-wrap');
          $stageBoxInner.removeAttr('style');
        }
      }

      Shared.util.addScrollListener(_.throttle(callbackBg, 16, { trailing: false, leading: true }))

      if (!isBlocked) {

        var youtube = new Youtube();

        var start01 = 0;
        var start02 = 0;
        var start03 = 0;
        var start04 = 0;
        var start05 = 0;

        var ytPlayer01 = youtube.create('', {
          container: '#js-movie01-player',
          volume: 0,
          controls: 0,
          autoPlay: 0,
          showinfo: 0,
          vq: 'hd720'
        });

        var ytPlayer02 = youtube.create('', {
          container: '#js-movie02-player',
          volume: 0,
          controls: 0,
          autoPlay: 0,
          showinfo: 0,
          vq: 'hd720'
        });

        var ytPlayer03 = youtube.create('', {
          container: '#js-movie03-player',
          volume: 0,
          controls: 0,
          autoPlay: 0,
          showinfo: 0,
          vq: 'hd720'
        });

        var ytPlayer04 = youtube.create('', {
          container: '#js-movie04-player',
          volume: 0,
          controls: 0,
          autoPlay: 0,
          showinfo: 0,
          vq: 'hd720'
        });

        var ytPlayer05 = youtube.create('', {
          container: '#js-movie05-player',
          volume: 0,
          controls: 0,
          autoPlay: 0,
          showinfo: 0,
          vq: 'hd720'
        });

        var $movie01 = $('#js-movie01');
        var $movie02 = $('#js-movie02');
        var $movie03 = $('#js-movie03');
        var $movie04 = $('#js-movie04');
        var $movie05 = $('#js-movie05');

        var $movie01Img = $movie01.find('.stage-detail__img-thumb');
        var $movie02Img = $movie02.find('.stage-detail__img-thumb');
        var $movie03Img = $movie03.find('.stage-detail__img-thumb');
        var $movie04Img = $movie04.find('.stage-detail__img-thumb');
        var $movie05Img = $movie05.find('.stage-detail__img-thumb');

        var $movie01Btn = $movie01.find('.stage-detail__play');
        var $movie02Btn = $movie02.find('.stage-detail__play');
        var $movie03Btn = $movie03.find('.stage-detail__play');
        var $movie04Btn = $movie04.find('.stage-detail__play');
        var $movie05Btn = $movie05.find('.stage-detail__play');

        function initMovie (player, id, start) {
          player.loadVideoById(id);
          player.seek(start);
          player.pause();
        }

        function playMovie (player, img, btn) {
          img.addClass('u-hidden');
          btn.addClass('u-hide');
          player.play();
        }

        function resetMovie (player, start, img, btn) {
          player.seek(start);
          player.pause();
          img.removeClass('u-hidden');
          btn.removeClass('u-hide');
        }

        initMovie(ytPlayer01, vid01, start01);
        initMovie(ytPlayer02, vid02, start02);
        initMovie(ytPlayer03, vid03, start03);
        initMovie(ytPlayer04, vid04, start04);
        initMovie(ytPlayer05, vid05, start05);

        ytPlayer01.onEnded(function() {
          resetMovie(ytPlayer01, start01, $movie01Img, $movie01Btn);
          $slidelist.slick('slickGoTo', 1);
        });

        ytPlayer02.onEnded(function() {
          resetMovie(ytPlayer02, start02, $movie02Img, $movie02Btn);
          $slidelist.slick('slickGoTo', 2);
        });

        ytPlayer03.onEnded(function() {
          resetMovie(ytPlayer03, start03, $movie03Img, $movie03Btn);
          $slidelist.slick('slickGoTo', 3);
        });

        ytPlayer04.onEnded(function() {
          resetMovie(ytPlayer04, start04, $movie04Img, $movie04Btn);
          $slidelist.slick('slickGoTo', 0);
        });

        $movie01Btn.on('click', 'a', function (e) {
          e.preventDefault();
          playMovie(ytPlayer01, $movie01Img, $movie01Btn);
        });

        $movie02Btn.on('click', 'a', function (e) {
          e.preventDefault();
          playMovie(ytPlayer02, $movie02Img, $movie02Btn);
        });

        $movie03Btn.on('click', 'a', function (e) {
          e.preventDefault();
          playMovie(ytPlayer03, $movie03Img, $movie03Btn);
        });

        $movie04Btn.on('click', 'a', function (e) {
          e.preventDefault();
          playMovie(ytPlayer04, $movie04Img, $movie04Btn);
        });

        $movie05Btn.on('click', 'a', function (e) {
          e.preventDefault();
          playMovie(ytPlayer05, $movie05Img, $movie05Btn);
        });

        $slidelist.on('beforeChange', function(event, slick, currentSlide, nextSlide){
          resetMovie(ytPlayer01, start01, $movie01Img, $movie01Btn);
          resetMovie(ytPlayer02, start02, $movie02Img, $movie02Btn);
          resetMovie(ytPlayer03, start03, $movie03Img, $movie03Btn);
          resetMovie(ytPlayer04, start04, $movie04Img, $movie04Btn);
        });

        $slidelist.on('afterChange', function(event, slick, currentSlide, nextSlide){
          if(currentSlide === 0){
            playMovie(ytPlayer01, $movie01Img, $movie01Btn);
          }else if(currentSlide === 1){
            playMovie(ytPlayer02, $movie02Img, $movie02Btn);
          }else if(currentSlide === 2){
            playMovie(ytPlayer03, $movie03Img, $movie03Btn);
          }else if(currentSlide === 3){
            playMovie(ytPlayer04, $movie04Img, $movie04Btn);
          }
        });

        var $viewnote = $('.globalfooter-note__txt--viewnote');
        $viewnote.show();


        var $stageDetail = $('.stage-detail-wrap');

        var callbackMovie = function (t, b) {

          var stageDetailTop = $stageDetail.offset().top;
          var stageDetailH = $stageDetail.outerHeight();

          if(t > stageDetailTop + stageDetailH/2){
            resetMovie(ytPlayer01, start01, $movie01Img, $movie01Btn);
            resetMovie(ytPlayer02, start02, $movie02Img, $movie02Btn);
            resetMovie(ytPlayer03, start03, $movie03Img, $movie03Btn);
            resetMovie(ytPlayer04, start04, $movie04Img, $movie04Btn);
          }

          if (b > stageDetailTop + stageDetailH/2) {
            playMovie(ytPlayer01, $movie01Img, $movie01Btn);
          }else{
          }
        };

        Shared.util.addScrollListener(_.throttle(callbackMovie, 16, { trailing: false, leading: true }));

      }

      /************************************************************************************************************************
       * MODAL
       ************************************************************************************************************************/
      function setPaddingBody(isClose) {
        var pr = parseInt($("body").css("padding-right"), 10);
        pr = pr ? pr : 0;
        $("body").css(
          "padding-right",
          String(pr + $.getScrollBarSize() * (isClose ? -1 : 1)) + "px"
        );
      }
      var stageModal = $("#stageModal");
      var $stageModalSlider = $("#js-stageModal-slide");

      function openStageModal(cnt) {
        $("html")
          .addClass("is-opened-modal")
          .addClass("is-open-anime-modal");
        stageModal.removeClass("u-hide");
        setPaddingBody(false);

        setTimeout(function() {
          $("html").addClass("is-open-anime-modal");
        }, 17);
        setTimeout(function() {
          $("html").addClass("is-init-modal");

          if (!$stageModalSlider.hasClass("slick-initialized")) {
            $stageModalSlider.slick({
              autoplay: false,
              speed: 800,
              pauseOnHover: true,
              pauseOnDotsHover: true,
              cssEase: "cubic-bezier(0.190, 1.000, 0.220, 1.000)",
              dots: true,
              dotsClass: "stageModal-dot",
              appendDots: $(".stageModal__dot"),
              arrows: true,
              draggable: true,
              prevArrow:
                '<div class="stageModal-slide-ui__prev"><button class="stageModal-slide-ui__prev-btn"><i><svg role="img" title=""><use xlink:href="/assets_v2/img/common/sprite.svg#arrow_s"/></svg></i></button></div>',
              nextArrow:
                '<div class="stageModal-slide-ui__next"><button class="stageModal-slide-ui__next-btn"><i><svg role="img" title=""><use xlink:href="/assets_v2/img/common/sprite.svg#arrow_s"/></svg></i></button></div>',
              infinite: true,
              initialSlide: cnt,
              pauseOnHover: true,
              slidesToShow: 1,
              slidesToScroll: 1,
              swipe: true,
              centerMode: true,
              centerPadding: "20%",
              responsive: [
                {
                  breakpoint: 759,
                  settings: {
                    centerPadding: "6%"
                  }
                }
              ]
            });
          } else {
            $stageModalSlider.slick("setPosition");
            $stageModalSlider.slick("slickGoTo", cnt);
          }
        }, 570);
      }

      function closeStageModal() {
        $("html").removeClass("is-init-modal");
        setTimeout(function() {
          $("html").removeClass("is-open-anime-modal");
        }, 400);
        setTimeout(function() {
          $("html").removeClass("is-opened-modal");
          stageModal.addClass("u-hide");
          setPaddingBody(true);
        }, 1050);
      }

      $(".js-stageModal").on("click", function(e) {
        e.preventDefault();
        var cnt = $(this).attr("data-index");
        cnt = parseInt(cnt, 10);
        openStageModal(cnt);
      });

      $(".js-closeModal").on("click", function(e) {
        e.preventDefault();
        closeStageModal();
      });

  });
    return def.promise();
  }

  function initStage(){
    $.when(
      documentReady()
    ).then(function () {
      })
  }

  initStage();

}(jQuery,Handlebars);

