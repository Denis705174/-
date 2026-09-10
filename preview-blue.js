const LEAD_API = "https://syntora-lead-api-1.onrender.com/api/lead";
const LEAD_FETCH_MS = 90000;

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav");
    const header = document.getElementById("header");
    const scrollLine = document.getElementById("scrollLine");
    const form = document.getElementById("contactForm");
    const formError = document.getElementById("formError");
    const formSuccess = document.getElementById("formSuccess");

    const setMenu = (open) => {
        if (!nav || !burger) return;
        nav.classList.toggle("active", open);
        burger.classList.toggle("active", open);
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("nav-open", open);
    };

    if (burger && nav) {
        burger.addEventListener("click", () => setMenu(!nav.classList.contains("active")));
        nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
    }

    const onScroll = () => {
        if (header) header.classList.toggle("is-on", window.scrollY > 8);
        if (scrollLine) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = max > 0 ? window.scrollY / max : 0;
            scrollLine.style.width = `${Math.min(ratio, 1) * 100}%`;
        }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!reduceMotion) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.14 }
        );
        document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    } else {
        document.querySelectorAll(".reveal-on-scroll").forEach((el) => el.classList.add("is-visible"));
    }

    const canvas = document.getElementById("vizField");
    if (canvas && !reduceMotion) {
        const ctx = canvas.getContext("2d");
        const count = window.innerWidth < 800 ? 42 : 78;
        const particles = Array.from({ length: count }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.6 + 0.4,
            vx: (Math.random() - 0.5) * 0.00032,
            vy: (Math.random() - 0.5) * 0.00028,
            a: Math.random(),
        }));

        const fit = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            return [window.innerWidth, window.innerHeight];
        };

        let size = fit();
        window.addEventListener("resize", () => {
            size = fit();
        });

        let active = !document.hidden;
        document.addEventListener("visibilitychange", () => {
            active = !document.hidden;
            if (active) requestAnimationFrame(loop);
        });

        const loop = (time) => {
            const [w, h] = size;
            ctx.clearRect(0, 0, w, h);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > 1) p.vx *= -1;
                if (p.y < 0 || p.y > 1) p.vy *= -1;
                const pulse = 0.35 + Math.abs(Math.sin(time * 0.001 + p.a * 5)) * 0.65;
                ctx.beginPath();
                ctx.fillStyle = `rgba(79, 195, 255, ${0.18 + pulse * 0.35})`;
                ctx.arc(p.x * w, p.y * h, p.r * (0.8 + pulse * 0.4), 0, Math.PI * 2);
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i += 1) {
                for (let j = i + 1; j < particles.length; j += 1) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = (a.x - b.x) * w;
                    const dy = (a.y - b.y) * h;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 130) {
                        ctx.strokeStyle = `rgba(47, 107, 255, ${(1 - dist / 130) * 0.18})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x * w, a.y * h);
                        ctx.lineTo(b.x * w, b.y * h);
                        ctx.stroke();
                    }
                }
            }

            if (active) requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.textContent;
        if (formError) {
            formError.hidden = true;
            formError.textContent = "";
        }
        if (formSuccess) {
            formSuccess.hidden = true;
            formSuccess.textContent = "";
        }
        btn.disabled = true;
        btn.textContent = "Отправка...";

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), LEAD_FETCH_MS);

        try {
            const data = Object.fromEntries(new FormData(form).entries());
            const response = await fetch(LEAD_API, {
                method: "POST",
                headers: { Accept: "application/json", "Content-Type": "application/json" },
                body: JSON.stringify(data),
                signal: controller.signal,
            });
            if (!response.ok) throw new Error("send");
            form.reset();
            if (formSuccess) {
                formSuccess.hidden = false;
                formSuccess.textContent = "Заявка отправлена. Менеджер Syntora Space свяжется с вами.";
            }
            btn.textContent = "Отправлено";
        } catch (error) {
            if (formError) {
                formError.hidden = false;
                formError.textContent =
                    error.name === "AbortError"
                        ? "Сервис просыпается — подождите минуту или напишите в Telegram @syntora_space."
                        : "Не отправилось. Напишите в Telegram @syntora_space.";
            }
        } finally {
            window.clearTimeout(timeout);
            window.setTimeout(() => {
                btn.disabled = false;
                btn.textContent = original;
            }, 2800);
        }
    });
});
