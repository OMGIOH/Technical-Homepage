(function () {
    var themeToggle = document.getElementById('theme-toggle');
    var floatTop = document.getElementById('float-top');

    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'light');
        }
    }

    var savedTheme = localStorage.getItem('theme');
    // 默认暗色：首次访问（无保存主题）时使用暗色
    if (savedTheme === null) {
        applyTheme(true);
    } else {
        applyTheme(savedTheme === 'dark');
    }

    function toggleTheme() {
        applyTheme(document.documentElement.getAttribute('data-theme') !== 'dark');
    }

    themeToggle.addEventListener('click', toggleTheme);

    var musicToggle = document.getElementById('music-toggle');
    var bgMusic = document.getElementById('bg-music');
    var isPlaying = false;

    function toggleMusic() {
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
            musicToggle.innerHTML = '<i class="fas fa-music"></i>';
        } else {
            bgMusic.play().catch(function(e) {
                console.log('Auto-play prevented:', e);
            });
            musicToggle.classList.add('playing');
            musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    }

    musicToggle.addEventListener('click', toggleMusic);

    window.addEventListener('scroll', function () {
        if (window.scrollY > 500) {
            floatTop.classList.add('visible');
        } else {
            floatTop.classList.remove('visible');
        }
    });

    floatTop.addEventListener('click', function () {
        var target = document.getElementById('articles');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });

    var fadeElements = document.querySelectorAll(
        '.tech-toc'
    );
    fadeElements.forEach(function (el) {
        el.classList.add('fade-in');
    });

    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.1 }
    );

    fadeElements.forEach(function (el) {
        observer.observe(el);
    });

    var heroName = document.querySelector('.hero-name');
    if (heroName) {
        var text = heroName.textContent;
        heroName.textContent = '';
        var i = 0;
        function typeWriter() {
            if (i < text.length) {
                heroName.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 90);
            }
        }
        setTimeout(typeWriter, 500);
    }

    var gameFrame = document.querySelector('.game-frame');
    if (gameFrame) {
        function hideGameFallback() {
            gameFrame.setAttribute('data-loaded', 'true');
        }
        gameFrame.addEventListener('load', hideGameFallback);
        setTimeout(hideGameFallback, 3000);
    }

    // ============== 右侧导航点 ==============
    var sections = ['hero', 'articles', 'ai-detail', 'ai-competitions', 'aigc-portfolio', 'game-detail'];
    var dots = document.querySelectorAll('.page-dot');
    var dotsTrack = document.getElementById('page-dots-track');
    var currentSection = 0;
    // 每个点占用空间：10px 高度 + 8px gap = 18px
    var DOT_GAP = 8;
    var DOT_SIZE = 10;
    var DOT_STEP = DOT_SIZE + DOT_GAP; // 18px

    function updateDots() {
        dots.forEach(function (dot) {
            var idx = parseInt(dot.getAttribute('data-index'));
            var diff = idx - currentSection;
            dot.classList.remove('active', 'near', 'far');

            if (diff === 0) {
                dot.classList.add('active');
            } else if (Math.abs(diff) === 1) {
                dot.classList.add('near');
            } else {
                dot.classList.add('far');
            }
        });

        // 滑动 track，使当前页的点位于窗口中心（第3个位置）
        // 窗口显示5个点，当前点应在第3个位置
        // track 需要先下移2个DOT_STEP（让第1个点位于中心），再随currentSection上移
        var translateY = (2 * DOT_STEP) - (currentSection * DOT_STEP);
        dotsTrack.style.transform = 'translateY(' + translateY + 'px)';
    }

    // 点击导航点跳转到对应页面
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var idx = parseInt(dot.getAttribute('data-index'));
            if (idx >= 0 && idx < sections.length) {
                var target = document.getElementById(sections[idx]);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // 滚动时检测当前页面
    function detectCurrentSection() {
        var scrollPos = window.scrollY + window.innerHeight / 2;
        for (var i = 0; i < sections.length; i++) {
            var el = document.getElementById(sections[i]);
            if (el) {
                var top = el.offsetTop;
                var bottom = top + el.offsetHeight;
                if (scrollPos >= top && scrollPos < bottom) {
                    if (currentSection !== i) {
                        currentSection = i;
                        updateDots();
                    }
                    break;
                }
            }
        }
    }

    window.addEventListener('scroll', function () {
        detectCurrentSection();
    });

    updateDots();
})();
