document.addEventListener("DOMContentLoaded", () => {
    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav");
    const header = document.getElementById("header");
    const progress = document.getElementById("scrollProgress");
    const form = document.getElementById("contactForm");
    const wechat = document.getElementById("wechatCopy");
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

    if (wechat) {
        wechat.addEventListener("click", async () => {
            const value = wechat.dataset.copy;
            const label = wechat.querySelector("strong");
            try {
                await navigator.clipboard.writeText(value);
                label.textContent = "Скопировано";
            } catch (error) {
                label.textContent = value;
            }
        });
    }

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
            window.location.href = "https://t.me/max_orlo";
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
});
