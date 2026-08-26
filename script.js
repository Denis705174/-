document.addEventListener("DOMContentLoaded", () => {
    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav");
    const header = document.getElementById("header");
    const progress = document.getElementById("scrollProgress");
    const form = document.getElementById("contactForm");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    burger.addEventListener("click", () => {
        nav.classList.toggle("active");
        burger.classList.toggle("active");
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("active");
            burger.classList.remove("active");
        });
    });

    const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? window.scrollY / max : 0;
        progress.style.width = `${Math.min(ratio, 1) * 100}%`;
        header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = "Отправка...";
        btn.disabled = true;
        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" },
            });
            if (!response.ok) {
                throw new Error("send failed");
            }
            btn.textContent = "Отправлено";
            form.reset();
        } catch (error) {
            window.location.href = "https://t.me/syntora_space";
            return;
        } finally {
            setTimeout(() => {
                btn.textContent = original;
                btn.disabled = false;
            }, 2400);
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const href = anchor.getAttribute("href");
            if (href === "#") {
                return;
            }
            const target = document.querySelector(href);
            if (!target) {
                return;
            }
            event.preventDefault();
            target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        });
    });

    const setupCanvas = (canvas, draw) => {
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext("2d");
        const fit = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, rect.width) * dpr;
            canvas.height = Math.max(1, rect.height) * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            return [rect.width, rect.height];
        };
        let size = fit();
        window.addEventListener("resize", () => {
            size = fit();
        });
        const loop = (time) => {
            draw(ctx, size[0], size[1], time);
            if (!reduceMotion) {
                requestAnimationFrame(loop);
            }
        };
        loop(0);
    };

    const stars = Array.from({ length: 140 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.4 + 0.2,
        a: Math.random(),
        s: 0.2 + Math.random() * 0.8,
    }));

    setupCanvas(document.getElementById("space"), (ctx, w, h, time) => {
        ctx.clearRect(0, 0, w, h);
        stars.forEach((star) => {
            const pulse = 0.25 + Math.abs(Math.sin(time * 0.001 * star.s + star.a * 8)) * 0.7;
            ctx.fillStyle = `rgba(0, 212, 255, ${pulse * 0.55})`;
            ctx.beginPath();
            ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    const golden = Math.PI * (3 - Math.sqrt(5));
    const globeDots = Array.from({ length: 520 }, (_, i) => {
        const y = 1 - (i / 519) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = golden * i;
        return [Math.cos(theta) * radius, y, Math.sin(theta) * radius];
    });

    setupCanvas(document.getElementById("globe"), (ctx, w, h, time) => {
        ctx.clearRect(0, 0, w, h);
        const cx = w * 0.52;
        const cy = h * 0.52;
        const radius = Math.min(w, h) * 0.32;
        const rot = reduceMotion ? 0.6 : time * 0.00045;

        const glow = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius * 1.55);
        glow.addColorStop(0, "rgba(0, 123, 255, 0.28)");
        glow.addColorStop(0.55, "rgba(0, 242, 255, 0.08)");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        [[0.55, 1.72], [0.22, 1.95], [-0.42, 1.5]].forEach((ring, i) => {
            ctx.strokeStyle = `rgba(0, 242, 255, ${0.22 + i * 0.08})`;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.ellipse(0, 0, radius * ring[1], radius * ring[1] * 0.26, ring[0] + rot * (0.4 + i * 0.12), 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.restore();

        globeDots.forEach((dot) => {
            const cos = Math.cos(rot);
            const sin = Math.sin(rot);
            const x = dot[0] * cos - dot[2] * sin;
            const z = dot[0] * sin + dot[2] * cos;
            if (z < -0.08) {
                return;
            }
            const depth = (z + 1) / 2;
            ctx.fillStyle = `rgba(0, 212, 255, ${0.18 + depth * 0.82})`;
            ctx.beginPath();
            ctx.arc(cx + x * radius, cy + dot[1] * radius, 0.7 + depth * 1.7, 0, Math.PI * 2);
            ctx.fill();
        });

        const ang = rot * 3.2;
        const px = cx + Math.cos(ang) * radius * 1.62;
        const py = cy + Math.sin(ang) * radius * 0.42;
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#00d4ff";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(px + 10, py);
        ctx.lineTo(px - 7, py - 5);
        ctx.lineTo(px - 1, py);
        ctx.lineTo(px - 7, py + 5);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    if (!reduceMotion) {
        document.querySelectorAll(".tilt").forEach((card) => {
            card.addEventListener("mousemove", (event) => {
                const box = card.getBoundingClientRect();
                const x = (event.clientX - box.left) / box.width - 0.5;
                const y = (event.clientY - box.top) / box.height - 0.5;
                card.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 10}deg) translateZ(8px)`;
            });
            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });
        });
    }
});
