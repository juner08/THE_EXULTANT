// ============================================================
// THE EXULTANT - Main JavaScript
// ============================================================

document.addEventListener('DOMContentLoaded', function() {

    // ---------- Navbar Scroll Effect ----------
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ---------- Auto-hide Alerts ----------
    const alerts = document.querySelectorAll('.alert-custom:not(.persistent-alert)');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            alert.style.transition = 'opacity 0.5s ease';
            alert.style.opacity = '0';
            setTimeout(function() {
                alert.remove();
            }, 500);
        }, 4000);
    });

    // ---------- Admin Sidebar Toggle ----------
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }

    // ---------- Confirm Delete ----------
    // Delegated once so dynamically rendered delete buttons are covered and
    // handlers are never stacked up by re-rendering a table.
    document.addEventListener('click', function(e) {
        const btn = e.target.closest ? e.target.closest('.btn-delete') : null;
        if (!btn) return;
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            e.preventDefault();
        }
    });

    // ---------- Image Preview on File Select ----------
    const imageInput = document.getElementById('articleImage');
    const imagePreview = document.getElementById('imagePreview');
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ---------- Video Preview on File Select (object URL - reliable for large files & mobile) ----------
    function formatBytes(bytes) {
        if (bytes >= 1024 * 1024 * 1024) {
            return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
        }
        if (bytes >= 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
        }
        if (bytes >= 1024) {
            return (bytes / 1024).toFixed(1) + 'KB';
        }
        return bytes + 'B';
    }

    const videoInput = document.getElementById('articleVideo');
    const videoPreviewWrap = document.getElementById('videoPreviewWrap');
    const videoPreview = document.getElementById('videoPreview');
    const videoFileInfo = document.getElementById('videoFileInfo');
    const videoFileError = document.getElementById('videoFileError');
    const videoUploadStatus = document.getElementById('videoUploadStatus');
    const videoUploadStatusText = document.getElementById('videoUploadStatusText');
    const videoUploadProgress = document.getElementById('videoUploadProgress');
    let previewObjectUrl = null;

    function clearVideoInputError() {
        if (videoFileError) {
            videoFileError.textContent = '';
            videoFileError.hidden = true;
        }
    }

    function showVideoInputError(message) {
        if (videoFileError) {
            videoFileError.textContent = message;
            videoFileError.hidden = false;
        }
        if (videoFileInfo) {
            videoFileInfo.hidden = true;
        }
    }

    function resetVideoSelectionFeedback() {
        clearVideoInputError();
        if (videoFileInfo) {
            videoFileInfo.hidden = true;
        }
        if (videoUploadStatus) {
            videoUploadStatus.hidden = true;
        }
    }

    function hideVideoPreview() {
        if (videoPreview) {
            videoPreview.pause();
            videoPreview.removeAttribute('src');
            videoPreview.load();
        }
        if (videoPreviewWrap) {
            videoPreviewWrap.hidden = true;
        }
    }

    if (videoInput && videoPreview) {
        videoInput.addEventListener('change', function() {
            resetVideoSelectionFeedback();
            const file = this.files[0];
            if (!file) {
                hideVideoPreview();
                return;
            }
            // Client-side extension check (server does the real validation)
            const allowedExts = ['mp4', 'm4v', 'webm', 'mov', 'avi', 'mkv', 'mpeg', 'mpg', 'ogg', 'ogv', '3gp', 'wmv'];
            const fileName = file.name.toLowerCase();
            const isSupported = allowedExts.some(function(ext) {
                return fileName.endsWith('.' + ext);
            });
            if (!isSupported) {
                this.value = '';
                hideVideoPreview();
                showVideoInputError('Only video files are allowed. Supported formats: MP4, M4V, WebM, MOV, AVI, MKV, MPEG, OGG, 3GP, WMV.');
                return;
            }
            // Pre-check against the actual server upload limit (no artificial cap).
            const maxBytes = parseInt(videoInput.getAttribute('data-max-upload') || '0', 10);
            if (maxBytes > 0 && file.size > maxBytes) {
                this.value = '';
                hideVideoPreview();
                showVideoInputError('This video exceeds the maximum upload size allowed by the server (' + formatBytes(maxBytes) + '). Please choose a smaller video or raise the server upload limit.');
                return;
            }
            if (videoFileInfo) {
                videoFileInfo.textContent = file.name + ' - ' + formatBytes(file.size);
                videoFileInfo.hidden = false;
            }
            if (previewObjectUrl) {
                URL.revokeObjectURL(previewObjectUrl);
            }
            previewObjectUrl = URL.createObjectURL(file);
            videoPreview.src = previewObjectUrl;
            videoPreview.load();
            if (videoPreviewWrap) {
                videoPreviewWrap.hidden = false;
            }
        });

        const videoForm = videoInput.closest('form');
        if (videoForm) {
            videoForm.addEventListener('submit', function() {
                const file = videoInput.files[0];
                if (!file) {
                    return;
                }
                if (videoUploadStatusText) {
                    videoUploadStatusText.textContent = 'Uploading ' + file.name + ' (' + formatBytes(file.size) + ')...';
                }
                if (videoUploadProgress) {
                    videoUploadProgress.removeAttribute('value');
                }
                if (videoUploadStatus) {
                    videoUploadStatus.hidden = false;
                }
            });
        }
    }

    window.addEventListener('pageshow', function() {
        if (videoUploadStatus) {
            videoUploadStatus.hidden = true;
        }
    });

    // ---------- Textarea Auto-resize ----------
    const textareas = document.querySelectorAll('textarea.auto-resize');
    textareas.forEach(function(textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });

    // ---------- Smooth Scroll for Anchor Links ----------
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // A bare "#" is used by placeholder links; do not pass it to
            // querySelector (it throws) and do not jump the page.
            if (!href || href === '#') {
                e.preventDefault();
                return;
            }
            let target = null;
            try {
                target = document.querySelector(href);
            } catch (err) {
                target = null;
            }
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ---------- Article Card Hover Animation ----------
    const cards = document.querySelectorAll('.article-card');
    cards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });

    // ---------- Scroll to Top Button ----------
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ---------- Video Player Controls (mute/unmute + playback error feedback) ----------
    // Update the mute button icon to match the current muted state (used by click + events)
    function updateMuteIconFor(video) {
        if (!video) return;
        const wrap = video.closest ? video.closest('.video-player-wrap') : null;
        const btn = wrap ? wrap.querySelector('.video-mute-btn[data-video-target="' + video.id + '"]') : null;
        if (!btn) return;
        const icon = btn.querySelector('i');
        if (video.muted) {
            icon.className = 'fas fa-volume-mute';
            btn.setAttribute('aria-label', 'Unmute');
            btn.title = 'Sound: Off (click to turn sound on)';
        } else {
            icon.className = 'fas fa-volume-up';
            btn.setAttribute('aria-label', 'Mute');
            btn.title = 'Sound: On (click to mute)';
        }
    }

    // Click handler for all mute buttons (works for static and dynamic players)
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.video-mute-btn');
        if (!btn) return;
        const id = btn.getAttribute('data-video-target');
        const video = document.getElementById(id);
        if (!video) return;
        e.preventDefault();
        video.muted = !video.muted;
        video.dispatchEvent(new Event('volumechange', { bubbles: true }));
        updateMuteIconFor(video);
    });

    // Wire up each video player: sync the button icon + show friendly error when unplayable
    function setupVideoPlayer(video) {
        if (!video || video.__videoSetup) return;
        video.__videoSetup = true;

        const wrap = video.closest ? video.closest('.video-player-wrap') : null;
        const msg = wrap ? wrap.querySelector('.video-error-msg') : null;

        if (wrap) {
            video.addEventListener('volumechange', function() {
                updateMuteIconFor(video);
            });
            video.addEventListener('loadedmetadata', function() {
                updateMuteIconFor(video);
                if (msg) msg.hidden = true;
            });
            updateMuteIconFor(video);
        }

        if (msg) {
            // Show the error message only when the media genuinely cannot be decoded/loaded
            video.addEventListener('error', function() {
                if (video.error && (video.error.code === 3 || video.error.code === 4)) {
                    msg.hidden = false;
                }
            });
        }
    }

    // Initialize all video players already in the DOM (public + admin pages)
    document.querySelectorAll('video.video-element').forEach(setupVideoPlayer);

});
