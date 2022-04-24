# Real World

Below is a real world example you can use to better understand how this module works and how it can be applied to your web application. We are working on providing a live demonstration for more advanced use cases but the below example should give you a good understanding of how to leverage this module.

## Example

The first thing we want to do is make a connection with SPX. In your JavaScript bundle we need to initialize it (connect). Our example web application has 3 pages, the **home** page, **about** page and **contact** page. We are going to instruct SPX to replace the `<nav>` and `<main>` fragments on every visit and then we are going to leverage `data-spx` attributes to replace an additional fragment when we navigate to the contact page.

### JavaScript Bundle

<!-- prettier-ignore -->
```javascript
import spx from "SPX";


SPX.connect({
  targets: [
    "nav",
    "main"
  ]
});


```

## Home Page

Below we have a very basic Home Page with SPX wired up. All `<a>` elements will be intercepted and cached as per the default configuration. SSR web applications (in most cases) will only ever have a couple of fragments that change between navigation.

<!-- prettier-ignore -->
```html

<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Home Page</title>
    <script src="/bundle.js"></script>
  </head>
  <body>

    <header>

      <h1>SPX Example</h1>

      <!-- THIS FRAGMENT WILL BE REPLACED -->
      <nav>

        <!-- This link will be intercepted -->
        <a
         href="/home"
         class="active">Home</a>

        <!-- These links will be pe-fetched on hover -->
        <a
         href="/about"
         data-spx-hover>About</a>

        <!-- This link will replace the #foo fragment -->
        <a
         href="/contact"
         data-spx-replace="(['#foo'])">Contact</a>
      </nav>

    </header>

    <!-- THIS FRAGMENT WILL BE REPLACED -->
    <main>

      <h1>Welcome to the home page</h1>

      <div class="container">
        Brixtol Textiles is a Swedish apparel brand!
      </div>

    </main>

    <div id="foo">
      This fragment will not be touched until /contact is clicked
    </div>

    <footer>
      This fragment will not be touched during navigations as it's not
      defined within targets.
    </footer>

  </body>
</html>

```

## About Page

<br>

The about page in our web application would look practically identical to the home page. We instructed SPX to pre-fetch this page upon hover by annotating the `<a>` href link with `data-spx-hover` attribute. This attribute informs SPX to being fetching the page the moment the user hovers over the `<a>` link which results in the visit being instantaneous. The **about** page only has some minor differences, but for the sake of clarity, lets have look:

<!-- prettier-ignore -->
```html

<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>About Page</title>
    <script src="/bundle.js"></script>
  </head>
  <body>

    <header>

      <h1>SPX Example</h1>

      <!-- THIS FRAGMENT WILL BE REPLACED -->
      <nav>

        <!-- This link will be intercepted -->
        <a
         href="/home">Home</a>

        <!-- These links will be pe-fetched on hover -->
        <a
         href="/about"
         class="active"
         data-spx-hover>About</a>

        <!-- This link will replace the #foo fragment -->
        <a
         href="/contact"
         data-spx-replace="(['#foo'])">Contact</a>
      </nav>

    </header>

    <!-- THIS FRAGMENT WILL BE REPLACED -->
    <main>

      <h1>Welcome to the About Page</h1>

      <div class="container">
        Brixtol Textiles makes jackets out of recycled PET bottles.
        <p>Producing clothing in a sustainable way is the future!</p>
      </div>

    </main>

    <div id="foo">
      This fragment will not be touched until /contact is clicked
    </div>

    <footer>
      This fragment will not be touched during navigations as it's not
      defined within targets.
    </footer>

  </body>
</html>
```

## Contact Page

The contact page will replace an additional fragment with the id value of `foo` which we informed upon via attribute annotation. Upon visiting this page the `<nav>`, `<main>` and `<div id="foo">` fragments will be replaced.

<!-- prettier-ignore -->
```html

<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Contact Page</title>
    <script src="/bundle.js"></script>
  </head>
  <body>

    <header>

      <h1>SPX Example</h1>

      <!-- THIS FRAGMENT WILL BE REPLACED -->
      <nav>

        <!-- This link will be intercepted -->
        <a
         href="/home">Home</a>

        <!-- These links will be pe-fetched on hover -->
        <a
         href="/about"
         class="active"
         data-spx-hover>About</a>

        <!-- This link will replace the #foo fragment -->
        <a
         href="/contact"
         data-spx-replace="(['#foo'])">Contact</a>
      </nav>

    </header>

    <!-- THIS FRAGMENT WILL BE REPLACED -->
    <main>

      <h1>Welcome to the Contact Page</h1>

      <div class="container">
        This is contact page of our example! The below fragment was replaced too!
      </div>

    </main>

    <!-- THIS FRAGMENT WAS REPLACE VIA ATTRIBUTE INSTRUCTION -->
    <div id="foo">
      This fragment was replaced!
    </div>

    <footer>
      This fragment will not be touched during navigations as it's not
      defined within targets.
    </footer>

  </body>
</html>
```
