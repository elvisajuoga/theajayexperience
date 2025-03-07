/*******************************************************
 * Configuration
 *******************************************************/
const config = {
    // This will automatically detect if we're in development or production
    apiBaseUrl: window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
        ? 'http://localhost:3003'  // Development
        : 'https://your-production-domain.com',  // Production - you'll need to update this
    
    // Using only shopping bag as the permanent cart icon
    cartIcon: 'fa-shopping-bag'
};

/*******************************************************
 * Navbar Scroll Effect and Mobile Menu
 *******************************************************/
document.addEventListener("DOMContentLoaded", () => {
    let lastScrollTop = 0;
    const navbar = document.getElementById("navbar");
  
    // Navbar scroll effect
    if (navbar) {
      window.addEventListener("scroll", () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
          // Scrolling down - hide navbar
          navbar.style.transform = "translateY(-100%)";
        } else {
          // Scrolling up - show navbar
          navbar.style.transform = "translateY(0)";
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
      });
    }

    // Logo click handler
    const logoElement = document.querySelector('.logo');
    if (logoElement) {
      logoElement.style.cursor = 'pointer';
      logoElement.addEventListener('click', () => {
        // Add animation class
        logoElement.classList.add('logo-animation');
        
        // Remove animation class after animation completes
        setTimeout(() => {
          logoElement.classList.remove('logo-animation');
        }, 500);
        
        const currentPath = window.location.pathname;
        const isHomePage = currentPath.endsWith('index.html') || 
                          currentPath.endsWith('/') || 
                          currentPath.endsWith('/htmls/') ||
                          currentPath.endsWith('/htmls/index.html');
        
        if (isHomePage) {
          // If already on home page, refresh the page
          window.location.reload();
        } else {
          // If not on home page, navigate to home
          window.location.href = currentPath.includes('/htmls/') ? 'index.html' : 'htmls/index.html';
        }
      });
    }

    // Set active class for current page in navigation
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('nav ul li a');
        
        // Check if we're on the home page
        const isHomePage = currentPath === '/' || currentPath.endsWith('/index.html');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Handle the home page specially
            if (href === 'index.html' && isHomePage) {
                link.classList.add('active');
            } 
            // For other pages
            else if (href && currentPath.includes(href) && href !== 'index.html') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Call the function to set the active link
    setActiveNavLink();

    // Add mobile menu toggle functionality
    const mobileMenuBtn = document.createElement('div');
    mobileMenuBtn.className = 'hamburger-menu';
    mobileMenuBtn.id = 'menu-btn';
    
    for (let i = 0; i < 3; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      mobileMenuBtn.appendChild(bar);
    }
    
    // Add mobile menu button to header
    const navbarHeader = document.querySelector('.navbar');
    if (navbarHeader) {
      navbarHeader.appendChild(mobileMenuBtn);
      
      // Create mobile nav if it doesn't exist
      let mobileNav = document.querySelector('.navigation');
      if (!mobileNav) {
        mobileNav = document.createElement('div');
        mobileNav.className = 'navigation';
        
        // Clone the nav links for mobile
        const navLinks = document.querySelector('nav ul');
        if (navLinks) {
          const clonedNav = navLinks.cloneNode(true);
          mobileNav.appendChild(clonedNav);
          navbarHeader.appendChild(mobileNav);
        }
      }
      
      // Add event listener for mobile menu toggle
      mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
      });
    }

    // Initialize the Free Fridays Gallery if it exists
    if (document.getElementById("freeFridaysGallery")) {
        initializeGallery();
    }
  });
  
  /*******************************************************
   * Event Card Hover Effect (Description Fade-in)
   *******************************************************/
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".event-card").forEach(card => {
      const description = card.querySelector(".event-description");
      if (description) {
        card.addEventListener("mouseover", () => {
          description.style.opacity = "1";
        });
        card.addEventListener("mouseout", () => {
          description.style.opacity = "0";
        });
      }
    });
  });
  
  /*******************************************************
   * (Optional) Original Dynamic Event Image Loading
   * If you no longer need this, you can remove or keep it commented out.
   *******************************************************/
  // document.addEventListener("DOMContentLoaded", () => {
  //   const imageBasePath = "./flashback-images/"; // Adjust if needed
  //   const events = [
  //     { name: "FREE FRIDAYS", folder: "free-fridays", images: ["IMG_1.jpg", "IMG_2.jpg", "IMG_3.jpg"] },
  //     { name: "Frenzy Fridays", folder: "frenzy-fridays", images: ["IMG_1.jpg", "IMG_2.jpg"] },
  //     { name: "Desta After Dark", folder: "desta-after-dark", images: ["IMG_1.jpg", "IMG_2.jpg", "IMG_3.jpg", "IMG_4.jpg"] }
  //   ];
  
  //   const galleryContainer = document.getElementById("eventsGallery");
  //   if (!galleryContainer) return;
  
  //   events.forEach(event => {
  //     const eventCard = document.createElement("div");
  //     eventCard.classList.add("event-card");
  
  //     // Use first image as the event card cover
  //     const coverImage = event.images.length
  //       ? `${imageBasePath}${event.folder}/${event.images[0]}`
  //       : "default.jpg";
  
  //     eventCard.innerHTML = `
  //       <div class="event-image">
  //         <img src="${coverImage}" alt="${event.name}">
  //         <div class="event-description">
  //             <h3>${event.name}</h3>
  //             <p>Relive the moments from ${event.name} with the best vibes and music.</p>
  //         </div>
  //       </div>
  //     `;
  //     eventCard.addEventListener("click", () => openGallery(event));
  //     galleryContainer.appendChild(eventCard);
  //   });
  // });
  
  /*******************************************************
   * Modals for Event Galleries (If you use them)
   *******************************************************/
  function openGallery(event) {
    const modal = document.getElementById("photoModal");
    if (!modal) return; // If there's no modal in your HTML, skip
  
    const modalTitle = document.getElementById("modalTitle");
    const photoContainer = document.getElementById("photoContainer");
  
    modalTitle.innerText = event.name;
    photoContainer.innerHTML = ""; // Clear images
  
    event.images.forEach(img => {
      const imgElement = document.createElement("img");
      imgElement.src = `./flashback-images/${event.folder}/${img}`;
      imgElement.alt = `${event.name} Photo`;
      photoContainer.appendChild(imgElement);
    });
  
    modal.style.display = "block";
  }
  
  function closeModal() {
    const modal = document.getElementById("photoModal");
    if (modal) {
      modal.style.display = "none";
    }
  }
  
  /*******************************************************
   * NEW: Load Free Fridays Gallery Dynamically from folder
   *******************************************************/
  function initializeGallery() {
    const galleryContainer = document.getElementById("freeFridaysGallery");
    const lightbox = document.getElementById("imageLightbox");
    
    if (!galleryContainer || !lightbox) return;
    
    const lightboxImg = lightbox.querySelector("img");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = document.getElementById("prevImage");
    const nextBtn = document.getElementById("nextImage");
    let currentImageIndex = 0;
    let images = [];

    // Function to load images from the freeFridays directory
    async function loadGalleryImages() {
        try {
            // Remove the loader
            const loader = galleryContainer.querySelector(".gallery-loader");
            if (loader) {
                loader.remove();
            }

            // Make API call to get the list of images
            const response = await fetch(`${config.apiBaseUrl}/api/gallery/freeFridays`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            images = await response.json();

            if (!Array.isArray(images) || images.length === 0) {
                throw new Error('No images found in the gallery');
            }

            // Create image elements
            images.forEach((imagePath, index) => {
                const imgContainer = document.createElement("div");
                imgContainer.className = "gallery-image-container";

                const img = document.createElement("img");
                img.src = `${config.apiBaseUrl}${imagePath}`;
                img.alt = `Free Fridays Image ${index + 1}`;
                img.loading = "lazy"; // Enable lazy loading

                // Add error handling for images
                img.onerror = () => {
                    img.src = 'placeholder.jpg';
                    imgContainer.classList.add('image-error');
                };

                // Add click event for lightbox
                imgContainer.addEventListener("click", () => openLightbox(index));
                
                imgContainer.appendChild(img);
                galleryContainer.appendChild(imgContainer);
            });
        } catch (error) {
            console.error("Error loading gallery:", error);
            galleryContainer.innerHTML = `
                <div class="error-message">
                    <p>Error loading gallery: ${error.message}</p>
                    <button onclick="initializeGallery()" class="retry-button">Retry</button>
                </div>`;
        }
    }

    // Lightbox functions
    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
    }

    function updateLightboxImage() {
        lightboxImg.src = `${config.apiBaseUrl}${images[currentImageIndex]}`;
        lightboxImg.alt = `Free Fridays Image ${currentImageIndex + 1}`;
        updateNavigationButtons();
    }

    function updateNavigationButtons() {
        prevBtn.disabled = currentImageIndex === 0;
        nextBtn.disabled = currentImageIndex === images.length - 1;
    }

    // Event listeners for lightbox navigation
    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", () => {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            updateLightboxImage();
        }
    });
    nextBtn.addEventListener("click", () => {
        if (currentImageIndex < images.length - 1) {
            currentImageIndex++;
            updateLightboxImage();
        }
    });

    // Close lightbox with escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeLightbox();
        } else if (e.key === "ArrowLeft") {
            prevBtn.click();
        } else if (e.key === "ArrowRight") {
            nextBtn.click();
        }
    });

    // Initialize the gallery
    loadGalleryImages();
  }
  
// Download and Subscribe functionality only if elements exist
document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.querySelector('.lightbox-download');
  const subscribeModal = document.getElementById('subscribeModal');
  
  if (downloadBtn && subscribeModal) {
      const modalClose = document.querySelector('.modal-close');
      const subscribeForm = document.getElementById('subscribeForm');
    
      downloadBtn.addEventListener('click', () => {
          subscribeModal.classList.add('active');
      });
    
      modalClose.addEventListener('click', () => {
          subscribeModal.classList.remove('active');
      });
    
      // Close on outside click
      subscribeModal.addEventListener('click', (e) => {
          if (e.target === subscribeModal) {
              subscribeModal.classList.remove('active');
          }
      });
    
      // Handle subscribe form submission
      if (subscribeForm) {
          subscribeForm.addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const email = document.getElementById('subscriberEmail').value;
              const currentImage = document.querySelector('#imageLightbox img').src;
              
              try {
                  const response = await fetch(`${config.apiBaseUrl}/api/subscribe`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                          email,
                          imageUrl: currentImage
                      })
                  });
                  
                  const result = await response.json();
                  
                  if (result.success) {
                      // Show success message
                      subscribeForm.innerHTML = `<p class="success-message">Thank you for subscribing! Your download is starting...</p>`;
                      
                      // Start download
                      const link = document.createElement('a');
                      link.href = currentImage;
                      link.download = currentImage.split('/').pop();
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      // Hide modal after delay
                      setTimeout(() => {
                          subscribeModal.classList.remove('active');
                      }, 3000);
                  } else {
                      throw new Error(result.error || 'Subscription failed');
                  }
              } catch (error) {
                  console.error('Error:', error);
                  subscribeForm.innerHTML += `<p class="error-message">Error: ${error.message}</p>`;
              }
          });
      }
  }
});
  
  /*******************************************************
   * Contact Form Handling
   *******************************************************/
  document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            // Get form data
            const formData = {
                name: contactForm.querySelector('#name').value,
                email: contactForm.querySelector('#email').value,
                eventType: contactForm.querySelector('#eventType').value,
                date: contactForm.querySelector('#date').value,
                message: contactForm.querySelector('#message').value,
                emailList: contactForm.querySelector('#emailList').checked
            };

            try {
                // Send form data to server
                const response = await fetch(`${config.apiBaseUrl}/api/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error('Failed to send message');
                }

                // Show success message
                const formContent = contactForm.innerHTML;
                contactForm.innerHTML = `
                    <div class="success-message">
                        <h3>Thank you for reaching out!</h3>
                        <p>We'll get back to you as soon as possible.</p>
                    </div>`;

                // Reset form after 3 seconds
                setTimeout(() => {
                    contactForm.innerHTML = formContent;
                    contactForm.reset();
                }, 3000);

            } catch (error) {
                console.error('Contact form error:', error);
                alert('Sorry, something went wrong. Please try again or contact us directly through email.');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
  });
  
/*******************************************************
 * Cart Icon Initialization
 *******************************************************/
// Initialize the cart icon to always use shopping bag
document.addEventListener("DOMContentLoaded", () => {
    const cartIcons = document.querySelectorAll('.cart-icon i');
    cartIcons.forEach(icon => {
        // Remove any existing icon classes
        icon.className = '';
        icon.classList.add('fas', config.cartIcon);
    });
    
    // ... rest of existing DOMContentLoaded code
});
  
// Add scroll indicator functionality
document.addEventListener('DOMContentLoaded', function() {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  const scrollingText = document.querySelector('.scrolling-text');
  
  if (scrollIndicator && scrollingText) {
    scrollIndicator.addEventListener('click', function() {
      scrollingText.scrollIntoView({ 
        behavior: 'smooth'
      });
    });
  }
});
  