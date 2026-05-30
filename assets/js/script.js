// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {

  // --- 1. INITIALIZE LENIS SMOOTH SCROLLER ---
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom ease curve
    direction: "vertical",
    gestureDirection: "vertical",
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // Connect Lenis to GSAP ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);
  
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  
  gsap.ticker.lagSmoothing(0);

  // --- 2. GSAP SCROLLTRIGGER REGISTRATION ---
  gsap.registerPlugin(ScrollTrigger);

  // --- 3. CUSTOM CURSOR FOLLOWER ---
  const cursor = document.getElementById("custom-cursor");
  const cursorDot = document.getElementById("custom-cursor-dot");
  
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let dotX = 0, dotY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth lerp for cursor follower
  function animateCursor() {
    // Lerp outer ring
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    // Lerp inner dot
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;
    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Highlight cursor on hoverable items
  const hoverElements = document.querySelectorAll("a, button, select, input, textarea, .gallery-item, .people-tab, .interest-checkbox-label");
  hoverElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("hovered");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("hovered");
    });
  });

  // Hide default cursor in window frames
  document.addEventListener("mouseleave", () => {
    cursor.style.display = "none";
    cursorDot.style.display = "none";
  });
  document.addEventListener("mouseenter", () => {
    cursor.style.display = "block";
    cursorDot.style.display = "block";
  });

  // --- 4. STICKY NAVBAR SCROLL ACTION ---
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Scroll Progress Bar Tracker
  const progressBar = document.getElementById("scroll-progress-bar");
  window.addEventListener("scroll", () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / docHeight) * 100;
    progressBar.style.width = `${progress}%`;
  });

  // Mobile Hamburger Menu Toggle
  const hamburger = document.getElementById("hamburger");
  const navLinksList = document.getElementById("nav-links");
  
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinksList.classList.toggle("open");
  });

  // Close nav on clicking links
  navLinksList.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinksList.classList.remove("open");
    });
  });

  // --- 5. HERO INTERACTIVE CANVAS (Subtle charcoal dots matching the portfolio) ---
  const canvas = document.getElementById("hero-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");

    let particlesArray = [];
    const maxParticles = 40;
    
    function resizeCanvas() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 1;
        this.speedX = Math.random() * 0.2 - 0.1;
        this.speedY = Math.random() * 0.2 - 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        ctx.fillStyle = "rgba(17, 17, 17, 0.15)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      particlesArray = [];
      for (let i = 0; i < maxParticles; i++) {
        particlesArray.push(new Particle());
      }
    }
    initParticles();

    function handleParticles() {
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        // Connecting web lines
        for (let j = i + 1; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 140) {
            ctx.strokeStyle = `rgba(17, 17, 17, ${0.06 - distance/140})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function renderLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      handleParticles();
      requestAnimationFrame(renderLoop);
    }
    renderLoop();
  }

  // --- 6. DYNAMIC CARDS SPOTLIGHT / GLOW EFFECT ---
  const updateSpotlight = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  function setupSpotlightOnCards() {
    const glassCards = document.querySelectorAll(".tactile-card, .widget-terminal, .widget-stats, .widget-github");
    glassCards.forEach((card) => {
      card.addEventListener("mousemove", updateSpotlight);
    });
  }
  setupSpotlightOnCards();

  // --- 7. HERO WIDGETS GENERATIONS & INTERACTIVITY ---
  // Git Contributions Generator
  const contribGrid = document.getElementById("github-contrib-grid");
  if (contribGrid) {
    const cellsCount = 14 * 7;
    for (let i = 0; i < cellsCount; i++) {
      const cell = document.createElement("div");
      cell.classList.add("github-cell");
      
      const rand = Math.random();
      if (rand > 0.85) {
        cell.classList.add("lvl-4");
      } else if (rand > 0.7) {
        cell.classList.add("lvl-3");
      } else if (rand > 0.5) {
        cell.classList.add("lvl-2");
      } else if (rand > 0.3) {
        cell.classList.add("lvl-1");
      }
      contribGrid.appendChild(cell);
    }
  }

  // Typewriter Terminal Widget effect (Simulate a local npm dev server setup)
  const typewriterElement = document.getElementById("typewriter-text");
  const termLines = [
    document.getElementById("terminal-out-1"),
    document.getElementById("terminal-out-2"),
    document.getElementById("terminal-out-3")
  ];
  
  if (typewriterElement) {
    const commandText = "npm run dev";
    let index = 0;
    
    function typeCommand() {
      if (index < commandText.length) {
        typewriterElement.textContent += commandText.charAt(index);
        index++;
        setTimeout(typeCommand, 80 + Math.random() * 40);
      } else {
        setTimeout(() => { if (termLines[0]) termLines[0].style.display = "flex"; }, 400);
        setTimeout(() => { if (termLines[1]) termLines[1].style.display = "flex"; }, 1000);
        setTimeout(() => { if (termLines[2]) termLines[2].style.display = "flex"; }, 1600);
      }
    }
    setTimeout(typeCommand, 1500);
  }

  // --- 8. GSAP ENTRANCE & SCROLL ANIMATIONS ---
  const heroTL = gsap.timeline();
  heroTL.from("#navbar", { y: -80, opacity: 0, duration: 0.8, ease: "power4.out" })
    .from("#hero-status-tag", { scale: 0.9, opacity: 0, duration: 0.6, ease: "back.out(1.5)" }, "-=0.3")
    .from("#hero-main-title span", { y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }, "-=0.4")
    .from("#hero-description", { opacity: 0, y: 15, duration: 0.6, ease: "power3.out" }, "-=0.4")
    .from("#hero-actions-container a", { scale: 0.95, opacity: 0, duration: 0.6, stagger: 0.15, ease: "power3.out" }, "-=0.4")
    .from(".hero-visuals", { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" }, "-=0.6")
    .from("#hero-widgets-container > div", { y: 40, opacity: 0, stagger: 0.15, duration: 0.8, ease: "power3.out" }, "-=0.4")
    .from("#hero-scroll-indicator", { opacity: 0, y: -10, duration: 0.6, ease: "power2.out" }, "-=0.2");

  // General reveal helper for sections
  const sections = ["about", "events", "foss-united", "people", "partners", "gallery", "join"];
  sections.forEach((sect) => {
    gsap.from(`#${sect}-section-header`, {
      scrollTrigger: {
        trigger: `#${sect}`,
        start: "top 80%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power3.out"
    });
  });

  // About Section Cards reveal
  gsap.from("#about-cards-grid .tactile-card", {
    scrollTrigger: {
      trigger: "#about-cards-grid",
      start: "top 75%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.12,
    ease: "power3.out",
    clearProps: "all"
  });



  // Featured Event Cards scroll reveal
  gsap.from("#events-card-grid .event-card", {
    scrollTrigger: {
      trigger: "#events-card-grid",
      start: "top 75%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.12,
    ease: "power3.out"
  });

  // Our People Section team grids slide-up
  gsap.from("#grid-core .member-card", {
    scrollTrigger: {
      trigger: "#grid-core",
      start: "top 75%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out"
  });

  // Gallery Section Grid items load-in
  gsap.from("#gallery-masonry-grid .gallery-item", {
    scrollTrigger: {
      trigger: "#gallery-masonry-grid",
      start: "top 75%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    scale: 0.96,
    duration: 0.7,
    stagger: 0.1,
    ease: "power2.out"
  });

  // Join Us components slide-up
  gsap.from("#join-info-panel", {
    scrollTrigger: {
      trigger: "#join",
      start: "top 75%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 25,
    duration: 0.8,
    ease: "power3.out"
  });

  gsap.from("#join-form-container", {
    scrollTrigger: {
      trigger: "#join",
      start: "top 75%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: "power3.out"
  });

  // --- 9. PARTNERSHIP CARDS REVEAL ---
  gsap.from(".foss-united-main-card", {
    scrollTrigger: {
      trigger: "#foss-united",
      start: "top 75%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 35,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out"
  });

  // --- 10. SCROLL COUNT-UP STATS ---
  const statNumbers = document.querySelectorAll(".stat-number");
  statNumbers.forEach((stat) => {
    const target = parseInt(stat.getAttribute("data-target"), 10);
    gsap.fromTo(stat, 
      { textContent: "0" },
      {
        textContent: target,
        duration: 2.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: stat,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        snap: { textContent: 1 },
        onUpdate: function() {
          if (this.targets()[0].getAttribute("data-target") === "500") {
            this.targets()[0].textContent = Math.ceil(this.targets()[0].textContent) + "+";
          } else if (this.targets()[0].getAttribute("data-target") === "60") {
            this.targets()[0].textContent = Math.ceil(this.targets()[0].textContent) + "+";
          }
        }
      }
    );
  });

  // --- 11. OUR PEOPLE REVEAL ---
  gsap.from(".people-grid .member-card", {
    scrollTrigger: {
      trigger: ".people-grid",
      start: "top 80%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 25,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out"
  });

  // --- 12. GALLERY LIGHTBOX MODAL ---
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  const galleryItems = document.querySelectorAll(".gallery-item");

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const src = item.getAttribute("data-img");
      const captionText = item.getAttribute("data-caption");
      
      if (lightbox && lightboxImg && lightboxCaption) {
        lightboxImg.src = src;
        lightboxCaption.textContent = captionText;
        lightbox.classList.add("open");
        lenis.stop();
      }
    });
  });

  function closeLightboxModal() {
    if (lightbox) {
      lightbox.classList.remove("open");
      lenis.start();
    }
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightboxModal);
  }
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightboxModal();
      }
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLightboxModal();
    }
  });

  // --- 13. JOIN REGISTRATION TERMINAL FEEDBACK ---
  const joinForm = document.getElementById("foss-registry-form");
  const formTerminal = document.getElementById("form-terminal-output");
  const submitBtn = document.getElementById("form-submit-btn");

  if (joinForm && formTerminal) {
    joinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("form-name").value.trim();
      const email = document.getElementById("form-email").value.trim();
      const dept = document.getElementById("form-dept").value;
      
      const checkedInterests = [];
      document.querySelectorAll(".interest-checkbox:checked").forEach((chk) => {
        checkedInterests.push(chk.value);
      });
      
      submitBtn.disabled = true;
      submitBtn.querySelector("span").textContent = "Submitting...";
      
      formTerminal.style.display = "block";
      formTerminal.innerHTML = "";
      
      const responseLines = [
        `$ curl -X POST https://api.foss.ajce.in/register \\`,
        `  -d name="${name}" \\`,
        `  -d dept="${dept}" \\`,
        `  -d email="${email}"`,
        `Connecting to community registry database...`,
        `Compiling selection list: [${checkedInterests.join(", ") || "General Interest"}]`,
        `[success] Registered successfully to AJCE FOSS database.`,
        `Welcome to the team, ${name}! We have sent a confirmation email to ${email}.`
      ];

      let lineIndex = 0;
      
      function printTerminalLine() {
        if (lineIndex < responseLines.length) {
          const div = document.createElement("div");
          let text = responseLines[lineIndex];
          if (text.startsWith("$") || text.startsWith("  -d")) {
            div.style.color = "var(--accent-orange-dark)";
          } else if (text.includes("[success]")) {
            div.style.color = "var(--accent-green-dark)";
            div.style.fontWeight = "bold";
          } else if (text.includes("Welcome to the team")) {
            div.style.color = "var(--accent-orange-dark)";
            div.style.fontWeight = "bold";
          }
          div.textContent = text;
          formTerminal.appendChild(div);
          
          formTerminal.scrollTop = formTerminal.scrollHeight;
          
          lineIndex++;
          setTimeout(printTerminalLine, 500 + Math.random() * 200);
        } else {
          setTimeout(() => {
            joinForm.reset();
            formTerminal.style.display = "none";
            submitBtn.disabled = false;
            submitBtn.querySelector("span").textContent = "Submit Registration";
          }, 6000);
        }
      }
      printTerminalLine();
    });
  }

  // --- 14. DYNAMIC NAVIGATION CURRENT SECTION HIGHLIGHT ---
  const navLinks = document.querySelectorAll(".nav-links a");
  const watchSections = document.querySelectorAll("section");

  function syncActiveNavLink() {
    let scrollPos = window.scrollY + 180;
    
    watchSections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");
      
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }
  window.addEventListener("scroll", syncActiveNavLink);
  syncActiveNavLink();

  // --- 15. DYNAMIC CAMPUS PHOTO SLIDESHOW / HANGER ---
  const campusImages = [
    { src: "./assets/images/ajce_college_building.png", caption: "Amal Jyothi Campus" },
    { src: "./assets/images/college_event_1.jpg", caption: "FOSS Workshop Sprint" },
    { src: "./assets/images/college_event_2.jpg", caption: "Wikimedia Seminar Meet" },
    { src: "./assets/images/college_event_3.jpg", caption: "Wikidata Presentation Session" },
    { src: "./assets/images/college_event_4.jpg", caption: "Lab Hacking & Mentoring" },
    { src: "./assets/images/college_event_5.jpg", caption: "Wikimedia Technical Summit" }
  ];

  let currentImageIndex = 0;
  const collegeCardImg = document.getElementById("college-card-img");
  const collegeCardCaption = document.getElementById("college-card-caption");
  const collegeCardWidget = document.getElementById("college-card-widget");
  const pinL = document.getElementById("hanger-pin-l");
  const pinR = document.getElementById("hanger-pin-r");

  function changeCampusImage() {
    if (!collegeCardImg || !collegeCardCaption || !collegeCardWidget) return;

    // Pick a random image index that is not the current one
    let nextIndex = currentImageIndex;
    if (campusImages.length > 1) {
      while (nextIndex === currentImageIndex) {
        nextIndex = Math.floor(Math.random() * campusImages.length);
      }
    } else {
      nextIndex = 0;
    }
    currentImageIndex = nextIndex;
    const nextImg = campusImages[currentImageIndex];

    const changeTL = gsap.timeline();

    // 1. Unpin Left: Left pin springs up, card pivots on the Right pin (80% 0%) and swings down heavily
    changeTL.to(pinL, {
      y: -15,
      rotation: -15,
      duration: 0.35,
      ease: "power2.out"
    });

    changeTL.to(collegeCardWidget, {
      transformOrigin: "80% 0%",
      rotation: 28,
      duration: 0.45,
      ease: "power1.inOut"
    }, "-=0.3");

    // 2. Unpin Right: Right pin springs up, card drops off completely falling with gravity and rotation
    changeTL.to(pinR, {
      y: -15,
      rotation: 15,
      duration: 0.25,
      ease: "power2.out"
    }, "-=0.15");

    changeTL.to(collegeCardWidget, {
      y: 280,
      rotation: 40,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        // Swap image and text while card is out of view
        collegeCardImg.src = nextImg.src;
        collegeCardCaption.textContent = nextImg.caption;
      }
    }, "-=0.25");

    // 3. Reset pins to normal clamping position
    changeTL.to([pinL, pinR], {
      y: 0,
      rotation: 0,
      duration: 0.1
    });

    // 4. Drop new card from above (y: -120), pivoting around center, and start swinging back and forth
    changeTL.fromTo(collegeCardWidget, 
      { y: -120, rotation: -24, opacity: 0, transformOrigin: "50% 0%" },
      { y: 0, rotation: 12, opacity: 1, duration: 0.55, ease: "power2.out" }
    );

    // Let the pins bounce slightly when the card is "clipped"
    changeTL.fromTo([pinL, pinR], 
      { y: -8 }, 
      { y: 0, duration: 0.4, ease: "bounce.out" }, 
      "-=0.55"
    );

    // Swing Left
    changeTL.to(collegeCardWidget, {
      rotation: -8,
      duration: 0.45,
      ease: "power1.inOut"
    });

    // Swing Right
    changeTL.to(collegeCardWidget, {
      rotation: 4,
      duration: 0.35,
      ease: "power1.inOut"
    });

    // Swing Left
    changeTL.to(collegeCardWidget, {
      rotation: -2,
      duration: 0.25,
      ease: "power1.inOut"
    });

    // Settle to a slight random angle (simulating real resting hanging picture)
    changeTL.to(collegeCardWidget, {
      rotation: Math.random() * 4 - 2, // between -2 and 2 degrees
      duration: 0.2,
      ease: "power1.inOut"
    });
  }

  // Infinite gentle bobbing and swaying for the entire hanger assembly to make it feel alive
  gsap.to(".college-card-wrapper", {
    y: "+=6",
    rotation: 1,
    duration: 3.5,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });

  // Auto transition every 6 seconds to give the viewer time to see the photo and the gorgeous physics swing
  setInterval(changeCampusImage, 6000);
});
