(function() {
    'use strict';

    window.__app = window.__app || {};

    const TRANSITION_DURATION = 300;
    const DEBOUNCE_DELAY = 250;
    const THROTTLE_DELAY = 100;

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => { inThrottle = false; }, limit);
            }
        };
    }

    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function initBurgerMenu() {
        if (window.__app.burgerInit) return;
        window.__app.burgerInit = true;

        const toggle = document.querySelector('.navbar-toggler');
        const collapse = document.querySelector('.navbar-collapse');
        const body = document.body;
        const header = document.querySelector('.l-header');

        if (!toggle || !collapse) return;

        const headerHeight = header ? header.offsetHeight : 72;
        collapse.style.setProperty('--header-h', `${headerHeight}px`);

        function openMenu() {
            collapse.style.display = 'block';
            collapse.style.height = `calc(100vh - ${headerHeight}px)`;
            setTimeout(() => {
                collapse.classList.add('show');
            }, 10);
            toggle.setAttribute('aria-expanded', 'true');
            body.style.overflow = 'hidden';
        }

        function closeMenu() {
            collapse.classList.remove('show');
            toggle.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
            setTimeout(() => {
                if (!collapse.classList.contains('show')) {
                    collapse.style.display = '';
                    collapse.style.height = '';
                }
            }, TRANSITION_DURATION);
        }

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                closeMenu();
            }
        });

        const navLinks = collapse.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024) {
                    closeMenu();
                }
            });
        });

        window.addEventListener('resize', throttle(() => {
            if (window.innerWidth >= 1024 && toggle.getAttribute('aria-expanded') === 'true') {
                closeMenu();
            }
        }, THROTTLE_DELAY));
    }

    function initScrollSpy() {
        if (window.__app.scrollSpyInit) return;
        window.__app.scrollSpyInit = true;

        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        if (sections.length === 0 || navLinks.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href === `#${entry.target.id}`) {
                            navLinks.forEach(l => l.classList.remove('active'));
                            link.classList.add('active');
                            link.setAttribute('aria-current', 'page');
                        }
                    });
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-100px 0px -66% 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    function initSmoothScroll() {
        if (window.__app.smoothScrollInit) return;
        window.__app.smoothScrollInit = true;

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href === '#' || href === '#!') return;

            const targetId = href.substring(1);
            const target = document.getElementById(targetId);
            if (!target) return;

            e.preventDefault();

            const header = document.querySelector('.l-header');
            const headerHeight = header ? header.offsetHeight : 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    }

    function initScrollAnimations() {
        if (window.__app.scrollAnimInit) return;
        window.__app.scrollAnimInit = true;

        const elements = document.querySelectorAll('.card, .c-card, h2, h3, p, img, .btn');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    entry.target.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        });
                    });

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }

    function initButtonRippleEffect() {
        if (window.__app.rippleInit) return;
        window.__app.rippleInit = true;

        const buttons = document.querySelectorAll('.btn, .c-button, .nav-link');

        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s ease-in-out';
                this.style.transform = 'translateY(-2px)';
            });

            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });

            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    left: ${x}px;
                    top: ${y}px;
                    transform: scale(0);
                    animation: ripple-effect 0.6s ease-out;
                    pointer-events: none;
                `;

                const style = document.createElement('style');
                if (!document.getElementById('ripple-animation')) {
                    style.id = 'ripple-animation';
                    style.textContent = `
                        @keyframes ripple-effect {
                            to {
                                transform: scale(2);
                                opacity: 0;
                            }
                        }
                    `;
                    document.head.appendChild(style);
                }

                const position = window.getComputedStyle(this).position;
                if (position === 'static') {
                    this.style.position = 'relative';
                }
                this.style.overflow = 'hidden';

                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    function initCardHoverEffects() {
        if (window.__app.cardHoverInit) return;
        window.__app.cardHoverInit = true;

        const cards = document.querySelectorAll('.card, .c-card');

        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s ease-in-out';
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.15)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            });
        });
    }

    function initCountUp() {
        if (window.__app.countUpInit) return;
        window.__app.countUpInit = true;

        const counters = document.querySelectorAll('[data-count]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const endValue = parseInt(target.getAttribute('data-count'));
                    const duration = 2000;
                    const startTime = performance.now();

                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const currentValue = Math.floor(progress * endValue);

                        target.textContent = currentValue.toLocaleString();

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            target.textContent = endValue.toLocaleString();
                        }
                    }

                    requestAnimationFrame(updateCounter);
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    function initFormValidation() {
        if (window.__app.formValidationInit) return;
        window.__app.formValidationInit = true;

        const forms = document.querySelectorAll('#contact-form, #serviceForm');

        const validators = {
            firstName: {
                pattern: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
                message: 'Vorname muss 2-50 Zeichen enthalten (nur Buchstaben)'
            },
            lastName: {
                pattern: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
                message: 'Nachname muss 2-50 Zeichen enthalten (nur Buchstaben)'
            },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
            },
            phone: {
                pattern: /^[\d\s+\-()]{10,20}$/,
                message: 'Telefonnummer muss 10-20 Zeichen enthalten'
            },
            message: {
                minLength: 10,
                message: 'Nachricht muss mindestens 10 Zeichen enthalten'
            },
            subject: {
                required: true,
                message: 'Bitte wählen Sie ein Thema aus'
            },
            privacy: {
                checked: true,
                message: 'Sie müssen die Datenschutzbestimmungen akzeptieren'
            }
        };

        function showError(field, message) {
            const errorId = field.getAttribute('aria-describedby');
            let errorElement = errorId ? document.getElementById(errorId) : null;

            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'invalid-feedback';
                errorElement.id = `${field.id}Error`;
                field.setAttribute('aria-describedby', errorElement.id);
                field.parentNode.appendChild(errorElement);
            }

            errorElement.textContent = message;
            errorElement.style.display = 'block';
            field.classList.add('is-invalid');
            field.setAttribute('aria-invalid', 'true');
        }

        function clearError(field) {
            const errorId = field.getAttribute('aria-describedby');
            const errorElement = errorId ? document.getElementById(errorId) : null;

            if (errorElement) {
                errorElement.style.display = 'none';
            }

            field.classList.remove('is-invalid');
            field.removeAttribute('aria-invalid');
        }

        function validateField(field) {
            const fieldName = field.name || field.id;
            const validator = validators[fieldName];

            if (!validator) return true;

            clearError(field);

            const value = field.value.trim();

            if (field.hasAttribute('required') && !value && field.type !== 'checkbox') {
                showError(field, 'Dieses Feld ist erforderlich');
                return false;
            }

            if (field.type === 'checkbox' && validator.checked && !field.checked) {
                showError(field, validator.message);
                return false;
            }

            if (value && validator.pattern && !validator.pattern.test(value)) {
                showError(field, validator.message);
                return false;
            }

            if (value && validator.minLength && value.length < validator.minLength) {
                showError(field, validator.message);
                return false;
            }

            if (field.tagName === 'SELECT' && validator.required && !value) {
                showError(field, validator.message);
                return false;
            }

            return true;
        }

        forms.forEach(form => {
            const fields = form.querySelectorAll('input, textarea, select');

            fields.forEach(field => {
                field.addEventListener('blur', () => validateField(field));
                field.addEventListener('input', debounce(() => {
                    if (field.classList.contains('is-invalid')) {
                        validateField(field);
                    }
                }, 300));
            });

            form.addEventListener('submit', (e) => {
                e.preventDefault();

                let isValid = true;
                const formFields = form.querySelectorAll('input, textarea, select');

                formFields.forEach(field => {
                    if (!validateField(field)) {
                        isValid = false;
                    }
                });

                if (!isValid) {
                    const firstInvalid = form.querySelector('.is-invalid');
                    if (firstInvalid) {
                        firstInvalid.focus();
                        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                }

                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;

                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';

                setTimeout(() => {
                    window.location.href = 'thank_you.html';
                }, 1500);
            });
        });
    }

    function initLazyLoading() {
        if (window.__app.lazyLoadInit) return;
        window.__app.lazyLoadInit = true;

        const images = document.querySelectorAll('img:not([loading])');
        const videos = document.querySelectorAll('video:not([loading])');

        images.forEach(img => {
            if (!img.classList.contains('c-logo__img') && !img.hasAttribute('data-critical')) {
                img.setAttribute('loading', 'lazy');
            }
        });

        videos.forEach(video => {
            video.setAttribute('loading', 'lazy');
        });
    }

    function initModalPrivacy() {
        if (window.__app.modalPrivacyInit) return;
        window.__app.modalPrivacyInit = true;

        const privacyLinks = document.querySelectorAll('a[href="privacy.html"], a[href="/privacy.html"]');

        privacyLinks.forEach(link => {
            if (link.closest('footer') || link.closest('.form-check')) {
                link.addEventListener('click', (e) => {
                    if (window.innerWidth >= 768 && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();

                        const modal = document.createElement('div');
                        modal.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0.7);
                            z-index: 9999;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 20px;
                            animation: fadeIn 0.3s ease-in-out;
                        `;

                        const modalContent = document.createElement('div');
                        modalContent.style.cssText = `
                            background: white;
                            border-radius: 16px;
                            max-width: 800px;
                            max-height: 80vh;
                            overflow-y: auto;
                            padding: 40px;
                            position: relative;
                            animation: slideUp 0.3s ease-out;
                        `;

                        const closeBtn = document.createElement('button');
                        closeBtn.innerHTML = '&times;';
                        closeBtn.style.cssText = `
                            position: absolute;
                            top: 20px;
                            right: 20px;
                            background: transparent;
                            border: none;
                            font-size: 32px;
                            cursor: pointer;
                            color: #6B7280;
                            line-height: 1;
                            padding: 0;
                            width: 32px;
                            height: 32px;
                        `;

                        const iframe = document.createElement('iframe');
                        iframe.src = 'privacy.html';
                        iframe.style.cssText = `
                            width: 100%;
                            height: 60vh;
                            border: none;
                            border-radius: 8px;
                        `;

                        const style = document.createElement('style');
                        style.textContent = `
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                            @keyframes slideUp {
                                from { height: 0; max-height: calc(100vh - var(--header-h)); opacity: 1; }
                                to { transform: translateY(0); opacity: 1; }
                            }
                        `;
                        document.head.appendChild(style);

                        closeBtn.addEventListener('click', () => {
                            modal.style.animation = 'fadeOut 0.3s ease-in-out';
                            setTimeout(() => modal.remove(), 300);
                        });

                        modal.addEventListener('click', (e) => {
                            if (e.target === modal) {
                                modal.style.animation = 'fadeOut 0.3s ease-in-out';
                                setTimeout(() => modal.remove(), 300);
                            }
                        });

                        modalContent.appendChild(closeBtn);
                        modalContent.appendChild(iframe);
                        modal.appendChild(modalContent);
                        modal.addEventListener('transitionend', () => {
                            if (!document.body.contains(modal)) {
                                document.body.style.overflow = '';
                            }
                        });
                        document.body.appendChild(modal);

                        document.body.style.overflow = 'hidden';
                    }
                });
            }
        });
    }

    function initScrollToTop() {
        if (window.__app.scrollToTopInit) return;
        window.__app.scrollToTopInit = true;

        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '↑';
        scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease-in-out;
            z-index: 999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;

        document.body.appendChild(scrollBtn);

        window.addEventListener('scroll', throttle(() => {
            if (window.pageYOffset > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
            }
        }, THROTTLE_DELAY));

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        scrollBtn.addEventListener('mouseenter', () => {
            scrollBtn.style.transform = 'scale(1.1)';
        });

        scrollBtn.addEventListener('mouseleave', () => {
            scrollBtn.style.transform = 'scale(1)';
        });
    }

    function initImageAnimations() {
        if (window.__app.imageAnimInit) return;
        window.__app.imageAnimInit = true;

        const images = document.querySelectorAll('img');

        images.forEach(img => {
            img.style.opacity = '0';
            img.style.transform = 'scale(0.95)';

            if (img.complete) {
                animateImage(img);
            } else {
                img.addEventListener('load', () => animateImage(img));
            }
        });

        function animateImage(img) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                        requestAnimationFrame(() => {
                            img.style.opacity = '1';
                            img.style.transform = 'scale(1)';
                        });
                        observer.unobserve(img);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(img);
        }
    }

    function initHeroAnimations() {
        if (window.__app.heroAnimInit) return;
        window.__app.heroAnimInit = true;

        const hero = document.querySelector('.l-hero');
        if (!hero) return;

        const heroElements = hero.querySelectorAll('h1, .lead, .btn');

        heroElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';

            setTimeout(() => {
                el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    window.__app.init = function() {
        initBurgerMenu();
        initScrollSpy();
        initSmoothScroll();
        initScrollAnimations();
        initButtonRippleEffect();
        initCardHoverEffects();
        initCountUp();
        initFormValidation();
        initLazyLoading();
        initModalPrivacy();
        initScrollToTop();
        initImageAnimations();
        initHeroAnimations();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.__app.init);
    } else {
        window.__app.init();
    }

})();