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
     } catch (e) {
       console.warn("Failed to load state:", e);
     }
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
     } catch (e) {
       console.warn("Failed to save state:", e);
     }
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
       this.vibrate(50);
     } else {
       this.state.workStartTime = null;
       this.stopTimers();
       this.vibrate(30);
     }
     this.saveState();
     this.render();
   },
 
   vibrate(ms) {
     try {
       if (navigator.vibrate) {
         navigator.vibrate(ms);
       }
     } catch(e) {}
   },
 
   startTimers() {
     this.stopTimers();
     this.timer = setInterval(() => {
       this.state.activitySecondsLeft -= 1;
       this.state.waterSecondsLeft -= 1;
 
       if (this.state.activitySecondsLeft <= 0) {
         this.state.activitySecondsLeft = this.state.activityInterval * 60;
         this.state.dailyActivityCount += 1;
         this.vibrate(300);
         this.sendNotification("该起身活动了！", "已经连续工作一段时间了，站起来走一走，伸展一下身体吧！");
         this.saveState();
       }
 
       if (this.state.waterSecondsLeft <= 0) {
         this.state.waterSecondsLeft = this.state.waterInterval * 60;
         this.state.dailyWaterCount += 1;
         this.vibrate(200);
         this.sendNotification("该喝水了！", "工作再忙也要记得补充水分，喝杯纯净水吧！");
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
 
   sendNotification(title, body) {
     if (!("Notification" in window)) return;
     if (Notification.permission === "granted") {
       try {
         new Notification(title, {
           body: body,
           icon: "icons/icon.png",
           tag: "work-wellness",
           requireInteraction: true,
           vibrate: [200, 100, 200],
         });
       } catch(e) {
         console.warn("Notification failed:", e);
       }
     }
   },
 
   formatTime(seconds) {
     const m = Math.floor(seconds / 60);
     const s = Math.floor(seconds % 60);
     return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
   },
 
   getWorkDuration() {
     if (!this.state.workStartTime) return "今日工作 0h 0m";
     const elapsed = Math.floor((Date.now() - this.state.workStartTime) / 1000);
     const h = Math.floor(elapsed / 3600);
     const m = Math.floor((elapsed % 3600) / 60);
     return `今日工作 ${h}h ${m}m`;
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
     toggle.querySelector(".toggle-icon").textContent = isActive ? "⏸" : "▶";
 
     const status = document.getElementById("statusText");
     status.textContent = isActive ? "工作中" : "已暂停";
     status.className = "status-text" + (isActive ? " active" : "");
 
     document.getElementById("workDuration").textContent = this.getWorkDuration();
     document.getElementById("activityCountdown").textContent = isActive ? this.formatTime(s.activitySecondsLeft) : "--:--";
     document.getElementById("waterCountdown").textContent = isActive ? this.formatTime(s.waterSecondsLeft) : "--:--";
     document.getElementById("activityCard").className = "timer-card" + (isActive ? " active" : "");
     document.getElementById("waterCard").className = "timer-card" + (isActive ? " active" : "");
     document.getElementById("activityCount").textContent = s.dailyActivityCount;
     document.getElementById("waterCount").textContent = s.dailyWaterCount;
     document.getElementById("totalMinutes").textContent = this.getTotalMinutes();
     document.getElementById("activityIntervalLabel").textContent = "每 " + s.activityInterval + " 分钟";
     document.getElementById("waterIntervalLabel").textContent = "每 " + s.waterInterval + " 分钟";
 
     if (this.particles) {
       this.particles.setActive(isActive);
     }
 
     document.getElementById("activityIntervalValue").textContent = s.activityInterval + " 分钟";
     document.getElementById("waterIntervalValue").textContent = s.waterInterval + " 分钟";
   },
 
   bindEvents() {
     document.getElementById("masterToggle").addEventListener("click", () => { this.toggleWorking(); });
     document.getElementById("settingsBtn").addEventListener("click", () => { this.openSettings(); });
     document.getElementById("settingsOverlay").addEventListener("click", () => { this.closeSettings(); });
 
     document.getElementById("activityIntervalSlider").addEventListener("input", (e) => {
       const val = parseInt(e.target.value);
       document.getElementById("activityIntervalValue").textContent = val + " 分钟";
       this.state.activityInterval = val;
       if (this.state.isWorking) {
         this.state.activitySecondsLeft = val * 60;
       }
     });
 
     document.getElementById("waterIntervalSlider").addEventListener("input", (e) => {
       const val = parseInt(e.target.value);
       document.getElementById("waterIntervalValue").textContent = val + " 分钟";
       this.state.waterInterval = val;
       if (this.state.isWorking) {
         this.state.waterSecondsLeft = val * 60;
       }
     });
 
     document.getElementById("saveSettings").addEventListener("click", () => {
       this.saveState();
       this.vibrate(20);
       this.closeSettings();
     });
 
     document.getElementById("testNotificationBtn").addEventListener("click", () => {
       if (!("Notification" in window)) {
         alert("此设备不支持通知功能");
         return;
       }
       if (Notification.permission === "denied") {
         alert("通知权限已被拒绝，请在系统设置中开启");
         return;
       }
       if (Notification.permission === "granted") {
         this.sendNotification("工作养生", "通知已正常工作！");
         this.vibrate(100);
       } else {
         Notification.requestPermission().then((perm) => {
           if (perm === "granted") {
             this.sendNotification("工作养生", "通知已开启！");
             this.vibrate(100);
           }
         });
       }
     });
 
     // 请求通知权限
     setTimeout(() => {
       if ("Notification" in window && Notification.permission === "default") {
         Notification.requestPermission();
       }
     }, 3000);
   },
 
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
