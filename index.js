let jsonvariants;

/**
 * Respond with one of the two variants depending on the visits the user makes
 * Also changes the content of the HTML pages
 * @param {Request} request
 */
async function handleRequest(request) {

  const response = await fetch("https://cfw-takehome.developers.workers.dev/api/variants"
    , { method: 'GET' });

  let data = await response.json();

  jsonvariants = data.variants;

  let cookie = getCookie(request,"selected");

  let selected;

  if (cookie) {
    console.log("Cookie found! :: " + cookie);
    selected = cookie;
  } else {
    console.log("Cookie not found!");

    //selecting a random based on A/B testing style
    selected = Math.random() < 0.5 ? jsonvariants[0] : jsonvariants[1];
  }

  console.log("Selected variant :: " + selected);

  const selectedVariantRes = await fetch(selected, { method: 'GET' });

  let res = new HTMLRewriter();

  res = res.on('title', new TitleHandler())
    .on('h1', new H1Handler())
    .on('p', new PHandler())
    .on('a', new HREFHandler())
    .transform(selectedVariantRes);

  //setting the cookie if it does not exist
  if (!cookie) res.headers.append('Set-Cookie', `selected=${selected};`);

  return res;

}

/**
 * Grabs the cookie with name from the request headers
 * @param {Request} request incoming Request
 * @param {string} name of the cookie to grab
 * Source : https://github.com/ashleygwilliams/template-registry/blob/master/templates/javascript/cookie_extract.js
 */
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

/**
 * Class to handle the changes in the Title
 */
class TitleHandler {
  element(element) {
    element.setInnerContent("Hey there!(Sample title)");
  }
}

/**
 * Class to handle the changes in the H1 element
 */
class H1Handler {
  element(element) {
    element.setInnerContent("Hope you are doing well!");
  }
}

/**
 * Class to handle the changes in the p element
 */
class PHandler {
  element(element) {
    element.setInnerContent("This is the sample variant paragraph.(Sample paragraph)");
  }
}


/**
 * Class to handle the changes in the HREF of the anchor tag
 */
class HREFHandler {
  element(element) {
    element.setAttribute("href", "https://www.linkedin.com/in/floyed-pinto");
    element.setInnerContent("Please connect through LinkedIn!");
  }
}

