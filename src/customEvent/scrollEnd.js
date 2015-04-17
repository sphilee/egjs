(function($, ns, global, doc){
//function __scrollEnd($, ns, global, doc){
    "use strict";
    /**
     * Support scrollEnd event in jQuery
     * @ko jQuery custom scrollEnd 이벤트 지원
     * @name jQuery.extention#scrollEnd
     * @event
     * @param {Number} e.top top position
     * @param {Number} e.left left position
     * @example
     * $(window).on("scrollend",function(e){
     *      e.top;
     *      e.left;
     * });
     *
     */

    var isTouched, isMoved, preTop = 0, preLeft = 0, observerInterval, scrollEndTimer, rotateFlag = false,
    CHROME = 3,
    TIMERBASE = 2,
    TOUCHBASE = 1,
    SCROLLBASE = 0,
    deviceType = getDeviceType();

    $.event.special.scrollend = {
        setup: function() {
            attachEvent();
        },
        teardown: function() {
            removeEvent();
        }
    };

    /**
     * Below iOS7 : Scroll event occurs once when the scroll is stopped
     * Since iOS8 : Scroll event occurs every time scroll
     * android : Scroll event's occurs every time scroll
     * Below android 2.x : Touch event-based processing
     * android & chrome : Scroll event occurs when the rotation
     * @ko
     * iOS : iOS 7.x 이하에서는 스크롤이 멈췄을때 scroll 이벤트 한번 발생
     *       iOS 8.x 이상에서는 scroll 이벤트가 android 와 동일하게 스크롤시 매번 발생
     * android : 스크롤시 scroll 이벤트는 매번 발생
     *           android 2.x 이하에서는 터치 이벤트 기반으로 처리
     * android & chrome : 회전시 scroll 이벤트가 발생되어 이를 처리하기 위함.
     */

    function getDeviceType(){
        var retValue = SCROLLBASE,
            osInfo = ns.agent.os,
            browserInfo = ns.agent.browser,
            version = parseInt(osInfo.version, 10);

        if(osInfo.name === "android"){
            retValue = browserInfo.name === "chrome" ? CHROME : (version >= 3 ? TIMERBASE : TOUCHBASE);
        }else if(/^(?:window|ios)$/.test(osInfo.name) && version >= 8){
                 retValue = TIMERBASE;
        }

        return retValue;
    }

    function attachEvent(){

        var winEvent = $(global).on("scroll" , scroll);

        if(deviceType === TOUCHBASE){
            $(doc).on({
                "touchstart" : touchStart,
                "touchmove" : touchMove,
                "touchend" : touchEnd
            });
        }

        if(deviceType === CHROME) {
            winEvent.on("orientationchange" , function(){
                rotateFlag = true;
            });
        }
    }

    function touchStart(){
        isTouched = true;
        isMoved = false;
        preTop = preLeft = 0;
    }

    function touchMove(){
        isMoved = true;
    }

    function touchEnd(){
        isTouched = false;
        if(isMoved) {
            startObserver();
        }
    }

    function scroll(){
        switch(deviceType) {
            case SCROLLBASE :
                triggerScrollEnd();
                break;
            case TOUCHBASE :
                startObserver();
                break;
            case TIMERBASE :
                triggerScrollEndAlways();
                break;
            case CHROME :
                if(rotateFlag){
                    rotateFlag = false;
                }else{
                    triggerScrollEnd();
                }
                break;
        }
    }

    function startObserver(){
        stopObserver();
        observerInterval = setInterval(observe,100);

    }

    function stopObserver(){
        observerInterval && clearInterval(observerInterval);
        observerInterval = null;
    }

    function observe(){
        if(isTouched || (preTop !== global.pageYOffset || preLeft !== global.pageXOffset) ) {
            preTop = global.pageYOffset;
            preLeft = global.pageXOffset;
        } else {
            stopObserver();
            triggerScrollEnd();
        }

    }

    function triggerScrollEnd(){
        $(global).trigger("scrollend" , {
            top : global.pageYOffset,
            left : global.pageXOffset
        });
    }

    function triggerScrollEndAlways() {
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(function() {
            triggerScrollEnd();
        },350);
    }

    function removeEvent(){
        $(doc).off({
            "touchstart" : touchStart,
            "touchmove" : touchMove,
            "touchend" : touchEnd
        });
        $(global).off("scroll" , scroll);
    }

    // @qunit getDeviceType, CHROME, TIMERBASE, TOUCHBASE, SCROLLBASE
//    return {
//        getDeviceType : getDeviceType,
//        CHROME : CHROME,
//        TIMERBASE : TIMERBASE,
//        TOUCHBASE : TOUCHBASE,
//        SCROLLBASE : SCROLLBASE
//    };
//}
//    if(!eg.debug){
//        __scrollEnd(jQuery, eg, window, document);
//    }
})(jQuery, eg, window, document);