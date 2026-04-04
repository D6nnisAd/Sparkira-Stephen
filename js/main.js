$(document).ready(function() {
    // Initialize AOS Animation Library
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        offset: 50
    });

    // Navbar scroll effect for everywhere
    const handleScroll = () => {
        if ($(window).scrollTop() > 50) {
            $('#mainNavbar').addClass('scrolled');
        } else {
            $('#mainNavbar').removeClass('scrolled');
        }
    };

    $(window).scroll(handleScroll);
    
    // Trigger on load in case page is refreshed halfway down
    handleScroll();

    // Close mobile menu when clicking a nav-link
    $('.navbar-collapse .nav-link').on('click', function() {
        if ($('.navbar-toggler').is(':visible')) {
            $('.navbar-collapse').collapse('hide');
        }
    });

    // Global Routing to Register Page for Cards, Images, and Buttons
    const routeElements = [
        '.bento-card', 
        '.package-card', 
        '.about-img', 
        '.hero-title-img', 
        '.hero-image-mobile', 
        '.btn-primary-glowing',
        '.pkg-btn-diamond',
        '.pkg-btn-silver'
    ];
    
    // Convert elements into interactive routing triggers unless they are specifically internal hash links
    $(routeElements.join(', ')).not('[href^="#"]').addClass('route-to-register').on('click', function(e) {
        // Prevent default if it's an 'a' tag without a valid href
        if($(this).is('a') && (!$(this).attr('href') || $(this).attr('href') === '#')) {
            e.preventDefault();
        }
        window.location.href = 'register.html';
    });
});
