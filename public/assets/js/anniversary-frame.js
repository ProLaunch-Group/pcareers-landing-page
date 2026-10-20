/**
 * ProLaunch Careers — 1-Year Anniversary Interactive Photo Frame Studio
 * & Countdown Timer Engine.
 * 
 * Target Date: October 31st, 2026, 7:00 PM WAT
 */

class AnniversaryFrameStudio {
    constructor() {
        this.canvas = document.getElementById('celebrationCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.size = 1080; // Crisp social square resolution
        this.canvas.width = this.size;
        this.canvas.height = this.size;

        // State
        this.userImage = null;
        this.imageScale = 1.0;
        this.minScale = 0.3;
        this.maxScale = 3.0;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;

        // Frame Customization State
        this.theme = 'forest'; // 'forest', 'teal', 'emerald'
        this.selectedBadge = "I'm Celebrating ProLaunch Careers @ 1! 🚀";
        this.userName = "";
        this.userRole = "";

        // Preload Logo
        this.logoImg = new Image();
        this.logoImg.src = 'assets/images/logo2.webp';
        this.logoImg.onload = () => this.draw();

        this.bindEvents();
        this.loadSampleAvatar();
    }

    bindEvents() {
        const fileInput = document.getElementById('framePhotoInput');
        const zoomSlider = document.getElementById('frameZoomSlider');
        const badgeSelect = document.getElementById('frameBadgeSelect');
        const nameInput = document.getElementById('frameNameInput');
        const roleInput = document.getElementById('frameRoleInput');
        const themeBtns = document.querySelectorAll('.theme-btn');
        const downloadBtn = document.getElementById('btnDownloadFrame');
        const shareBtn = document.getElementById('btnShareLinkedIn');

        // File upload
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                            this.userImage = img;
                            this.resetTransform();
                            this.draw();
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Zoom Slider
        if (zoomSlider) {
            zoomSlider.addEventListener('input', (e) => {
                this.imageScale = parseFloat(e.target.value);
                this.draw();
            });
        }

        // Badge Select
        if (badgeSelect) {
            badgeSelect.addEventListener('change', (e) => {
                this.selectedBadge = e.target.value;
                this.draw();
            });
        }

        // Name & Role Inputs
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.userName = e.target.value.trim();
                this.draw();
            });
        }
        if (roleInput) {
            roleInput.addEventListener('input', (e) => {
                this.userRole = e.target.value.trim();
                this.draw();
            });
        }

        // Theme Pickers
        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                themeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.theme = btn.dataset.theme || 'forest';
                this.draw();
            });
        });

        // Mouse Drag / Pan
        this.canvas.addEventListener('mousedown', (e) => this.onDragStart(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => this.onDragMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', () => this.onDragEnd());

        // Touch Drag / Pan for Mobile
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.onDragStart(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (this.isDragging && e.touches.length === 1) {
                this.onDragMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
        window.addEventListener('touchend', () => this.onDragEnd());

        // Download Action
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadPNG());
        }

        // LinkedIn Share Action
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareToLinkedIn());
        }
    }

    resetTransform() {
        if (!this.userImage) return;
        // Fit image so minimum dimension covers circular frame
        const circleDiameter = 620;
        const scaleX = circleDiameter / this.userImage.width;
        const scaleY = circleDiameter / this.userImage.height;
        this.imageScale = Math.max(scaleX, scaleY) * 1.1;
        this.panX = 0;
        this.panY = 0;

        const zoomSlider = document.getElementById('frameZoomSlider');
        if (zoomSlider) {
            zoomSlider.value = this.imageScale;
        }
    }

    loadSampleAvatar() {
        // Draw initial placeholder
        this.draw();
    }

    onDragStart(clientX, clientY) {
        if (!this.userImage) return;
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        const scale = this.size / rect.width;
        this.dragStartX = (clientX - rect.left) * scale - this.panX;
        this.dragStartY = (clientY - rect.top) * scale - this.panY;
    }

    onDragMove(clientX, clientY) {
        if (!this.isDragging || !this.userImage) return;
        const rect = this.canvas.getBoundingClientRect();
        const scale = this.size / rect.width;
        this.panX = (clientX - rect.left) * scale - this.dragStartX;
        this.panY = (clientY - rect.top) * scale - this.dragStartY;
        this.draw();
    }

    onDragEnd() {
        this.isDragging = false;
    }

    draw() {
        const ctx = this.ctx;
        const S = this.size;

        // Clear canvas
        ctx.clearRect(0, 0, S, S);

        // 1. Background Fill: Strict ProLaunch Brand Deep Forest Gradient
        const bgGrad = ctx.createLinearGradient(0, 0, S, S);
        if (this.theme === 'emerald') {
            bgGrad.addColorStop(0, '#064e3b');
            bgGrad.addColorStop(0.5, '#022c22');
            bgGrad.addColorStop(1, '#064e3b');
        } else if (this.theme === 'teal') {
            bgGrad.addColorStop(0, '#0a2e2b');
            bgGrad.addColorStop(0.5, '#124745');
            bgGrad.addColorStop(1, '#19a08c');
        } else {
            // Signature ProLaunch Forest & Emerald
            bgGrad.addColorStop(0, '#092624');
            bgGrad.addColorStop(0.45, '#0d3b38');
            bgGrad.addColorStop(1, '#124745');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, S, S);

        // 2. Decorative Background Patterns & Festive Fireworks Sparks
        this.drawFestiveBackdrop(ctx, S);

        // 3. User Avatar Area (Centered Circle)
        const centerX = S / 2;
        const centerY = S / 2 - 40;
        const radius = 300;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        if (this.userImage) {
            ctx.save();
            ctx.translate(centerX + this.panX, centerY + this.panY);
            ctx.scale(this.imageScale, this.imageScale);
            ctx.drawImage(
                this.userImage,
                -this.userImage.width / 2,
                -this.userImage.height / 2
            );
            ctx.restore();
        } else {
            // Placeholder Avatar
            ctx.fillStyle = '#e8f5d6';
            ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

            ctx.fillStyle = '#5e9428';
            ctx.beginPath();
            ctx.arc(centerX, centerY - 40, 90, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(centerX, centerY + 240, 200, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0d3b38';
            ctx.font = 'bold 30px "Lato", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Click "Upload Your Photo" to Begin', centerX, centerY + 80);
        }
        ctx.restore();

        // 4. Circle Border & Outer Rings (Brand Lime Green & Crisp White)
        ctx.save();
        ctx.lineWidth = 14;
        ctx.strokeStyle = (this.theme === 'teal') ? '#19a08c' : '#7bb640';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 5. Top Header Branding: ProLaunch Logo & Anniversary Banner
        this.drawTopBranding(ctx, S);

        // 6. Bottom Name & Status Badge Box
        this.drawBottomCard(ctx, S, centerX);
    }

    drawFestiveBackdrop(ctx, S) {
        ctx.save();

        // Elegant geometric orbit rings in brand colors (Clean & Executive)
        ctx.strokeStyle = 'rgba(123, 182, 64, 0.22)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 12]);
        ctx.beginPath();
        ctx.arc(S / 2, S / 2 - 40, 345, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(S / 2, S / 2 - 40, 365, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(123, 182, 64, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(S / 2, S / 2 - 40, 395, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawTopBranding(ctx, S) {
        ctx.save();
        const barY = 55;

        // Logo
        if (this.logoImg && this.logoImg.complete && this.logoImg.naturalWidth > 0) {
            ctx.drawImage(this.logoImg, 70, barY, 64, 64);
        }

        // ProLaunch Careers Text
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
        ctx.fillText('ProLaunch Careers', 148, barY + 44);

        // Top Right 1st Anniversary Emblem
        ctx.textAlign = 'right';
        ctx.fillStyle = '#7bb640';
        ctx.font = 'bold 22px "Lato", sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText('1ST YEAR ANNIVERSARY', S - 70, barY + 32);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '600 16px "Lato", sans-serif';
        ctx.fillText('2025 - 2026 • LAUNCHING GLOBAL TALENT', S - 70, barY + 54);

        ctx.restore();
    }

    drawBottomCard(ctx, S, centerX) {
        ctx.save();
        const cardY = 820;
        const cardWidth = S - 140;
        const cardHeight = 200;
        const cardX = (S - cardWidth) / 2;

        // Card Container
        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 10;
        this.roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 22);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = (this.theme === 'teal') ? '#19a08c' : '#7bb640';
        this.roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 22);
        ctx.stroke();

        // 1. User Name & Role (or Default Invitation)
        ctx.textAlign = 'center';
        if (this.userName) {
            ctx.fillStyle = '#0d3b38';
            ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
            ctx.fillText(this.userName, centerX, cardY + 54);

            if (this.userRole) {
                ctx.fillStyle = '#5e9428';
                ctx.font = '700 20px "Lato", sans-serif';
                ctx.fillText(this.userRole, centerX, cardY + 86);
            }
        } else {
            ctx.fillStyle = '#0d3b38';
            ctx.font = 'bold 34px "Playfair Display", Georgia, serif';
            ctx.fillText('Celebrating ProLaunch Careers @ 1!', centerX, cardY + 65);
        }

        // 2. Selected Celebration Badge Pill
        const badgeY = this.userName ? (cardY + 130) : (cardY + 115);
        const badgeWidth = Math.min(cardWidth - 80, 720);
        const badgeHeight = 44;
        const badgeX = centerX - badgeWidth / 2;

        ctx.fillStyle = (this.theme === 'teal') ? '#e6f6f4' : '#e8f5d6';
        this.roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 22);
        ctx.fill();

        ctx.fillStyle = (this.theme === 'teal') ? '#124745' : '#0d3b38';
        ctx.font = '800 19px "Lato", sans-serif';
        ctx.fillText(this.selectedBadge, centerX, badgeY + 28);

        // 3. Website Watermark at the very bottom
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '600 15px "Lato", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('careers.prolaunchgroup.org/anniversary • #ProLaunchAt1', centerX, S - 20);

        ctx.restore();
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    downloadPNG() {
        const link = document.createElement('a');
        link.download = `prolaunch-1-year-celebration-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png', 1.0);
        link.click();
    }

    shareToLinkedIn() {
        // First download the image for user
        this.downloadPNG();

        // Copy celebratory post text
        const postText = `🎉 Happy 1st Anniversary to ProLaunch Careers!\n\nFrom empowering hundreds of African professionals to breaking barriers into the global remote workforce, I am proud to celebrate this milestone. 🚀\n\nJoin the 1-Year celebration webinar & claim anniversary giveaways (worth ₦50,000+):\n👉 https://careers.prolaunchgroup.org/anniversary\n\n#ProLaunchAt1 #1YearOfImpact #RemoteCareers #ProLaunchCareers #CareerGrowth`;

        navigator.clipboard.writeText(postText).then(() => {
            alert('Celebration photo downloaded and post text copied to clipboard! Paste it into LinkedIn to celebrate with us.');
            window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
        }).catch(() => {
            window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
        });
    }
}

// ── Global Countdown Timer Engine ──
// Target: October 31st, 2026, 7:00 PM WAT (UTC+1)
function initAnniversaryCountdown() {
    const targetDate = new Date('2026-10-31T19:00:00+01:00').getTime();

    function update() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        const dayEls = document.querySelectorAll('.countdown-days');
        const hrEls = document.querySelectorAll('.countdown-hours');
        const minEls = document.querySelectorAll('.countdown-mins');
        const secEls = document.querySelectorAll('.countdown-secs');

        if (diff <= 0) {
            dayEls.forEach(el => el.textContent = '00');
            hrEls.forEach(el => el.textContent = '00');
            minEls.forEach(el => el.textContent = '00');
            secEls.forEach(el => el.textContent = '00');
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = (n) => String(n).padStart(2, '0');

        dayEls.forEach(el => el.textContent = pad(days));
        hrEls.forEach(el => el.textContent = pad(hours));
        minEls.forEach(el => el.textContent = pad(mins));
        secEls.forEach(el => el.textContent = pad(secs));
    }

    update();
    setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    window.frameStudio = new AnniversaryFrameStudio();
    initAnniversaryCountdown();
});
