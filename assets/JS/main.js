
//? Navbar
const mobileMenu = document.getElementById('mobile-menu');
console.log(mobileMenu)
const navbarMenu = document.querySelector('.navbar-menu');

// mobileMenu.addEventListener('click', () => {
//     navbarMenu.classList.toggle('active');
// });

document.addEventListener("DOMContentLoaded", () => {
    const sliderControls = document.querySelector(".slider-controls");
    const sliderTabs = sliderControls.querySelectorAll(".slider-tab");
    const sliderIndicator = sliderControls.querySelector(".slider-indicator");
    const updateIndicator = (tab, index) => {
        document.querySelector(".slider-tab.current")?.classList.remove("current");
        tab.classList.add("current");

        sliderIndicator.style.transform = `translateX(${tab.offsetLeft}px)`;
        sliderIndicator.style.width = `${tab.offsetWidth}px`;
        const scrollLeft = tab.offsetLeft - sliderControls.offsetWidth / 2 + tab.offsetWidth / 2;
        sliderControls.scrollTo({ left: scrollLeft, behavior: "smooth" });
    };
    const swiper = new Swiper(".slider-container", {
        effect: "fade",
        speed: 1300,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        navigation: {
            prevEl: "#slide-prev",
            nextEl: "#slide-next",
        },
        on: {
            slideChange: () => {
                const currentTabIndex = swiper.activeIndex;
                if (sliderTabs[currentTabIndex]) {
                    updateIndicator(sliderTabs[currentTabIndex], currentTabIndex);
                }
            },
        },
    });
    sliderTabs.forEach((tab, index) => {
        tab.setAttribute("tabindex", "0");
        tab.addEventListener("click", () => {
            swiper.slideTo(index);
            updateIndicator(tab, index);
            swiper.autoplay.start();
        });
        tab.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight" && index < sliderTabs.length - 1) {
                sliderTabs[index + 1].click();
            }
            if (event.key === "ArrowLeft" && index > 0) {
                sliderTabs[index - 1].click();
            }
        });
    });
    updateIndicator(sliderTabs[0], 0);
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => updateIndicator(sliderTabs[swiper.activeIndex], swiper.activeIndex), 200);
    });
});


const sliderTrack = document.querySelector('.slider-track');

sliderTrack.addEventListener('mouseenter', () => {
    sliderTrack.style.animationPlayState = 'paused';
});

sliderTrack.addEventListener('mouseleave', () => {
    sliderTrack.style.animationPlayState = 'running';
});