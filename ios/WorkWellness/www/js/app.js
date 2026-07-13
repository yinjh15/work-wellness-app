 const App = {
   state: {
     isWorking: false,
     activityInterval: 40,
     waterInterval: 60,
     activitySecondsLeft: 0,
     waterSecondsLeft: 0,
     dailyActivityCount: 0,
     dailyWaterCount: 0,
     workStartTime: null,
   },
 
   timer: null,
   workDurationTimer: null,
   particles: null,
 
   init() {
     this.particles = new ParticleSystem(document.getElementById("particleCanvas"));
     this.loadState();
     this.render();
     this.bindEvents();
     if (this.state.isWorking) {
       this.startTimers();

      // 调度 iOS 后台通知（锁屏/后台/杀死 App 也能收到）
      if (window.scheduleBackgroundReminders) {
        window.scheduleBackgroundReminders(s.activityInterval, s.waterInterval);
      }
     }
     this.particles.start();
     this.checkDateChange();
     this.startWorkDurationTimer();
   },
 
   loadState() {
     try {
       const saved = localStorage.getItem("workWellnessState");
       if (saved) {
         const data = JSON.parse(saved);
         const today = this.todayString();
         this.state.isWorking = data.isWorking || false;
         this.state.activityInterval = data.activityInterval || 40;
         this.state.waterInterval = data.waterInterval || 60;
         this.state.dailyActivityCount = data.lastDate === today ? data.dailyActivityCount || 0 : 0;
         this.state.dailyWaterCount = data.lastDate === today ? data.dailyWaterCount || 0 : 0;
         this.state.workStartTime = data.workStartTime || null;
         if (this.state.isWorking) {
           this.state.activitySecondsLeft = this.state.activityInterval * 60;
           this.state.waterSecondsLeft = this.state.waterInterval * 60;
         }
       }
     } catch (e) { }
   },
 
   saveState() {
     try {
       const today = this.todayString();
       localStorage.setItem("workWellnessState", JSON.stringify({
         isWorking: this.state.isWorking,
         activityInterval: this.state.activityInterval,
         waterInterval: this.state.waterInterval,
         dailyActivityCount: this.state.dailyActivityCount,
         dailyWaterCount: this.state.dailyWaterCount,
         lastDate: today,
         workStartTime: this.state.workStartTime,
       }));
     } catch (e) { }
   },
 
   todayString() {
     const d = new Date();
     return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
   },
 
   checkDateChange() {
     setInterval(() => {
       const saved = localStorage.getItem("workWellnessState");
       if (saved) {
         try {
           const data = JSON.parse(saved);
           const today = this.todayString();
           if (data.lastDate && data.lastDate !== today) {
             this.state.dailyActivityCount = 0;
             this.state.dailyWaterCount = 0;
             this.saveState();
             this.render();
           }
         } catch(e) {}
       }
     }, 60000);
   },
 
   toggleWorking() {
     this.state.isWorking = !this.state.isWorking;
     if (this.state.isWorking) {
       this.state.workStartTime = Date.now();
       this.state.activitySecondsLeft = this.state.activityInterval * 60;
       this.state.waterSecondsLeft = this.state.waterInterval * 60;
       this.startTimers();

      // 调度 iOS 后台通知（锁屏/后台/杀死 App 也能收到）
      if (window.scheduleBackgroundReminders) {
        window.scheduleBackgroundReminders(s.activityInterval, s.waterInterval);
      }
     } else {
       this.state.workStartTime = null;
       this.stopTimers();

      // 取消 iOS 后台通知
      if (window.cancelAllReminders) {
        window.cancelAllReminders();
      }
     }
     this.saveState();
     this.render();
   },
 
   /** 鍙戦€佸師鐢?iOS 閫氱煡锛堥€氳繃 WKScriptMessageHandler 妗ユ帴锛?*/
   sendNotification(title, body) {
     try {
       if (window.sendNativeNotification) {
         window.sendNativeNotification(title, body);
       } else if ('Notification' in window && Notification.permission === 'granted') {
         new Notification(title, { body: body });
       }
     } catch(e) {}
   },
 
   startTimers() {
     this.stopTimers();

      // 取消 iOS 后台通知
      if (window.cancelAllReminders) {
        window.cancelAllReminders();
      }
     this.timer = setInterval(() => {
       this.state.activitySecondsLeft -= 1;
       this.state.waterSecondsLeft -= 1;
 
       if (this.state.activitySecondsLeft <= 0) {
         this.state.activitySecondsLeft = this.state.activityInterval * 60;
         this.state.dailyActivityCount += 1;
         this.sendNotification("璇ヨ捣韬椿鍔ㄤ簡锛?, "宸茬粡杩炵画宸ヤ綔涓€娈垫椂闂翠簡锛岀珯璧锋潵璧颁竴璧帮紝浼稿睍涓€涓嬭韩浣撳惂锛?);
         this.saveState();
       }
 
       if (this.state.waterSecondsLeft <= 0) {
         this.state.waterSecondsLeft = this.state.waterInterval * 60;
         this.state.dailyWaterCount += 1;
         this.sendNotification("璇ュ枬姘翠簡锛?, "宸ヤ綔鍐嶅繖涔熻璁板緱琛ュ厖姘村垎锛屽枬鏉函鍑€姘村惂锛?);
         this.saveState();
       }
 
       this.render();
     }, 1000);
   },
 
   stopTimers() {
     if (this.timer) {
       clearInterval(this.timer);
       this.timer = null;
     }
     this.state.activitySecondsLeft = 0;
     this.state.waterSecondsLeft = 0;
   },
 
   startWorkDurationTimer() {
     this.workDurationTimer = setInterval(() => {
       if (this.state.isWorking) {
         document.getElementById("workDuration").textContent = this.getWorkDuration();
       }
     }, 60000);
   },
 
   formatTime(seconds) {
     const m = Math.floor(seconds / 60);
     const s = Math.floor(seconds % 60);
     return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
   },
 
   getWorkDuration() {
     if (!this.state.workStartTime) return "浠婃棩宸ヤ綔 0h 0m";
     const elapsed = Math.floor((Date.now() - this.state.workStartTime) / 1000);
     const h = Math.floor(elapsed / 3600);
     const m = Math.floor((elapsed % 3600) / 60);
     return `浠婃棩宸ヤ綔 ${h}h ${m}m`;
   },
 
   getTotalMinutes() {
     if (!this.state.workStartTime) return 0;
     return Math.floor((Date.now() - this.state.workStartTime) / 60000);
   },
 
   render() {
     const s = this.state;
     const isActive = s.isWorking;
 
     const toggle = document.getElementById("masterToggle");
     toggle.className = "master-toggle" + (isActive ? " active" : "");
     toggle.querySelector(".toggle-icon").textContent = isActive ? "鈴? : "鈻?;
 
     const status = document.getElementById("statusText");
     status.textContent = isActive ? "宸ヤ綔涓? : "宸叉殏鍋?;
     status.className = "status-text" + (isActive ? " active" : "");
 
     document.getElementById("workDuration").textContent = this.getWorkDuration();
     document.getElementById("activityCountdown").textContent = isActive ? this.formatTime(s.activitySecondsLeft) : "--:--";
     document.getElementById("waterCountdown").textContent = isActive ? this.formatTime(s.waterSecondsLeft) : "--:--";
     document.getElementById("activityCard").className = "timer-card" + (isActive ? " active" : "");
     document.getElementById("waterCard").className = "timer-card" + (isActive ? " active" : "");
     document.getElementById("activityCount").textContent = s.dailyActivityCount;
     document.getElementById("waterCount").textContent = s.dailyWaterCount;
     document.getElementById("totalMinutes").textContent = this.getTotalMinutes();
     document.getElementById("activityIntervalLabel").textContent = "姣?" + s.activityInterval + " 鍒嗛挓";
     document.getElementById("waterIntervalLabel").textContent = "姣?" + s.waterInterval + " 鍒嗛挓";
 
     if (this.particles) {
       this.particles.setActive(isActive);
     }
 
     document.getElementById("activityIntervalValue").textContent = s.activityInterval + " 鍒嗛挓";
     document.getElementById("waterIntervalValue").textContent = s.waterInterval + " 鍒嗛挓";
   },
 
   bindEvents() {
     document.getElementById("masterToggle").addEventListener("click", () => { this.toggleWorking(); });
     document.getElementById("settingsBtn").addEventListener("click", () => { this.openSettings(); });
     document.getElementById("settingsOverlay").addEventListener("click", () => { this.closeSettings(); });
 
     document.getElementById("activityIntervalSlider").addEventListener("input", (e) => {
       const val = parseInt(e.target.value);
       document.getElementById("activityIntervalValue").textContent = val + " 鍒嗛挓";
       this.state.activityInterval = val;
       if (this.state.isWorking) {
         this.state.activitySecondsLeft = val * 60;
       }
     });
 
     document.getElementById("waterIntervalSlider").addEventListener("input", (e) => {
       const val = parseInt(e.target.value);
       document.getElementById("waterIntervalValue").textContent = val + " 鍒嗛挓";
       this.state.waterInterval = val;
       if (this.state.isWorking) {
         this.state.waterSecondsLeft = val * 60;
       }
     });
 
     document.getElementById("saveSettings").addEventListener("click", () => {
       this.saveState();
       this.closeSettings();
     });
 
     document.getElementById("testNotificationBtn").addEventListener("click", () => {
       this.sendNotification("宸ヤ綔鍏荤敓", "閫氱煡宸叉甯稿伐浣滐紒");
     });
 
     // iOS 鍘熺敓涓嶉渶瑕侀澶栬姹傞€氱煡鏉冮檺锛屾ˉ鎺ヨ嚜鍔ㄥ鐞?   },
 
   openSettings() {
     document.getElementById("settingsOverlay").classList.add("open");
     document.getElementById("settingsPanel").classList.add("open");
     document.getElementById("activityIntervalSlider").value = this.state.activityInterval;
     document.getElementById("waterIntervalSlider").value = this.state.waterInterval;
     this.render();
   },
 
   closeSettings() {
     document.getElementById("settingsOverlay").classList.remove("open");
     document.getElementById("settingsPanel").classList.remove("open");
   },
 };
 
 document.addEventListener("DOMContentLoaded", () => App.init());

