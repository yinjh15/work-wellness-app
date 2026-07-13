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
    configUrl: "https://raw.githubusercontent.com/example/work-wellness-config/main/config.json",
  },

  timer: null,
  countdownInterval: null,
  particles: null,
  notificationPermission: false,

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
        this.state.dailyActivityCount =
          data.lastDate === today ? data.dailyActivityCount || 0 : 0;
        this.state.dailyWaterCount =
          data.lastDate === today ? data.dailyWaterCount || 0 : 0;
        this.state.workStartTime = data.workStartTime || null;
        this.state.configUrl = data.configUrl || this.state.configUrl;
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
        configUrl: this.state.configUrl,
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
      this.requestNotificationPermission();
    } else {
      this.state.workStartTime = null;
      this.stopTimers();
    }
    this.saveState();
    this.render();
  },

  requestNotificationPermission() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      this.notificationPermission = true;
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        this.notificationPermission = perm === "granted";
      });
    }
  },

  sendNotification(title, body) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body: body,
          icon: "/favicon.ico",
          tag: "work-wellness",
          requireInteraction: true,
        });
      } catch(e) {
        console.warn("Notification failed:", e);
      }
    }
  },

  startTimers() {
    this.stopTimers();
    this.timer = setInterval(() => {
      this.state.activitySecondsLeft -= 1;
      this.state.waterSecondsLeft -= 1;

      if (this.state.activitySecondsLeft <= 0) {
        this.state.activitySecondsLeft = this.state.activityInterval * 60;
        this.state.dailyActivityCount += 1;
        this.sendNotification(
          "该起身活动了！",
          "已经连续工作一段时间了，站起来走一走，伸展一下身体吧！"
        );
        this.saveState();
      }

      if (this.state.waterSecondsLeft <= 0) {
        this.state.waterSecondsLeft = this.state.waterInterval * 60;
        this.state.dailyWaterCount += 1;
        this.sendNotification(
          "该喝水了！",
          "工作再忙也要记得补充水分，喝杯纯净水吧！"
        );
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

  render() {
    const s = this.state;
    const isActive = s.isWorking;

    // Toggle button
    const toggle = document.getElementById("masterToggle");
    toggle.className = "master-toggle" + (isActive ? " active" : "");
    toggle.querySelector(".toggle-icon").textContent = isActive ? "⏸" : "▶";

    // Status text
    const status = document.getElementById("statusText");
    status.textContent = isActive ? "工作中" : "已暂停";
    status.className = "status-text" + (isActive ? " active" : "");

    // Work duration
    document.getElementById("workDuration").textContent = this.getWorkDuration();

    // Timer countdowns
    document.getElementById("activityCountdown").textContent =
      isActive ? this.formatTime(s.activitySecondsLeft) : "--:--";
    document.getElementById("waterCountdown").textContent =
      isActive ? this.formatTime(s.waterSecondsLeft) : "--:--";

    // Timer card active states
    document.getElementById("activityCard").className =
      "timer-card" + (isActive ? " active" : "");
    document.getElementById("waterCard").className =
      "timer-card" + (isActive ? " active" : "");

    // Stats
    document.getElementById("activityCount").textContent = s.dailyActivityCount;
    document.getElementById("waterCount").textContent = s.dailyWaterCount;

        document.getElementById("activityIntervalLabel").textContent = "每 " + s.activityInterval + " 分钟";
    document.getElementById("waterIntervalLabel").textContent = "每 " + s.waterInterval + " 分钟";

    // Particle speed
    if (this.particles) {
      this.particles.setActive(isActive);
    }

    // Settings intervals
    document.getElementById("activityIntervalValue").textContent =
      s.activityInterval + " 分钟";
    document.getElementById("waterIntervalValue").textContent =
      s.waterInterval + " 分钟";
  },

  bindEvents() {
    document.getElementById("masterToggle").addEventListener("click", () => {
      this.toggleWorking();
    });

    document.getElementById("settingsBtn").addEventListener("click", () => {
      this.openSettings();
    });

    document.getElementById("settingsOverlay").addEventListener("click", () => {
      this.closeSettings();
    });

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
      this.closeSettings();
    });

    document.getElementById("syncConfig").addEventListener("click", () => {
      this.fetchRemoteConfig();
    });
  },

  openSettings() {
    document.getElementById("settingsOverlay").classList.add("open");
    document.getElementById("settingsPanel").classList.add("open");
    document.getElementById("activityIntervalSlider").value = this.state.activityInterval;
    document.getElementById("waterIntervalSlider").value = this.state.waterInterval;
    document.getElementById("configUrlInput").value = this.state.configUrl;
    this.render();
  },

  closeSettings() {
    document.getElementById("settingsOverlay").classList.remove("open");
    document.getElementById("settingsPanel").classList.remove("open");
  },

  async fetchRemoteConfig() {
    const url = document.getElementById("configUrlInput").value.trim();
    if (!url) return;
    this.state.configUrl = url;
    const btn = document.getElementById("syncConfig");
    btn.textContent = "同步中...";
    btn.disabled = true;

    try {
      const resp = await fetch(url, { cache: "no-cache" });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const config = await resp.json();

      if (config.activity_interval) {
        const val = parseInt(config.activity_interval);
        this.state.activityInterval = val;
        document.getElementById("activityIntervalSlider").value = val;
      }
      if (config.water_interval) {
        const val = parseInt(config.water_interval);
        this.state.waterInterval = val;
        document.getElementById("waterIntervalSlider").value = val;
      }
      if (config.primary_color) {
        document.documentElement.style.setProperty("--purple-600", config.primary_color);
      }
      if (config.particle_color) {
        document.documentElement.style.setProperty("--purple-500", config.particle_color);
      }
      if (config.activity_message || config.water_message) {
        // Store custom messages for future notifications
      }
      this.saveState();
      this.render();
      alert("远程配置已同步！");
    } catch (e) {
      alert("配置加载失败: " + e.message);
    } finally {
      btn.textContent = "同步远程配置";
      btn.disabled = false;
    }
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());

