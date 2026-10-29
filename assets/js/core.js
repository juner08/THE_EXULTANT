// ============================================================
// THE EXULTANT - HTML Prototype Core
// localStorage data layer, auth, flash messages, and shared
// helpers that mirror the original PHP functions in
// config/db.php, includes/article_media.php and includes/video.php
// ============================================================

window.Exultant = (function () {
    'use strict';

    // ---------- Storage keys ----------
    var KEYS = {
        admins: 'exultant_admins',
        users: 'exultant_users',
        categories: 'exultant_categories',
        articles: 'exultant_articles',
        comments: 'exultant_comments',
        session: 'exultant_admin_session',
        flash: 'exultant_flash',
        seeded: 'exultant_seeded'
    };

    // Simulated server upload limit (mirrors exultant_video_max_bytes())
    var VIDEO_MAX_BYTES = 2147483648; // 2GB

    var VIDEO_EXTENSIONS = ['mp4', 'm4v', 'webm', 'mov', 'avi', 'mkv', 'mpeg', 'mpg', 'ogg', 'ogv', '3gp', 'wmv'];

    // ---------- Seed data (matches database.deploy.sql exactly) ----------
    var SEED = {
        admins: [
            { id: 1, username: 'admin', password: 'admin123', created_at: '2026-09-23 10:21:29' }
        ],
        users: [
            { id: 1, name: 'Sample Author', email: 'author@theexultant.com', username: 'author', password: 'author123', role: 'author', created_at: '2026-09-23 10:21:29' }
        ],
        categories: [
            { id: 1, category_name: 'News', description: 'Latest school news and updates from the campus community' },
            { id: 2, category_name: 'Sports', description: 'School sports events, competitions, and athlete features' },
            { id: 3, category_name: 'Opinion', description: 'Editorials, student opinions, and thought-provoking commentaries' },
            { id: 4, category_name: 'Features', description: 'In-depth feature stories, student achievements, and school events' },
            { id: 5, category_name: 'Literary', description: 'Poems, short stories, creative writing, and literary works' },
            { id: 6, category_name: 'Entertainment', description: 'Entertainment articles, movies, music, and student activities' },
            { id: 7, category_name: 'Announcements', description: 'Official school announcements and important notices' }
        ],
        articles: [
            {
                id: 1,
                title: 'Welcome to The Exultant - Our Inaugural Edition',
                content: 'We are thrilled to announce the launch of The Exultant, the official student publication of Holy Cross Academy. This platform serves as a voice for our student body, providing a space for news, stories, opinions, and creative expression. Our team of dedicated student journalists and writers is committed to delivering quality content that informs, inspires, and engages our school community. Stay tuned for regular updates, compelling stories, and thought-provoking articles that reflect the spirit and excellence of our institution.',
                image: 'article_1790350305_3619.png',
                video: null,
                category_id: 1,
                author_id: 1,
                status: 'published',
                created_at: '2026-09-23 10:21:29',
                updated_at: '2026-09-25 23:31:45'
            },
            {
                id: 2,
                title: 'Students Excel in Regional Science Fair',
                content: 'Holy Cross Academy students brought home multiple awards from the Regional Science Fair held last weekend. The team, composed of five senior students, presented innovative projects ranging from renewable energy solutions to biomedical applications. Their dedication and months of hard work paid off as they secured first place in the Environmental Science category and third place in the Biomedical Engineering division. The school administration congratulates all participants and their faculty mentors for this outstanding achievement.',
                image: 'article_1790350323_8725.png',
                video: null,
                category_id: 4,
                author_id: 1,
                status: 'published',
                created_at: '2026-09-23 10:21:29',
                updated_at: '2026-09-25 23:32:03'
            },
            {
                id: 3,
                title: 'Basketball Team Clinches Championship Title',
                content: 'In an electrifying final game that had the entire school on their feet, the Holy Cross Academy basketball team secured the championship title after a hard-fought victory against their long-time rivals. The team displayed exceptional teamwork and determination throughout the tournament, finishing with an impressive 12-1 record. Team captain Marcus Rivera led the charge with 28 points in the finals, earning the Most Valuable Player award.',
                image: 'article_1790350348_5375.png',
                video: null,
                category_id: 2,
                author_id: 1,
                status: 'published',
                created_at: '2026-09-23 10:21:29',
                updated_at: '2026-09-25 23:32:28'
            },
            {
                id: 4,
                title: 'Why Student Voice Matters: A Case for Open Dialogue',
                content: 'In an era where students are more connected and informed than ever before, it is imperative that educational institutions foster environments where student voices are not only heard but actively sought. Student publications like The Exultant play a crucial role in bridging the gap between the student body and the administration. This editorial argues for the importance of open dialogue and the vital role that student journalism plays in building a vibrant, engaged school community.',
                image: null,
                video: null,
                category_id: 3,
                author_id: 1,
                status: 'published',
                created_at: '2026-09-23 10:21:29',
                updated_at: '2026-09-23 10:21:29'
            },
            {
                id: 5,
                title: 'Echoes of Tomorrow: A Collection of Student Poetry',
                content: 'The literary section of The Exultant proudly presents a curated collection of poems written by talented students from across all grade levels. These works explore themes of identity, hope, change, and the universal experience of growing up. From free verse to structured sonnets, these poems showcase the remarkable depth and creativity of our student writers. We invite you to immerse yourself in these words and discover the voices that will shape tomorrow.',
                image: null,
                video: null,
                category_id: 5,
                author_id: 1,
                status: 'published',
                created_at: '2026-09-23 10:21:29',
                updated_at: '2026-09-23 10:21:29'
            },
            {
                id: 6,
                title: 'Annual School Festival: A Celebration of Culture and Community',
                content: 'The much-awaited Annual School Festival is set to take place next month, promising a week filled with cultural performances, academic exhibitions, and community-building activities. This year theme, "Unity in Diversity," aims to celebrate the rich cultural tapestry of our student body. Events will include a cultural night, talent show, academic symposium, sports tournament, and a grand community fair. All students, parents, and community members are invited to participate in this grand celebration.',
                image: null,
                video: null,
                category_id: 4,
                author_id: 1,
                status: 'published',
                created_at: '2026-09-23 10:21:29',
                updated_at: '2026-09-23 10:21:29'
            },
            {
                id: 7,
                title: 'Okay',
                content: 'Game',
                image: null,
                video: 'video_1790130525_6628.mp4',
                category_id: 6,
                author_id: 1,
                status: 'published',
                created_at: '2026-09-23 10:28:45',
                updated_at: '2026-09-23 10:28:45'
            },
            {
                id: 9,
                title: 'adadad',
                content: 'dadawda',
                image: 'article_1790350289_2739.png',
                video: null,
                category_id: 7,
                author_id: 1,
                status: 'published',
                created_at: '2026-09-25 22:45:09',
                updated_at: '2026-09-25 23:31:29'
            },
            {
                id: 11,
                title: 'HAHAHHA',
                content: 'AFAaswda',
                image: null,
                video: 'video_1790349836_6f27b28d.mp4',
                category_id: 6,
                author_id: 1,
                status: 'published',
                created_at: '2026-09-25 23:23:56',
                updated_at: '2026-09-25 23:23:56'
            },
            {
                id: 13,
                title: 'Wapin',
                content: 'HAHAHHAHA',
                image: 'article_1790350248_1854.png',
                video: null,
                category_id: 7,
                author_id: 1,
                status: 'published',
                created_at: '2026-09-25 23:30:48',
                updated_at: '2026-09-25 23:30:48'
            }
        ],
        comments: [
            { id: 1, article_id: 1, user_id: 1, comment: 'Congratulations on the launch! Excited to see what The Exultant has in store for us.', created_at: '2026-09-23 10:21:29' }
        ]
    };

    // ---------- Base path (admin pages live one level down) ----------
    var BASE = /\/admin\//i.test(window.location.pathname) ? '../' : '';

    // ---------- Low-level storage ----------
    function load(key) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    function ensureSeed() {
        if (localStorage.getItem(KEYS.seeded) === '1') {
            return;
        }
        save(KEYS.admins, SEED.admins);
        save(KEYS.users, SEED.users);
        save(KEYS.categories, SEED.categories);
        save(KEYS.articles, SEED.articles);
        save(KEYS.comments, SEED.comments);
        localStorage.setItem(KEYS.seeded, '1');
    }

    ensureSeed();

    function resetPrototypeData() {
        localStorage.removeItem(KEYS.seeded);
        ensureSeed();
    }

    function nextId(rows) {
        var max = 0;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].id > max) max = rows[i].id;
        }
        return max + 1;
    }

    function nowStamp() {
        var d = new Date();
        function p(n) { return (n < 10 ? '0' : '') + n; }
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    }

    function mysqlDateTimeToParts(dt) {
        var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(dt || ''));
        if (!m) {
            var d = new Date(dt);
            return { y: d.getFullYear(), mo: d.getMonth() + 1, d: d.getDate(), h: d.getHours(), mi: d.getMinutes(), s: d.getSeconds() };
        }
        return { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5], s: +(m[6] || 0) };
    }

    // ---------- Database layer ----------
    var db = {
        admins: function () { return load(KEYS.admins) || []; },
        users: function () { return load(KEYS.users) || []; },
        categories: function () { return load(KEYS.categories) || []; },
        articles: function () { return load(KEYS.articles) || []; },
        comments: function () { return load(KEYS.comments) || []; },

        findAdminById: function (id) {
            var rows = db.admins();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].id === id) return rows[i];
            }
            return null;
        },
        findAdminByUsername: function (username) {
            var rows = db.admins();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].username === username) return rows[i];
            }
            return null;
        },
        updateAdmin: function (id, patch) {
            var rows = db.admins();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].id === id) {
                    for (var k in patch) {
                        if (Object.prototype.hasOwnProperty.call(patch, k)) rows[i][k] = patch[k];
                    }
                }
            }
            save(KEYS.admins, rows);
        },

        findUserById: function (id) {
            var rows = db.users();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].id === id) return rows[i];
            }
            return null;
        },
        findUserByEmail: function (email) {
            var rows = db.users();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].email === email) return rows[i];
            }
            return null;
        },
        findUserByUsername: function (username) {
            var rows = db.users();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].username === username) return rows[i];
            }
            return null;
        },
        insertUser: function (obj) {
            var rows = db.users();
            obj.id = nextId(rows);
            if (!obj.created_at) obj.created_at = nowStamp();
            rows.push(obj);
            save(KEYS.users, rows);
            return obj.id;
        },
        updateUserRole: function (id, role) {
            var rows = db.users();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].id === id) rows[i].role = role;
            }
            save(KEYS.users, rows);
        },
        deleteUser: function (id) {
            save(KEYS.users, db.users().filter(function (r) { return r.id !== id; }));
        },

        findCategoryById: function (id) {
            var rows = db.categories();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].id === id) return rows[i];
            }
            return null;
        },
        findCategoryByName: function (name) {
            var rows = db.categories();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].category_name === name) return rows[i];
            }
            return null;
        },
        insertCategory: function (obj) {
            var rows = db.categories();
            obj.id = nextId(rows);
            rows.push(obj);
            save(KEYS.categories, rows);
            return obj.id;
        },
        updateCategory: function (id, patch) {
            var rows = db.categories();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].id === id) {
                    for (var k in patch) {
                        if (Object.prototype.hasOwnProperty.call(patch, k)) rows[i][k] = patch[k];
                    }
                }
            }
            save(KEYS.categories, rows);
        },
        deleteCategory: function (id) {
            save(KEYS.categories, db.categories().filter(function (r) { return r.id !== id; }));
        },
        categoryArticleCount: function (id) {
            return db.articles().filter(function (a) { return a.category_id === id; }).length;
        },

        findArticleById: function (id) {
            var rows = db.articles();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].id === id) return rows[i];
            }
            return null;
        },
        insertArticle: function (obj) {
            var rows = db.articles();
            obj.id = nextId(rows);
            if (!obj.created_at) obj.created_at = nowStamp();
            if (!obj.updated_at) obj.updated_at = obj.created_at;
            rows.push(obj);
            save(KEYS.articles, rows);
            return obj.id;
        },
        updateArticle: function (id, patch) {
            var rows = db.articles();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].id === id) {
                    for (var k in patch) {
                        if (Object.prototype.hasOwnProperty.call(patch, k)) rows[i][k] = patch[k];
                    }
                    rows[i].updated_at = nowStamp();
                }
            }
            save(KEYS.articles, rows);
        },
        deleteArticle: function (id) {
            save(KEYS.articles, db.articles().filter(function (r) { return r.id !== id; }));
            save(KEYS.comments, db.comments().filter(function (c) { return c.article_id !== id; }));
        },
        updateArticleStatus: function (id, status) {
            var rows = db.articles();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].id === id) {
                    rows[i].status = status;
                    rows[i].updated_at = nowStamp();
                }
            }
            save(KEYS.articles, rows);
        },

        articleComments: function (articleId) {
            return db.comments().filter(function (c) { return c.article_id === articleId; });
        },
        insertComment: function (obj) {
            var rows = db.comments();
            obj.id = nextId(rows);
            if (!obj.created_at) obj.created_at = nowStamp();
            rows.push(obj);
            save(KEYS.comments, rows);
            return obj.id;
        },

        // Enriched article rows (mirrors the PHP JOIN queries)
        publishedArticles: function () {
            return enrich(db.articles().filter(function (a) { return a.status === 'published'; }));
        },
        allArticlesEnriched: function () {
            return enrich(db.articles());
        },
        userArticleCount: function (userId) {
            return db.articles().filter(function (a) { return a.author_id === userId; }).length;
        },
        userCommentCount: function (userId) {
            return db.comments().filter(function (c) { return c.user_id === userId; }).length;
        }
    };

    function enrich(articles) {
        var cats = db.categories();
        var users = db.users();
        return articles.map(function (a) {
            var copy = {};
            for (var k in a) {
                if (Object.prototype.hasOwnProperty.call(a, k)) copy[k] = a[k];
            }
            var cat = null;
            var usr = null;
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === a.category_id) cat = cats[i];
            }
            for (var j = 0; j < users.length; j++) {
                if (users[j].id === a.author_id) usr = users[j];
            }
            copy.category_name = cat ? cat.category_name : '';
            copy.author_name = usr ? usr.name : '';
            return copy;
        });
    }

    function byCreatedDesc(a, b) {
        if (a.created_at === b.created_at) return b.id - a.id;
        return a.created_at < b.created_at ? 1 : -1;
    }

    // ---------- Auth (mirrors admin/includes/auth.php + login.php) ----------
    // The admin session lives in sessionStorage (mirrors a PHP session).
    function sessionRead() {
        try {
            var raw = sessionStorage.getItem(KEYS.session);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function sessionWrite(value) {
        try {
            sessionStorage.setItem(KEYS.session, JSON.stringify(value));
        } catch (e) { /* ignore quota errors */ }
    }

    var auth = {
        login: function (username, password) {
            var admin = db.findAdminByUsername(username);
            if (admin && admin.password === password) {
                sessionWrite({
                    admin_id: admin.id,
                    admin_username: admin.username,
                    admin_role: 'admin',
                    admin_login_time: Math.floor(Date.now() / 1000)
                });
                return admin;
            }
            return null;
        },
        logout: function () {
            sessionStorage.removeItem(KEYS.session);
        },
        session: function () { return sessionRead(); },
        setSession: function (value) { sessionWrite(value); },
        isLoggedIn: function () { return !!sessionRead(); },
        isAdmin: function () {
            var s = sessionRead();
            return !!(s && s.admin_role === 'admin');
        },
        getCurrentAdmin: function () {
            var s = sessionRead();
            if (!s) return null;
            return db.findAdminById(s.admin_id);
        },
        requireLogin: function () {
            if (!auth.isLoggedIn()) {
                window.location.replace('login.html');
                return false;
            }
            return true;
        },
        requireAdmin: function () {
            if (!auth.requireLogin()) return false;
            if (!auth.isAdmin()) return false;
            return true;
        }
    };

    // ---------- Flash messages (mirrors $_SESSION flash) ----------
    var flash = {
        set: function (message, type) {
            sessionStorage.setItem(KEYS.flash, JSON.stringify({ message: message, type: type || 'info' }));
        },
        consume: function () {
            try {
                var raw = sessionStorage.getItem(KEYS.flash);
                if (!raw) return null;
                sessionStorage.removeItem(KEYS.flash);
                return JSON.parse(raw);
            } catch (e) {
                return null;
            }
        }
    };

    // ---------- Generic helpers (mirrors config/db.php) ----------
    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function sanitize(data) {
        if (data === null || data === undefined) return '';
        var stripped = String(data).replace(/<[^>]*>/g, '');
        return escapeHtml(stripped.trim());
    }

    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // date('F j, Y')
    function formatDate(date) {
        var p = mysqlDateTimeToParts(date);
        return MONTHS[p.mo - 1] + ' ' + p.d + ', ' + p.y;
    }

    // date('F j, Y \a\t g:i A')
    function formatDateTime(date) {
        var p = mysqlDateTimeToParts(date);
        var hour12 = p.h % 12;
        if (hour12 === 0) hour12 = 12;
        var ampm = p.h < 12 ? 'AM' : 'PM';
        var min = (p.mi < 10 ? '0' : '') + p.mi;
        return MONTHS[p.mo - 1] + ' ' + p.d + ', ' + p.y + ' at ' + hour12 + ':' + min + ' ' + ampm;
    }

    // date('M j, Y')
    function formatShortDate(date) {
        var p = mysqlDateTimeToParts(date);
        return MONTHS_SHORT[p.mo - 1] + ' ' + p.d + ', ' + p.y;
    }

    // date('l, F j, Y')
    function todayLong() {
        var d = new Date();
        return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

    function phpSubstr(str, start, len) {
        return String(str || '').substring(start, start + len);
    }

    function nl2br(str) {
        return escapeHtml(str).replace(/\r\n|\r|\n/g, '<br>');
    }

    function qs(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    function formatBytes(bytes) {
        bytes = parseInt(bytes, 10) || 0;
        if (bytes >= 1073741824) {
            return rtrimZero((bytes / 1073741824).toFixed(1)) + 'GB';
        }
        if (bytes >= 1048576) {
            return rtrimZero((bytes / 1048576).toFixed(1)) + 'MB';
        }
        if (bytes >= 1024) {
            return rtrimZero((bytes / 1024).toFixed(1)) + 'KB';
        }
        return bytes + 'B';
    }

    function rtrimZero(str) {
        return str.replace(/\.0+$/, '');
    }

    // ---------- Video helpers (mirrors includes/video.php) ----------
    function videoMimeFromExt(ext) {
        var map = {
            mp4: 'video/mp4',
            m4v: 'video/x-m4v',
            webm: 'video/webm',
            mov: 'video/quicktime',
            avi: 'video/x-msvideo',
            mkv: 'video/x-matroska',
            mpeg: 'video/mpeg',
            mpg: 'video/mpeg',
            ogg: 'video/ogg',
            ogv: 'video/ogg',
            '3gp': 'video/3gpp',
            wmv: 'video/x-ms-wmv'
        };
        return map[ext] || 'video/mp4';
    }

    function basename(path) {
        var parts = String(path || '').split(/[\\/]/);
        return parts[parts.length - 1];
    }

    function fileExt(path) {
        var name = basename(path);
        var idx = name.lastIndexOf('.');
        return idx === -1 ? '' : name.substring(idx + 1).toLowerCase();
    }

    // ---------- Media helpers (mirrors includes/article_media.php) ----------
    function articleUrl(article) {
        return BASE + 'article.html?id=' + (article && article.id ? article.id : 0);
    }

    function articleImageUrl(article) {
        var image = trimStr(article && article.image);
        if (image === '') return '';
        if (image.indexOf('data:') === 0 || image.indexOf('blob:') === 0 || image.indexOf('http') === 0) return image;
        return BASE + 'assets/uploads/' + encodeURIComponent(basename(image));
    }

    function articleVideoInfo(article) {
        var video = trimStr(article && article.video);
        if (video === '') return { url: '', mime: '', ext: '' };
        if (video.indexOf('blob:') === 0 || video.indexOf('data:') === 0 || video.indexOf('http') === 0) {
            return { url: video, mime: 'video/mp4', ext: 'mp4' };
        }
        var file = basename(video);
        var ext = fileExt(file);
        return {
            url: BASE + 'assets/uploads/' + encodeURIComponent(file),
            mime: videoMimeFromExt(ext),
            ext: ext
        };
    }

    function articlePlaceholderClass(article) {
        var category = trimStr(article && article.category_name).toLowerCase();
        var slug = category.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return 'cat-' + (slug !== '' ? slug : 'news');
    }

    function trimStr(value) {
        return value === null || value === undefined ? '' : String(value).trim();
    }

    function renderVideoPreview(article, className) {
        var video = articleVideoInfo(article);
        var url = escapeHtml(video.url) + '#t=0.5';
        return '<video class="' + escapeHtml(className) + '" src="' + url + '" muted playsinline preload="metadata" tabindex="-1" aria-hidden="true"></video>';
    }

    function renderMediaPreview(article, variant, showCategory, wrapperStyle) {
        variant = variant || 'card';
        if (showCategory === undefined) showCategory = true;
        var title = sanitize(article.title || 'Article');
        var category = sanitize(article.category_name || '');
        var imageUrl = articleImageUrl(article);
        var video = articleVideoInfo(article);
        var hasVideo = video.url !== '';
        var placeholderClass = articlePlaceholderClass(article);

        if (variant === 'sm') {
            if (imageUrl !== '') {
                return '<img src="' + escapeHtml(imageUrl) + '" alt="' + title + '" class="sm-image" loading="lazy">';
            }
            if (hasVideo) {
                return renderVideoPreview(article, 'sm-video');
            }
            return '<div class="placeholder-img ' + placeholderClass + '">' + category + '</div>';
        }

        if (variant === 'featured') {
            if (imageUrl !== '') {
                return '<img src="' + escapeHtml(imageUrl) + '" alt="' + title + '" class="featured-image">';
            }
            if (hasVideo) {
                return renderVideoPreview(article, 'featured-video');
            }
            return '<div class="placeholder-img ' + placeholderClass + '" style="height:450px;"><span>' + title + '</span></div>';
        }

        var html = '<div class="card-image-wrapper"' + (wrapperStyle ? ' style="' + escapeHtml(wrapperStyle) + '"' : '') + '>';
        if (imageUrl !== '') {
            html += '<img src="' + escapeHtml(imageUrl) + '" alt="' + title + '" class="card-image" loading="lazy">';
        } else if (hasVideo) {
            html += renderVideoPreview(article, 'card-video-preview');
        } else {
            html += '<div class="placeholder-img ' + placeholderClass + '">' + category + '</div>';
        }
        if (showCategory) {
            html += '<span class="card-category">' + category + '</span>';
        }
        if (hasVideo) {
            if (imageUrl === '') {
                html += '<span class="card-play-badge" aria-hidden="true"><i class="fas fa-play"></i></span>';
            } else {
                html += '<span class="card-video-badge" title="Has video"><i class="fas fa-video"></i></span>';
            }
        }
        html += '</div>';
        return html;
    }

    // ---------- UI helpers ----------
    function paginationHtml(page, totalPages, makeHref) {
        if (totalPages <= 1) return '';
        var html = '<div class="pagination">';
        if (page > 1) {
            html += '<a href="' + escapeHtml(makeHref(page - 1)) + '" class="page-link"><i class="fas fa-chevron-left"></i></a>';
        }
        for (var i = 1; i <= totalPages; i++) {
            html += '<a href="' + escapeHtml(makeHref(i)) + '" class="page-link' + (i === page ? ' active' : '') + '">' + i + '</a>';
        }
        if (page < totalPages) {
            html += '<a href="' + escapeHtml(makeHref(page + 1)) + '" class="page-link"><i class="fas fa-chevron-right"></i></a>';
        }
        html += '</div>';
        return html;
    }

    function flashAlertHtml() {
        var f = flash.consume();
        if (!f) return '';
        return '<div class="alert-custom ' + escapeHtml(f.type || 'info') + '"><i class="fas fa-info-circle"></i> ' + escapeHtml(f.message) + '</div>';
    }

    function errorAlertHtml(message, persistent) {
        return '<div class="alert-custom error' + (persistent ? ' persistent-alert' : '') + '"><i class="fas fa-exclamation-circle"></i> ' + escapeHtml(message) + '</div>';
    }

    function successAlertHtml(message) {
        return '<div class="alert-custom success"><i class="fas fa-check-circle"></i> ' + escapeHtml(message) + '</div>';
    }

    // ---------- Category navigation maps (mirrors index.php) ----------
    var CATEGORY_ICONS = {
        'News': 'fa-newspaper',
        'Sports': 'fa-basketball-ball',
        'Opinion': 'fa-comments',
        'Features': 'fa-star',
        'Literary': 'fa-book-open',
        'Entertainment': 'fa-film',
        'Announcements': 'fa-bullhorn'
    };

    var CATEGORY_LINKS = {
        'News': 'news.html',
        'Sports': 'sports.html',
        'Opinion': 'opinion.html',
        'Features': 'features.html',
        'Literary': 'literary.html',
        'Entertainment': 'entertainment.html',
        'Announcements': 'announcements.html'
    };

    // Categories added from the admin panel do not have a dedicated section page.
    // Send them to the archive filtered by their id instead of a dead "#" link.
    function categoryLink(name, id) {
        if (CATEGORY_LINKS[name]) {
            return BASE + CATEGORY_LINKS[name];
        }
        var categoryId = parseInt(id, 10) || 0;
        return BASE + 'archives.html' + (categoryId > 0 ? '?category=' + encodeURIComponent(categoryId) : '');
    }

    function currentFileName() {
        var path = window.location.pathname.split(/[\\/]/);
        return path[path.length - 1] || 'index.html';
    }

    // ---------- Shared page init ----------
    function initPublicPage() {
        // Date bars
        var dateEls = document.querySelectorAll('.js-today-long');
        for (var i = 0; i < dateEls.length; i++) {
            dateEls[i].textContent = todayLong();
        }

        // Navbar search value from ?q= (mirrors navbar.php sanitize($_GET['q']))
        var navInput = document.querySelector('.nav-search input[name="q"]');
        var q = qs('q');
        if (navInput && q) {
            navInput.value = q;
        }

        // Footer year (mirrors date('Y'))
        var yearEls = document.querySelectorAll('.js-footer-year');
        for (var j = 0; j < yearEls.length; j++) {
            yearEls[j].textContent = new Date().getFullYear();
        }
    }

    // Save an uploaded image: data URL when small enough, else object URL
    function storeUploadedFile(file, callback) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var dataUrl = e.target.result;
            // Guard against blowing the localStorage quota (~5MB)
            var usage = 0;
            try {
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    usage += (k ? k.length : 0) + (localStorage.getItem(k) || '').length;
                }
            } catch (err) { usage = 0; }
            if (usage + dataUrl.length < 4200000) {
                callback(dataUrl);
            } else {
                callback(URL.createObjectURL(file));
            }
        };
        reader.readAsDataURL(file);
    }

    return {
        BASE: BASE,
        KEYS: KEYS,
        VIDEO_MAX_BYTES: VIDEO_MAX_BYTES,
        VIDEO_EXTENSIONS: VIDEO_EXTENSIONS,
        db: db,
        auth: auth,
        flash: flash,
        sanitize: sanitize,
        escapeHtml: escapeHtml,
        formatDate: formatDate,
        formatDateTime: formatDateTime,
        formatShortDate: formatShortDate,
        todayLong: todayLong,
        phpSubstr: phpSubstr,
        nl2br: nl2br,
        qs: qs,
        formatBytes: formatBytes,
        videoMimeFromExt: videoMimeFromExt,
        basename: basename,
        fileExt: fileExt,
        articleUrl: articleUrl,
        articleImageUrl: articleImageUrl,
        articleVideoInfo: articleVideoInfo,
        renderMediaPreview: renderMediaPreview,
        paginationHtml: paginationHtml,
        flashAlertHtml: flashAlertHtml,
        errorAlertHtml: errorAlertHtml,
        successAlertHtml: successAlertHtml,
        CATEGORY_ICONS: CATEGORY_ICONS,
        CATEGORY_LINKS: CATEGORY_LINKS,
        categoryLink: categoryLink,
        currentFileName: currentFileName,
        initPublicPage: initPublicPage,
        storeUploadedFile: storeUploadedFile,
        byCreatedDesc: byCreatedDesc,
        resetPrototypeData: resetPrototypeData,
        nowStamp: nowStamp
    };
})();
