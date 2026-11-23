/**
 * MEHRANGARH FORT MAIN CONTROLLER
 * Interactive UI, Web Audio Ambient Synthesizer, Ticket & E-Pass Engine
 */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================================
       1. ROYAL PRELOADER SIMULATOR
       ========================================================== */
    const preloader = document.getElementById("preloader");
    const loadProgress = document.getElementById("loadProgress");
    const loadStatus = document.getElementById("loadStatus");

    const statusMessages = [
        "Surveying Bhakurcheeria Ridge...",
        "Carving Sandstone Bastions & Jharokhas...",
        "Inlaying 24K Gold at Phool Mahal...",
        "Tuning Desert Soundscape...",
        "Citadel Ready."
    ];

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 22) + 12;
        if (progress > 100) progress = 100;

        if (loadProgress) loadProgress.style.width = progress + "%";
        const msgIdx = Math.min(Math.floor((progress / 100) * statusMessages.length), statusMessages.length - 1);
        if (loadStatus) loadStatus.textContent = statusMessages[msgIdx];

        if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                if (preloader) {
                    preloader.classList.add("fade-out");
                    setTimeout(() => preloader.remove(), 800);
                }
            }, 400);
        }
    }, 120);

    /* ==========================================================
       2. ROYAL AMBIENT SOUNDSCAPE (Web Audio API Synthesizer)
       Authentic Indian Classical Tanpura & Desert Drone
       ========================================================== */
    let audioCtx = null;
    let isAudioPlaying = false;
    let masterGain = null;
    let droneOscillators = [];
    let lfo = null;

    const audioToggleBtn = document.getElementById("audioToggleBtn");
    const heroAudioPrompt = document.getElementById("heroAudioPrompt");
    const audioIcon = document.getElementById("audioIcon");
    const hudAudioGuideBtn = document.getElementById("hudAudioGuideBtn");

    function initDesertAudio() {
        if (audioCtx) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        // Master Gain
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        // Warm Rajasthani Raga Drone: Indian Sa (D) & Pa (A) harmonics (146.83 Hz, 220 Hz, 293.66 Hz, 440 Hz)
        const droneFrequencies = [
            { freq: 73.42, type: 'triangle', gain: 0.35 },   // Low Sa drone
            { freq: 110.00, type: 'sine', gain: 0.25 },     // Pa
            { freq: 146.83, type: 'sawtooth', gain: 0.12 }, // Mid Sa
            { freq: 220.00, type: 'sine', gain: 0.15 },     // Upper Pa
            { freq: 293.66, type: 'triangle', gain: 0.08 }  // Upper Sa
        ];

        // Low-pass filter to give rich warm acoustic resonance
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, audioCtx.currentTime);
        filter.Q.setValueAtTime(4, audioCtx.currentTime);
        filter.connect(masterGain);

        // Create drone oscillators
        droneOscillators = droneFrequencies.map(spec => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = spec.type;
            osc.frequency.setValueAtTime(spec.freq, audioCtx.currentTime);

            // Subtle pitch detuning for shimmering tanpura acoustic effect
            osc.detune.setValueAtTime((Math.random() - 0.5) * 8, audioCtx.currentTime);

            gain.gain.setValueAtTime(spec.gain, audioCtx.currentTime);

            osc.connect(gain);
            gain.connect(filter);
            osc.start();
            return { osc, gain };
        });

        // Slow LFO for organic breath-like swell
        lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime); // 8 second cycle
        lfoGain.gain.setValueAtTime(150, audioCtx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
    }

    function toggleRoyalAudio() {
        if (!audioCtx) initDesertAudio();

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        if (!isAudioPlaying) {
            masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
            masterGain.gain.setTargetAtTime(0.28, audioCtx.currentTime, 1.2);
            isAudioPlaying = true;
            if (audioToggleBtn) audioToggleBtn.classList.add("playing");
            if (audioIcon) {
                audioIcon.className = "fas fa-volume-high";
            }
            if (heroAudioPrompt) {
                heroAudioPrompt.innerHTML = '<i class="fas fa-pause"></i> Pause Soundscape';
            }
        } else {
            masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
            masterGain.gain.setTargetAtTime(0.001, audioCtx.currentTime, 0.8);
            isAudioPlaying = false;
            if (audioToggleBtn) audioToggleBtn.classList.remove("playing");
            if (audioIcon) {
                audioIcon.className = "fas fa-volume-xmark";
            }
            if (heroAudioPrompt) {
                heroAudioPrompt.innerHTML = '<i class="fas fa-music"></i> Play Desert Soundscape';
            }
        }
    }

    if (audioToggleBtn) audioToggleBtn.addEventListener("click", toggleRoyalAudio);
    if (heroAudioPrompt) heroAudioPrompt.addEventListener("click", toggleRoyalAudio);
    if (hudAudioGuideBtn) {
        hudAudioGuideBtn.addEventListener("click", () => {
            if (!isAudioPlaying) toggleRoyalAudio();
            alert("Playing narrated audio lore: Echoes of Marwar.");
        });
    }

    /* ==========================================================
       3. MOBILE NAVIGATION DRAWER
       ========================================================== */
    const mobileNavToggle = document.getElementById("mobileNavToggle");
    const mainNav = document.getElementById("mainNav");

    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener("click", () => {
            mainNav.classList.toggle("open");
        });

        // Close on nav link click
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                mainNav.classList.remove("open");
            });
        });
    }

    /* ==========================================================
       4. PALACE GALLERIES MODAL DATA & FILTERING
       ========================================================== */
    const PALACE_DATA = {
        "phool-mahal": {
            title: "Phool Mahal (Palace of Flowers)",
            subtitle: "Built by Maharaja Abhay Singh (1724–1749)",
            badge: "24K Gold Filigree",
            bg: "linear-gradient(135deg, #a4501a, #4a2810)",
            body: `
                <p><strong>Phool Mahal</strong> is widely celebrated as the most sumptuous, flamboyant residential hall ever crafted in Rajasthan. 
                Commissioned by Maharaja Abhay Singh in the mid-18th century following his dramatic victory over the Mughal governor in Ahmedabad, 
                the entire ceiling was encrusted with fine gold leaf brought directly from Gujarat as war spoils.</p>
                <br>
                <p>The walls feature exquisite miniature paintings in the Marwar style depicting the 36 classical Ragas and Raginis, floral patterns, 
                and portraits of the Rathore rulers. It served as a private pleasure pavilion for poetry soirees and classical Kathak performances, 
                illuminated by cut-glass chandeliers and rose-tinted lamps.</p>
                <br>
                <p><strong>Architectural Highlight:</strong> Notice the fluted columns carved from single sandstone monoliths, transitioning smoothly into 
                gold-foiled brackets and floral capitals.</p>
            `
        },
        "sheesh-mahal": {
            title: "Sheesh Mahal (Hall of Mirrors)",
            subtitle: "Private Bedchamber of Maharaja Ajit Singh (1707–1724)",
            badge: "Belgian Convex Mirrors",
            bg: "linear-gradient(135deg, #1e3a5f, #0c1b33)",
            body: `
                <p><strong>Sheesh Mahal</strong> served as the sanctum sanctorum of royal privacy. Crafted during the reign of Maharaja Ajit Singh, 
                its walls and barrel-vaulted ceiling are studded with thousands of delicate convex mirror fragments imported from Belgium.</p>
                <br>
                <p>The hall was designed so that a single oil lamp or candle would refract endlessly across the curved glass mosaic, simulating a star-filled 
                desert night sky inside the chamber. The mirrored plasterwork frames large religious murals of Lord Krishna lifting Mount Govardhan and dancing 
                with the Gopis along the Yamuna river.</p>
            `
        },
        "moti-mahal": {
            title: "Moti Mahal (Pearl Palace)",
            subtitle: "Built by Raja Sawai Sur Singh (1595–1619)",
            badge: "Chunnam Shell Plaster",
            bg: "linear-gradient(135deg, #44403c, #1c1917)",
            body: `
                <p><strong>Moti Mahal</strong> is the oldest and largest surviving audience hall within the citadel complex. Its legendary luster comes 
                from a secret formulation of <em>Chunnam</em> — a plaster crafted from crushed sea pearls, limestone, egg whites, and lentils polished 
                with river stones to a mirror-like ivory sheen.</p>
                <br>
                <p>The hall was used for formal coronation durbars and council meetings. Concealed within the upper walls are five secret <em>zenana</em> jharokhas, 
                where the royal women could peer through intricate stone lattice (jali) screens without being seen by foreign envoys below.</p>
            `
        },
        "howdahs": {
            title: "Daulat Khana & The Royal Howdahs",
            subtitle: "The Treasury of Maharaja Jaswant Singh I",
            badge: "Mughal & Rathore Regalia",
            bg: "linear-gradient(135deg, #6b21a8, #2e1065)",
            body: `
                <p>The <strong>Daulat Khana</strong> (Treasury) houses one of the premier museum collections of decorative arts from the Mughal and Rajput courts. 
                Its crowning glory is the collection of royal <em>Howdahs</em> (elephant carriages carved from solid silver and gilded teakwood).</p>
                <br>
                <p>The centerpiece is the solid silver <em>Ambari Howdah</em>, gifted by Mughal Emperor Shah Jahan to Maharaja Jaswant Singh I in 1657 as an 
                emblem of highest imperial honor. Surrounding galleries display Rathore chainmail armor, damascened talwar swords with ruby hilts, and the personal 
                weapons of Emperor Akbar.</p>
            `
        },
        "loha-pol": {
            title: "Loha Pol & The Sati Memorial",
            subtitle: "15th-Century Heavy Defensive Gateway",
            badge: "31 Sati Handprints",
            bg: "linear-gradient(135deg, #800e13, #1a0202)",
            body: `
                <p><strong>Loha Pol</strong> (The Iron Gate) forms the inner defense before the royal palace courtyards. Designed at a sharp right angle 
                on an incline, it was impervious to charging elephant battering rams.</p>
                <br>
                <p>Carved into the stone flanking the archway are 31 handprints marked with vermillion powder. These memorialize the queens and concubines 
                of Maharaja Man Singh who performed the tragic rite of Sati, walking to the funeral pyre after the king died in 1843. It remains a place of solemn reverence.</p>
            `
        },
        "ramparts": {
            title: "Grand Ramparts & The Kilkila Cannon",
            subtitle: "Southern Artillery Battery over the Blue City",
            badge: "Artillery & Panoramic Vista",
            bg: "linear-gradient(135deg, #0284c7, #0369a1)",
            body: `
                <p>The towering ramparts of Mehrangarh are among the most impregnable defensive works in Asia, built directly into the sheer volcanic rhyolite cliffs. 
                Lining the southern parapets are magnificent historic artillery pieces, including the famous bronze <em>Kilkila</em>, <em>Shambhu Ban</em>, and <em>Gajnak</em>.</p>
                <br>
                <p>Standing on these ramparts gives you the ultimate panoramic gaze across the entire Blue City of Jodhpur, with thousands of indigo houses rolling 
                toward the Jaswant Thada cenotaph and the shimmering sands of the Thar Desert beyond.</p>
            `
        }
    };

    // Filter cards
    const filterBtns = document.querySelectorAll(".filter-btn");
    const palaceCards = document.querySelectorAll(".palace-card");

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;
            palaceCards.forEach(card => {
                if (filter === "all" || card.dataset.category === filter) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

    // Open Palace Modal
    const palaceModalOverlay = document.getElementById("palaceModalOverlay");
    const modalCloseBtn = document.getElementById("modalCloseBtn");

    document.querySelectorAll(".open-modal-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.modal;
            const data = PALACE_DATA[key];
            if (!data || !palaceModalOverlay) return;

            document.getElementById("modalTitle").textContent = data.title;
            document.getElementById("modalSubtitle").textContent = data.subtitle;
            document.getElementById("modalBadge").textContent = data.badge;
            document.getElementById("modalBanner").style.background = data.bg;
            document.getElementById("modalBody").innerHTML = data.body;

            palaceModalOverlay.classList.add("active");
        });
    });

    if (modalCloseBtn && palaceModalOverlay) {
        modalCloseBtn.addEventListener("click", () => {
            palaceModalOverlay.classList.remove("active");
        });
        palaceModalOverlay.addEventListener("click", (e) => {
            if (e.target === palaceModalOverlay) {
                palaceModalOverlay.classList.remove("active");
            }
        });
    }

    /* ==========================================================
       5. TICKET PRICING CALCULATOR & ROYAL E-PASS GENERATOR
       ========================================================== */
    const ticketForm = document.getElementById("ticketBookingForm");
    const totalFareAmount = document.getElementById("totalFareAmount");

    // Form inputs
    const visitorRadios = document.querySelectorAll('input[name="visitorType"]');
    const guestMinus = document.getElementById("guestMinus");
    const guestPlus = document.getElementById("guestPlus");
    const guestCountEl = document.getElementById("guestCount");
    const guestNameInput = document.getElementById("guestName");
    const visitDateInput = document.getElementById("visitDate");
    const visitSlotSelect = document.getElementById("visitSlot");

    const addonAudio = document.getElementById("addonAudio");
    const addonElevator = document.getElementById("addonElevator");
    const addonCamera = document.getElementById("addonCamera");

    // E-Pass Preview Elements
    const passBadgeType = document.getElementById("passBadgeType");
    const previewName = document.getElementById("previewName");
    const previewBookingId = document.getElementById("previewBookingId");
    const previewDate = document.getElementById("previewDate");
    const previewSlot = document.getElementById("previewSlot");
    const previewGuests = document.getElementById("previewGuests");
    const previewAddons = document.getElementById("previewAddons");

    // State
    let guests = 1;
    const baseRates = {
        indian: 100,
        foreigner: 600,
        student: 50
    };

    // Set Default Visit Date to Today
    if (visitDateInput) {
        const today = new Date().toISOString().split("T")[0];
        visitDateInput.value = today;
        visitDateInput.min = today;
    }

    function calculateTotal() {
        const selectedType = document.querySelector('input[name="visitorType"]:checked').value;
        const baseRate = baseRates[selectedType] || 100;

        let total = baseRate * guests;

        const activeAddons = [];
        if (addonAudio && addonAudio.checked) {
            total += 180 * guests;
            activeAddons.push("Audio Guide");
        }
        if (addonElevator && addonElevator.checked) {
            total += 50 * guests;
            activeAddons.push("Elevator Lift");
        }
        if (addonCamera && addonCamera.checked) {
            total += 100; // Flat permit
            activeAddons.push("Camera Permit");
        }

        // Update Total Fare Bar
        if (totalFareAmount) {
            totalFareAmount.textContent = "₹" + total.toLocaleString("en-IN");
        }

        // Update Live E-Pass Preview
        if (passBadgeType) {
            passBadgeType.textContent = selectedType.toUpperCase() + " PASS";
        }
        if (previewName) {
            previewName.textContent = guestNameInput.value.trim() || "Ajay Rathore";
        }
        if (previewDate && visitDateInput) {
            previewDate.textContent = visitDateInput.value || "Today";
        }
        if (previewSlot && visitSlotSelect) {
            const slotText = visitSlotSelect.options[visitSlotSelect.selectedIndex].text;
            previewSlot.textContent = slotText.split(" (")[0];
        }
        if (previewGuests) {
            previewGuests.textContent = `${guests} Person${guests > 1 ? 's' : ''}`;
        }
        if (previewAddons) {
            previewAddons.textContent = activeAddons.length > 0 ? activeAddons.join(", ") : "Standard Entry";
        }
    }

    // Guest Counter
    if (guestMinus && guestPlus && guestCountEl) {
        guestMinus.addEventListener("click", () => {
            if (guests > 1) {
                guests--;
                guestCountEl.textContent = guests;
                calculateTotal();
            }
        });
        guestPlus.addEventListener("click", () => {
            if (guests < 20) {
                guests++;
                guestCountEl.textContent = guests;
                calculateTotal();
            }
        });
    }

    // Radio card style updates
    visitorRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            document.querySelectorAll(".radio-card").forEach(c => c.classList.remove("active"));
            radio.closest(".radio-card").classList.add("active");
            calculateTotal();
        });
    });

    [guestNameInput, visitDateInput, visitSlotSelect, addonAudio, addonElevator, addonCamera].forEach(el => {
        if (el) el.addEventListener("input", calculateTotal);
    });

    // Form Submit -> Generate Royal E-Pass Modal
    const ePassSuccessModal = document.getElementById("ePassSuccessModal");
    const printablePassWrap = document.getElementById("printablePassWrap");
    const passSuccessCloseBtn = document.getElementById("passSuccessCloseBtn");
    const closePassModalBtn = document.getElementById("closePassModalBtn");

    if (ticketForm) {
        ticketForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Generate unique random booking ID
            const randomCode = "MHR-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
            if (previewBookingId) previewBookingId.textContent = randomCode;

            calculateTotal();

            // Clone the preview ticket into printable container
            const ePassPreview = document.getElementById("ePassPreview");
            if (ePassPreview && printablePassWrap) {
                printablePassWrap.innerHTML = "";
                const clone = ePassPreview.cloneNode(true);
                printablePassWrap.appendChild(clone);
            }

            if (ePassSuccessModal) {
                ePassSuccessModal.classList.add("active");
            }
        });
    }

    if (passSuccessCloseBtn && ePassSuccessModal) {
        passSuccessCloseBtn.addEventListener("click", () => {
            ePassSuccessModal.classList.remove("active");
        });
    }
    if (closePassModalBtn && ePassSuccessModal) {
        closePassModalBtn.addEventListener("click", () => {
            ePassSuccessModal.classList.remove("active");
        });
    }

    // Initial calculation
    calculateTotal();

    /* ==========================================================
       6. SMOOTH SCROLL FOR ALL ANCHORS
       ========================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

});
