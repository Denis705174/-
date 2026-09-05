const LEAD_API = "https://syntora-lead-api-1.onrender.com/api/lead";
const LEAD_FETCH_MS = 90000;

(() => {
    const host = window.location.hostname;
    if (window.location.protocol === "http:" && host === "syntora.space") {
        window.location.replace(`https://syntora.space${window.location.pathname}${window.location.search}${window.location.hash}`);
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav");
    const header = document.getElementById("header");
    const progress = document.getElementById("scrollProgress");
    const form = document.getElementById("contactForm");
    const formError = document.getElementById("formError");
    const formSuccess = document.getElementById("formSuccess");
    const bgMesh = document.getElementById("bgMesh");
    const cursorGlow = document.getElementById("cursorGlow");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setMenu = (open) => {
        if (!nav || !burger) {
            return;
        }
        nav.classList.toggle("active", open);
        burger.classList.toggle("active", open);
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("nav-open", open);
    };

    if (burger && nav) {
        burger.addEventListener("click", () => setMenu(!nav.classList.contains("active")));
        nav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => setMenu(false));
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                setMenu(false);
            }
        });
    }

    const onScroll = () => {
        if (progress) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = max > 0 ? window.scrollY / max : 0;
            progress.style.width = `${Math.min(ratio, 1) * 100}%`;
        }
        if (header) {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        }
        if (bgMesh && !reduceMotion) {
            const y = window.scrollY * 0.08;
            bgMesh.style.transform = `translate3d(0, ${y}px, 0)`;
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
            { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
        );
        document.querySelectorAll(".reveal-on-scroll").forEach((el, index) => {
            el.style.setProperty("--stagger", `${Math.min(index % 6, 5) * 70}ms`);
            observer.observe(el);
        });
    } else {
        document.querySelectorAll(".reveal-on-scroll").forEach((el) => el.classList.add("is-visible"));
    }

    if (!reduceMotion && cursorGlow && window.matchMedia("(pointer: fine)").matches) {
        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let gx = mx;
        let gy = my;
        document.addEventListener(
            "pointermove",
            (event) => {
                mx = event.clientX;
                my = event.clientY;
                cursorGlow.classList.add("is-on");
            },
            { passive: true }
        );
        document.addEventListener("pointerleave", () => cursorGlow.classList.remove("is-on"));
        const tickGlow = () => {
            gx += (mx - gx) * 0.12;
            gy += (my - gy) * 0.12;
            cursorGlow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
            requestAnimationFrame(tickGlow);
        };
        requestAnimationFrame(tickGlow);
    }

    if (!reduceMotion) {
        document.querySelectorAll(".magnetic").forEach((btn) => {
            btn.addEventListener("pointermove", (event) => {
                const box = btn.getBoundingClientRect();
                const x = event.clientX - box.left - box.width / 2;
                const y = event.clientY - box.top - box.height / 2;
                btn.style.transform = `translate3d(${x * 0.18}px, ${y * 0.22}px, 0)`;
            });
            btn.addEventListener("pointerleave", () => {
                btn.style.transform = "";
            });
        });

        document.querySelectorAll(".tilt-card").forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                const box = card.getBoundingClientRect();
                const x = (event.clientX - box.left) / box.width - 0.5;
                const y = (event.clientY - box.top) / box.height - 0.5;
                card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
            });
            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
            });
        });
    }

    const clearFormMessages = () => {
        if (formError) {
            formError.hidden = true;
            formError.textContent = "";
        }
        if (formSuccess) {
            formSuccess.hidden = true;
            formSuccess.textContent = "";
        }
    };

    const showFormError = (message) => {
        if (!formError) {
            return;
        }
        formError.textContent = message;
        formError.hidden = false;
        if (formSuccess) {
            formSuccess.hidden = true;
        }
    };

    const showFormSuccess = (message) => {
        if (!formSuccess) {
            return;
        }
        formSuccess.textContent = message;
        formSuccess.hidden = false;
        if (formError) {
            formError.hidden = true;
        }
        if (typeof window.mslFireConfetti === "function") {
            window.mslFireConfetti();
        }
    };

    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const original = btn.textContent;
            clearFormMessages();
            btn.textContent = "Отправка...";
            btn.disabled = true;

            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), LEAD_FETCH_MS);

            try {
                const data = Object.fromEntries(new FormData(form).entries());
                const response = await fetch(LEAD_API, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                    signal: controller.signal,
                });

                if (response.status === 429) {
                    throw new Error("rate");
                }
                if (!response.ok) {
                    throw new Error("send");
                }

                btn.textContent = "Отправлено";
                form.reset();
                showFormSuccess("Заявка отправлена. Менеджер MiniScribe Labs свяжется с вами.");
            } catch (error) {
                if (error.name === "AbortError") {
                    showFormError("Сервис просыпается — подождите минуту и попробуйте снова, или напишите в Telegram @syntora_space.");
                } else if (error.message === "rate") {
                    showFormError("Слишком часто. Подождите полминуты и отправьте ещё раз.");
                } else {
                    showFormError("Не отправилось. Напишите в Telegram @syntora_space или попробуйте ещё раз.");
                }
            } finally {
                window.clearTimeout(timeout);
                setTimeout(() => {
                    btn.textContent = original;
                    btn.disabled = false;
                }, 3200);
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const href = anchor.getAttribute("href");
            if (!href || href === "#") {
                return;
            }
            const target = document.querySelector(href);
            if (!target) {
                return;
            }
            event.preventDefault();
            target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
            history.replaceState(null, "", href);
        });
    });

    const canvas = document.getElementById("fxField");
    if (canvas && !reduceMotion) {
        const ctx = canvas.getContext("2d");
        const particles = Array.from({ length: window.innerWidth < 800 ? 36 : 64 }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.8 + 0.4,
            vx: (Math.random() - 0.5) * 0.00035,
            vy: (Math.random() - 0.5) * 0.00025,
            a: Math.random(),
            s: 0.4 + Math.random() * 1.2,
        }));

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

        let active = !document.hidden;
        document.addEventListener("visibilitychange", () => {
            active = !document.hidden;
            if (active) {
                requestAnimationFrame(loop);
            }
        });

        const loop = (time) => {
            const [w, h] = size;
            ctx.clearRect(0, 0, w, h);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > 1) {
                    p.vx *= -1;
                }
                if (p.y < 0 || p.y > 1) {
                    p.vy *= -1;
                }
                const pulse = 0.2 + Math.abs(Math.sin(time * 0.001 * p.s + p.a * 6)) * 0.8;
                ctx.beginPath();
                ctx.fillStyle = `rgba(200, 245, 66, ${0.12 + pulse * 0.35})`;
                ctx.arc(p.x * w, p.y * h, p.r * (0.8 + pulse * 0.5), 0, Math.PI * 2);
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i += 1) {
                for (let j = i + 1; j < particles.length; j += 1) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = (a.x - b.x) * w;
                    const dy = (a.y - b.y) * h;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 120) {
                        ctx.strokeStyle = `rgba(200, 245, 66, ${(1 - dist / 120) * 0.12})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x * w, a.y * h);
                        ctx.lineTo(b.x * w, b.y * h);
                        ctx.stroke();
                    }
                }
            }

            if (active) {
                requestAnimationFrame(loop);
            }
        };
        requestAnimationFrame(loop);
    }
});
