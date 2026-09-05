/* Magic UI–style interactions (vanilla). Loaded after script.js core. */
(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const spawnMeteors = (root) => {
        if (!root || reduceMotion) {
            return;
        }
        const count = window.innerWidth < 720 ? 10 : 18;
        for (let i = 0; i < count; i += 1) {
            const el = document.createElement("span");
            el.className = "mu-meteor";
            el.style.left = `${Math.random() * 100}%`;
            el.style.setProperty("--delay", `${Math.random() * 6}s`);
            el.style.setProperty("--duration", `${3 + Math.random() * 4}s`);
            el.style.top = `${Math.random() * 40}%`;
            root.appendChild(el);
        }
    };

    const spawnSparkles = (root) => {
        if (!root || reduceMotion) {
            return;
        }
        const colors = ["#c8f542", "#f3f2ee", "#8ec8ff"];
        for (let i = 0; i < 12; i += 1) {
            const el = document.createElement("span");
            el.className = "mu-sparkle";
            el.style.left = `${8 + Math.random() * 84}%`;
            el.style.top = `${8 + Math.random() * 84}%`;
            el.style.setProperty("--c", colors[i % colors.length]);
            el.style.setProperty("--d", `${1.4 + Math.random()}s`);
            el.style.setProperty("--delay", `${Math.random() * 2}s`);
            root.appendChild(el);
        }
    };

    const initWordRotate = (root) => {
        if (!root) {
            return;
        }
        const words = Array.from(root.querySelectorAll("span"));
        if (!words.length) {
            return;
        }
        let index = 0;
        words[0].classList.add("is-on");
        if (reduceMotion || words.length < 2) {
            return;
        }
        window.setInterval(() => {
            words[index].classList.remove("is-on");
            index = (index + 1) % words.length;
            words[index].classList.add("is-on");
        }, 2200);
    };

    const initNumberTickers = () => {
        const nodes = document.querySelectorAll("[data-ticker]");
        if (!nodes.length) {
            return;
        }
        const animate = (el) => {
            const target = Number(el.getAttribute("data-ticker") || 0);
            const suffix = el.getAttribute("data-suffix") || "";
            const prefix = el.getAttribute("data-prefix") || "";
            if (reduceMotion) {
                el.textContent = `${prefix}${target}${suffix}`;
                return;
            }
            const duration = 1400;
            const start = performance.now();
            const step = (now) => {
                const t = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - t, 3);
                const value = Math.round(target * eased);
                el.textContent = `${prefix}${value}${suffix}`;
                if (t < 1) {
                    requestAnimationFrame(step);
                }
            };
            requestAnimationFrame(step);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animate(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.4 }
        );
        nodes.forEach((node) => observer.observe(node));
    };

    const initMagicCards = () => {
        if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) {
            return;
        }
        document.querySelectorAll(".mu-magic-card").forEach((card) => {
            card.addEventListener(
                "pointermove",
                (event) => {
                    const box = card.getBoundingClientRect();
                    const x = ((event.clientX - box.left) / box.width) * 100;
                    const y = ((event.clientY - box.top) / box.height) * 100;
                    card.style.setProperty("--mx", `${x}%`);
                    card.style.setProperty("--my", `${y}%`);
                },
                { passive: true }
            );
        });
    };

    const fireConfetti = () => {
        if (reduceMotion) {
            return;
        }
        const layer = document.createElement("div");
        layer.className = "mu-confetti";
        layer.setAttribute("aria-hidden", "true");
        const colors = ["#c8f542", "#8ec8ff", "#f3f2ee", "#9dffb8", "#ffd27a"];
        for (let i = 0; i < 48; i += 1) {
            const piece = document.createElement("i");
            piece.style.left = `${Math.random() * 100}%`;
            piece.style.background = colors[i % colors.length];
            piece.style.setProperty("--x", `${(Math.random() - 0.5) * 180}px`);
            piece.style.setProperty("--d", `${1.8 + Math.random() * 1.4}s`);
            piece.style.setProperty("--delay", `${Math.random() * 0.35}s`);
            layer.appendChild(piece);
        }
        document.body.appendChild(layer);
        window.setTimeout(() => layer.remove(), 3200);
    };

    const initCoolMode = () => {
        if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) {
            return;
        }
        document.addEventListener("click", (event) => {
            const target = event.target.closest(".btn, .solution-card, .channel-card");
            if (!target) {
                return;
            }
            const colors = ["#c8f542", "#8ec8ff", "#f3f2ee"];
            for (let i = 0; i < 8; i += 1) {
                const burst = document.createElement("span");
                burst.className = "mu-cool-burst";
                burst.style.left = `${event.clientX}px`;
                burst.style.top = `${event.clientY}px`;
                burst.style.background = colors[i % colors.length];
                const angle = (Math.PI * 2 * i) / 8;
                const dist = 28 + Math.random() * 36;
                burst.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
                burst.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
                document.body.appendChild(burst);
                window.setTimeout(() => burst.remove(), 750);
            }
        });
    };

    const hookFormConfetti = () => {
        const success = document.getElementById("formSuccess");
        if (!success || typeof MutationObserver === "undefined") {
            return;
        }
        const observer = new MutationObserver(() => {
            if (!success.hidden && success.textContent.trim()) {
                fireConfetti();
            }
        });
        observer.observe(success, { attributes: true, childList: true, characterData: true, subtree: true });
    };

    document.addEventListener("DOMContentLoaded", () => {
        spawnMeteors(document.getElementById("muMeteors"));
        document.querySelectorAll(".mu-sparkles").forEach(spawnSparkles);
        initWordRotate(document.getElementById("muWordRotate"));
        initNumberTickers();
        initMagicCards();
        initCoolMode();
        hookFormConfetti();
        window.mslFireConfetti = fireConfetti;
    });
})();
