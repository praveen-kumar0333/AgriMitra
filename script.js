document.addEventListener('DOMContentLoaded', () => {

    // --- Live Clock ---
    const clockTime = document.getElementById('clock-time');
    if (clockTime) {
        function updateClock() {
            const now = new Date();
            clockTime.innerText = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        setInterval(updateClock, 1000);
        updateClock(); // Initial call
    }

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => revealOnScroll.observe(el));

    // --- Animated Counters ---
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-target');
                let count = 0;
                const speed = 200; // lower is slower
                const inc = target / speed;

                const updateCount = () => {
                    count += inc;
                    if (count < target) {
                        entry.target.innerText = Math.ceil(count);
                        setTimeout(updateCount, 10);
                    } else {
                        entry.target.innerText = target;
                    }
                };
                updateCount();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // --- Image Preview ---
    const imageInput = document.getElementById('leafImage');
    const previewArea = document.getElementById('imagePreview');

    imageInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewArea.style.backgroundImage = `url(${e.target.result})`;
                previewArea.innerHTML = ''; // Clear text/icon
                previewArea.style.border = 'none';
            }
            reader.readAsDataURL(file);
        }
    });

    // --- Agent Simulation Logic ---
    const form = document.getElementById('ai-form');
    const resultsPanel = document.getElementById('results-panel');
    const simBox = document.getElementById('simulation-box');
    const simStepsContainer = document.getElementById('sim-steps');
    const finalDashboard = document.getElementById('final-dashboard');

    const agents = [
        { name: "Manager Agent", desc: "Initializing workflow and analyzing input...", icon: "fa-sitemap" },
        { name: "Weather Agent", desc: "Checking hyperlocal climate & risk factors...", icon: "fa-cloud-sun-rain" },
        { name: "Crop Agent", desc: "Evaluating soil compatibility & season...", icon: "fa-seedling" },
        { name: "Disease Agent", desc: "Scanning imagery & symptom NLP...", icon: "fa-microscope" },
        { name: "Remedy Agent", desc: "Synthesizing organic & chemical treatments...", icon: "fa-flask" },
        { name: "Market Agent", desc: "Fetching APMC mandis real-time prices...", icon: "fa-chart-line" },
        { name: "Store Agent", desc: "Geolocating nearest agri-input vendors...", icon: "fa-map-location-dot" },
        { name: "Finance Agent", desc: "Checking eligible govt subsidies...", icon: "fa-coins" }
    ];

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Task 4: Geolocation Permission
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    window.userLat = position.coords.latitude;
                    window.userLon = position.coords.longitude;
                },
                (err) => {
                    console.log("Geolocation denied or error", err);
                }
            );
        }

        // Hide dashboard if open, show panel
        finalDashboard.style.display = 'none';
        resultsPanel.style.display = 'block';
        simBox.style.display = 'block';
        simStepsContainer.innerHTML = '';

        // Scroll to results
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Helper for translation
        const lang = document.getElementById('language-selector') ? document.getElementById('language-selector').value : 'en';
        const t = (enStr) => {
            if (lang === 'en') return enStr;
            const entry = window.appDictionary.find(d => d.en === enStr);
            return entry && entry[lang] ? entry[lang] : enStr;
        };

        // Build Steps HTML
        agents.forEach((agent, index) => {
            const stepHtml = `
                <div class="sim-step" id="step-${index}">
                    <div class="step-icon"><i class="fa-solid ${agent.icon}"></i></div>
                    <div style="flex-grow: 1">
                        <div style="font-size: 0.85rem; color: var(--primary); font-weight: bold;">${t(agent.name)}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${t(agent.desc)}</div>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" id="fill-${index}"></div></div>
                    <div style="font-size: 0.75rem" id="status-${index}">${t("Wait")}</div>
                </div>
            `;
            simStepsContainer.insertAdjacentHTML('beforeend', stepHtml);
        });

        // Run Sequence
        let currentStep = 0;

        function runNextStep() {
            if (currentStep >= agents.length) {
                setTimeout(() => {
                    simBox.style.display = 'none';
                    generateFinalReport();
                }, 500);
                return;
            }

            const stepEl = document.getElementById(`step-${currentStep}`);
            const fillEl = document.getElementById(`fill-${currentStep}`);
            const statusEl = document.getElementById(`status-${currentStep}`);
            const lang = document.getElementById('language-selector') ? document.getElementById('language-selector').value : 'en';
            const t = (enStr) => {
                if (lang === 'en') return enStr;
                const entry = window.appDictionary.find(d => d.en === enStr);
                return entry && entry[lang] ? entry[lang] : enStr;
            };

            stepEl.classList.add('active');
            statusEl.innerText = t('Running...');

            // Animate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 20) + 10;
                if (progress > 100) progress = 100;
                fillEl.style.width = progress + '%';

                if (progress === 100) {
                    clearInterval(interval);
                    statusEl.innerText = t("Done");
                    statusEl.style.color = '#22c55e';
                    stepEl.classList.remove('active');
                    stepEl.classList.add('done');
                    currentStep++;
                    runNextStep();
                }
            }, 100);
        }

        // Start sequence
        setTimeout(runNextStep, 500);
    });

    function generateFinalReport() {
        const crop = document.getElementById('cropName').value.toLowerCase();
        const symptoms = document.getElementById('symptoms').value.toLowerCase();
        const location = document.getElementById('location').value;

        // Logic routing based on inputs (Mock logic for hackathon)
        let disease = "Healthy / Unknown";
        let confidence = "N/A";
        let severity = "Low";
        let cause = "N/A";
        let organic = "Maintain regular watering and monitor.";
        let chemical = "None required.";
        let prevent = "Good agricultural practices.";
        let waterAdvice = "Normal irrigation.";
        let recovery = "N/A";

        if (crop.includes('tomato') && symptoms.includes('yellow') || crop.includes('tomato')) {
            disease = "Early Blight (Alternaria solani)";
            confidence = "94%";
            severity = "High";
            cause = "Fungal infection from soil or infected seeds, thrives in high humidity.";
            organic = "Neem oil spray (5ml/L). Prune infected leaves. Apply Trichoderma to soil.";
            chemical = "Mancozeb 75% WP (2g/L) or Copper Oxychloride spray.";
            prevent = "Crop rotation, wide spacing, avoid overhead watering.";
            waterAdvice = "Drip irrigation recommended. Do not wet leaves.";
            recovery = "7-14 Days";
        } else if (crop.includes('rice') && symptoms.includes('yellow') || crop.includes('rice')) {
            disease = "Bacterial Leaf Blight";
            confidence = "91%";
            severity = "High";
            cause = "Xanthomonas oryzae bacteria, spreads rapidly via water and wind.";
            organic = "Spray fresh cow dung extract (20%). Avoid excess nitrogen.";
            chemical = "Streptocycline (1g/10L) + Copper Oxychloride (30g/10L).";
            prevent = "Use resistant varieties, proper field drainage.";
            waterAdvice = "Drain the field immediately for 3-4 days.";
            recovery = "10-15 Days";
        } else if (crop.includes('cotton') && symptoms.includes('white') || crop.includes('cotton')) {
            disease = "Whitefly Attack";
            confidence = "88%";
            severity = "Medium";
            cause = "Sap-sucking insects that transmit leaf curl virus.";
            organic = "Yellow sticky traps (10/acre). Neem Seed Kernel Extract (5%).";
            chemical = "Diafenthiuron 50% WP (1.2g/L) or Imidacloprid.";
            prevent = "Remove weed hosts, maintain clean borders.";
            waterAdvice = "Maintain adequate moisture to reduce plant stress.";
            recovery = "5-10 Days";
        } else if (crop.includes('chili') && symptoms.includes('curl') || crop.includes('chili')) {
            disease = "Leaf Curl Virus";
            confidence = "96%";
            severity = "High";
            cause = "Virus transmitted by thrips and whiteflies.";
            organic = "Uproot and burn infected plants. Spray sour buttermilk (5%).";
            chemical = "Control vectors with Fipronil 5% SC (2ml/L).";
            prevent = "Use nylon net covers in nursery. Seed treatment.";
            waterAdvice = "Standard irrigation, avoid waterlogging.";
            recovery = "Non-recoverable (Manage spread)";
        } else if (symptoms.length > 3) {
            disease = "Fungal Infection (Generic)";
            confidence = "75%";
            severity = "Medium";
            cause = "Excess moisture and poor ventilation.";
            organic = "Baking soda spray (1 tsp/gal). Improve air flow.";
            chemical = "Broad-spectrum fungicide spray.";
            prevent = "Proper spacing and soil health.";
            waterAdvice = "Reduce watering frequency.";
            recovery = "1-2 Weeks";
        }

        // Get current language to translate output dynamically
        const lang = document.getElementById('language-selector') ? document.getElementById('language-selector').value : 'en';

        // Helper to translate strings if dictionary exists
        const t = (str) => {
            if (typeof window.appDictionary !== 'undefined') {
                const entry = window.appDictionary.find(d => d.en === str);
                if (entry && entry[lang]) return entry[lang];
            }
            return str;
        };

        // Update DOM elements

        // Disease
        let severityColor = severity === 'High' ? 'severity-high' : (severity === 'Medium' ? 'severity-medium' : 'severity-low');
        document.getElementById('disease-result').innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem">${t(disease)}</div>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.8rem">
                <strong>${t('Cause')}:</strong> ${t(cause)}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem">
                <span>${t('Confidence')}: <span style="color: var(--primary)">${confidence}</span></span>
                <span>${t('Severity')}: <span class="${severityColor}">${t(severity).toUpperCase()}</span></span>
            </div>
        `;

        // Remedy
        const remedyHtml = `
            <div class="chatgpt-style-remedy" style="background: rgba(15, 23, 42, 0.4); padding: 1rem; border-radius: 8px; border: 1px solid var(--glass-border);">
                <p style="color: var(--primary); font-weight: bold; margin-bottom: 0.5rem"><i class="fa-solid fa-leaf"></i> ${t('Step 1: Organic & Immediate Action')}</p>
                <ul style="margin-bottom: 1rem; padding-left: 1.2rem; font-size: 0.9rem; color: var(--text-main);">
                    <li>${t(organic)}</li>
                </ul>
                
                <p style="color: #3b82f6; font-weight: bold; margin-bottom: 0.5rem"><i class="fa-solid fa-flask"></i> ${t('Step 2: Chemical Treatment')}</p>
                <ul style="margin-bottom: 1rem; padding-left: 1.2rem; font-size: 0.9rem; color: var(--text-main);">
                    <li>${t(chemical)}</li>
                </ul>
                
                <p style="color: #f59e0b; font-weight: bold; margin-bottom: 0.5rem"><i class="fa-solid fa-shield-halved"></i> ${t('Step 3: Future Prevention')}</p>
                <ul style="margin-bottom: 1rem; padding-left: 1.2rem; font-size: 0.9rem; color: var(--text-main);">
                    <li>${t(prevent)}</li>
                    <li>${t(waterAdvice)}</li>
                </ul>
                
                <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px dashed var(--glass-border); font-size: 0.85rem; color: #8b5cf6;">
                    <i class="fa-solid fa-clock"></i> <strong>${t('Recovery Time')}:</strong> ${t(recovery)}
                </div>
            </div>
        `;

        const remedyContainer = document.getElementById('remedy-result');
        remedyContainer.innerHTML = remedyHtml;

        // ChatGPT Typewriter Effect using TreeWalker
        const textNodes = [];
        const walker = document.createTreeWalker(remedyContainer, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue.trim().length > 0) {
                textNodes.push({
                    node: node,
                    originalText: node.nodeValue
                });
                node.nodeValue = ''; // Clear text initially
            }
        }

        let nodeIndex = 0;
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (nodeIndex >= textNodes.length) {
                clearInterval(typeInterval);
                return;
            }

            const currentObj = textNodes[nodeIndex];
            currentObj.node.nodeValue = currentObj.originalText.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex >= currentObj.originalText.length) {
                nodeIndex++;
                charIndex = 0;
            }
        }, 15);

        // Markets
        document.getElementById('market-result').innerHTML = `
            <div class="market-item"><span>${t('Local APMC')}</span> <span>₹2,400 / Qtl</span></div>
            <div class="market-item"><span>${t('District Market')}</span> <span>₹2,550 / Qtl</span></div>
            <div class="market-item best-price"><span>${t('State Hub (Best)')}</span> <span>₹2,800 / Qtl <i class="fa-solid fa-arrow-trend-up"></i></span></div>
        `;

        // Stores
        const lat = window.userLat || 20.5937;
        const lon = window.userLon || 78.9629;
        const mapsLink1 = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=Green+Agro+Center`;
        const mapsLink2 = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=Krushi+Seva+Kendra`;

        document.getElementById('store-result').innerHTML = `
            <div class="store-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem">
                <div><strong>${t('Green Agro Center')}</strong><br><span style="font-size:0.75rem; color:var(--text-muted)">${t('Fertilizer & Seeds')} • ${window.userLat ? '1.2 km' : '2.4 km'}</span></div>
                <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end;">
                    <span style="color:var(--primary); font-size:0.75rem; margin-bottom:0.2rem;">${t('Open Now')}</span>
                    <a href="${mapsLink1}" target="_blank" class="btn-icon" style="padding: 0.3rem 0.5rem; font-size: 0.8rem; background: var(--glass-bg); border-radius: 4px; text-decoration: none; color: white;"><i class="fa-solid fa-location-arrow"></i> ${t('Dir')}</a>
                </div>
            </div>
            <div class="store-item" style="display:flex; justify-content:space-between; align-items:center;">
                <div><strong>${t('Krushi Seva Kendra')}</strong><br><span style="font-size:0.75rem; color:var(--text-muted)">${t('Pesticides')} • ${window.userLat ? '3.5 km' : '5.1 km'}</span></div>
                <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end;">
                    <span style="color:var(--primary); font-size:0.75rem; margin-bottom:0.2rem;">${t('Open Now')}</span>
                    <a href="${mapsLink2}" target="_blank" class="btn-icon" style="padding: 0.3rem 0.5rem; font-size: 0.8rem; background: var(--glass-bg); border-radius: 4px; text-decoration: none; color: white;"><i class="fa-solid fa-location-arrow"></i> ${t('Dir')}</a>
                </div>
            </div>
        `;

        // Action Plan Roadmap
        const onlineLink = `https://www.bighaat.com/search?q=${encodeURIComponent(t(chemical))}`;
        document.getElementById('roadmap-result').innerHTML = `
            <div style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 0.8rem">
                <strong>1. ${t('Local Purchase')}:</strong> ${t('Visit')} <em>${t('Green Agro Center')}</em> ${t('and ask for')} <strong>${t(chemical)}</strong>.
            </div>
            <div style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 0.8rem">
                <strong>2. ${t('Online Delivery')}:</strong> ${t('If unavailable locally, you can order it online to your farm.')}
                <div style="margin-top: 0.5rem">
                    <a href="${onlineLink}" target="_blank" class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; text-decoration: none;"><i class="fa-solid fa-cart-shopping"></i> ${t('Buy on BigHaat')}</a>
                </div>
            </div>
        `;

        // Weather
        document.getElementById('weather-result').innerHTML = `
            <div style="display:flex; align-items:center; gap: 1rem; margin-top: 0.5rem">
                <i class="fa-solid fa-cloud-showers-heavy" style="font-size: 2rem; color: #3b82f6"></i>
                <div>
                    <strong>${t('Light Rain Expected')}</strong><br>
                    <span style="font-size: 0.8rem; color: var(--text-muted)">${t('Next 48 hours. Delay chemical spraying.')}</span>
                </div>
            </div>
        `;

        // Show Dashboard
        document.getElementById('final-dashboard').style.display = 'block';
    }

    // --- Voice Feature ---
    document.getElementById('btn-speak').addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            const crop = document.getElementById('cropName').value || 'crop';
            const diseaseResult = document.getElementById('disease-result').innerText;
            const textToSpeak = `Agri Mitra AI Report for your ${crop}. Analysis complete. ${diseaseResult}. Please check the treatment plan for organic and chemical remedies.`;

            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Speech synthesis not supported in this browser.");
        }
    });

    // --- Download Report ---
    document.getElementById('btn-download').addEventListener('click', () => {
        const farmerName = document.getElementById('farmerName').value || 'Farmer';
        const crop = document.getElementById('cropName').value || 'Crop';
        const disease = document.getElementById('disease-result').innerText.split('\n')[0];

        const reportContent = `
========================================
       AGRIMITRA AI PRO REPORT
========================================
Date: ${new Date().toLocaleDateString()}
Farmer: ${farmerName}
Crop: ${crop}

--- DIAGNOSIS ---
${disease}

--- TREATMENT PLAN ---
Organic: Neem oil spray, remove infected leaves.
Chemical: Copper Oxychloride spray in evening.
Prevention: Ensure proper field drainage.

--- MARKET INSIGHTS ---
Best Price found at State Hub.

========================================
Generated by Autonomous Multi-Agent System
========================================
        `;

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AgriMitra_Report_${farmerName.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // --- Chatbot Logic ---
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');
    const sendChat = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');

    chatToggle.addEventListener('click', () => {
        chatWindow.classList.add('open');
        chatToggle.style.display = 'none';
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('open');
        setTimeout(() => chatToggle.style.display = 'block', 300);
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.innerText = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function handleChat() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';

        // Simple mock responses
        setTimeout(() => {
            const lowerText = text.toLowerCase();
            let reply = "I am processing your query through my agronomy database...";

            if (lowerText.includes('summer')) reply = "For summer (Zaid season), Watermelon, Cucumber, and Moong Dal are highly profitable depending on your water availability.";
            else if (lowerText.includes('pest') || lowerText.includes('insect')) reply = "For general pest control, Neem Oil (10000 ppm) spray is a great organic start. For severe attacks, identify the exact insect for specific chemical advice.";
            else if (lowerText.includes('spray') || lowerText.includes('time')) reply = "Always spray chemicals early morning or late evening. Never spray under intense midday sun or if rain is expected within 4 hours.";
            else if (lowerText.includes('hello') || lowerText.includes('hi')) reply = "Namaste! How can I help you improve your farm yield today?";

            addMessage(reply, 'bot');
        }, 800);
    }

    sendChat.addEventListener('click', handleChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });

    // Expose to window for chip clicks
    window.askBot = function (q) {
        chatInput.value = q;
        handleChat();
    };

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuBtn.addEventListener('click', () => {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'rgba(15, 23, 42, 0.95)';
            navLinks.style.padding = '1rem 0';

            const links = navLinks.querySelectorAll('a');
            links.forEach(l => {
                l.style.margin = '1rem 0';
                l.style.textAlign = 'center';
            });
        }
    });

});

// --- TRANSLATION SYSTEM ---
window.appDictionary = [
    { en: "Home", kn: "ಮುಖಪುಟ", hi: "होम", mr: "मुख्यपृष्ठ", te: "హోమ్" },
    { en: "Features", kn: "ವೈಶಿಷ್ಟ್ಯಗಳು", hi: "विशेषताएं", mr: "वैशिष्ट्ये", te: "ఫీచర్లు" },
    { en: "Architecture", kn: "ವಾಸ್ತುಶಿಲ್ಪ", hi: "संरचना", mr: "रचना", te: "నిర్మాణం" },
    { en: "Live Demo", kn: "ಲೈವ್ ಡೆಮೊ", hi: "लाइव डेमो", mr: "थेट प्रात्यक्षिक", te: "లైవ్ డెమో" },
    { en: "AgriMitra AI Pro", kn: "ಅಗ್ರಿಮಿತ್ರ ಎಐ ಪ್ರೊ", hi: "एग्रीमित्रा एआई प्रो", mr: "अ‍ॅग्रीमित्रा एआय प्रो", te: "అగ్రిమిత్ర ఏఐ ప్రో" },
    { en: "Solving Real Farming Problems", kn: "ನೈಜ ಕೃಷಿ ಸಮಸ್ಯೆಗಳನ್ನು ಪರಿಹರಿಸುವುದು", hi: "वास्तविक कृषि समस्याओं का समाधान", mr: "वास्तविक शेती समस्या सोडवणे", te: "నిజమైన వ్యవసాయ సమస్యలను పరిష్కరించడం" },
    { en: "Upload Plant/Leaf Image or Use Camera", kn: "ಸಸ್ಯ/ಎಲೆ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಕ್ಯಾಮೆರಾ ಬಳಸಿ", hi: "पौधे/पत्ती की छवि अपलोड करें या कैमरा का उपयोग करें", mr: "वनस्पती/पानाची प्रतिमा अपलोड करा किंवा कॅमेरा वापरा", te: "మొక్క/ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి లేదా కెమెరాను ఉపయోగించండి" },
    { en: "Click to upload or drag & drop", kn: "ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ", hi: "अपलोड करने के लिए क्लिक करें", mr: "अपलोड करण्यासाठी क्लिक करा", te: "అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి" },
    { en: "Open Camera", kn: "ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ", hi: "कैमरा खोलें", mr: "कॅमेरा उघडा", te: "కెమెరా తెరవండి" },
    { en: "Live Plant Scanner", kn: "ಲೈವ್ ಸಸ್ಯ ಸ್ಕ್ಯಾನರ್", hi: "लाइव प्लांट स्कैनर", mr: "थेट वनस्पती स्कॅनर", te: "లైవ్ ప్లాంట్ స్కానర్" },
    { en: "Capture", kn: "ಸೆರೆಹಿಡಿಯಿರಿ", hi: "खींचें", mr: "काढा", te: "తీయండి" },
    { en: "Retake", kn: "ಮತ್ತೆ ತೆಗೆಯಿರಿ", hi: "फिर से लें", mr: "पुन्हा घ्या", te: "మళ్ళీ తీయండి" },
    { en: "Use Photo", kn: "ಫೋಟೋ ಬಳಸಿ", hi: "फोटो का उपयोग करें", mr: "फोटो वापरा", te: "ఫోటో ఉపయోగించండి" },
    // Output translations
    { en: "Cause", kn: "ಕಾರಣ", hi: "कारण", mr: "कारण", te: "కారణం" },
    { en: "Confidence", kn: "ವಿಶ್ವಾಸ", hi: "विश्वास", mr: "आत्मविश्वास", te: "విశ్వాసం" },
    { en: "Severity", kn: "ತೀವ್ರತೆ", hi: "गंभीरता", mr: "तीव्रता", te: "తీవ్రత" },
    { en: "High", kn: "ಹೆಚ್ಚು", hi: "उच्च", mr: "जास्त", te: "ఎక్కువ" },
    { en: "Medium", kn: "ಮಧ್ಯಮ", hi: "मध्यम", mr: "मध्यम", te: "మధ్యస్థం" },
    { en: "Low", kn: "ಕಡಿಮೆ", hi: "कम", mr: "कमी", te: "తక్కువ" },
    { en: "Organic", kn: "ಸಾವಯವ", hi: "जैविक", mr: "सेंद्रिय", te: "సేంద్రీయ" },
    { en: "Chemical", kn: "ರಾಸಾಯನಿಕ", hi: "रासायनिक", mr: "रासायनिक", te: "రసాయన" },
    { en: "Prevent", kn: "ತಡೆಗಟ್ಟಿ", hi: "रोकथाम", mr: "प्रतिबंध", te: "నివారణ" },
    { en: "Water Advice", kn: "ನೀರಿನ ಸಲಹೆ", hi: "सिंचाई सलाह", mr: "पाण्याचा सल्ला", te: "నీటి సలహా" },
    { en: "Recovery Time", kn: "ಚೇತರಿಕೆ ಸಮಯ", hi: "ठीक होने का समय", mr: "बरे होण्याचा वेळ", te: "కోలుకునే సమయం" },
    { en: "Local APMC", kn: "ಸ್ಥಳೀಯ ಎಪಿಎಂಸಿ", hi: "स्थानीय एपीएमसी", mr: "स्थानिक एपीएमसी", te: "స్థానిక APMC" },
    { en: "District Market", kn: "ಜಿಲ್ಲಾ ಮಾರುಕಟ್ಟೆ", hi: "जिला बाजार", mr: "जिल्हा बाजार", te: "జిల్లా మార్కెట్" },
    { en: "State Hub (Best)", kn: "ರಾಜ್ಯ ಹಬ್ (ಅತ್ಯುತ್ತಮ)", hi: "राज्य हब (सर्वश्रेष्ठ)", mr: "राज्य हब (सर्वोत्तम)", te: "స్టేట్ హబ్ (ఉత్తమం)" },
    { en: "Green Agro Center", kn: "ಗ್ರೀನ್ ಆಗ್ರೋ ಸೆಂಟರ್", hi: "ग्रीन एग्रो सेंटर", mr: "ग्रीन अॅग्रो सेंटर", te: "గ్రీన్ ఆగ్రో సెంటర్" },
    { en: "Fertilizer & Seeds", kn: "ರಸಗೊಬ್ಬರ ಮತ್ತು ಬೀಜಗಳು", hi: "उर्वरक और बीज", mr: "खते आणि बियाणे", te: "ఎరువులు & విత్తనాలు" },
    { en: "Open Now", kn: "ಈಗ ತೆರೆದಿದೆ", hi: "अभी खुला है", mr: "आता उघडे आहे", te: "ఇప్పుడు తెరిచి ఉంది" },
    { en: "Krushi Seva Kendra", kn: "ಕೃಷಿ ಸೇವಾ ಕೇಂದ್ರ", hi: "कृषि सेवा केंद्र", mr: "कृषी सेवा केंद्र", te: "కృషి సేవా కేంద్రం" },
    { en: "Pesticides", kn: "ಕೀಟನಾಶಕಗಳು", hi: "कीटनाशक", mr: "कीटकनाशके", te: "పురుగుల మందులు" },
    { en: "PM-Kisan Samman", kn: "ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್", hi: "पीएम-किसान सम्मान", mr: "पीएम-किसान सन्मान", te: "పీఎం-కిసాన్ సమ్మాన్" },
    { en: "Fasal Bima Yojana", kn: "ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ", hi: "फसल बीमा योजना", mr: "पीक विमा योजना", te: "ఫసల్ బీమా యోజన" },
    { en: "Fertilizer Subsidy", kn: "ರಸಗೊಬ್ಬರ ಸಬ್ಸಿಡಿ", hi: "उर्वरक सब्सिडी", mr: "खत अनुदान", te: "ఎరువుల సబ్సిడీ" },
    { en: "Light Rain Expected", kn: "ಹಗುರವಾದ ಮಳೆ ನಿರೀಕ್ಷೆ", hi: "हल्की बारिश की उम्मीद", mr: "हलक्या पावसाची शक्यता", te: "తేలికపాటి వర్షం ఆశించబడుతుంది" },
    { en: "Next 48 hours. Delay chemical spraying.", kn: "ಮುಂದಿನ 48 ಗಂಟೆ. ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆ ವಿಳಂಬಗೊಳಿಸಿ.", hi: "अगले 48 घंटे। रासायनिक छिड़काव में देरी करें।", mr: "पुढील ४८ तास. रासायनिक फवारणी टाळा.", te: "తదుపరి 48 గంటలు. రసాయన పిచికారీని ఆలస్యం చేయండి." },
    // Diseases & specific terms
    { en: "Early Blight (Alternaria solani)", kn: "ಆರಂಭಿಕ ರೋಗ (Early Blight)", hi: "प्रारंभिक झुलसा (Early Blight)", mr: "लवकर करपा", te: "ప్రారంభ ముడత" },
    { en: "Fungal infection from soil or infected seeds, thrives in high humidity.", kn: "ಶಿಲೀಂಧ್ರ ಸೋಂಕು", hi: "फंगल संक्रमण", mr: "बुरशीजन्य संसर्ग", te: "ఫంగల్ ఇన్ఫెక్షన్" },
    { en: "Neem oil spray (5ml/L). Prune infected leaves. Apply Trichoderma to soil.", kn: "ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.", hi: "नीम के तेल का छिड़काव करें।", mr: "कडुलिंबाच्या तेलाची फवारणी करा.", te: "వేప నూనె పిచికారీ చేయండి." },
    { en: "Mancozeb 75% WP (2g/L) or Copper Oxychloride spray.", kn: "ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆ", hi: "रासायनिक छिड़काव", mr: "रासायनिक फवारणी", te: "రసాయన పిచికారీ" },
    { en: "Crop rotation, wide spacing, avoid overhead watering.", kn: "ಬೆಳೆ ತಿರುಗುವಿಕೆ", hi: "फसल चक्र", mr: "पीक फेरपालट", te: "పంట మార్పిడి" },
    { en: "Drip irrigation recommended. Do not wet leaves.", kn: "ಹನಿ ನೀರಾವರಿ", hi: "ड्रिप सिंचाई", mr: "ठिबक सिंचन", te: "బిందు సేద్యం" },
    { en: "7-14 Days", kn: "7-14 ದಿನಗಳು", hi: "7-14 दिन", mr: "7-14 दिवस", te: "7-14 రోజులు" },
    { en: "Bacterial Leaf Blight", kn: "ಬ್ಯಾಕ್ಟೀರಿಯಲ್ ಎಲೆ ರೋಗ", hi: "बैक्टीरियल लीफ ब्लाइट", mr: "जिवाणूजन्य करपा", te: "బ్యాక్టీరియల్ ఆకు ముడత" },
    { en: "Xanthomonas oryzae bacteria, spreads rapidly via water and wind.", kn: "ಬ್ಯಾಕ್ಟೀರಿಯಾ ಸೋಂಕು", hi: "बैक्टीरिया संक्रमण", mr: "जिवाणू संसर्ग", te: "బ్యాక్టీరియా ఇన్ఫెక్షన్" },
    { en: "Spray fresh cow dung extract (20%). Avoid excess nitrogen.", kn: "ಹಸುವಿನ ಸಗಣಿ ಸಾರ", hi: "गाय के गोबर का अर्क", mr: "गाईच्या शेणाचा अर्क", te: "ఆవు పేడ సారం" },
    { en: "Streptocycline (1g/10L) + Copper Oxychloride (30g/10L).", kn: "ಸ್ಟ್ರೆಪ್ಟೊಸೈಕ್ಲಿನ್", hi: "स्ट्रेप्टोसाइक्लिन", mr: "स्ट्रेप्टोसायक्लिन", te: "స్ట్రెప్టోసైక్లిన్" },
    { en: "Use resistant varieties, proper field drainage.", kn: "ನಿರೋಧಕ ತಳಿಗಳು", hi: "प्रतिरोधी किस्में", mr: "प्रतिरोधक वाण", te: "నిరోధక రకాలు" },
    { en: "Drain the field immediately for 3-4 days.", kn: "ನೀರು ಹರಿಸುವುದು", hi: "पानी निकाल दें", mr: "पाणी काढून टाका", te: "నీరు తీసివేయండి" },
    { en: "10-15 Days", kn: "10-15 ದಿನಗಳು", hi: "10-15 दिन", mr: "10-15 दिवस", te: "10-15 రోజులు" },
    { en: "Whitefly Attack", kn: "ಬಿಳಿ ನೊಣ ದಾಳಿ", hi: "सफेद मक्खी का हमला", mr: "पांढरी माशीचा हल्ला", te: "తెల్ల దోమ దాడి" },
    { en: "Sap-sucking insects that transmit leaf curl virus.", kn: "ರಸ ಹೀರುವ ಕೀಟಗಳು", hi: "रस चूसने वाले कीड़े", mr: "रस शोषक कीटक", te: "రసం పీల్చే పురుగులు" },
    { en: "Yellow sticky traps (10/acre). Neem Seed Kernel Extract (5%).", kn: "ಹಳದಿ ಬಲೆಗಳು", hi: "पीले चिपचिपे जाल", mr: "पिवळे चिकट सापळे", te: "పసుపు జిగురు వలలు" },
    { en: "Diafenthiuron 50% WP (1.2g/L) or Imidacloprid.", kn: "ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್", hi: "इमिडाक्लोप्रिड", mr: "इमिडाक्लोप्रिड", te: "ఇమిడాక్లోప్రిడ్" },
    { en: "Remove weed hosts, maintain clean borders.", kn: "ಕಳೆ ತೆಗೆಯಿರಿ", hi: "खरपतवार हटाएँ", mr: "तण काढा", te: "కలుపు తీయండి" },
    { en: "Maintain adequate moisture to reduce plant stress.", kn: "ತೇವಾಂಶ ಕಾಪಾಡಿ", hi: "नमी बनाए रखें", mr: "ओलावा टिकवून ठेवा", te: "తేమను నిర్వహించండి" },
    { en: "5-10 Days", kn: "5-10 ದಿನಗಳು", hi: "5-10 दिन", mr: "5-10 दिवस", te: "5-10 రోజులు" },
    { en: "Leaf Curl Virus", kn: "ಎಲೆ ಮುದುರುವಿಕೆ ವೈರಸ್", hi: "लीफ कर्ल वायरस", mr: "पाने गुंडाळणारा विषाणू", te: "ఆకు ముడత వైరస్" },
    { en: "Virus transmitted by thrips and whiteflies.", kn: "ವೈರಸ್ ಸೋಂಕು", hi: "वायरस संक्रमण", mr: "विषाणू संसर्ग", te: "వైరస్ ఇన్ఫెక్షన్" },
    { en: "Uproot and burn infected plants. Spray sour buttermilk (5%).", kn: "ರೋಗಗ್ರಸ್ತ ಸಸ್ಯ ಸುಟ್ಟುಹಾಕಿ", hi: "संक्रमित पौधों को जला दें", mr: "रोगग्रस्त झाडे जाळून टाका", te: "వ్యాధిగ్రస్తులైన మొక్కలను కాల్చండి" },
    { en: "Control vectors with Fipronil 5% SC (2ml/L).", kn: "ಫಿಪ್ರೊನಿಲ್", hi: "फिप्रोनिल", mr: "फिप्रोनिल", te: "ఫిప్రోనిల్" },
    { en: "Use nylon net covers in nursery. Seed treatment.", kn: "ಬೀಜೋಪಚಾರ", hi: "बीज उपचार", mr: "बीज प्रक्रिया", te: "విత్తన శుద్ధి" },
    { en: "Standard irrigation, avoid waterlogging.", kn: "ಪ್ರಮಾಣಿತ ನೀರಾವರಿ", hi: "मानक सिंचाई", mr: "प्रमाणित सिंचन", te: "ప్రామాణిక నీటిపారుదల" },
    { en: "Non-recoverable (Manage spread)", kn: "ಚೇತರಿಸಲಾಗದು", hi: "ठीक नहीं हो सकता", mr: "बरे होऊ शकत नाही", te: "కోలుకోలేనిది" },
    { en: "Fungal Infection (Generic)", kn: "ಶಿಲೀಂಧ್ರ ಸೋಂಕು (ಸಾಮಾನ್ಯ)", hi: "फंगल संक्रमण (सामान्य)", mr: "बुरशीजन्य संसर्ग (सामान्य)", te: "ఫంగల్ ఇన్ఫెక్షన్ (సాధారణ)" },
    { en: "Excess moisture and poor ventilation.", kn: "ಹೆಚ್ಚು ತೇವಾಂಶ", hi: "अधिक नमी", mr: "अतिरिक्त ओलावा", te: "అధిక తేమ" },
    { en: "Baking soda spray (1 tsp/gal). Improve air flow.", kn: "ಬೇಕಿಂಗ್ ಸೋಡಾ ಸಿಂಪಡಿಸಿ", hi: "बेकिंग सोडा का छिड़काव", mr: "बेकिंग सोडा फवारणी", te: "బేకింగ్ సోడా పిచికారీ" },
    { en: "Broad-spectrum fungicide spray.", kn: "ಶಿಲೀಂಧ್ರನಾಶಕ", hi: "फफूंदनाशक", mr: "बुरशीनाशक", te: "శిలీంద్ర సంహారిణి" },
    { en: "Proper spacing and soil health.", kn: "ಸೂಕ್ತ ಅಂತರ", hi: "उचित दूरी", mr: "योग्य अंतर", te: "సరైన దూరం" },
    { en: "Reduce watering frequency.", kn: "ನೀರು ಕಡಿಮೆ ಮಾಡಿ", hi: "पानी कम दें", mr: "पाणी कमी द्या", te: "నీరు తగ్గించండి" },
    { en: "1-2 Weeks", kn: "1-2 ವಾರಗಳು", hi: "1-2 सप्ताह", mr: "1-2 आठवडे", te: "1-2 వారాలు" },
    // Form Inputs & Options
    { en: "Black Soil", kn: "ಕಪ್ಪು ಮಣ್ಣು", hi: "काली मिट्टी", mr: "काळी माती", te: "నల్ల నేల" },
    { en: "Red Soil", kn: "ಕೆಂಪು ಮಣ್ಣು", hi: "लाल मिट्टी", mr: "लाल माती", te: "ఎర్ర నేల" },
    { en: "Alluvial Soil", kn: "ಮೆಕ್ಕಲು ಮಣ್ಣು", hi: "जलोढ़ मिट्टी", mr: "गाळाची माती", te: "ఒండ్రు నేల" },
    { en: "Clay Soil", kn: "ಜೇಡಿಮಣ್ಣು", hi: "चिकनी मिट्टी", mr: "चिकणमाती", te: "బంకమట్టి నేల" },
    { en: "Kharif (Monsoon)", kn: "ಖಾರಿಫ್ (ಮುಂಗಾರು)", hi: "खरीफ (मानसून)", mr: "खरीप (पावसाळा)", te: "ఖరీఫ్ (రుతుపవనాలు)" },
    { en: "Rabi (Winter)", kn: "ರಬಿ (ಚಳಿಗಾಲ)", hi: "रबी (सर्दी)", mr: "रब्बी (हिवाळा)", te: "రబీ (చలికాలం)" },
    { en: "Zaid (Summer)", kn: "ಜೈದ್ (ಬೇಸಿಗೆ)", hi: "ज़ैद (गर्मी)", mr: "उन्हाळी (उन्हाळा)", te: "జైద్ (వేసవి)" },
    { en: "Max Profit", kn: "ಗರಿಷ್ಠ ಲಾಭ", hi: "अधिकतम लाभ", mr: "जास्तीत जास्त नफा", te: "గరిష్ట లాభం" },
    { en: "Safety First", kn: "ಮೊದಲು ಸುರಕ್ಷತೆ", hi: "सुरक्षा पहले", mr: "प्रथम सुरक्षा", te: "భద్రత ముఖ్యం" },
    { en: "Fast Growth", kn: "ವೇಗದ ಬೆಳವಣಿಗೆ", hi: "तेज विकास", mr: "जलद वाढ", te: "వేగవంతమైన పెరుగుదల" },
    { en: "Farmer Name", kn: "ರೈತನ ಹೆಸರು", hi: "किसान का नाम", mr: "शेतकऱ्याचे नाव", te: "రైతు పేరు" },
    { en: "State & District", kn: "ರಾಜ್ಯ ಮತ್ತು ಜಿಲ್ಲೆ", hi: "राज्य और जिला", mr: "राज्य आणि जिल्हा", te: "రాష్ట్రం & జిల్లా" },
    { en: "Soil Type", kn: "ಮಣ್ಣಿನ ಪ್ರಕಾರ", hi: "मिट्टी का प्रकार", mr: "मातीचा प्रकार", te: "నేల రకం" },
    { en: "Season", kn: "ಋತು", hi: "मौसम", mr: "हंगाम", te: "సీజన్" },
    { en: "Crop Name", kn: "ಬೆಳೆಯ ಹೆಸರು", hi: "फसल का नाम", mr: "पिकाचे नाव", te: "పంట పేరు" },
    { en: "Problem Symptoms", kn: "ರೋಗದ ಲಕ್ಷಣಗಳು", hi: "समस्या के लक्षण", mr: "समस्येची लक्षणे", te: "సమస్య లక్షణాలు" },
    { en: "Budget & Priority", kn: "ಬಜೆಟ್ ಮತ್ತು ಆದ್ಯತೆ", hi: "बजट और प्राथमिकता", mr: "बजेट आणि प्राधान्य", te: "బడ్జెట్ & ప్రాధాన్యత" },
    { en: "e.g. Ramesh Patel", kn: "ಉದಾ. ರಮೇಶ್ ಪಟೇಲ್", hi: "उदा. रमेश पटेल", mr: "उदा. रमेश पटेल", te: "ఉదా. రమేష్ పటేల్" },
    { en: "e.g. Maharashtra, Pune", kn: "ಉದಾ. ಮಹಾರಾಷ್ಟ್ರ, ಪುಣೆ", hi: "उदा. महाराष्ट्र, पुणे", mr: "उदा. महाराष्ट्र, पुणे", te: "ఉదా. మహారాష్ట్ర, పూణే" },
    { en: "e.g. Tomato, Rice", kn: "ಉದಾ. ಟೊಮೆಟೊ, ಭತ್ತ", hi: "उदा. टमाटर, चावल", mr: "उदा. टोमॅटो, तांदूळ", te: "ఉదా. టమోటా, బియ్యం" },
    { en: "e.g. yellow spots on leaves", kn: "ಉದಾ. ಎಲೆಗಳ ಮೇಲೆ ಹಳದಿ ಕಲೆಗಳು", hi: "उदा. पत्तियों पर पीले धब्बे", mr: "उदा. पानांवर पिवळे डाग", te: "ఉదా. ఆకులపై పసుపు మచ్చలు" },
    // Agent Simulation
    { en: "Manager Agent", kn: "ಮ್ಯಾನೇಜರ್ ಏಜೆಂಟ್", hi: "मैनेजर एजेंट", mr: "मॅनेजर एजंट", te: "మేనేజర్ ఏజెంట్" },
    { en: "Weather Agent", kn: "ಹವಾಮಾನ ಏಜೆಂಟ್", hi: "मौसम एजेंट", mr: "हवामान एजंट", te: "వాతావరణ ఏజెంట్" },
    { en: "Crop Agent", kn: "ಬೆಳೆ ಏಜೆಂಟ್", hi: "फसल एजेंट", mr: "पीक एजंट", te: "పంట ఏజెంట్" },
    { en: "Disease Agent", kn: "ರೋಗ ಏಜೆಂಟ್", hi: "बीमारी एजेंट", mr: "रोग एजंट", te: "వ్యాధి ఏజెంట్" },
    { en: "Remedy Agent", kn: "ಪರಿಹಾರ ಏಜೆಂಟ್", hi: "उपचार एजेंट", mr: "उपाय एजंट", te: "నివారణ ఏజెంట్" },
    { en: "Market Agent", kn: "ಮಾರುಕಟ್ಟೆ ಏಜೆಂಟ್", hi: "बाज़ार एजेंट", mr: "बाजार एजंट", te: "మార్కెట్ ఏజెంట్" },
    { en: "Store Agent", kn: "ಸ್ಟೋರ್ ಏಜೆಂಟ್", hi: "स्टोर एजेंट", mr: "स्टोअर एजंट", te: "స్టోర్ ఏజెంట్" },
    { en: "Finance Agent", kn: "ಹಣಕಾಸು ಏಜೆಂಟ್", hi: "वित्त एजेंट", mr: "फायनान्स एजंट", te: "ఆర్థిక ఏజెంట్" },
    { en: "Initializing workflow and analyzing input...", kn: "ಕಾರ್ಯಪ್ರವಾಹವನ್ನು ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ ಮತ್ತು ಇನ್‌ಪುಟ್ ಅನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...", hi: "वर्कफ़्लो प्रारंभ कर रहा है और इनपुट का विश्लेषण कर रहा है...", mr: "वर्कफ्लो सुरू करत आहे आणि इनपुटचे विश्लेषण करत आहे...", te: "పనితీరును ప్రారంభిస్తోంది మరియు ఇన్‌పుట్‌ను విశ్లేషిస్తోంది..." },
    { en: "Checking hyperlocal climate & risk factors...", kn: "ಹೈಪರ್-ಲೋಕಲ್ ಹವಾಮಾನ ಮತ್ತು ಅಪಾಯಕಾರಿ ಅಂಶಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...", hi: "हाइपरलोकल जलवायु और जोखिम कारकों की जाँच कर रहा है...", mr: "हायपरलोकल हवामान आणि धोक्याच्या घटकांची तपासणी करत आहे...", te: "హైపర్‌లోకల్ వాతావరణం & ప్రమాద కారకాలను తనిఖీ చేస్తోంది..." },
    { en: "Evaluating soil compatibility & season...", kn: "ಮಣ್ಣಿನ ಹೊಂದಾಣಿಕೆ ಮತ್ತು ಋತುವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗುತ್ತಿದೆ...", hi: "मिट्टी की अनुकूलता और मौसम का मूल्यांकन कर रहा है...", mr: "माती सुसंगतता आणि हंगामाचे मूल्यमापन करत आहे...", te: "నేల అనుకూలత & సీజన్‌ను మూల్యాంకనం చేస్తోంది..." },
    { en: "Scanning imagery & symptom NLP...", kn: "ಚಿತ್ರಣ ಮತ್ತು ರೋಗಲಕ್ಷಣ NLP ಅನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗುತ್ತಿದೆ...", hi: "इमेजरी और लक्षण एनएलपी स्कैन कर रहा है...", mr: "इमेजरी आणि लक्षण NLP स्कॅन करत आहे...", te: "చిత్రాలు & లక్షణం NLP స్కానింగ్ చేస్తోంది..." },
    { en: "Synthesizing organic & chemical treatments...", kn: "ಸಾವಯವ ಮತ್ತು ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆಗಳನ್ನು ಸಂಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...", hi: "जैविक और रासायनिक उपचारों का संश्लेषण कर रहा है...", mr: "सेंद्रिय आणि रासायनिक उपचारांचे संश्लेषण करत आहे...", te: "సేంద్రీయ & రసాయన చికిత్సలను సంశ్లేషణ చేస్తోంది..." },
    { en: "Fetching APMC mandis real-time prices...", kn: "ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆಗಳ ನೈಜ-ಸಮಯದ ಬೆಲೆಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...", hi: "एपीएमसी मंडियों से रीयल-टाइम कीमतें प्राप्त कर रहा है...", mr: "APMC मंडईच्या रिअल-टाइम किंमती आणत आहे...", te: "APMC మార్కెట్ల రియల్ టైమ్ ధరలను పొందుతోంది..." },
    { en: "Geolocating nearest agri-input vendors...", kn: "ಹತ್ತಿರದ ಕೃಷಿ-ಇನ್‌ಪುಟ್ ಮಾರಾಟಗಾರರನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...", hi: "निकटतम कृषि-इनपुट विक्रेताओं का भू-स्थान खोज रहा है...", mr: "जवळच्या कृषी-इनपुट विक्रेत्यांचे भौगोलिक स्थान शोधत आहे...", te: "సమీప వ్యవసాయ ఇన్‌పుట్ విక్రేతలను గుర్తిస్తోంది..." },
    { en: "Checking eligible govt subsidies...", kn: "ಅರ್ಹ ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...", hi: "योग्य सरकारी सब्सिडी की जाँच कर रहा है...", mr: "पात्र सरकारी अनुदानाची तपासणी करत आहे...", te: "అర్హతగల ప్రభుత్వ సబ్సిడీలను తనిఖీ చేస్తోంది..." },
    { en: "Wait", kn: "ನಿರೀಕ್ಷಿಸಿ", hi: "प्रतीक्षा करें", mr: "थांबा", te: "వేచి ఉండండి" },
    { en: "Done", kn: "ಮುಗಿದಿದೆ", hi: "पूर्ण", mr: "पूर्ण झाले", te: "పూర్తయింది" },
    // ChatGPT Remedy Steps
    { en: "Step 1: Organic & Immediate Action", kn: "ಹಂತ 1: ಸಾವಯವ ಮತ್ತು ತಕ್ಷಣದ ಕ್ರಮ", hi: "चरण 1: जैविक और तत्काल कार्रवाई", mr: "पायरी 1: सेंद्रिय आणि त्वरित कारवाई", te: "దశ 1: సేంద్రీయ & తక్షణ చర్య" },
    { en: "Step 2: Chemical Treatment", kn: "ಹಂತ 2: ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ", hi: "चरण 2: रासायनिक उपचार", mr: "पायरी 2: रासायनिक उपचार", te: "దశ 2: రసాయన చికిత్స" },
    { en: "Step 3: Future Prevention", kn: "ಹಂತ 3: ಭವಿಷ್ಯದ ತಡೆಗಟ್ಟುವಿಕೆ", hi: "चरण 3: भविष्य की रोकथाम", mr: "पायरी 3: भविष्यातील प्रतिबंध", te: "దశ 3: భవిష్యత్తు నివారణ" },
    // Hero & Features
    { en: "Autonomous Multi-Agent AI Platform Helping Farmers Increase Yield, Detect Disease & Maximize Profit.", kn: "ರೈತರಿಗೆ ಇಳುವರಿ ಹೆಚ್ಚಿಸಲು, ರೋಗ ಪತ್ತೆಹಚ್ಚಲು ಮತ್ತು ಲಾಭವನ್ನು ಗರಿಷ್ಠಗೊಳಿಸಲು ಸಹಾಯ ಮಾಡುವ ಸ್ವಾಯತ್ತ ಬಹು-ಏಜೆಂಟ್ ಎಐ ವೇದಿಕೆ.", hi: "किसानों को उपज बढ़ाने, बीमारी का पता लगाने और लाभ को अधिकतम करने में मदद करने वाला स्वायत्त मल्टी-एजेंट एआई प्लेटफॉर्म।", mr: "शेतकऱ्यांना उत्पन्न वाढवण्यासाठी, रोग शोधण्यासाठी आणि नफा जास्तीत जास्त वाढवण्यासाठी मदत करणारे स्वायत्त मल्टी-एजंट एआय प्लॅटफॉर्म.", te: "రైతులకు దిగుబడిని పెంచడానికి, వ్యాధిని గుర్తించడానికి మరియు లాభాన్ని పెంచడానికి సహాయపడే స్వయంప్రతిపత్త బహుళ-ఏజెంట్ AI ప్లాట్‌ఫారమ్." },
    { en: "Try Live Demo", kn: "ಲೈವ್ ಡೆಮೊ ಪ್ರಯತ್ನಿಸಿ", hi: "लाइव डेमो आज़माएं", mr: "थेट डेमो वापरून पहा", te: "లైవ్ డెమోని ప్రయత్నించండి" },
    { en: "See Architecture", kn: "ವಾಸ್ತುಶಿಲ್ಪ ನೋಡಿ", hi: "आर्किटेक्चर देखें", mr: "आर्किटेक्चर पहा", te: "ఆర్కిటెక్చర్ చూడండి" },
    { en: "Pest Attack Losses", kn: "ಕೀಟ ದಾಳಿಯ ನಷ್ಟಗಳು", hi: "कीट हमले के नुकसान", mr: "कीटकांच्या हल्ल्याचे नुकसान", te: "తెగులు దాడి నష్టాలు" },
    { en: "Early detection prevents major crop damage and financial ruin.", kn: "ಆರಂಭಿಕ ಪತ್ತೆ ದೊಡ್ಡ ಬೆಳೆ ಹಾನಿ ಮತ್ತು ಆರ್ಥಿಕ ನಷ್ಟವನ್ನು ತಡೆಯುತ್ತದೆ.", hi: "प्रारंभिक पहचान प्रमुख फसल क्षति और वित्तीय बर्बादी को रोकती है।", mr: "लवकर शोध लागल्याने पिकाचे मोठे नुकसान आणि आर्थिक हानी टळते.", te: "ప్రారంభ గుర్తింపు ప్రధాన పంట నష్టం మరియు ఆర్థిక నష్టాన్ని నిరోధిస్తుంది." },
    { en: "Disease Spread", kn: "ರೋಗದ ಹರಡುವಿಕೆ", hi: "बीमारी का फैलाव", mr: "रोगाचा प्रसार", te: "వ్యాధి వ్యాప్తి" },
    { en: "Stop infections before they spread across the entire farm.", kn: "ಇಡೀ ಜಮೀನಿನಾದ್ಯಂತ ಹರಡುವ ಮುನ್ನ ಸೋಂಕುಗಳನ್ನು ನಿಲ್ಲಿಸಿ.", hi: "पूरे खेत में फैलने से पहले संक्रमण को रोकें।", mr: "संपूर्ण शेतात पसरण्यापूर्वी संसर्ग थांबवा.", te: "మొత్తం పొలంలో వ్యాపించే ముందు అంటువ్యాధులను ఆపండి." },
    { en: "Low Crop Prices", kn: "ಕಡಿಮೆ ಬೆಳೆ ಬೆಲೆಗಳು", hi: "फसल की कम कीमतें", mr: "पिकांचे कमी भाव", te: "తక్కువ పంట ధరలు" },
    { en: "Real-time market insights to sell at the best possible price.", kn: "ಉತ್ತಮ ಬೆಲೆಗೆ ಮಾರಾಟ ಮಾಡಲು ನೈಜ-ಸಮಯದ ಮಾರುಕಟ್ಟೆ ಒಳನೋಟಗಳು.", hi: "सर्वोत्तम संभव कीमत पर बेचने के लिए रीयल-टाइम बाज़ार अंतर्दृष्टि।", mr: "सर्वोत्तम शक्य किंमतीत विकण्यासाठी रिअल-टाइम मार्केट इनसाइट्स.", te: "సాధ్యమైనంత ఉత్తమమైన ధరకు విక్రయించడానికి రియల్ టైమ్ మార్కెట్ అంతర్దృష్టులు." },
    { en: "Lack of Experts", kn: "ತಜ್ಞರ ಕೊರತೆ", hi: "विशेषज्ञों की कमी", mr: "तज्ञांची कमतरता", te: "నిపుణుల కొరత" },
    { en: "Instant access to AI-driven agronomy advice 24/7.", kn: "AI-ಚಾಲಿತ ಕೃಷಿ ಸಲಹೆಗೆ 24/7 ತ್ವರಿತ ಪ್ರವೇಶ.", hi: "एआई-संचालित कृषि विज्ञान सलाह 24/7 तक त्वरित पहुंच।", mr: "AI-चालित कृषी विज्ञान सल्ल्यासाठी 24/7 त्वरित प्रवेश.", te: "AI-ఆధారిత వ్యవసాయ సలహాకు 24/7 తక్షణ ప్రాప్యత." },
    { en: "Climate Risk", kn: "ಹವಾಮಾನ ಅಪಾಯ", hi: "जलवायु जोखिम", mr: "हवामान धोका", te: "వాతావరణ ప్రమాదం" },
    { en: "Hyper-local weather alerts to protect your harvest.", kn: "ನಿಮ್ಮ ಸುಗ್ಗಿಯನ್ನು ರಕ್ಷಿಸಲು ಹೈಪರ್-ಲೋಕಲ್ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು.", hi: "आपकी फसल की सुरक्षा के लिए हाइपर-लोकल मौसम अलर्ट।", mr: "तुमच्या पिकाचे रक्षण करण्यासाठी हायपर-लोकल हवामान सूचना.", te: "మీ పంటను రక్షించడానికి హైపర్-లోకల్ వాతావరణ హెచ్చరికలు." },
    { en: "Wrong Fertilizer Use", kn: "ತಪ್ಪಾದ ರಸಗೊಬ್ಬರ ಬಳಕೆ", hi: "गलत उर्वरक का उपयोग", mr: "चुकीचा खत वापर", te: "తప్పు ఎరువు వాడకం" },
    { en: "Precision chemical and organic recommendations.", kn: "ನಿಖರವಾದ ರಾಸಾಯನಿಕ ಮತ್ತು ಸಾವಯವ ಶಿಫಾರಸುಗಳು.", hi: "सटीक रासायनिक और जैविक सिफारिशें।", mr: "अचूक रासायनिक आणि सेंद्रिय शिफारसी.", te: "ఖచ్చితమైన రసాయన మరియు సేంద్రీయ సిఫార్సులు." },
    { en: "Market Confusion", kn: "ಮಾರುಕಟ್ಟೆ ಗೊಂದಲ", hi: "बाज़ार का भ्रम", mr: "बाजारातील गोंधळ", te: "మార్కెట్ గందరగోళం" },
    { en: "Find exact buyers and sellers without middleman chaos.", kn: "ಮಧ್ಯವರ್ತಿಗಳ ಗೊಂದಲವಿಲ್ಲದೆ ನಿಖರವಾದ ಖರೀದಿದಾರರು ಮತ್ತು ಮಾರಾಟಗಾರರನ್ನು ಹುಡುಕಿ.", hi: "बिचौलियों की अराजकता के बिना सटीक खरीदार और विक्रेता खोजें।", mr: "मध्यस्थांच्या गोंधळाशिवाय अचूक खरेदीदार आणि विक्रेते शोधा.", te: "మధ్యవర్తుల గందరగోళం లేకుండా ఖచ్చితమైన కొనుగోలుదారులు మరియు అమ్మకందారులను కనుగొనండి." },
    { en: "Time Waste", kn: "ಸಮಯ ವ್ಯರ್ಥ", hi: "समय की बर्बादी", mr: "वेळेचा अपव्यय", te: "సమయం వృధా" },
    { en: "Locate nearest stores and resources instantly.", kn: "ಹತ್ತಿರದ ಮಳಿಗೆಗಳು ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳನ್ನು ತಕ್ಷಣವೇ ಪತ್ತೆಹಚ್ಚಿ.", hi: "निकटतम स्टोर और संसाधनों का तुरंत पता लगाएं।", mr: "जवळची दुकाने आणि संसाधने त्वरित शोधा.", te: "సమీప దుకాణాలు మరియు వనరులను తక్షణమే గుర్తించండి." }
];

document.addEventListener('DOMContentLoaded', () => {
    // Execute Translation on Load (default EN, but good to set hooks)
    const langSelector = document.getElementById('language-selector');
    if (langSelector) {
        langSelector.addEventListener('change', (e) => {
            const lang = e.target.value;
            applyTranslation(lang);
        });
    }

    function applyTranslation(lang) {
        // Translate text nodes
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            // skip script and style tags, and only skip language selector options
            if (node.parentElement && (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE' || (node.parentElement.tagName === 'OPTION' && node.parentElement.closest('#language-selector')))) continue;

            let trimmed = node.nodeValue.trim();
            if (!trimmed) continue;

            if (typeof node.originalEnglish === 'undefined') {
                node.originalEnglish = trimmed;
            }

            const entry = window.appDictionary.find(d => d.en === node.originalEnglish);
            if (entry && entry[lang]) {
                node.nodeValue = node.nodeValue.replace(trimmed, entry[lang]);
            }
        }

        // Translate placeholders
        document.querySelectorAll('input[placeholder]').forEach(el => {
            if (!el.dataset.origPlaceholder) el.dataset.origPlaceholder = el.placeholder;
            const entry = window.appDictionary.find(d => d.en === el.dataset.origPlaceholder);
            if (entry && entry[lang]) el.placeholder = entry[lang];
        });

        // Translate specific data-i18n tags (like buttons and spans)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            if (!el.dataset.origI18n) el.dataset.origI18n = el.innerText.trim();
            const entry = window.appDictionary.find(d => d.en === el.dataset.origI18n) || window.appDictionary.find(d => d.en === el.getAttribute('data-i18n-key'));

            // Backup for i18n specific hardcoded keys
            let key = el.getAttribute('data-i18n');
            let englishFallback = el.dataset.origI18n;

            // Try to find by english text
            const dictEntry = window.appDictionary.find(d => d.en === englishFallback || d.en === key);

            if (dictEntry && dictEntry[lang]) {
                // If it contains icons, preserve them
                if (el.querySelector('i')) {
                    const iconHTML = el.querySelector('i').outerHTML;
                    el.innerHTML = iconHTML + ' ' + dictEntry[lang];
                } else {
                    el.innerText = dictEntry[lang];
                }
            }
        });

        // If results panel is open, re-render it to apply translations
        if (document.getElementById('final-dashboard').style.display === 'block') {
            generateFinalReport(); // The function now has internal translation
        }
    }

    // --- CAMERA FEATURE LOGIC ---
    const openCameraBtn = document.getElementById('open-camera-btn');
    const cameraModal = document.getElementById('camera-modal');
    const closeCameraBtn = document.getElementById('close-camera');
    const videoElement = document.getElementById('camera-video');
    const canvasElement = document.getElementById('camera-canvas');
    const snapshotElement = document.getElementById('camera-snapshot');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const usePhotoBtn = document.getElementById('use-photo-btn');
    const previewArea = document.getElementById('imagePreview');
    let stream = null;

    if (openCameraBtn) {
        openCameraBtn.addEventListener('click', async () => {
            cameraModal.style.display = 'flex';
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                videoElement.srcObject = stream;
                videoElement.style.display = 'block';
                snapshotElement.style.display = 'none';
                captureBtn.style.display = 'inline-block';
                retakeBtn.style.display = 'none';
                usePhotoBtn.style.display = 'none';
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access camera. Please allow permissions.");
            }
        });
    }

    if (closeCameraBtn) {
        closeCameraBtn.addEventListener('click', stopCamera);
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            canvasElement.getContext('2d').drawImage(videoElement, 0, 0);
            const imgDataUrl = canvasElement.toDataURL('image/jpeg');

            snapshotElement.src = imgDataUrl;
            snapshotElement.style.display = 'block';
            videoElement.style.display = 'none';

            captureBtn.style.display = 'none';
            retakeBtn.style.display = 'inline-block';
            usePhotoBtn.style.display = 'inline-block';
        });
    }

    if (retakeBtn) {
        retakeBtn.addEventListener('click', () => {
            snapshotElement.style.display = 'none';
            videoElement.style.display = 'block';
            captureBtn.style.display = 'inline-block';
            retakeBtn.style.display = 'none';
            usePhotoBtn.style.display = 'none';
        });
    }

    if (usePhotoBtn) {
        usePhotoBtn.addEventListener('click', () => {
            const imgDataUrl = snapshotElement.src;
            previewArea.style.backgroundImage = `url(${imgDataUrl})`;
            previewArea.innerHTML = ''; // Clear text/icon
            previewArea.style.border = 'none';
            stopCamera();
        });
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        cameraModal.style.display = 'none';
    }

    // --- Voice Input Feature ---
    function setupVoiceInput(btnId, inputId) {
        const btn = document.getElementById(btnId);
        const inputField = document.getElementById(inputId);

        if (btn && inputField && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = function () {
                btn.classList.add('recording');
            };

            recognition.onresult = function (event) {
                const transcript = event.results[0][0].transcript;
                inputField.value = transcript;
                btn.classList.remove('recording');
            };

            recognition.onerror = function (event) {
                console.error("Speech recognition error", event.error);
                btn.classList.remove('recording');
            };

            recognition.onend = function () {
                btn.classList.remove('recording');
            };

            btn.addEventListener('click', () => {
                if (btn.classList.contains('recording')) {
                    recognition.stop();
                } else {
                    const langSelector = document.getElementById('language-selector');
                    if (langSelector) {
                        const langMap = { 'en': 'en-IN', 'kn': 'kn-IN', 'hi': 'hi-IN', 'mr': 'mr-IN', 'te': 'te-IN' };
                        recognition.lang = langMap[langSelector.value] || 'en-IN';
                    }
                    recognition.start();
                }
            });
        } else if (btn) {
            btn.addEventListener('click', () => {
                alert("Voice input is not supported in this browser.");
            });
        }
    }

    setupVoiceInput('voice-chat-btn', 'chat-input');
    setupVoiceInput('voice-symptoms-btn', 'symptoms');
    setupVoiceInput('voice-name-btn', 'farmerName');
    setupVoiceInput('voice-loc-btn', 'location');
    setupVoiceInput('voice-crop-btn', 'cropName');

    // --- Schemes Eligibility Logic ---
    const schemesForm = document.getElementById('schemes-form');
    const schemesResults = document.getElementById('schemes-results');
    const schemesGrid = document.getElementById('schemes-grid');

    if (schemesForm) {
        schemesForm.addEventListener('submit', (e) => {
            e.preventDefault();

            schemesResults.style.display = 'block';
            schemesGrid.innerHTML = `
                <div class="dash-card" style="margin-bottom: 1rem;">
                    <h4>PM-Kisan Samman Nidhi</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">₹6000/year direct income support for farmers.</p>
                    <a href="https://pmkisan.gov.in/" target="_blank" class="btn btn-outline" style="padding: 0.3rem 1rem; font-size: 0.85rem; display: inline-block; text-decoration: none;">Apply Now <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                </div>
                <div class="dash-card" style="margin-bottom: 1rem;">
                    <h4>Agriculture Infrastructure Fund</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Subsidized loans for agri-startups and infrastructure.</p>
                    <a href="https://agriinfra.dac.gov.in/" target="_blank" class="btn btn-outline" style="padding: 0.3rem 1rem; font-size: 0.85rem; display: inline-block; text-decoration: none;">Apply Now <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                </div>
                <div class="dash-card" style="margin-bottom: 1rem;">
                    <h4>PM Fasal Bima Yojana</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Crop insurance against natural calamities.</p>
                    <a href="https://pmfby.gov.in/" target="_blank" class="btn btn-outline" style="padding: 0.3rem 1rem; font-size: 0.85rem; display: inline-block; text-decoration: none;">Apply Now <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                </div>
                <div class="dash-card" style="margin-bottom: 1rem;">
                    <h4>Kisan Credit Card (KCC)</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Short-term credit for crop cultivation at low interest.</p>
                    <a href="https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card" target="_blank" class="btn btn-outline" style="padding: 0.3rem 1rem; font-size: 0.85rem; display: inline-block; text-decoration: none;">Apply Now <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                </div>
            `;
            schemesResults.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // --- Authentication Logic ---
    const authOverlay = document.getElementById('auth-overlay');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const loginError = document.getElementById('login-error');
    const regError = document.getElementById('reg-error');

    // Check if already logged in
    const isLoggedIn = localStorage.getItem('agriMitra_isLoggedIn');
    if (isLoggedIn === 'true') {
        if (authOverlay) authOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Auto populate name if available
        const currentUser = localStorage.getItem('agriMitra_currentUser');
        if (currentUser) {
            const userDataStr = localStorage.getItem('agriMitra_user_' + currentUser);
            if (userDataStr) {
                try {
                    const userData = JSON.parse(userDataStr);
                    const farmerNameInput = document.getElementById('farmerName');
                    if (farmerNameInput && !farmerNameInput.value) {
                        farmerNameInput.value = userData.name;
                    }
                } catch (e) { }
            }
        }
    }

    if (tabLogin && tabRegister) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabLogin.style.borderBottomColor = 'var(--primary)';
            tabLogin.style.color = 'var(--primary)';

            tabRegister.classList.remove('active');
            tabRegister.style.borderBottomColor = 'transparent';
            tabRegister.style.color = 'var(--text-muted)';

            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabRegister.style.borderBottomColor = 'var(--primary)';
            tabRegister.style.color = 'var(--primary)';

            tabLogin.classList.remove('active');
            tabLogin.style.borderBottomColor = 'transparent';
            tabLogin.style.color = 'var(--text-muted)';

            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
        });
    }

    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const identifier = document.getElementById('reg-identifier').value;
            const password = document.getElementById('reg-password').value;

            if (localStorage.getItem('agriMitra_user_' + identifier)) {
                regError.innerText = 'User with this Email/Phone already exists.';
                regError.style.display = 'block';
                return;
            }

            const userData = {
                name: name,
                identifier: identifier,
                password: password
            };
            localStorage.setItem('agriMitra_user_' + identifier, JSON.stringify(userData));

            // Auto-login after registration
            localStorage.setItem('agriMitra_isLoggedIn', 'true');
            localStorage.setItem('agriMitra_currentUser', identifier);

            const farmerNameInput = document.getElementById('farmerName');
            if (farmerNameInput) farmerNameInput.value = name;

            authOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const identifier = document.getElementById('login-identifier').value;
            const password = document.getElementById('login-password').value;

            const userDataStr = localStorage.getItem('agriMitra_user_' + identifier);
            if (!userDataStr) {
                loginError.innerText = 'User not found. Please register first.';
                loginError.style.display = 'block';
                return;
            }

            const userData = JSON.parse(userDataStr);
            if (userData.password !== password) {
                loginError.innerText = 'Incorrect password.';
                loginError.style.display = 'block';
                return;
            }

            localStorage.setItem('agriMitra_isLoggedIn', 'true');
            localStorage.setItem('agriMitra_currentUser', identifier);

            const farmerNameInput = document.getElementById('farmerName');
            if (farmerNameInput) farmerNameInput.value = userData.name;

            authOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    window.showToast = function (msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let icon = 'fa-circle-check';
        if (type === 'error') icon = 'fa-triangle-exclamation';
        if (type === 'info') icon = 'fa-circle-info';
        if (type === 'warning') icon = 'fa-circle-exclamation';

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        if (localStorage.getItem('agriMitra_theme') === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('agriMitra_theme', 'dark');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
                showToast('Dark mode enabled', 'info');
            } else {
                localStorage.setItem('agriMitra_theme', 'light');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
                showToast('Light mode enabled', 'info');
            }
        });
    }

    const dashboardSection = document.getElementById('dashboard');
    const agentsSection = document.getElementById('agents');
    const dashUserName = document.getElementById('dashboard-user-name');

    function updateSaaSUI() {
        const isLoggedInCheck = localStorage.getItem('agriMitra_isLoggedIn');
        if (isLoggedInCheck === 'true') {
            if (dashboardSection) dashboardSection.style.display = 'block';
            if (agentsSection) agentsSection.style.display = 'block';

            const profileStr = localStorage.getItem('agriMitra_profile');
            let profileData = profileStr ? JSON.parse(profileStr) : null;

            if (profileData && dashUserName) {
                dashUserName.innerText = profileData.name.split(' ')[0];
            } else if (dashUserName) {
                const curUser = localStorage.getItem('agriMitra_currentUser');
                if (curUser) {
                    const udStr = localStorage.getItem('agriMitra_user_' + curUser);
                    if (udStr) dashUserName.innerText = JSON.parse(udStr).name.split(' ')[0];
                }
            }
        }
    }

    updateSaaSUI();

    if (formLogin) {
        formLogin.addEventListener('submit', () => { setTimeout(updateSaaSUI, 100); });
    }
    if (formRegister) {
        formRegister.addEventListener('submit', () => { setTimeout(updateSaaSUI, 100); });
    }

    const profileModal = document.getElementById('profile-modal');
    const openProfileBtn = document.getElementById('open-profile-btn');
    const closeProfileBtn = document.getElementById('close-profile');
    const profileForm = document.getElementById('profile-form');

    if (openProfileBtn) {
        openProfileBtn.addEventListener('click', () => {
            const profileStr = localStorage.getItem('agriMitra_profile');
            if (profileStr) {
                const data = JSON.parse(profileStr);
                document.getElementById('prof-name').value = data.name || '';
                document.getElementById('prof-location').value = data.location || '';
                document.getElementById('prof-lang').value = data.lang || 'en';
                document.getElementById('prof-size').value = data.size || '';
                document.getElementById('prof-crops').value = data.crops || '';
            } else {
                const curUser = localStorage.getItem('agriMitra_currentUser');
                if (curUser) {
                    const udStr = localStorage.getItem('agriMitra_user_' + curUser);
                    if (udStr) document.getElementById('prof-name').value = JSON.parse(udStr).name;
                }
            }
            profileModal.style.display = 'flex';
        });
    }

    if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('prof-name').value,
                location: document.getElementById('prof-location').value,
                lang: document.getElementById('prof-lang').value,
                size: document.getElementById('prof-size').value,
                crops: document.getElementById('prof-crops').value
            };
            localStorage.setItem('agriMitra_profile', JSON.stringify(data));
            profileModal.style.display = 'none';
            updateSaaSUI();
            showToast('Profile updated successfully!', 'success');
        });
    }

    const agentModal = document.getElementById('agent-modal');
    const closeAgentModal = document.getElementById('agent-modal-close');
    const agentCards = document.querySelectorAll('.agent-card');
    const agentSidebarList = document.getElementById('agent-switch-list');
    const activeAgentTitle = document.getElementById('active-agent-title');
    const agentDynamicFormArea = document.getElementById('agent-dynamic-form-area');
    const agentResultArea = document.getElementById('agent-result-area');
    const agentLoader = document.getElementById('agent-loader');

    let currentAgent = null;

    const agentDefinitions = {
        'crop_doctor': {
            title: 'Crop Doctor',
            icon: 'fa-microscope',
            fields: [
                { id: 'cd-crop', label: 'Crop Name', type: 'text', placeholder: 'e.g. Tomato' },
                { id: 'cd-symptoms', label: 'Symptoms', type: 'text', placeholder: 'e.g. Yellowing leaves, spots' }
            ],
            generate: (data) => `<strong>Probable Issue:</strong> Early Blight (Fungal Disease)<br><strong>Treatment:</strong> Apply Chlorothalonil or Copper-based fungicides. Ensure proper spacing for air circulation.<br><strong>Prevention:</strong> Rotate crops and avoid overhead watering.`
        },
        'weather': {
            title: 'Weather Advisor',
            icon: 'fa-cloud-sun-rain',
            fields: [
                { id: 'wa-location', label: 'Location', type: 'text', placeholder: 'e.g. Pune' }
            ],
            generate: (data) => `<strong>Current Weather:</strong> 28°C, Partly Cloudy<br><strong>Forecast (Next 5 Days):</strong> Light showers expected on Day 3.<br><strong>Advice:</strong> Hold off on spraying pesticides until after the rain passes.`
        },
        'waste': {
            title: 'Waste to Wealth',
            icon: 'fa-recycle',
            fields: [
                { id: 'ww-crop', label: 'Harvested Crop', type: 'text', placeholder: 'e.g. Wheat' },
                { id: 'ww-waste', label: 'Waste Type', type: 'text', placeholder: 'e.g. Stubble' }
            ],
            generate: (data) => `<strong>Compost Idea:</strong> Treat stubble with microbial decomposers to create nutrient-rich compost in 45 days.<br><strong>Biofuel:</strong> Sell to local biomass plants for extra income. Average rate: ₹2000/ton.`
        },
        'market': {
            title: 'Market Price',
            icon: 'fa-chart-line',
            fields: [
                { id: 'mp-crop', label: 'Crop Name', type: 'text', placeholder: 'e.g. Onion' },
                { id: 'mp-market', label: 'Nearby Mandi', type: 'text', placeholder: 'e.g. Lasalgaon' }
            ],
            generate: (data) => `<strong>Estimated Price:</strong> ₹2500 - ₹3000 per Quintal.<br><strong>Trend:</strong> Prices are rising due to supply shortage.<br><strong>Advice:</strong> Sell 50% now and hold 50% for next week's predicted peak.`
        },
        'smart_farm': {
            title: 'Smart Farming',
            icon: 'fa-leaf',
            fields: [
                { id: 'sf-crop', label: 'Crop', type: 'text', placeholder: 'e.g. Cotton' },
                { id: 'sf-stage', label: 'Growth Stage', type: 'text', placeholder: 'e.g. Flowering' }
            ],
            generate: (data) => `<strong>Fertilizer Timing:</strong> Apply NPK (19:19:19) via foliar spray this week.<br><strong>Irrigation:</strong> Maintain moderate soil moisture; avoid waterlogging during flowering.`
        },
        'schemes': {
            title: 'Govt Schemes',
            icon: 'fa-file-invoice-dollar',
            fields: [
                { id: 'gs-state', label: 'State', type: 'text', placeholder: 'e.g. Maharashtra' },
                { id: 'gs-category', label: 'Category', type: 'text', placeholder: 'e.g. Small Farmer' }
            ],
            generate: (data) => `<strong>Eligible Schemes:</strong><br>1. PM-Kisan Samman Nidhi (₹6000/year)<br>2. PM Fasal Bima Yojana (Crop Insurance)<br><strong>Next Step:</strong> Visit nearest CSC center with Aadhar and Land Records.`
        },
        'voice': {
            title: 'Voice Assistant',
            icon: 'fa-headset',
            fields: [
                { id: 'va-lang', label: 'Language', type: 'select', options: ['English', 'Hindi', 'Marathi', 'Kannada'] },
                { id: 'va-query', label: 'Ask Query', type: 'text', placeholder: 'Click the mic and speak...' }
            ],
            generate: (data) => `I have processed your query in ${data['va-lang']}. Based on expert agronomy data, here is your personalized advice: Maintain proper drainage and apply Neem oil as a preventive measure.`
        },
        'emergency': {
            title: 'Emergency Help',
            icon: 'fa-truck-medical',
            fields: [
                { id: 'em-issue', label: 'Emergency Type', type: 'text', placeholder: 'e.g. Locust Attack, Flood' }
            ],
            generate: (data) => `<strong>URGENT ACTION PLAN:</strong><br>1. Immediately contact local agriculture office.<br>2. Apply recommended emergency spray if pest-related.<br>3. Document damage for insurance claims via PMFBY.`
        }
    };

    function renderAgentSidebar() {
        if (!agentSidebarList) return;
        agentSidebarList.innerHTML = '';
        Object.keys(agentDefinitions).forEach(key => {
            const def = agentDefinitions[key];
            const btn = document.createElement('button');
            btn.className = `btn full-width ${currentAgent === key ? 'btn-glow' : 'btn-outline'}`;
            btn.style.textAlign = 'left';
            btn.style.padding = '0.5rem 1rem';
            btn.style.marginBottom = '0.5rem';
            btn.innerHTML = `<i class="fa-solid ${def.icon}" style="width: 25px;"></i> ${def.title}`;
            btn.onclick = () => openAgent(key);
            agentSidebarList.appendChild(btn);
        });
    }

    function openAgent(agentKey) {
        currentAgent = agentKey;
        const def = agentDefinitions[agentKey];
        if (!def) return;

        activeAgentTitle.innerHTML = `<i class="fa-solid ${def.icon}"></i> ${def.title}`;
        agentResultArea.style.display = 'none';

        let formHTML = `<form id="active-agent-form" class="agent-dynamic-form">`;
        def.fields.forEach(f => {
            formHTML += `<div class="input-group">
                <label>${f.label}</label>`;
            if (f.type === 'select') {
                formHTML += `<select id="${f.id}">`;
                f.options.forEach(opt => formHTML += `<option value="${opt}">${opt}</option>`);
                formHTML += `</select>`;
            } else {
                formHTML += `<input type="text" id="${f.id}" placeholder="${f.placeholder}" required>`;
            }
            formHTML += `</div>`;
        });
        formHTML += `<button type="submit" class="btn btn-glow mt-3"><i class="fa-solid fa-bolt"></i> Generate Answer</button>`;
        formHTML += `</form>`;

        agentDynamicFormArea.innerHTML = formHTML;
        renderAgentSidebar();

        const currentForm = document.getElementById('active-agent-form');
        currentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {};
            def.fields.forEach(f => {
                formData[f.id] = document.getElementById(f.id).value;
            });

            agentResultArea.style.display = 'none';
            agentLoader.style.display = 'block';

            setTimeout(() => {
                agentLoader.style.display = 'none';
                agentResultArea.innerHTML = `<h4>AI Response:</h4><p style="margin-top: 1rem; color: var(--text-main);">${def.generate(formData)}</p>`;
                agentResultArea.style.display = 'block';
                showToast('Analysis complete!', 'success');

                saveHistory(def.title, formData, def.generate(formData));
            }, 1500);
        });

        agentModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    if (agentCards) {
        agentCards.forEach(card => {
            card.addEventListener('click', () => {
                const agent = card.getAttribute('data-agent');
                openAgent(agent);
            });
        });
    }

    if (closeAgentModal) {
        closeAgentModal.addEventListener('click', () => {
            agentModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    const historyModal = document.getElementById('history-modal');
    const openHistoryBtn = document.getElementById('open-history-btn');
    const closeHistoryBtn = document.getElementById('close-history');
    const historyList = document.getElementById('history-list');

    function saveHistory(agentTitle, inputs, result) {
        let history = JSON.parse(localStorage.getItem('agriMitra_history') || '[]');
        history.unshift({ agentTitle, date: new Date().toLocaleString(), inputs, result });
        if (history.length > 20) history.pop();
        localStorage.setItem('agriMitra_history', JSON.stringify(history));
    }

    function renderHistory() {
        if (!historyList) return;
        let history = JSON.parse(localStorage.getItem('agriMitra_history') || '[]');
        if (history.length === 0) {
            historyList.innerHTML = '<p class="text-center" style="color: var(--text-muted);">No history found.</p>';
            return;
        }

        historyList.innerHTML = '';
        history.forEach(item => {
            const card = document.createElement('div');
            card.className = 'dash-card';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong>${item.agentTitle}</strong>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${item.date}</span>
                </div>
                <div style="font-size: 0.9rem; margin-bottom: 0.5rem; background: var(--input-bg); padding: 0.5rem; border-radius: 4px;">
                    ${JSON.stringify(item.inputs).replace(/["{}]/g, '').replace(/:/g, ': ')}
                </div>
                <p style="font-size: 0.9rem;">${item.result}</p>
            `;
            historyList.appendChild(card);
        });
    }

    if (openHistoryBtn) {
        openHistoryBtn.addEventListener('click', () => {
            renderHistory();
            historyModal.style.display = 'flex';
        });
    }

    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', () => {
            historyModal.style.display = 'none';
        });
    }

    const btnFavorite = document.getElementById('btn-favorite');
    if (btnFavorite) {
        btnFavorite.addEventListener('click', () => {
            btnFavorite.innerHTML = '<i class="fa-solid fa-star" style="color: #f59e0b;"></i>';
            showToast('Saved to favorites!', 'success');
        });
    }
});
