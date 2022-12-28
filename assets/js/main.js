/* @AJJPSMUSIC */
function hsl2rgb (h, s, l) {

    var r, g, b, m, c, x

    if (!isFinite(h)) h = 0
    if (!isFinite(s)) s = 0
    if (!isFinite(l)) l = 0

    h /= 60
    if (h < 0) h = 6 - (-h % 6)
    h %= 6

    s = Math.max(0, Math.min(1, s / 100))
    l = Math.max(0, Math.min(1, l / 100))

    c = (1 - Math.abs((2 * l) - 1)) * s
    x = c * (1 - Math.abs((h % 2) - 1))

    if (h < 1) {
        r = c
        g = x
        b = 0
    } else if (h < 2) {
        r = x
        g = c
        b = 0
    } else if (h < 3) {
        r = 0
        g = c
        b = x
    } else if (h < 4) {
        r = 0
        g = x
        b = c
    } else if (h < 5) {
        r = x
        g = 0
        b = c
    } else {
        r = c
        g = 0
        b = x
    }

    m = l - c / 2
    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return { r: r, g: g, b: b }

}

function setup() {
  pixelDensity(1);
  createCanvas(400, 400);
}

const drawPixel = (x, y, color = {}) => {
  const index = (x + y * width) * 4;
  pixels[index] = color.r;
  pixels[index + 1] = color.g;
  pixels[index + 2] = color.b;
  pixels[index + 3] = color.a || 255;
};

let mouseIsLock = false;
const pressedMouse = {x: 0, y: 0};
const draggedMouse = {x: 0, y: 0};

const getC = (a, b) => {
  return { real: a, imagine: b };
};

function mousePressed() {
   if(!mouseIsLock) {
      mouseIsLock = true;
      pressedMouse.x = mouseX;
      pressedMouse.y = mouseY;
    }
}

function mouseDragged() {
  if (mouseIsLock) {
    draggedMouse.x = mouseX;
    draggedMouse.y = mouseY;
    
    const speed = 3;
    
    const updatedX = map(draggedMouse.x - pressedMouse.x, 0, width, 0, speed / currentViewPosition.zoom);
      
    const updatedY = map(draggedMouse.y - pressedMouse.y, 0, height, 0, speed / currentViewPosition.zoom);
    
    pressedMouse.x = draggedMouse.x;
    pressedMouse.y = draggedMouse.y;
    
    currentViewPosition.w = currentViewPosition.w + updatedX;
    currentViewPosition.h = currentViewPosition.h + updatedY;
  }
}

function mouseWheel({ delta }) {
  if (delta > 0) {
    currentViewPosition.zoom -= .2;
  } else {
    currentViewPosition.zoom += .2;
  };
  console.log('(4 / currentViewPosition.zoom)', (4 / currentViewPosition.zoom))
}

function mouseReleased() {
  mouseIsLock = false;
}

const currentViewPosition = {
  w: -2,
  h: -2,
  zoom: 1
}

const getMag = (z) => abs(z.real * z.real + z.imagine * z.imagine)

function draw() {
  background(0);
  // translate(width / 2, height / 2);
  loadPixels();  
  
  for(var canvasY = 0; canvasY < height; canvasY++) {
    for(var canvasX = 0; canvasX < width; canvasX++) {
      
      const x = map(canvasX, 0, width, currentViewPosition.w, currentViewPosition.w + (4 / Math.pow(currentViewPosition.zoom, 2)));
      
      const y = map(canvasY, 0, height, currentViewPosition.h, currentViewPosition.h + (4 / Math.pow(currentViewPosition.zoom, 2)));
      
      const c = getC(x, y);
      let z = { real: 0, imagine: 0 };
      
      let i = 0;
      
      const maxThreshold = 100;
      
      while(i < maxThreshold) {
        z = {
          real: z.real * z.real - z.imagine * z.imagine + c.real,
          imagine: 2 * z.real * z.imagine + c.imagine
        };
       
        
        if (getMag(z) > 16) {
          break;
        }
        
        i++;
      }
      
      const smooth = i + 1 - Math.log(Math.log(getMag(z))) / Math.log(2)
      
      const color =  80 * smooth;
      const saturation = 60;
      const value = 50;
    
      drawPixel(canvasX, canvasY, hsl2rgb(color, saturation, value));
      
    }
  }
  
  updatePixels();
}

(function($) {

	var	$window = $(window),
		$body = $('body');

	// Breakpoints.
		breakpoints({
			default:   ['1681px',   null       ],
			xlarge:    ['1281px',   '1680px'   ],
			large:     ['981px',    '1280px'   ],
			medium:    ['737px',    '980px'    ],
			small:     ['481px',    '736px'    ],
			xsmall:    ['361px',    '480px'    ],
			xxsmall:   [null,       '360px'    ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Hack: Enable IE workarounds.
		if (browser.name == 'ie')
			$body.addClass('is-ie');

	// Mobile?
		if (browser.mobile)
			$body.addClass('is-mobile');

	// Scrolly.
		$('.scrolly')
			.scrolly({
				offset: 100
			});

	// Polyfill: Object fit.
		if (!browser.canUse('object-fit')) {

			$('.image[data-position]').each(function() {

				var $this = $(this),
					$img = $this.children('img');

				// Apply img as background.
					$this
						.css('background-image', 'url("' + $img.attr('src') + '")')
						.css('background-position', $this.data('position'))
						.css('background-size', 'cover')
						.css('background-repeat', 'no-repeat');

				// Hide img.
					$img
						.css('opacity', '0');

			});

			$('.gallery > a').each(function() {

				var $this = $(this),
					$img = $this.children('img');

				// Apply img as background.
					$this
						.css('background-image', 'url("' + $img.attr('src') + '")')
						.css('background-position', 'center')
						.css('background-size', 'cover')
						.css('background-repeat', 'no-repeat');

				// Hide img.
					$img
						.css('opacity', '0');

			});

		}

	// Gallery.
		$('.gallery')
			.on('click', 'a', function(event) {

				var $a = $(this),
					$gallery = $a.parents('.gallery'),
					$modal = $gallery.children('.modal'),
					$modalImg = $modal.find('img'),
					href = $a.attr('href');

				// Not an image? Bail.
					if (!href.match(/\.(jpg|gif|png|mp4)$/))
						return;

				// Prevent default.
					event.preventDefault();
					event.stopPropagation();

				// Locked? Bail.
					if ($modal[0]._locked)
						return;

				// Lock.
					$modal[0]._locked = true;

				// Set src.
					$modalImg.attr('src', href);

				// Set visible.
					$modal.addClass('visible');

				// Focus.
					$modal.focus();

				// Delay.
					setTimeout(function() {

						// Unlock.
							$modal[0]._locked = false;

					}, 600);

			})
			.on('click', '.modal', function(event) {

				var $modal = $(this),
					$modalImg = $modal.find('img');

				// Locked? Bail.
					if ($modal[0]._locked)
						return;

				// Already hidden? Bail.
					if (!$modal.hasClass('visible'))
						return;

				// Stop propagation.
					event.stopPropagation();

				// Lock.
					$modal[0]._locked = true;

				// Clear visible, loaded.
					$modal
						.removeClass('loaded')

				// Delay.
					setTimeout(function() {

						$modal
							.removeClass('visible')

						setTimeout(function() {

							// Clear src.
								$modalImg.attr('src', '');

							// Unlock.
								$modal[0]._locked = false;

							// Focus.
								$body.focus();

						}, 475);

					}, 125);

			})
			.on('keypress', '.modal', function(event) {

				var $modal = $(this);

				// Escape? Hide modal.
					if (event.keyCode == 27)
						$modal.trigger('click');

			})
			.on('mouseup mousedown mousemove', '.modal', function(event) {

				// Stop propagation.
					event.stopPropagation();

			})
			.prepend('<div class="modal" tabIndex="-1"><div class="inner"><img src="" /></div></div>')
				.find('img')
					.on('load', function(event) {

						var $modalImg = $(this),
							$modal = $modalImg.parents('.modal');

						setTimeout(function() {

							// No longer visible? Bail.
								if (!$modal.hasClass('visible'))
									return;

							// Set loaded.
								$modal.addClass('loaded');

						}, 275);

					});

})(jQuery);
