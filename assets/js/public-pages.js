// ============================================================
// THE EXULTANT - HTML Prototype Public Pages
// Renderers that mirror index.php, category pages, article.php,
// search.php, archives.php and about.php
// ============================================================

window.ExultantPublic = (function () {
    'use strict';

    var E = window.Exultant;

    // ---------- Home (index.php) ----------
    function renderIndexPage() {
        E.initPublicPage();

        var published = E.db.publishedArticles().sort(E.byCreatedDesc);
        var featured = published.length > 0 ? published[0] : null;
        var latestArticles = published.slice(1, 7);
        var popularArticles = published.slice(0, 5);
        var categories = E.db.categories().slice().sort(function (a, b) {
            return a.category_name.localeCompare(b.category_name);
        });

        var dateCount = document.getElementById('dateBarCount');
        if (dateCount) {
            dateCount.textContent = published.length + ' Articles Published';
        }

        // Category cards. Hover styling lives in CSS so rapid clicks and
        // back/forward navigation can never leave an inline hover state behind.
        var catHtml = '';
        for (var i = 0; i < categories.length; i++) {
            var cat = categories[i];
            var icon = E.CATEGORY_ICONS[cat.category_name] || 'fa-folder';
            var link = E.categoryLink(cat.category_name, cat.id);
            catHtml +=
                '<div class="col-lg-3 col-md-4 col-6">' +
                    '<a href="' + E.escapeHtml(link) + '" class="category-card d-block text-center p-3 rounded-3 text-decoration-none" data-category-card data-category-id="' + cat.id + '">' +
                        '<i class="fas ' + icon + ' fa-2x mb-2"></i>' +
                        '<span>' + E.sanitize(cat.category_name) + '</span>' +
                    '</a>' +
                '</div>';
        }
        setHtml('categoryCards', catHtml);
        bindCategoryNavigation();

        // Featured story
        var featuredSection = document.getElementById('featuredSection');
        if (featuredSection) {
            if (featured) {
                featuredSection.hidden = false;
                var link2 = document.getElementById('featuredArticle');
                link2.setAttribute('href', E.articleUrl(featured));
                link2.innerHTML =
                    E.renderMediaPreview(featured, 'featured') +
                    '<div class="featured-overlay">' +
                        '<span class="featured-category">' + E.sanitize(featured.category_name) + '</span>' +
                        '<h2 class="featured-title">' + E.sanitize(featured.title) + '</h2>' +
                        '<p class="featured-excerpt">' + E.sanitize(E.phpSubstr(featured.content, 0, 200)) + '...</p>' +
                        '<div class="featured-meta">' +
                            '<span><i class="fas fa-user"></i> ' + E.sanitize(featured.author_name) + '</span>' +
                            '<span class="ms-3"><i class="fas fa-calendar"></i> ' + E.formatDate(featured.created_at) + '</span>' +
                        '</div>' +
                    '</div>';
            }
        }

        // Latest news
        var latestSection = document.getElementById('latestSection');
        if (latestSection && latestArticles.length > 0) {
            latestSection.hidden = false;
            var latestHtml = '';
            for (var j = 0; j < latestArticles.length; j++) {
                var a = latestArticles[j];
                latestHtml +=
                    '<div class="col-lg-4 col-md-6">' +
                        '<div class="article-card">' +
                            E.renderMediaPreview(a) +
                            '<div class="card-body">' +
                                '<h3 class="card-title"><a class="stretched-link" href="' + E.escapeHtml(E.articleUrl(a)) + '">' + E.sanitize(a.title) + '</a></h3>' +
                                '<p class="card-excerpt">' + E.sanitize(E.phpSubstr(a.content, 0, 150)) + '...</p>' +
                                '<div class="card-meta">' +
                                    '<span class="author">' + E.sanitize(a.author_name) + '</span>' +
                                    '<span class="date"><i class="fas fa-calendar-alt"></i> ' + E.formatDate(a.created_at) + '</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
            }
            setHtml('latestArticlesGrid', latestHtml);
        }

        // Recent articles + sidebar
        var recentSection = document.getElementById('recentSection');
        if (recentSection && popularArticles.length > 0) {
            recentSection.hidden = false;
            var smHtml = '';
            for (var k = 0; k < popularArticles.length; k++) {
                var art = popularArticles[k];
                smHtml +=
                    '<div class="article-card-sm">' +
                        E.renderMediaPreview(art, 'sm') +
                        '<div class="sm-content">' +
                            '<div class="sm-category">' + E.sanitize(art.category_name) + '</div>' +
                            '<h4 class="sm-title"><a class="stretched-link" href="' + E.escapeHtml(E.articleUrl(art)) + '">' + E.sanitize(art.title) + '</a></h4>' +
                            '<div class="sm-date"><i class="fas fa-calendar-alt me-1"></i> ' + E.formatDate(art.created_at) + '</div>' +
                        '</div>' +
                    '</div>';
            }
            setHtml('recentArticlesList', smHtml);

            var catListHtml = '';
            for (var m = 0; m < categories.length; m++) {
                var c = categories[m];
                catListHtml +=
                    '<a href="' + E.escapeHtml(E.categoryLink(c.category_name, c.id)) + '" class="d-flex justify-content-between align-items-center py-2 border-bottom" data-category-link style="font-size:0.9rem; color: var(--text-secondary);">' +
                        '<span>' + E.sanitize(c.category_name) + '</span>' +
                        '<i class="fas fa-arrow-right" style="font-size:0.7rem; color: var(--maroon);"></i>' +
                    '</a>';
            }
            setHtml('sidebarCategoryList', catListHtml);
        }
    }

    // ---------- Category navigation guard ----------
    var categoryNav = {
        bound: false,
        active: null
    };

    function clearCategoryNavigationState(link) {
        if (!link) return;
        link.removeAttribute('aria-busy');
        link.classList.remove('is-navigating');
    }

    // One delegated listener handles every category link, including cards that
    // are re-rendered later. This avoids attaching a new handler per card and
    // stops a double-click from starting the same navigation twice.
    function bindCategoryNavigation() {
        if (categoryNav.bound) return;
        categoryNav.bound = true;

        document.addEventListener('click', function (e) {
            // Keep native behaviour for middle-clicks, modified clicks and
            // anything another handler has already cancelled.
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                return;
            }

            var link = e.target && e.target.closest
                ? e.target.closest('[data-category-card], [data-category-link]')
                : null;
            if (!link) return;

            var href = link.getAttribute('href');
            if (!href || href === '#') {
                // A category without a destination should do nothing rather
                // than throwing an "invalid selector" error.
                e.preventDefault();
                return;
            }

            if (link.getAttribute('aria-busy') === 'true') {
                e.preventDefault();
                return;
            }

            // The most recent category click is the one that should win.
            if (categoryNav.active && categoryNav.active !== link) {
                clearCategoryNavigationState(categoryNav.active);
            }
            categoryNav.active = link;
            link.setAttribute('aria-busy', 'true');
            link.classList.add('is-navigating');

            // Recover if the browser blocks or cancels the navigation.
            window.setTimeout(function () {
                if (categoryNav.active === link) {
                    clearCategoryNavigationState(link);
                    categoryNav.active = null;
                }
            }, 15000);
        }, false);

        window.addEventListener('pageshow', function () {
            if (categoryNav.active) clearCategoryNavigationState(categoryNav.active);
            categoryNav.active = null;
        });
    }

    // ---------- Category pages (news.php, sports.php, ...) ----------
    var categoryRenderSeq = 0;
    var categoryPageConfig = null;
    var categoryPageEventsBound = false;

    function renderCategoryPage(config) {
        // Render tokens make repeated calls safe. If this ever becomes an
        // asynchronous loader, an older response can never overwrite a newer
        // category selection.
        var renderSeq = ++categoryRenderSeq;
        categoryPageConfig = config;

        E.initPublicPage();

        var perPage = 9;
        var page = Math.max(1, parseInt(E.qs('page') || '1', 10) || 1);
        var offset = (page - 1) * perPage;

        var cat = E.db.findCategoryByName(config.categoryName);
        if (!cat) {
            if (renderSeq !== categoryRenderSeq) return;
            var countMissing = document.getElementById('dateBarCount');
            if (countMissing) countMissing.textContent = '0 Articles';
            setHtml('categoryContent',
                '<div class="no-results">' +
                    '<i class="fas fa-exclamation-triangle"></i>' +
                    '<h3>Category not found</h3>' +
                    '<p>This category may have been renamed or removed.</p>' +
                    '<a href="' + E.escapeHtml(E.BASE + 'archives.html') + '" class="btn btn-outline-maroon mt-2">Browse Archives</a>' +
                '</div>');
            bindCategoryPageEvents();
            return;
        }

        var all = E.db.publishedArticles().filter(function (a) {
            return a.category_id === cat.id;
        }).sort(E.byCreatedDesc);

        var total = all.length;
        var totalPages = Math.ceil(total / perPage);
        var articles = all.slice(offset, offset + perPage);

        // Discard stale renders (e.g. a rapid repeat render triggered by
        // browser back/forward cache restoration).
        if (renderSeq !== categoryRenderSeq) return;

        var countEl = document.getElementById('dateBarCount');
        if (countEl) {
            countEl.textContent = total + ' Article' + (total !== 1 ? 's' : '');
        }

        var html = '';
        if (articles.length > 0) {
            html += '<div class="row g-4">';
            for (var i = 0; i < articles.length; i++) {
                var a = articles[i];
                html +=
                    '<div class="col-lg-4 col-md-6">' +
                        '<div class="article-card">' +
                            E.renderMediaPreview(a) +
                            '<div class="card-body">' +
                                '<h3 class="card-title"><a class="stretched-link" href="' + E.escapeHtml(E.articleUrl(a)) + '">' + E.sanitize(a.title) + '</a></h3>' +
                                '<p class="card-excerpt">' + E.sanitize(E.phpSubstr(a.content, 0, 150)) + '...</p>' +
                                '<div class="card-meta">' +
                                    '<span class="author">' + E.sanitize(a.author_name) + '</span>' +
                                    '<span class="date"><i class="fas fa-calendar-alt"></i> ' + E.formatDate(a.created_at) + '</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
            }
            html += '</div>';
            html += E.paginationHtml(page, totalPages, function (p) {
                return '?page=' + p;
            });
        } else {
            html +=
                '<div class="no-results">' +
                    '<i class="fas ' + config.emptyIcon + '"></i>' +
                    '<h3>' + E.sanitize(config.emptyTitle) + '</h3>' +
                    '<p>' + E.sanitize(config.emptyText) + '</p>' +
                '</div>';
        }
        setHtml('categoryContent', html);
        bindCategoryPageEvents();
    }

    // Refresh section pages when they are restored from the back/forward cache
    // so content always reflects the current category data.
    function bindCategoryPageEvents() {
        if (categoryPageEventsBound) return;
        categoryPageEventsBound = true;

        window.addEventListener('pageshow', function (e) {
            if (e.persisted && categoryPageConfig) {
                renderCategoryPage(categoryPageConfig);
            }
        });
    }

    // ---------- Article page (article.php) ----------
    function renderArticlePage() {
        E.initPublicPage();

        var root = document.getElementById('articleRoot');
        var rawId = E.qs('id');
        var articleId = rawId ? (parseInt(rawId, 10) || 0) : 0;

        if (articleId <= 0) {
            root.innerHTML = '<div class="container mt-5"><div class="alert-custom error"><i class="fas fa-exclamation-triangle"></i> Invalid article ID.</div></div>';
            return;
        }

        var article = null;
        var enriched = E.db.publishedArticles();
        for (var i = 0; i < enriched.length; i++) {
            if (enriched[i].id === articleId) article = enriched[i];
        }

        if (!article) {
            root.innerHTML = '<div class="container mt-5"><div class="alert-custom error"><i class="fas fa-exclamation-triangle"></i> Article not found or not yet published.</div></div>';
            return;
        }

        document.title = E.sanitize(article.title).replace(/&#039;/g, "'") + ' | The Exultant';

        var related = enriched.filter(function (a) {
            return a.category_id === article.category_id && a.id !== article.id;
        }).sort(E.byCreatedDesc).slice(0, 3);

        var comments = E.db.articleComments(article.id).map(function (c) {
            var user = E.db.findUserById(c.user_id);
            var copy = {};
            for (var k in c) {
                if (Object.prototype.hasOwnProperty.call(c, k)) copy[k] = c[k];
            }
            copy.user_name = user ? user.name : '';
            return copy;
        }).sort(E.byCreatedDesc);

        var html = '';

        // Article header
        html +=
            '<section class="article-header">' +
                '<div class="container" style="max-width: 900px;">' +
                    '<span class="article-category">' + E.sanitize(article.category_name) + '</span>' +
                    '<h1 class="article-title">' + E.sanitize(article.title) + '</h1>' +
                    '<div class="article-meta">' +
                        '<span><i class="fas fa-user"></i> By ' + E.sanitize(article.author_name) + '</span>' +
                        '<span><i class="fas fa-calendar-alt"></i> ' + E.formatDate(article.created_at) + '</span>' +
                        '<span id="articleCommentCount"><i class="fas fa-comments"></i> ' + comments.length + ' Comment' + (comments.length !== 1 ? 's' : '') + '</span>' +
                    '</div>' +
                '</div>' +
            '</section>';

        // Article body
        html += '<section><div class="container" style="max-width: 900px;">';

        var imageUrl = E.articleImageUrl(article);
        var videoInfo = E.articleVideoInfo(article);
        if (imageUrl !== '') {
            html += '<img src="' + E.escapeHtml(imageUrl) + '" alt="' + E.sanitize(article.title) + '" class="article-featured-image">';
        }

        if (videoInfo.url !== '') {
            var videoElId = 'articleVideo-' + article.id;
            html +=
                '<div class="article-video mb-3">' +
                    '<div class="video-player-wrap">' +
                        '<video id="' + videoElId + '" class="video-element" controls playsinline webkit-playsinline preload="metadata">' +
                            '<source src="' + E.escapeHtml(videoInfo.url) + '" type="' + E.escapeHtml(videoInfo.mime) + '">' +
                            'Your browser does not support embedded videos.' +
                        '</video>' +
                        '<button type="button" class="video-mute-btn" data-video-target="' + videoElId + '" aria-label="Toggle sound" title="Toggle sound">' +
                            '<i class="fas fa-volume-up"></i>' +
                        '</button>' +
                        '<div class="video-error-msg" hidden>' +
                            '<i class="fas fa-exclamation-triangle"></i> This video could not be played. The file may be corrupted or use an unsupported format. Please re-export it as MP4 (H.264/AAC) and upload it again.' +
                        '</div>' +
                    '</div>' +
                '</div>';
        } else if (imageUrl === '') {
            html += '<div class="placeholder-img ' + E.escapeHtml(placeholderClassFor(article)) + '" style="height: 350px; border-radius: 6px; margin-bottom: 2rem;"><span style="text-align:center; padding: 0 2rem;">' + E.sanitize(article.category_name) + '</span></div>';
        }

        // Content paragraphs (mirrors preg_split + htmlspecialchars)
        html += '<div class="article-content">';
        var paragraphs = String(article.content || '').split(/\r\n|\r|\n/);
        for (var p = 0; p < paragraphs.length; p++) {
            if (paragraphs[p].trim() !== '') {
                html += '<p>' + E.escapeHtml(paragraphs[p]) + '</p>';
            }
        }
        html += '</div></div></section>';

        // Related articles
        if (related.length > 0) {
            html +=
                '<section class="section">' +
                    '<div class="container">' +
                        '<div class="section-header">' +
                            '<h2 class="section-title">Related Articles</h2>' +
                            '<a href="' + E.escapeHtml(E.BASE + 'archives.html') + '" class="section-link">View All <i class="fas fa-arrow-right"></i></a>' +
                        '</div>' +
                        '<div class="row g-4">';
            for (var r = 0; r < related.length; r++) {
                var rel = related[r];
                html +=
                    '<div class="col-lg-4 col-md-6">' +
                        '<div class="article-card">' +
                            E.renderMediaPreview(rel) +
                            '<div class="card-body">' +
                                '<h3 class="card-title"><a class="stretched-link" href="' + E.escapeHtml(E.articleUrl(rel)) + '">' + E.sanitize(rel.title) + '</a></h3>' +
                                '<div class="card-meta">' +
                                    '<span class="author">' + E.sanitize(rel.author_name) + '</span>' +
                                    '<span class="date"><i class="fas fa-calendar-alt"></i> ' + E.formatDate(rel.created_at) + '</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
            }
            html += '</div></div></section>';
        }

        // Comments section
        html +=
            '<section class="comments-section">' +
                '<div class="container" style="max-width: 900px;">' +
                    '<h3 id="commentsTitle">Comments (' + comments.length + ')</h3>' +
                    '<div id="commentAlerts"></div>' +
                    '<div id="commentList">';

        if (comments.length > 0) {
            for (var c = 0; c < comments.length; c++) {
                html += commentItemHtml(comments[c]);
            }
        } else {
            html +=
                '<div class="no-results" id="commentsEmpty" style="padding: 2rem 1rem;">' +
                    '<i class="fas fa-comment-dots"></i>' +
                    '<h3>No comments yet</h3>' +
                    '<p>Be the first to share your thoughts on this article.</p>' +
                '</div>';
        }

        html +=
                    '</div>' +
                    '<div class="comment-form">' +
                        '<h4>Leave a Comment</h4>' +
                        '<form id="commentForm" method="POST" action="">' +
                            '<div class="row g-3">' +
                                '<div class="col-md-6">' +
                                    '<label class="form-label">Name</label>' +
                                    '<input type="text" name="name" class="form-control" required>' +
                                '</div>' +
                                '<div class="col-md-6">' +
                                    '<label class="form-label">Email</label>' +
                                    '<input type="email" name="email" class="form-control" required>' +
                                '</div>' +
                                '<div class="col-12">' +
                                    '<label class="form-label">Comment</label>' +
                                    '<textarea name="comment" class="form-control" rows="4" required></textarea>' +
                                '</div>' +
                                '<div class="col-12">' +
                                    '<button type="submit" name="submit_comment" class="btn btn-maroon">Post Comment</button>' +
                                '</div>' +
                            '</div>' +
                        '</form>' +
                    '</div>' +
                '</div>' +
            '</section>';

        root.innerHTML = html;

        // Comment submission (mirrors article.php POST handler)
        var form = document.getElementById('commentForm');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = form.elements['name'].value.trim();
            var email = form.elements['email'].value.trim();
            var comment = form.elements['comment'].value.trim();
            var alerts = document.getElementById('commentAlerts');

            if (comment === '') {
                alerts.innerHTML = E.errorAlertHtml('Please enter a comment.');
                return;
            }

            var user = email ? E.db.findUserByEmail(email) : null;
            var userId;
            if (user) {
                userId = user.id;
            } else {
                var baseName = String(name).toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
                userId = E.db.insertUser({
                    name: name,
                    email: email,
                    username: baseName + (100 + Math.floor(Math.random() * 900)),
                    password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
                    role: 'reader'
                });
            }

            E.db.insertComment({ article_id: articleId, user_id: userId, comment: comment });
            alerts.innerHTML = E.successAlertHtml('Your comment has been posted successfully.');
            form.elements['comment'].value = '';

            // Refresh comment list and counters (mirrors PHP re-fetch after insert)
            var fresh = E.db.articleComments(articleId).map(function (cm) {
                var u = E.db.findUserById(cm.user_id);
                var copy = {};
                for (var k in cm) {
                    if (Object.prototype.hasOwnProperty.call(cm, k)) copy[k] = cm[k];
                }
                copy.user_name = u ? u.name : '';
                return copy;
            }).sort(E.byCreatedDesc);

            var list = document.getElementById('commentList');
            var emptyBox = document.getElementById('commentsEmpty');
            if (emptyBox) emptyBox.remove();
            list.insertAdjacentHTML('afterbegin', commentItemHtml(fresh[0]));

            document.getElementById('commentsTitle').textContent = 'Comments (' + fresh.length + ')';
            document.getElementById('articleCommentCount').innerHTML =
                '<i class="fas fa-comments"></i> ' + fresh.length + ' Comment' + (fresh.length !== 1 ? 's' : '');
        });
    }

    function commentItemHtml(c) {
        return '<div class="comment-item">' +
            '<div class="comment-avatar">' + E.escapeHtml(String(c.user_name || '').substring(0, 1).toUpperCase()) + '</div>' +
            '<div class="comment-body">' +
                '<div class="comment-author">' + E.sanitize(c.user_name) + '</div>' +
                '<div class="comment-date">' + E.formatDateTime(c.created_at) + '</div>' +
                '<div class="comment-text">' + E.nl2br(String(c.comment || '').replace(/<[^>]*>/g, '')) + '</div>' +
            '</div>' +
        '</div>';
    }

    function placeholderClassFor(article) {
        var category = String(article.category_name || '').toLowerCase().trim();
        var slug = category.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return 'cat-' + (slug !== '' ? slug : 'news');
    }

    // ---------- Search (search.php) ----------
    function renderSearchPage() {
        E.initPublicPage();

        var query = (E.qs('q') || '').trim();
        var perPage = 10;
        var page = Math.max(1, parseInt(E.qs('page') || '1', 10) || 1);
        var offset = (page - 1) * perPage;

        var results = [];
        var total = 0;
        var totalPages = 0;

        if (query !== '') {
            var lower = query.toLowerCase();
            var matches = E.db.publishedArticles().filter(function (a) {
                return String(a.title).toLowerCase().indexOf(lower) !== -1 ||
                    String(a.content).toLowerCase().indexOf(lower) !== -1;
            }).sort(E.byCreatedDesc);
            total = matches.length;
            totalPages = Math.ceil(total / perPage);
            results = matches.slice(offset, offset + perPage);
        }

        var html = '';
        if (query !== '') {
            html += '<div class="search-results-info">';
            if (total > 0) {
                html += '<i class="fas fa-search me-1"></i> ' + total + ' result' + (total !== 1 ? 's' : '') + ' found for "' + E.sanitize(query) + '"';
            } else {
                html += '<i class="fas fa-search me-1"></i> No results found for "' + E.sanitize(query) + '"';
            }
            html += '</div>';
        }

        if (query !== '' && total > 0) {
            html += '<div class="row g-4">';
            for (var i = 0; i < results.length; i++) {
                var a = results[i];
                html +=
                    '<div class="col-lg-6">' +
                        '<div class="article-card">' +
                            '<div class="row g-0">' +
                                '<div class="col-md-4">' +
                                    E.renderMediaPreview(a, 'card', false, 'height: 100%; min-height: 180px;') +
                                '</div>' +
                                '<div class="col-md-8">' +
                                    '<div class="card-body" style="padding: 1.2rem;">' +
                                        '<span class="badge-category badge-' + E.sanitize(a.category_name).toLowerCase() + ' mb-2">' + E.sanitize(a.category_name) + '</span>' +
                                        '<h3 class="card-title"><a class="stretched-link" href="' + E.escapeHtml(E.articleUrl(a)) + '">' + E.sanitize(a.title) + '</a></h3>' +
                                        '<p class="card-excerpt" style="-webkit-line-clamp: 2;">' + E.sanitize(E.phpSubstr(a.content, 0, 120)) + '...</p>' +
                                        '<div class="card-meta">' +
                                            '<span class="author">' + E.sanitize(a.author_name) + '</span>' +
                                            '<span class="date"><i class="fas fa-calendar-alt"></i> ' + E.formatDate(a.created_at) + '</span>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
            }
            html += '</div>';
            html += E.paginationHtml(page, totalPages, function (p) {
                return '?q=' + encodeURIComponent(query) + '&page=' + p;
            });
        } else if (query !== '') {
            html +=
                '<div class="no-results">' +
                    '<i class="fas fa-search"></i>' +
                    '<h3>No results found</h3>' +
                    '<p>Try searching with different keywords.</p>' +
                    '<a href="' + E.escapeHtml(E.BASE + 'archives.html') + '" class="btn btn-outline-maroon mt-2">Browse Archives</a>' +
                '</div>';
        } else {
            html +=
                '<div class="no-results">' +
                    '<i class="fas fa-search"></i>' +
                    '<h3>Search our publication</h3>' +
                    '<p>Enter a keyword above to search for articles, news, and more.</p>' +
                '</div>';
        }

        setHtml('searchContent', html);

        // Prefill the hero search box
        var heroInput = document.querySelector('.search-box input[name="q"]');
        if (heroInput && query) {
            heroInput.value = query;
        }
    }

    // ---------- Archives (archives.php) ----------
    function renderArchivesPage() {
        E.initPublicPage();

        var perPage = 10;
        var page = Math.max(1, parseInt(E.qs('page') || '1', 10) || 1);
        var offset = (page - 1) * perPage;
        var catFilter = parseInt(E.qs('category') || '0', 10) || 0;
        var yearFilter = parseInt(E.qs('year') || '0', 10) || 0;
        var searchTerm = (E.qs('q') || '').trim();

        var categories = E.db.categories().slice().sort(function (a, b) {
            return a.category_name.localeCompare(b.category_name);
        });

        var published = E.db.publishedArticles();

        // Distinct years (desc)
        var yearMap = {};
        for (var y = 0; y < published.length; y++) {
            var yr = parseInt(String(published[y].created_at).slice(0, 4), 10);
            if (yr) yearMap[yr] = true;
        }
        var years = Object.keys(yearMap).map(Number).sort(function (a, b) { return b - a; });

        var matches = published.filter(function (a) {
            if (catFilter > 0 && a.category_id !== catFilter) return false;
            if (yearFilter > 0 && parseInt(String(a.created_at).slice(0, 4), 10) !== yearFilter) return false;
            if (searchTerm !== '') {
                var lower = searchTerm.toLowerCase();
                if (String(a.title).toLowerCase().indexOf(lower) === -1 && String(a.content).toLowerCase().indexOf(lower) === -1) {
                    return false;
                }
            }
            return true;
        }).sort(E.byCreatedDesc);

        var total = matches.length;
        var totalPages = Math.ceil(total / perPage);
        var articles = matches.slice(offset, offset + perPage);

        var countEl = document.getElementById('dateBarCount');
        if (countEl) {
            countEl.textContent = total + ' Archived Article' + (total !== 1 ? 's' : '');
        }

        // Filter selects
        var catSelect = document.getElementById('archiveCategory');
        if (catSelect) {
            var catHtml = '<option value="0">All Categories</option>';
            for (var c = 0; c < categories.length; c++) {
                catHtml += '<option value="' + categories[c].id + '"' + (catFilter === categories[c].id ? ' selected' : '') + '>' + E.sanitize(categories[c].category_name) + '</option>';
            }
            catSelect.innerHTML = catHtml;
        }
        var yearSelect = document.getElementById('archiveYear');
        if (yearSelect) {
            var yearHtml = '<option value="0">All Years</option>';
            for (var k = 0; k < years.length; k++) {
                yearHtml += '<option value="' + years[k] + '"' + (yearFilter === years[k] ? ' selected' : '') + '>' + years[k] + '</option>';
            }
            yearSelect.innerHTML = yearHtml;
        }
        var archiveSearch = document.getElementById('archiveSearch');
        if (archiveSearch && searchTerm) {
            archiveSearch.value = searchTerm;
        }

        var html = '';
        if (articles.length > 0) {
            html += '<div class="row g-4">';
            for (var i = 0; i < articles.length; i++) {
                var a = articles[i];
                html +=
                    '<div class="col-lg-6">' +
                        '<div class="article-card">' +
                            '<div class="row g-0">' +
                                '<div class="col-md-4">' +
                                    E.renderMediaPreview(a, 'card', false, 'height: 100%; min-height: 180px;') +
                                '</div>' +
                                '<div class="col-md-8">' +
                                    '<div class="card-body" style="padding: 1.2rem;">' +
                                        '<span class="badge-category badge-' + E.sanitize(a.category_name).toLowerCase() + ' mb-2">' + E.sanitize(a.category_name) + '</span>' +
                                        '<h3 class="card-title"><a class="stretched-link" href="' + E.escapeHtml(E.articleUrl(a)) + '">' + E.sanitize(a.title) + '</a></h3>' +
                                        '<p class="card-excerpt" style="-webkit-line-clamp: 2;">' + E.sanitize(E.phpSubstr(a.content, 0, 120)) + '...</p>' +
                                        '<div class="card-meta">' +
                                            '<span class="author">' + E.sanitize(a.author_name) + '</span>' +
                                            '<span class="date"><i class="fas fa-calendar-alt"></i> ' + E.formatDate(a.created_at) + '</span>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
            }
            html += '</div>';
            html += E.paginationHtml(page, totalPages, function (p) {
                var qs = '?page=' + p;
                if (catFilter > 0) qs += '&category=' + catFilter;
                if (yearFilter > 0) qs += '&year=' + yearFilter;
                if (searchTerm !== '') qs += '&q=' + encodeURIComponent(searchTerm);
                return qs;
            });
        } else {
            html +=
                '<div class="no-results">' +
                    '<i class="fas fa-archive"></i>' +
                    '<h3>No articles found</h3>' +
                    '<p>Try adjusting your filters or search terms.</p>' +
                '</div>';
        }

        setHtml('archivesContent', html);
        bindArchiveFilterForm();
    }

    // One guarded submit handler stops rapid Filter clicks from firing the same
    // category/year/search navigation more than once.
    function bindArchiveFilterForm() {
        var form = document.querySelector('.archive-filters form');
        if (!form || form.getAttribute('data-filter-bound') === '1') return;
        form.setAttribute('data-filter-bound', '1');

        form.addEventListener('submit', function (e) {
            if (form.getAttribute('data-submitting') === '1') {
                e.preventDefault();
                return;
            }
            form.setAttribute('data-submitting', '1');

            var button = form.querySelector('button[type="submit"]');
            if (button) {
                button.disabled = true;
                button.setAttribute('aria-busy', 'true');
                button.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Filtering...';
            }
        });

        window.addEventListener('pageshow', function () {
            form.removeAttribute('data-submitting');
            var button = form.querySelector('button[type="submit"]');
            if (button) {
                button.disabled = false;
                button.removeAttribute('aria-busy');
                button.innerHTML = 'Filter';
            }
        });
    }

    // ---------- About (about.php) ----------
    function renderAboutPage() {
        E.initPublicPage();

        var staff = [
            { name: 'Maria Santos', role: 'Editor-in-Chief' },
            { name: 'Joshua Reyes', role: 'Managing Editor' },
            { name: 'Ana Sofia Cruz', role: 'News Editor' },
            { name: 'Miguel Dela Cruz', role: 'Sports Editor' },
            { name: 'Carla Mendoza', role: 'Opinion Editor' },
            { name: 'Paolo Garcia', role: 'Features Editor' },
            { name: 'Isabella Hernandez', role: 'Literary Editor' },
            { name: 'Nathan Aquino', role: 'Entertainment Editor' },
            { name: 'Prof. Elena Villanueva', role: 'Faculty Adviser' },
            { name: 'James Ramirez', role: 'Layout & Design' },
            { name: 'Nicole Fernandez', role: 'Photography Editor' },
            { name: 'Christian Bautista', role: 'Associate Editor' }
        ];

        var html = '';
        for (var i = 0; i < staff.length; i++) {
            html +=
                '<div class="col-lg-3 col-md-4 col-6">' +
                    '<div class="staff-card">' +
                        '<div class="staff-avatar">' + E.escapeHtml(staff[i].name.substring(0, 1).toUpperCase()) + '</div>' +
                        '<div class="staff-name">' + E.sanitize(staff[i].name) + '</div>' +
                        '<div class="staff-role">' + E.sanitize(staff[i].role) + '</div>' +
                    '</div>' +
                '</div>';
        }
        setHtml('staffGrid', html);
    }

    function setHtml(id, html) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    return {
        renderIndexPage: renderIndexPage,
        renderCategoryPage: renderCategoryPage,
        renderArticlePage: renderArticlePage,
        renderSearchPage: renderSearchPage,
        renderArchivesPage: renderArchivesPage,
        renderAboutPage: renderAboutPage
    };
})();
