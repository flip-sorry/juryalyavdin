// Animates blocks

      $(document).ready(function() {

        function isInViewport($el) {
          var elementTop = $el.offset().top;
          var elementBottom = elementTop + $el.outerHeight();
          var viewportTop = $(window).scrollTop();
          var viewportBottom = viewportTop + $(window).height();
      
          return elementBottom > viewportTop && elementTop < viewportBottom;
        }
      
        function handleScroll() {
          $('.fade-content').each(function() {
            var $block = $(this);
            
            // If block is in viewport and it's not already animated
            if (isInViewport($block) && $block.css("opacity") == "0") {
              $block.css({
                'opacity': '1',
                'transform': 'translateY(0px)'
              });
            }
          });
        }
      
        // Attach the function to the scroll event
        $(window).on('scroll', handleScroll);
      
        // Initial check, in case any of the elements are already in the viewport on page load
        handleScroll();
      });

      
// Hides header on the main

      window.addEventListener('scroll', function () {
        var header = document.getElementById('header-main');
        if (window.scrollY >= 700) {
            header.style.top = '0';
        } else {
            header.style.top = '-64px';
        }
    });


// Gets dominant color from the imade in div and applies as drop shadow

    function getDominantColor(imageElement) {
      const canvas = document.getElementById('colorCanvas');
      const context = canvas.getContext('2d');
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;
      context.drawImage(imageElement, 0, 0);
    
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let colorMap = {};
      let maxCount = 0;
      let dominantColor = '';
    
      for (let i = 0; i < imageData.length; i += 4) {
        // Convert the color to a string format
        const color = `${imageData[i]},${imageData[i+1]},${imageData[i+2]}`;
    
        if (colorMap[color]) {
          colorMap[color]++;
        } else {
          colorMap[color] = 1;
        }
    
        if (colorMap[color] > maxCount) {
          maxCount = colorMap[color];
          dominantColor = color;
        }
      }
    
      return `rgba(${dominantColor},1)`;
    }
    
    window.onload = function() {
      const avatar = document.getElementById('avatar');
      const image = new Image();
      image.onload = function() {
        const dominantColor = getDominantColor(image);
        avatar.style.boxShadow = `0px 0px 240px ${dominantColor}`;
      };
      image.src = avatar.style.backgroundImage.slice(5, -2);
    };
    