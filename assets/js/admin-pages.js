// ============================================================
// THE EXULTANT - HTML Prototype Admin Pages
// Renderers and form handlers that mirror admin/*.php
// ============================================================

window.ExultantAdmin = (function () {
    'use strict';

    var E = window.Exultant;

    // Simulated server limits (mirrors php.ini values in the original setup)
    var POST_MAX_BYTES = 2158020608; // combined request limit (2GB + 10MB)
    var IMAGE_MAX_BYTES = 5 * 1024 * 1024;
    var UPLOADS_DIR_SIZE = 1071958711; // bytes of seeded files in assets/uploads
    var DB_NAME = 'the_exultant_db';

    var IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    var IMAGE_ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    var VIDEO_MIMES = {
        mp4: ['video/mp4', 'video/x-m4v', 'application/mp4'],
        m4v: ['video/mp4', 'video/x-m4v', 'application/mp4'],
        webm: ['video/webm'],
        mov: ['video/quicktime'],
        avi: ['video/x-msvideo', 'video/avi'],
        mkv: ['video/x-matroska'],
        mpeg: ['video/mpeg'],
        mpg: ['video/mpeg'],
        ogg: ['video/ogg', 'video/ogv', 'audio/ogg', 'application/ogg'],
        ogv: ['video/ogg', 'video/ogv', 'audio/ogg', 'application/ogg'],
        '3gp': ['video/3gpp', 'video/3gp'],
        wmv: ['video/x-ms-wmv', 'video/x-ms-asf']
    };

    // ---------- Shared helpers ----------
    function adminSet(id, html) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    function esc(value) {
        return E.escapeHtml(value);
    }

    function san(value) {
        return E.sanitize(value);
    }

    function flashAndGo(url, message, type) {
        E.flash.set(message, type || 'success');
        window.location.replace(url);
    }

    function autoHide(el) {
        setTimeout(function () {
            el.style.transition = 'opacity 0.5s ease';
            el.style.opacity = '0';
            setTimeout(function () {
                if (el.parentNode) el.remove();
            }, 500);
        }, 4000);
    }

    // Mirrors server-rendered alert-custom blocks (auto-hide unless persistent)
    function showFormError(containerId, message, persistent) {
        var box = document.getElementById(containerId);
        if (!box) return;
        box.innerHTML = E.errorAlertHtml(message, persistent);
        if (!persistent) {
            var alert = box.querySelector('.alert-custom');
            if (alert) autoHide(alert);
        }
    }

    function extOf(name) {
        var str = String(name || '');
        var idx = str.lastIndexOf('.');
        return idx === -1 ? '' : str.substring(idx + 1).toLowerCase();
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
    }

    function truncate(str, len) {
        var s = String(str || '');
        return san(s.substring(0, len)) + (s.length > len ? '...' : '');
    }

    // ---------- Admin chrome (sidebar/topbar is static markup) ----------
    function initChrome() {
        var admin = E.auth.getCurrentAdmin();
        var usernameEl = document.getElementById('topbarUsername');
        if (usernameEl && admin) {
            usernameEl.textContent = admin.username;
        }

        var logoutLinks = document.querySelectorAll('[data-logout]');
        Array.prototype.forEach.call(logoutLinks, function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                E.auth.logout();
                window.location.replace('login.html');
            });
        });

        var flashHtml = E.flashAlertHtml();
        var body = document.querySelector('.admin-body');
        if (body && flashHtml) {
            body.insertAdjacentHTML('afterbegin', flashHtml);
        }
    }

    // ---------- Login (admin/login.php) ----------
    function renderLogin() {
        if (E.auth.isLoggedIn()) {
            window.location.replace('dashboard.html');
            return;
        }

        var form = document.getElementById('loginForm');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var username = form.elements['username'].value.trim();
            var password = form.elements['password'].value.trim();
            var alertBox = document.getElementById('loginAlert');

            if (username === '' || password === '') {
                alertBox.innerHTML = E.errorAlertHtml('Please enter both username and password.');
                return;
            }

            var admin = E.auth.login(username, password);
            if (!admin) {
                alertBox.innerHTML = E.errorAlertHtml('Invalid username or password.');
                return;
            }

            window.location.replace('dashboard.html');
        });
    }

    // ---------- Dashboard (admin/dashboard.php) ----------
    function renderDashboard() {
        initChrome();

        var articles = E.db.allArticlesEnriched();
        var total = articles.length;
        var published = 0;
        var draft = 0;
        var archived = 0;
        for (var i = 0; i < articles.length; i++) {
            if (articles[i].status === 'published') published++;
            else if (articles[i].status === 'draft') draft++;
            else if (articles[i].status === 'archived') archived++;
        }

        var users = E.db.users();
        var categories = E.db.categories();
        var comments = E.db.comments();

        var recentArticles = articles.slice().sort(E.byCreatedDesc).slice(0, 6);
        var recentComments = E.db.comments().slice().sort(E.byCreatedDesc).slice(0, 5);

        var html = '';

        html +=
            '<div class="row g-3 mb-4">' +
                statCard('bg-maroon', 'fa-newspaper', total, 'Total Articles') +
                statCard('bg-gold', 'fa-check-circle', published, 'Published') +
                statCard('bg-green', 'fa-pen-fancy', draft, 'Drafts') +
                statCard('bg-blue', 'fa-users', users.length, 'Users') +
            '</div>' +
            '<div class="row g-3 mb-4">' +
                statCard('bg-maroon', 'fa-tags', categories.length, 'Categories', 'background:#42A5F5;') +
                statCard('bg-gold', 'fa-comments', comments.length, 'Comments', 'background:#1976D2;') +
                statCard('bg-green', 'fa-archive', archived, 'Archived', 'background:#0D47A1;') +
                statCard('bg-maroon', 'fa-eye', published + draft, 'Active Articles', 'background:#64B5F6;') +
            '</div>';

        html += '<div class="row g-3">';
        html +=
            '<div class="col-lg-8">' +
                '<div class="card shadow-sm">' +
                    '<div class="card-header d-flex justify-content-between align-items-center" style="background: var(--white); border-bottom: 2px solid var(--maroon);">' +
                        '<h5 class="card-title mb-0" style="font-family: var(--font-heading); color: var(--maroon);">Recent Articles</h5>' +
                        '<a href="add_article.html" class="btn btn-sm btn-maroon"><i class="fas fa-plus me-1"></i> New Article</a>' +
                    '</div>' +
                    '<div class="card-body p-0">' +
                        '<div class="table-responsive admin-table">' +
                            '<table class="table table-hover">' +
                                '<thead><tr><th>Title</th><th>Category</th><th>Author</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>' +
                                '<tbody>';

        for (var a = 0; a < recentArticles.length; a++) {
            var art = recentArticles[a];
            html +=
                '<tr>' +
                    '<td style="max-width: 220px;">' +
                        '<a href="edit_article.html?id=' + art.id + '" style="color: var(--text-primary); font-weight: 600;">' + truncate(art.title, 40) + '</a>' +
                    '</td>' +
                    '<td>' + san(art.category_name) + '</td>' +
                    '<td>' + san(art.author_name) + '</td>' +
                    '<td><span class="status-badge ' + esc(art.status) + '">' + esc(ucfirst(art.status)) + '</span></td>' +
                    '<td style="white-space: nowrap; font-size: 0.8rem;">' + E.formatShortDate(art.created_at) + '</td>' +
                    '<td><a href="edit_article.html?id=' + art.id + '" class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></a></td>' +
                '</tr>';
        }

        html += '</tbody></table></div></div></div>';

        html +=
            '<div class="col-lg-4">' +
                '<div class="card shadow-sm" style="background: var(--white);">' +
                    '<div class="card-header" style="background: var(--white); border-bottom: 2px solid var(--maroon);">' +
                        '<h5 class="card-title mb-0" style="font-family: var(--font-heading); color: var(--maroon);">Recent Comments</h5>' +
                    '</div>' +
                    '<div class="card-body p-0">';

        if (recentComments.length > 0) {
            for (var c = 0; c < recentComments.length; c++) {
                var cm = E.db.findUserById(recentComments[c].user_id);
                var userName = cm ? cm.name : '';
                var artRow = E.db.findArticleById(recentComments[c].article_id);
                var artTitle = artRow ? artRow.title : '';
                html +=
                    '<div class="d-flex gap-3 p-3 border-bottom">' +
                        '<div class="comment-avatar" style="width: 35px; height: 35px; font-size: 0.8rem;">' + esc(String(userName).substring(0, 1).toUpperCase()) + '</div>' +
                        '<div>' +
                            '<strong style="font-size: 0.85rem;">' + san(userName) + '</strong>' +
                            '<span class="text-muted" style="font-size: 0.75rem;">on <a href="' + esc(E.BASE + 'article.html?id=' + recentComments[c].article_id) + '" style="color: var(--maroon);">' + truncate(artTitle, 30) + '</a></span>' +
                            '<p class="text-muted mb-0 mt-1" style="font-size: 0.8rem; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + san(recentComments[c].comment) + '</p>' +
                            '<small class="text-muted" style="font-size: 0.7rem;">' + E.formatDateTime(recentComments[c].created_at) + '</small>' +
                        '</div>' +
                    '</div>';
            }
        } else {
            html +=
                '<div class="p-3 text-center text-muted">' +
                    '<p class="mb-0">No comments yet.</p>' +
                '</div>';
        }

        html += '</div></div></div></div>';

        adminSet('dashboardContent', html);
    }

    function statCard(iconClass, icon, value, label, extraStyle) {
        return '<div class="col-xl-3 col-md-6">' +
            '<div class="stat-card">' +
                '<div class="stat-icon ' + iconClass + '"' + (extraStyle ? ' style="' + extraStyle + '"' : '') + '><i class="fas ' + icon + '"></i></div>' +
                '<div class="stat-info"><h3>' + value + '</h3><p>' + esc(label) + '</p></div>' +
            '</div>' +
        '</div>';
    }

    function ucfirst(str) {
        var s = String(str || '');
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    // ---------- Manage Articles (admin/articles.php) ----------
    function renderArticlesPage() {
        // GET actions run before any output, exactly like the PHP handlers
        var deleteId = parseInt(E.qs('delete') || '0', 10);
        if (deleteId > 0) {
            E.db.deleteArticle(deleteId);
            flashAndGo('articles.html', 'Article deleted successfully.', 'success');
            return;
        }

        var action = E.qs('action');
        var actionId = parseInt(E.qs('id') || '0', 10);
        if (actionId > 0 && (action === 'publish' || action === 'draft' || action === 'archive')) {
            var newStatus = action === 'publish' ? 'published' : (action === 'archive' ? 'archived' : 'draft');
            E.db.updateArticleStatus(actionId, newStatus);
            flashAndGo('articles.html', 'Article status updated successfully.', 'success');
            return;
        }

        initChrome();

        var statusFilter = E.qs('status') || '';
        var search = (E.qs('q') || '').trim();

        var statusSelect = document.getElementById('filterStatus');
        var searchInput = document.getElementById('filterQ');
        if (statusSelect) statusSelect.value = statusFilter;
        if (searchInput) searchInput.value = search;

        var rows = E.db.allArticlesEnriched();
        rows = rows.filter(function (a) {
            if (statusFilter !== '' && ['published', 'draft', 'archived'].indexOf(statusFilter) !== -1 && a.status !== statusFilter) {
                return false;
            }
            if (search !== '') {
                var lower = search.toLowerCase();
                if (String(a.title).toLowerCase().indexOf(lower) === -1 && String(a.content).toLowerCase().indexOf(lower) === -1) {
                    return false;
                }
            }
            return true;
        }).sort(E.byCreatedDesc);

        var html = '';
        if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
                var a = rows[i];
                var imageUrl = E.articleImageUrl(a);
                html +=
                    '<tr>' +
                        '<td style="width: 60px;">' +
                            (a.image
                                ? '<img src="' + esc(imageUrl) + '" alt="" style="width: 50px; height: 40px; object-fit: cover; border-radius: 4px;">'
                                : '<div style="width: 50px; height: 40px; background: var(--light-gray); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: var(--text-muted);">No IMG</div>') +
                        '</td>' +
                        '<td>' +
                            '<a href="edit_article.html?id=' + a.id + '" style="color: var(--text-primary); font-weight: 600;">' + truncate(a.title, 45) + '</a>' +
                            (a.video ? '<span class="video-indicator" title="Has video" style="color: var(--maroon); margin-left: 0.3rem;"><i class="fas fa-video"></i></span>' : '') +
                        '</td>' +
                        '<td><span class="badge-category badge-' + esc(String(a.category_name).toLowerCase()) + '">' + san(a.category_name) + '</span></td>' +
                        '<td style="font-size: 0.85rem;">' + san(a.author_name) + '</td>' +
                        '<td><span class="status-badge ' + esc(a.status) + '">' + esc(ucfirst(a.status)) + '</span></td>' +
                        '<td style="white-space: nowrap; font-size: 0.8rem;">' + E.formatShortDate(a.created_at) + '</td>' +
                        '<td style="white-space: nowrap;">' +
                            '<a href="' + esc(E.BASE + 'article.html?id=' + a.id) + '" target="_blank" class="btn btn-sm btn-outline-secondary" title="View"><i class="fas fa-eye"></i></a>' +
                            '<a href="edit_article.html?id=' + a.id + '" class="btn btn-sm btn-outline-primary" title="Edit"><i class="fas fa-edit"></i></a>' +
                            (a.status === 'published'
                                ? '<a href="articles.html?action=draft&id=' + a.id + '" class="btn btn-sm btn-outline-warning" title="Unpublish"><i class="fas fa-pen"></i></a>'
                                : '<a href="articles.html?action=publish&id=' + a.id + '" class="btn btn-sm btn-outline-success" title="Publish"><i class="fas fa-check"></i></a>') +
                            '<a href="articles.html?delete=' + a.id + '" class="btn btn-sm btn-outline-danger btn-delete" title="Delete"><i class="fas fa-trash"></i></a>' +
                        '</td>' +
                    '</tr>';
            }
        } else {
            html =
                '<tr><td colspan="7" class="text-center text-muted py-4">' +
                    '<i class="fas fa-inbox fa-2x mb-2 d-block"></i>' +
                    'No articles found.' +
                '</td></tr>';
        }

        adminSet('articlesTableBody', html);
    }

    // ---------- Article form shared logic (add_article.php / edit_article.php) ----------
    function populateArticleForm(selectedCategoryId, selectedAuthorId, status) {
        var catSelect = document.getElementById('category_id');
        var authorSelect = document.getElementById('author_id');
        var statusSelect = document.getElementById('status');

        var categories = E.db.categories().slice().sort(function (a, b) {
            return a.category_name.localeCompare(b.category_name);
        });
        var authors = E.db.users().slice().sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });

        var html = '<option value="0">Select Category</option>';
        for (var i = 0; i < categories.length; i++) {
            var cat = categories[i];
            html += '<option value="' + cat.id + '"' + (selectedCategoryId === cat.id ? ' selected' : '') + '>' + san(cat.category_name) + '</option>';
        }
        if (catSelect) catSelect.innerHTML = html;

        html = '<option value="0">Select Author</option>';
        for (var j = 0; j < authors.length; j++) {
            var author = authors[j];
            html += '<option value="' + author.id + '"' + (selectedAuthorId === author.id ? ' selected' : '') + '>' + san(author.name) + '</option>';
        }
        if (authorSelect) authorSelect.innerHTML = html;

        if (statusSelect) statusSelect.value = status || 'draft';

        var videoInput = document.getElementById('articleVideo');
        if (videoInput) videoInput.setAttribute('data-max-upload', String(E.VIDEO_MAX_BYTES));
    }

    function validateArticleFields(form) {
        var title = form.elements['title'].value.trim();
        var content = form.elements['content'].value.trim();
        var categoryId = parseInt(form.elements['category_id'].value, 10) || 0;
        var authorId = parseInt(form.elements['author_id'].value, 10) || 0;

        if (title === '') return { error: 'Title is required.' };
        if (content === '') return { error: 'Content is required.' };
        if (categoryId <= 0) return { error: 'Please select a category.' };
        if (authorId <= 0) return { error: 'Please select an author.' };

        return {
            title: title,
            content: content,
            categoryId: categoryId,
            authorId: authorId,
            status: ['draft', 'published', 'archived'].indexOf(form.elements['status'].value) !== -1
                ? form.elements['status'].value
                : 'draft'
        };
    }

    function combinedRequestTooLarge(imageFile, videoFile) {
        var total = (imageFile ? imageFile.size : 0) + (videoFile ? videoFile.size : 0);
        return total > POST_MAX_BYTES;
    }

    function validateImageSync(file) {
        if (!file) return null;
        var type = String(file.type || '');
        var ext = extOf(file.name);
        if (IMAGE_ALLOWED_TYPES.indexOf(type) === -1 || IMAGE_ALLOWED_EXTS.indexOf(ext) === -1) {
            return 'Invalid image type. Only JPG, PNG, GIF, and WEBP are allowed.';
        }
        if (file.size > IMAGE_MAX_BYTES) {
            return 'Image is too large. Maximum size is 5MB.';
        }
        return null;
    }

    function validateVideoSync(file) {
        if (!file) return null;
        if (file.size <= 0) {
            return 'The uploaded video file is empty. Please upload a valid video file.';
        }
        var ext = extOf(file.name);
        if (E.VIDEO_EXTENSIONS.indexOf(ext) === -1) {
            return 'Invalid video format. Allowed formats: MP4, M4V, WebM, MOV, AVI, MKV, MPEG, OGG, 3GP, and WMV.';
        }
        var allowedMimes = VIDEO_MIMES[ext] || [];
        allowedMimes = allowedMimes.concat(['application/octet-stream', '']);
        if (file.type && allowedMimes.indexOf(file.type) === -1) {
            return 'Invalid video file type. Please upload a real video file.';
        }
        if (file.size > E.VIDEO_MAX_BYTES) {
            return 'Video is too large. The server accepts up to ' + E.formatBytes(E.VIDEO_MAX_BYTES) + ' per upload.';
        }
        return null;
    }

    // Mirrors exultant_video_has_valid_signature() using the first 64 bytes
    function videoSignatureValid(bytes, ext) {
        if (!bytes || bytes.length < 4) return false;

        function ascii(offset, len) {
            var out = '';
            for (var i = 0; i < len && offset + i < bytes.length; i++) {
                out += String.fromCharCode(bytes[offset + i]);
            }
            return out;
        }

        function hex(offset, len) {
            var out = '';
            for (var i = 0; i < len && offset + i < bytes.length; i++) {
                out += ('0' + bytes[offset + i].toString(16)).slice(-2);
            }
            return out;
        }

        if (ext === 'mp4' || ext === 'm4v' || ext === '3gp') {
            return bytes.length >= 12 && ascii(4, 4) === 'ftyp';
        }
        if (ext === 'mov') {
            if (bytes.length >= 12 && ascii(4, 4) === 'ftyp') return true;
            var tail = ascii(4, 60);
            return ['moov', 'mdat', 'wide', 'free', 'skip'].some(function (atom) {
                return tail.indexOf(atom) !== -1;
            });
        }
        if (ext === 'webm' || ext === 'mkv') {
            return hex(0, 4) === '1a45dfa3';
        }
        if (ext === 'avi') {
            return bytes.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'AVI ';
        }
        if (ext === 'mpeg' || ext === 'mpg') {
            return (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0xBA) ||
                (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0xB3);
        }
        if (ext === 'ogg' || ext === 'ogv') {
            return ascii(0, 4) === 'OggS';
        }
        if (ext === 'wmv') {
            return hex(0, 16) === '3026b2758e66cf11a6d900aa0062ce6c';
        }
        return false;
    }

    function readVideoHeader(file, callback) {
        try {
            var reader = new FileReader();
            reader.onload = function (e) {
                callback(new Uint8Array(e.target.result));
            };
            reader.onerror = function () {
                callback(null);
            };
            reader.readAsArrayBuffer(file.slice(0, 64));
        } catch (e) {
            callback(null);
        }
    }

    // ---------- Add Article (admin/add_article.php) ----------
    function renderAddArticle() {
        initChrome();
        populateArticleForm(0, 0, 'draft');

        var form = document.getElementById('articleForm');
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var imageFile = form.elements['image'].files[0] || null;
            var videoFile = form.elements['video'].files[0] || null;

            if (combinedRequestTooLarge(imageFile, videoFile)) {
                showFormError('formAlerts',
                    'The combined upload request is larger than the server limit of ' + E.formatBytes(POST_MAX_BYTES) +
                    '. Choose a smaller video or ask the server administrator to raise the limit.', true);
                return;
            }

            var data = validateArticleFields(form);
            if (data.error) {
                showFormError('formAlerts', data.error, true);
                return;
            }

            var imageError = validateImageSync(imageFile);
            if (imageError) {
                showFormError('formAlerts', imageError, true);
                return;
            }

            var videoError = validateVideoSync(videoFile);
            if (videoError) {
                showFormError('formAlerts', videoError, true);
                return;
            }

            function finish(imageValue) {
                function insertWithVideo(videoValue) {
                    E.db.insertArticle({
                        title: data.title,
                        content: data.content,
                        image: imageValue,
                        video: videoValue,
                        category_id: data.categoryId,
                        author_id: data.authorId,
                        status: data.status
                    });
                    flashAndGo('articles.html', 'Article created successfully!', 'success');
                }

                if (videoFile) {
                    readVideoHeader(videoFile, function (header) {
                        if (!videoSignatureValid(header, extOf(videoFile.name))) {
                            showFormError('formAlerts',
                                'The file is not a valid ' + extOf(videoFile.name).toUpperCase() +
                                ' video (signature check failed). Please upload a real video file.', true);
                            return;
                        }
                        E.storeUploadedFile(videoFile, insertWithVideo);
                    });
                } else {
                    insertWithVideo(null);
                }
            }

            if (imageFile) {
                E.storeUploadedFile(imageFile, finish);
            } else {
                finish(null);
            }
        });
    }

    // ---------- Edit Article (admin/edit_article.php) ----------
    function renderEditArticle() {
        var articleId = parseInt(E.qs('id') || '0', 10);
        if (articleId <= 0) {
            flashAndGo('articles.html', 'Invalid article ID.', 'error');
            return;
        }

        var article = E.db.findArticleById(articleId);
        if (!article) {
            flashAndGo('articles.html', 'Article not found.', 'error');
            return;
        }

        initChrome();
        populateArticleForm(article.category_id, article.author_id, article.status);

        var form = document.getElementById('articleForm');
        form.elements['title'].value = article.title;
        form.elements['content'].value = article.content;

        var imagePreview = document.getElementById('imagePreview');
        if (imagePreview && article.image) {
            imagePreview.src = E.articleImageUrl(article);
            imagePreview.style.display = 'block';
        }

        renderCurrentVideoBlock(article);

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var imageFile = form.elements['image'].files[0] || null;
            var videoFile = form.elements['video'].files[0] || null;
            var removeVideo = form.elements['remove_video'] ? form.elements['remove_video'].checked : false;

            if (combinedRequestTooLarge(imageFile, videoFile)) {
                showFormError('formAlerts',
                    'The combined upload request is larger than the server limit of ' + E.formatBytes(POST_MAX_BYTES) +
                    '. Choose a smaller video or ask the server administrator to raise the limit.', true);
                return;
            }

            var data = validateArticleFields(form);
            if (data.error) {
                showFormError('formAlerts', data.error, true);
                return;
            }

            var imageError = validateImageSync(imageFile);
            if (imageError) {
                showFormError('formAlerts', imageError, true);
                return;
            }

            var videoError = validateVideoSync(videoFile);
            if (videoError) {
                showFormError('formAlerts', videoError, true);
                return;
            }

            function finish(imageValue) {
                function saveWithVideo(videoValue) {
                    E.db.updateArticle(articleId, {
                        title: data.title,
                        content: data.content,
                        image: imageValue,
                        video: videoValue,
                        category_id: data.categoryId,
                        author_id: data.authorId,
                        status: data.status
                    });
                    flashAndGo('articles.html', 'Article updated successfully!', 'success');
                }

                if (videoFile) {
                    readVideoHeader(videoFile, function (header) {
                        if (!videoSignatureValid(header, extOf(videoFile.name))) {
                            showFormError('formAlerts',
                                'The file is not a valid ' + extOf(videoFile.name).toUpperCase() +
                                ' video (signature check failed). Please upload a real video file.', true);
                            return;
                        }
                        E.storeUploadedFile(videoFile, saveWithVideo);
                    });
                } else if (removeVideo && article.video) {
                    saveWithVideo(null);
                } else {
                    saveWithVideo(article.video || null);
                }
            }

            if (imageFile) {
                E.storeUploadedFile(imageFile, finish);
            } else {
                finish(article.image || null);
            }
        });
    }

    function renderCurrentVideoBlock(article) {
        var box = document.getElementById('currentVideoBlock');
        if (!box || !article.video) return;

        var videoInfo = E.articleVideoInfo(article);
        box.innerHTML =
            '<div class="mt-2">' +
                '<div class="video-player-wrap admin-video-block">' +
                    '<video id="currentVideo" class="video-element" controls playsinline preload="metadata">' +
                        '<source src="' + esc(videoInfo.url) + '" type="' + esc(videoInfo.mime) + '">' +
                    '</video>' +
                    '<button type="button" class="video-mute-btn" data-video-target="currentVideo" aria-label="Toggle sound" title="Toggle sound">' +
                        '<i class="fas fa-volume-up"></i>' +
                    '</button>' +
                    '<div class="video-error-msg" hidden>' +
                        '<i class="fas fa-exclamation-triangle"></i> This video could not be played. The file may be corrupted or use an unsupported format.' +
                    '</div>' +
                '</div>' +
                '<div class="form-check mt-2">' +
                    '<input type="checkbox" name="remove_video" value="1" class="form-check-input" id="removeVideo">' +
                    '<label class="form-check-label text-danger" for="removeVideo">Remove current video</label>' +
                '</div>' +
            '</div>';
    }

    // ---------- Manage Categories (admin/categories.php) ----------
    function renderCategoriesPage() {
        var deleteId = parseInt(E.qs('delete') || '0', 10);
        if (deleteId > 0) {
            if (E.db.categoryArticleCount(deleteId) > 0) {
                flashAndGo('categories.html', 'Cannot delete category. It contains articles.', 'error');
            } else {
                E.db.deleteCategory(deleteId);
                flashAndGo('categories.html', 'Category deleted successfully.', 'success');
            }
            return;
        }

        initChrome();

        var categories = E.db.categories().slice().sort(function (a, b) {
            return a.category_name.localeCompare(b.category_name);
        });

        var html = '';
        var modalsHtml = '';
        for (var i = 0; i < categories.length; i++) {
            var cat = categories[i];
            var count = E.db.categoryArticleCount(cat.id);
            html +=
                '<tr>' +
                    '<td><strong>' + san(cat.category_name) + '</strong></td>' +
                    '<td style="max-width: 250px; font-size: 0.85rem; color: var(--text-muted);">' +
                        (cat.description
                            ? san(String(cat.description).substring(0, 50)) + (String(cat.description).length > 50 ? '...' : '')
                            : '<em>No description</em>') +
                    '</td>' +
                    '<td><span class="badge bg-maroon">' + count + '</span></td>' +
                    '<td>' +
                        '<button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editModal' + cat.id + '">' +
                            '<i class="fas fa-edit"></i>' +
                        '</button> ' +
                        '<a href="categories.html?delete=' + cat.id + '" class="btn btn-sm btn-outline-danger btn-delete">' +
                            '<i class="fas fa-trash"></i>' +
                        '</a>' +
                    '</td>' +
                '</tr>';
            // Edit Modal (mirrors categories.php markup; kept outside the table because
            // the HTML parser would otherwise empty any <form> nested inside <tbody>)
            modalsHtml +=
                '<div class="modal fade" id="editModal' + cat.id + '" tabindex="-1">' +
                    '<div class="modal-dialog">' +
                        '<div class="modal-content">' +
                            '<form method="POST" action="" data-edit-category>' +
                                '<div class="modal-header" style="background: var(--maroon); color: var(--white);">' +
                                    '<h5 class="modal-title">Edit Category</h5>' +
                                    '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>' +
                                '</div>' +
                                '<div class="modal-body">' +
                                    '<input type="hidden" name="category_id" value="' + cat.id + '">' +
                                    '<div class="mb-3">' +
                                        '<label class="form-label">Category Name</label>' +
                                        '<input type="text" name="category_name" class="form-control" value="' + san(cat.category_name) + '" required>' +
                                    '</div>' +
                                    '<div class="mb-3">' +
                                        '<label class="form-label">Description</label>' +
                                        '<textarea name="description" class="form-control" rows="3">' + san(cat.description || '') + '</textarea>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="modal-footer">' +
                                    '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>' +
                                    '<button type="submit" name="edit_category" class="btn btn-maroon">Save Changes</button>' +
                                '</div>' +
                            '</form>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }

        adminSet('categoriesTableBody', html);
        var modalBox = document.getElementById('categoryModals');
        if (modalBox) modalBox.innerHTML = modalsHtml;

        var addForm = document.getElementById('addCategoryForm');
        addForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = addForm.elements['category_name'].value.trim();
            var description = addForm.elements['description'].value.trim();

            if (name === '') {
                showFormError('formAlerts', 'Category name is required.');
                return;
            }
            if (findCategoryIgnoreCase(name) !== null) {
                showFormError('formAlerts', 'A category with this name already exists.');
                return;
            }

            E.db.insertCategory({ category_name: name, description: description });
            flashAndGo('categories.html', 'Category added successfully!', 'success');
        });

        var editForms = document.querySelectorAll('form[data-edit-category]');
        Array.prototype.forEach.call(editForms, function (editForm) {
            editForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var id = parseInt(editForm.elements['category_id'].value, 10) || 0;
                var name = editForm.elements['category_name'].value.trim();
                var description = editForm.elements['description'].value.trim();

                if (name === '') {
                    showFormError('formAlerts', 'Category name is required.');
                    return;
                }
                var existing = findCategoryIgnoreCase(name);
                if (existing && existing.id !== id) {
                    showFormError('formAlerts', 'A category with this name already exists.');
                    return;
                }

                E.db.updateCategory(id, { category_name: name, description: description });
                flashAndGo('categories.html', 'Category updated successfully!', 'success');
            });
        });
    }

    function findCategoryIgnoreCase(name) {
        var rows = E.db.categories();
        var lower = String(name).toLowerCase();
        for (var i = 0; i < rows.length; i++) {
            if (String(rows[i].category_name).toLowerCase() === lower) return rows[i];
        }
        return null;
    }

    // ---------- Manage Users (admin/users.php) ----------
    function renderUsersPage() {
        var deleteId = parseInt(E.qs('delete') || '0', 10);
        if (deleteId > 0) {
            var session = E.auth.session();
            if (session && deleteId === session.admin_id) {
                flashAndGo('users.html', 'You cannot delete your own account.', 'error');
            } else {
                E.db.deleteUser(deleteId);
                flashAndGo('users.html', 'User deleted successfully.', 'success');
            }
            return;
        }

        initChrome();

        var session2 = E.auth.session();
        var adminId = session2 ? session2.admin_id : 0;
        var users = E.db.users().slice().sort(function (a, b) {
            return String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id;
        });

        var html = '';
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var articleCount = E.db.userArticleCount(user.id);
            var isSelf = user.id === adminId;

            html +=
                '<tr>' +
                    '<td>' +
                        '<div class="d-flex align-items-center gap-2">' +
                            '<div class="comment-avatar" style="width: 32px; height: 32px; font-size: 0.75rem;">' + esc(String(user.name).substring(0, 1).toUpperCase()) + '</div>' +
                            '<strong style="font-size: 0.85rem;">' + san(user.name) + '</strong>' +
                        '</div>' +
                    '</td>' +
                    '<td style="font-size: 0.85rem;">' + san(user.username) + '</td>' +
                    '<td style="font-size: 0.8rem;">' + san(user.email) + '</td>' +
                    '<td>' +
                        '<form method="POST" action="" class="d-inline" data-role-form>' +
                            '<input type="hidden" name="user_id" value="' + user.id + '">' +
                            '<select name="role" class="form-select form-select-sm" style="width: 100px;" onchange="this.form.requestSubmit()">' +
                                roleOptions(user.role) +
                            '</select>' +
                            '<input type="hidden" name="update_role" value="1">' +
                        '</form>' +
                    '</td>' +
                    '<td><span class="badge bg-secondary">' + articleCount + '</span></td>' +
                    '<td style="white-space: nowrap; font-size: 0.8rem;">' + E.formatShortDate(user.created_at) + '</td>' +
                    '<td>' +
                        '<a href="users.html?delete=' + user.id + '" class="btn btn-sm btn-outline-danger btn-delete"' +
                            (isSelf ? ' onclick="return false;" style="pointer-events: none; opacity: 0.5;"' : '') +
                        '><i class="fas fa-trash"></i></a>' +
                    '</td>' +
                '</tr>';
        }

        adminSet('usersTableBody', html);
        adminSet('usersCount', 'All Users (' + users.length + ')');

        var addForm = document.getElementById('addUserForm');
        addForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = addForm.elements['name'].value.trim();
            var email = addForm.elements['email'].value.trim();
            var username = addForm.elements['username'].value.trim();
            var password = addForm.elements['password'].value.trim();
            var role = ['admin', 'editor', 'author', 'reader'].indexOf(addForm.elements['role'].value) !== -1
                ? addForm.elements['role'].value
                : 'reader';

            if (name === '' || email === '' || username === '' || password === '') {
                showFormError('formAlerts', 'All fields are required.');
                return;
            }
            if (!isValidEmail(email)) {
                showFormError('formAlerts', 'Invalid email address.');
                return;
            }
            if (password.length < 6) {
                showFormError('formAlerts', 'Password must be at least 6 characters.');
                return;
            }
            if (E.db.findUserByUsername(username) !== null || E.db.findUserByEmail(email) !== null) {
                showFormError('formAlerts', 'Username or email already exists.');
                return;
            }

            E.db.insertUser({ name: name, email: email, username: username, password: password, role: role });
            flashAndGo('users.html', 'User added successfully!', 'success');
        });

        var roleForms = document.querySelectorAll('form[data-role-form]');
        Array.prototype.forEach.call(roleForms, function (roleForm) {
            roleForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var userId = parseInt(roleForm.elements['user_id'].value, 10) || 0;
                var role = ['admin', 'editor', 'author', 'reader'].indexOf(roleForm.elements['role'].value) !== -1
                    ? roleForm.elements['role'].value
                    : 'reader';

                E.db.updateUserRole(userId, role);
                flashAndGo('users.html', 'User role updated successfully!', 'success');
            });
        });
    }

    function roleOptions(selected) {
        var roles = ['reader', 'author', 'editor', 'admin'];
        var html = '';
        for (var i = 0; i < roles.length; i++) {
            html += '<option value="' + roles[i] + '"' + (selected === roles[i] ? ' selected' : '') + '>' + ucfirst(roles[i]) + '</option>';
        }
        return html;
    }

    // ---------- Settings (admin/settings.php) ----------
    function renderSettingsPage() {
        if (window.__ACCESS_DENIED__) {
            var body = document.querySelector('.admin-body');
            if (body) {
                body.innerHTML = 'Access Denied: You do not have permission to access this page.';
            }
            return;
        }

        initChrome();

        var admin = E.auth.getCurrentAdmin();
        if (!admin) {
            window.location.replace('login.html');
            return;
        }

        renderSettingsStats();

        var usernameForm = document.getElementById('usernameForm');
        usernameForm.elements['username'].value = admin.username;
        usernameForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var newUsername = usernameForm.elements['username'].value.trim();

            if (newUsername === '') {
                showFormError('formAlerts', 'Username cannot be empty.');
                return;
            }

            var admins = E.db.admins();
            for (var i = 0; i < admins.length; i++) {
                if (admins[i].username === newUsername && admins[i].id !== admin.id) {
                    showFormError('formAlerts', 'That username is already taken.');
                    return;
                }
            }

            E.db.updateAdmin(admin.id, { username: newUsername });

            var session = E.auth.session();
            if (session) {
                session.admin_username = newUsername;
                E.auth.setSession(session);
            }

            flashAndGo('settings.html', 'Username updated successfully!', 'success');
        });

        var passwordForm = document.getElementById('passwordForm');
        passwordForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var currentPass = passwordForm.elements['current_password'].value;
            var newPass = passwordForm.elements['new_password'].value;
            var confirmPass = passwordForm.elements['confirm_password'].value;

            if (currentPass === '' || newPass === '' || confirmPass === '') {
                showFormError('formAlerts', 'All password fields are required.');
                return;
            }
            if (currentPass !== admin.password) {
                showFormError('formAlerts', 'Current password is incorrect.');
                return;
            }
            if (newPass.length < 6) {
                showFormError('formAlerts', 'New password must be at least 6 characters.');
                return;
            }
            if (newPass !== confirmPass) {
                showFormError('formAlerts', 'New password and confirmation do not match.');
                return;
            }

            E.db.updateAdmin(admin.id, { password: newPass });
            flashAndGo('settings.html', 'Password updated successfully!', 'success');
        });
    }

    function renderSettingsStats() {
        var storedBytes = 0;
        var articles = E.db.articles();
        for (var i = 0; i < articles.length; i++) {
            var image = String(articles[i].image || '');
            if (image.indexOf('data:') === 0) {
                storedBytes += image.length;
            }
        }

        var sizeMb = Math.round(((UPLOADS_DIR_SIZE + storedBytes) / 1048576) * 100) / 100;

        var html =
            '<div class="row text-center g-3">' +
                statBlock(E.db.articles().length, 'Total Articles') +
                statBlock(E.db.users().length, 'Total Users') +
                statBlock(E.db.comments().length, 'Total Comments') +
                statBlock(E.db.categories().length, 'Categories') +
            '</div>' +
            '<hr>' +
            '<div class="row text-center g-3">' +
                '<div class="col-md-6">' +
                    '<p class="text-muted mb-0" style="font-size: 0.85rem;">Upload Directory Size</p>' +
                    '<h5 style="font-family: var(--font-heading); color: var(--maroon);">' + sizeMb + ' MB</h5>' +
                '</div>' +
                '<div class="col-md-6">' +
                    '<p class="text-muted mb-0" style="font-size: 0.85rem;">Database</p>' +
                    '<h5 style="font-family: var(--font-heading); color: var(--maroon);">' + DB_NAME + '</h5>' +
                '</div>' +
            '</div>';

        adminSet('settingsStats', html);
    }

    function statBlock(value, label) {
        return '<div class="col-md-3 col-6">' +
            '<h3 class="stat-number" style="font-family: var(--font-heading); color: var(--maroon);">' + value + '</h3>' +
            '<p class="text-muted mb-0" style="font-size: 0.85rem;">' + esc(label) + '</p>' +
        '</div>';
    }

    return {
        initChrome: initChrome,
        renderLogin: renderLogin,
        renderDashboard: renderDashboard,
        renderArticlesPage: renderArticlesPage,
        renderAddArticle: renderAddArticle,
        renderEditArticle: renderEditArticle,
        renderCategoriesPage: renderCategoriesPage,
        renderUsersPage: renderUsersPage,
        renderSettingsPage: renderSettingsPage
    };
})();
