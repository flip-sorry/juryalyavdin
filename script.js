        window.fbAsyncInit = function() {
          FB.init({
            xfbml            : true,
            version          : 'v7.0'
          });
        };

        (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));

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
      