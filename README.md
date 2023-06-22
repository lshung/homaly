# Homaly
jQuery plugin Horizontal Masonry Layout for Photo Gallery.
This project is forked from jLightroom (https://github.com/falkmueller/jLightroom).

## Requirements
- jQuery
- One of these two plugins: imagesLoaded (for basic usage) or lazysizes (for advanced usage). If none of them is included, Homaly does not work properly.

## Basic Usage
Basic usage shoud be used when the gallery does not have too many images so that the browser can load all of them at once. If there are more than 20 images, consider using lazyload technique as mentioned at Advanced Usage section below.
### HTML
```html
<div class="homaly-wrapper">
    <div class="homaly_item">
        <img class="homaly_img" src="https://dummyimage.com/900x600/98EF36/fff.jpg&text=Homaly" />
    </div>
    <div class="homaly_item">
        <img class="homaly_img" src="https://dummyimage.com/1000x600/B4A761/fff.jpg&text=Homaly" />
    </div>
</div>
```
### CSS
Just for smooth animation
```css
.homaly_img {
    opacity: 0;
}
.homaly_loaded {
    opacity: 1;
    transition-duration: 2s;
}
```
### Javascript
Homaly requires jQuery and imagesLoaded plugin
```javascript
<script src="jquery.min.js"></script>
<script src="imagesloaded.pkgd.min.js"></script>
<script src="homaly.min.js"></script>
<!-- Homaly Init -->
<script>
    $(document).ready(function () {
        $(".homaly-wrapper").homaly({
            item_selector: "div.homaly_item",
            img_selector: "img.homaly_img",
            img_loaded_class: "homaly_loaded",
            img_height: 200,
            img_spacing: 5,
        }).init();
    });
</script>
```

## Advanced Usage
- Apply lazyload technique using lazysizes plugin (https://github.com/aFarkas/lazysizes)
- View images using lightbox2 plugin (https://github.com/lokesh/lightbox2)
- Add animation for showing images using animate.css (https://github.com/animate-css/animate.css)
### HTML
- \<img\> tag: Change attribute "src" to "data-src" and add class "lazyload" to use lazysizes
- \<a\> tag: Add href link and attribute data-lightbox="lb1" to use lighbox2
```html
<div class="homaly-wrapper">
    <a href="https://dummyimage.com/900x600/98EF36/fff.jpg&text=Homaly" data-lightbox="lb1" class="homaly_item">
        <img data-src="https://dummyimage.com/900x600/98EF36/fff.jpg&text=Homaly" class="homaly_img lazyload" />
    </a>
    <a href="https://dummyimage.com/1000x600/B4A761/fff.jpg&text=Homaly" data-lightbox="lb1" class="homaly_item">
        <img data-src="https://dummyimage.com/1000x600/B4A761/fff.jpg&text=Homaly" class="homaly_img lazyload" />
    </a>
</div>
```
### CSS
```css
<link rel="stylesheet" href="lightbox.min.css">
<link rel="stylesheet" href="animate.min.css">
```
### Javascript
Add class "animate__animated animate__jackInTheBox" or any other "animate__*" class name from animate.css you like to img_loaded_class option
```javascript
<script src="jquery.min.js"></script>
<script src="lazysizes.min.js"></script>
<script src="lightbox.min.js"></script>
<script src="homaly.min.js"></script>
<!-- Homaly Init -->
<script>
    $(document).ready(function () {
        $(".homaly-wrapper").homaly({
            item_selector: "a.homaly_item",
            img_selector: "img.homaly_img",
            img_loaded_class: "homaly_loaded animate__animated animate__jackInTheBox",
            img_height: 200,
            img_spacing: 5,
        }).init();
    });
</script>
```