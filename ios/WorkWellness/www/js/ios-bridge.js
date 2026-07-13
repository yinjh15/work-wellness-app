(function() {
    'use strict';

    window.isIOSApp = true;

    window.sendNativeNotification = function(title, content) {
        try {
            window.webkit.messageHandlers.notifyBridge.postMessage({ title: title, content: content });
        } catch(e) {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body: content });
            }
        }
    };

    /** 调度后台定期通知（iOS 原生管理，App 在后台/Killed 也会按时弹出） */
    window.scheduleBackgroundReminders = function(activityMin, waterMin) {
        try {
            window.webkit.messageHandlers.scheduleBridge.postMessage({
                activityInterval: activityMin,
                waterInterval: waterMin
            });
            console.log('后台提醒已调度:', activityMin, waterMin);
        } catch(e) {
            console.log('scheduleBridge unavailable');
        }
    };

    /** 取消所有后台通知 */
    window.cancelAllReminders = function() {
        try {
            window.webkit.messageHandlers.cancelBridge.postMessage({});
            console.log('后台提醒已取消');
        } catch(e) {
            console.log('cancelBridge unavailable');
        }
    };

    window.sendNativeVibration = function() {
        try {
            window.webkit.messageHandlers.vibrateBridge.postMessage({});
        } catch(e) {
            console.log('Native vibration unavailable');
        }
    };

    var originalVibrate = navigator.vibrate;
    navigator.vibrate = function(duration) {
        if (window.sendNativeVibration) {
            window.sendNativeVibration();
            return true;
        }
        return originalVibrate ? originalVibrate.call(navigator, duration) : false;
    };

    if ('Notification' in window) {
        window.Notification = function(title, options) {
            window.sendNativeNotification(title, options.body || '');
            return this;
        };
        window.Notification.permission = 'granted';
        window.Notification.requestPermission = function() { return Promise.resolve('granted'); };
    }

    /** 应用从后台恢复时调用 - 由原生 Swift 代码触发 */
    window.handleAppResume = function() {
        console.log('App resumed from background');
    };

    console.log('iOS Bridge initialized (with background scheduling)');
})();
