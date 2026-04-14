const progressBar = document.querySelector(".scroll-progress");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".stat-card");
const spotlight = document.querySelector(".spotlight");
const cursorRing = document.querySelector(".cursor-ring");
const cursorDot = document.querySelector(".cursor-dot");
const heroStage = document.querySelector(".hero-stage");
const parallaxLayers = document.querySelectorAll("[data-parallax]");
const typeTarget = document.getElementById("type-target");
const yearNode = document.getElementById("year");
const canvas = document.querySelector(".starfield");
const interactiveNodes = document.querySelectorAll("a, button");
const skillNodes = document.querySelectorAll(".skill-node");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const handleProgress = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
};

window.addEventListener("scroll", handleProgress, { passive: true });
handleProgress();

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const animateCounter = (card) => {
  const counter = card.querySelector(".counter");
  const target = Number(card.dataset.count || 0);

  if (!counter || !target) {
    return;
  }

  const duration = 1300;
  const start = performance.now();

  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.round(target * eased).toString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

counters.forEach((card) => counterObserver.observe(card));

const touchDevice = window.matchMedia("(pointer: coarse)").matches;

if (!touchDevice) {
  window.addEventListener("mousemove", (event) => {
    const { clientX, clientY } = event;

    if (cursorRing) {
      cursorRing.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
    }

    if (cursorDot) {
      cursorDot.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
    }

    if (spotlight) {
      spotlight.style.setProperty("--x", `${clientX}px`);
      spotlight.style.setProperty("--y", `${clientY}px`);
    }
  });

  interactiveNodes.forEach((node) => {
    node.addEventListener("mouseenter", () => {
      document.body.classList.add("is-hovering");
    });

    node.addEventListener("mouseleave", () => {
      document.body.classList.remove("is-hovering");
    });
  });
}

skillNodes.forEach((node) => {
  const resetNode = () => {
    node.classList.remove("is-active");
    node.style.transform = "";
  };

  const pulseNode = () => {
    node.classList.remove("is-active");
    void node.offsetWidth;
    node.classList.add("is-active");
    window.setTimeout(() => node.classList.remove("is-active"), 520);
  };

  node.addEventListener("mouseenter", pulseNode);
  node.addEventListener("click", pulseNode);
  node.addEventListener("touchstart", pulseNode, { passive: true });

  if (!touchDevice) {
    node.addEventListener("mousemove", (event) => {
      const rect = node.getBoundingClientRect();
      const intensity = Number(node.dataset.tiltIntensity || 10);
      const rotateX = (((event.clientY - rect.top) / rect.height) - 0.5) * -intensity;
      const rotateY = (((event.clientX - rect.left) / rect.width) - 0.5) * intensity;
      node.style.transform = `var(--base-transform) perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    });

    node.addEventListener("mouseleave", resetNode);
  }
});

if (heroStage) {
  heroStage.addEventListener("mousemove", (event) => {
    const bounds = heroStage.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const centerX = x - bounds.width / 2;
    const centerY = y - bounds.height / 2;

    parallaxLayers.forEach((layer) => {
      const depth = Number(layer.dataset.parallax || 0);
      const moveX = (centerX / bounds.width) * depth;
      const moveY = (centerY / bounds.height) * depth;

      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  });

  heroStage.addEventListener("mouseleave", () => {
    parallaxLayers.forEach((layer) => {
      layer.style.transform = "";
    });
  });
}

if (typeTarget) {
  const phrases = [
    "building reliable software",
    "shipping production-ready systems",
    "working across cyber and backend",
    "turning ideas into real products"
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tickType = () => {
    const phrase = phrases[phraseIndex];
    const visibleText = deleting
      ? phrase.slice(0, charIndex--)
      : phrase.slice(0, charIndex++);

    typeTarget.textContent = visibleText;

    if (!deleting && charIndex > phrase.length) {
      deleting = true;
      window.setTimeout(tickType, 1200);
      return;
    }

    if (deleting && charIndex < 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      charIndex = 0;
    }

    const delay = deleting ? 40 : 70;
    window.setTimeout(tickType, delay);
  };

  tickType();
}

const initStarfield = () => {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  let width = 0;
  let height = 0;
  let stars = [];

  const createStars = () => {
    const density = Math.max(90, Math.floor((width * height) / 14000));
    stars = Array.from({ length: density }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.2,
      speed: Math.random() * 0.25 + 0.08,
      alpha: Math.random() * 0.8 + 0.1
    }));
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    createStars();
  };

  const render = () => {
    context.clearRect(0, 0, width, height);

    stars.forEach((star) => {
      star.y += star.speed;

      if (star.y > height + 4) {
        star.y = -4;
        star.x = Math.random() * width;
      }

      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      context.fill();
    });

    requestAnimationFrame(render);
  };

  resize();
  render();
  window.addEventListener("resize", resize);
};

initStarfield();
