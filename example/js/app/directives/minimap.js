(function( window, undefined ){
"use strict";
/**
 * Horizontal Minimap
 * Horizontal Minimap for AngularJS
 */

angular.module('CbeHorizontalMinimap', [])
  .directive('cbeHorizontalMinimap', ['$interval' , '$window', function($interval, $window) {
  var $miniMap,
      $parent,
      $region,
      $wrapper,
      mousedown = false,
      onSmoothScroll = false,
      downX;

  var settings = {
    heightRatio : 0.15,
    widthRatio : 0.1,
    offsetWidthRatio: 0.1,
    offsetHeightRatio: 0.1,
    smoothScroll: false,
    smoothScrollDelay: 25,
    dragDiagram: true
  };

  var scale = function() {
      return {
          x: ($window.innerWidth / $parent.clientWidth) * settings.widthRatio,
          y: 1

      };
  };

  var onResizeHandler = function(e) {
    var s = scale();
    var sc = 'scale(' + s.x + ', ' + settings.heightRatio + ')';

    var offsetTop = 0;
    var offsetLeftRight = 0;
    var top = $parent.clientHeight * (s.y - 1) / 2 + offsetTop;

    var right = $miniMap.clientWidth * (s.x - 1) / 2  + offsetLeftRight;
    var width = $miniMap.clientWidth * (s.x);

    var css = {
        '-webkit-transform': sc,
        '-moz-transform': sc,
        '-ms-transform': sc,
        '-o-transform': sc,
        'transform': sc,
        'top': '0',
        'right': right + 'px',
        'position': 'absolute'
    };


     $miniMap.css(css);
     $wrapper.css('width', width);

     var regionLeft = $miniMap.getBoundingClientRect().left * s.x;
     var cssRegion = {
          width : $parent.width() * s.x,
          height : $wrapper.height() - 2 +'px',
          margin : '0px',
          left : $parent.scrollLeft() * s.x  + 'px',
          position: 'absolute'

      };

      cssRegion.right = offsetLeftRight + 'px';
      $region.css(cssRegion);
  };

  var onScrollHandler = function(e) {
      var s = scale();
      $region.css({
              left : $parent.scrollLeft() * s.x  + 'px'
           });

  };
  var scrollToPosition = function(e) {
    if(angular.element(e.currentTarget).hasClass('diagram') && e.type === 'click'){
      return;
    }
    var s = scale();
    var left = $parent.scrollLeft() * s.x ;
    var offsetLeft = $region.width() /2;
    var target;
    if(angular.element(e.currentTarget).hasClass('diagram') && e.type !== 'click'){
      target = $parent.scrollLeft() + (downX - e.clientX) / 12;
    }
    else {
      target = (e.clientX - $region.offset().left + left - offsetLeft) / s.x;
    }

    if(e.type === 'click' && settings.smoothScroll) {
        var current = $parent.scrollLeft();
        var maxTarget =  $miniMap.outerWidth(true) - $parent.width();

        target = Math.max(target, Math.min(target, maxTarget));
        var direction = target > current;
        var delay = settings.smoothScrollDelay;
        var distance = Math.abs(current - target);

        var r = delay / distance ;

        var unitScroll = 1;
        var unitDelay = 4;
        if(r >= 4) {
            unitDelay = parseInt(unitScroll);
        } else if(r >= 1) {
            unitScroll = parseInt(r) * 4;
        } else {
            unitScroll = (4 / r);
        }

        var next = current;
        var count = parseInt(distance / unitScroll ) ;

        onSmoothScroll = true;

        // linear translate
        var smoothScroll = function() {
            next = next + (direction ? unitScroll : -unitScroll);
            if(--count <= 0) {
                $interval.cancel(timer);
                onSmoothScroll = false;
                next = target;
            }

            $parent.scrollLeft(next);
        };

        var timer = $interval(smoothScroll, unitDelay);
    } {
        $parent.scrollLeft(target);
    }
    if(e.stopPropagation !== undefined){
      e.stopPropagation();
    }

  };

  var onMouseupHandler = function(e) {
      mousedown = false;
  };

  var onMousemoveHandler = function(e) {
      if(!mousedown || onSmoothScroll) return;
      scrollToPosition(e);

  };

  var onClickHandler = function(e) {
      scrollToPosition(e);
      mousedown = false;
  };

  var onMousedownHandler = function(e) {
      mousedown = true;
      downX = e.clientX;
  };

  return ({
    transclude: true,
    link: function($scope, $element, $attrs, $ctrl, $transclude) {
      $wrapper = angular.element('<div class="minimap-box"></div>');

      var parent = $transclude($scope.$new(), function(clone){
        $element.append(angular.element(clone));
        $element.after($wrapper);
      });

      // -- the original
      $parent = angular.element(parent[1]);

      var minimap =  $transclude($scope.$new(), function(clone){
        $element.removeClass('diagram').addClass('minimap');
        $wrapper.append(angular.element(clone));
        $wrapper.children().removeClass('diagram').addClass('minimap');
        angular.element(clone[1]).addClass('minimap noselect');

        // --  remove events
        angular.forEach(angular.element(clone[1]).children(), function(v,k){
          angular.element(v).css({'pointer-events': 'none'});
        });

      });
      // -- the minimap
      $miniMap = angular.element(minimap[1]);

      // -- the visible area
      $wrapper.append('<div class="miniregion"></div>');
      $region = angular.element(document.getElementsByClassName('miniregion'));

      onResizeHandler();

      $window.on('resize', onResizeHandler);
      $window.on('mouseup', onMouseupHandler);
      $parent.on('scroll', onScrollHandler);

      if(settings.dragDiagram) {
        $parent.on('mousedown', onMousedownHandler);
        $parent.on('mouseup', onMouseupHandler);
        $parent.on('mousemove', onMousemoveHandler);
      }

      $region.on('mousedown', onMousedownHandler);
      $region.on('mouseup', onMouseupHandler);
      $region.on('mousemove', onMousemoveHandler);
      $region.on('click', onClickHandler);

      $wrapper.on('mousedown', onMousedownHandler);
      $wrapper.on('mouseup', onMouseupHandler);
      $wrapper.on('mousemove', onMousemoveHandler);
      $wrapper.on('click', onClickHandler);

    },

  });
}]);
}(window));