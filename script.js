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
    applyTheme(savedTheme === 'dark');

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

    // 尝试自动播放
    window.addEventListener('load', function() {
        bgMusic.play().then(function() {
            isPlaying = true;
            musicToggle.classList.add('playing');
            musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
        }).catch(function(e) {
            console.log('Auto-play prevented by browser:', e);
        });
    });

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
})();
