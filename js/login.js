document.addEventListener('DOMContentLoaded', () => {
    // Password Show/Hide Functionality
    const passwordInput = document.getElementById('password');
    const togglePasswordButton = document.getElementById('togglePassword');
    const passwordIcon = togglePasswordButton.querySelector('i');

    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        passwordIcon.classList.toggle('fa-eye-slash', type === 'password');
        passwordIcon.classList.toggle('fa-eye', type === 'text');
    });

    // Carousel Functionality
    const carousel = document.getElementById('carousel');
    const dots = document.querySelectorAll('#dots span');
    let currentIndex = 0;
    const totalSlides = dots.length;
    const slideInterval = 5000; // 5 seconds interval for auto-slide

    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('bg-white', index === currentIndex);
            dot.classList.toggle('bg-gray-600', index !== currentIndex);
        });
    }

    function nextSlide() {
        currentIndex++;
        if (currentIndex >= totalSlides) {
            currentIndex = 0; // Reset to first slide
        }
        updateCarousel();
    }

    // Auto-slide functionality
    let autoSlide = setInterval(nextSlide, slideInterval);

    // Reset auto-slide timer when user interacts
    function resetAutoSlide() {
        clearInterval(autoSlide);
        autoSlide = setInterval(nextSlide, slideInterval);
    }

    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            currentIndex = parseInt(dot.getAttribute('data-index'));
            updateCarousel();
            resetAutoSlide();
        });
    });

    // Swipe functionality
    let startX = 0;
    let isDragging = false;

    carousel.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
    });

    carousel.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const diffX = e.clientX - startX;
            if (Math.abs(diffX) > 50) {
                if (diffX > 0 && currentIndex > 0) {
                    currentIndex--;
                } else if (diffX < 0) {
                    currentIndex++;
                    if (currentIndex >= totalSlides) {
                        currentIndex = 0; // Reset to first slide
                    }
                }
                updateCarousel();
                resetAutoSlide();
                isDragging = false;
            }
        }
    });

    carousel.addEventListener('mouseup', () => {
        isDragging = false;
    });

    carousel.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    // Touch support for mobile
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    carousel.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const diffX = e.touches[0].clientX - startX;
            if (Math.abs(diffX) > 50) {
                if (diffX > 0 && currentIndex > 0) {
                    currentIndex--;
                } else if (diffX < 0) {
                    currentIndex++;
                    if (currentIndex >= totalSlides) {
                        currentIndex = 0; // Reset to first slide
                    }
                }
                updateCarousel();
                resetAutoSlide();
                isDragging = false;
            }
        }
    });

    carousel.addEventListener('touchend', () => {
        isDragging = false;
    });
});