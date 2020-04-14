let jsonvariants;

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {

  let url = "https://cfw-takehome.developers.workers.dev/api/variants";

  const response = await fetch(url, { method: 'GET' });

  let data = response.json();

  jsonvariants = data.variants;

  let cookie = request.headers.get('cookie');

  let selected;

  let res = new HTMLRewriter();

  if (cookie) {
    console.log("Cookie found! :: " + cookie);
    selected = cookie;
  } else {
    console.log("Cookie not found!");
    selected = Math.random() < 0.5 ? jsonvariants[0] : jsonvariants[1];
  }

  console.log("Selected variant :: " + selected);

  const selectedVariantRes = await fetch(selected, { method: 'GET' });

  res = res.on('title', new TitleHandler())
    .on('h1', new H1Handler())
    .on('p', new PHandler())
    .on('a', new HREFHandler())
    .transform(selectedVariantRes);

  if(!cookie) res.headers.append('Set-Cookie', `${selected};`);

  return res;

}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});


class TitleHandler {
  element(element) {
    element.setInnerContent("Hey there!(Sample title)");
  }
}

class H1Handler {
  element(element) {
    element.setInnerContent("Hope you are doing well!");
  }
}

class PHandler {
  element(element) {
    element.setInnerContent("This is the sample variant paragraph.(Sample paragraph)");
  }
}

class HREFHandler {
  element(element) {
    element.setAttribute("href", "https://www.linkedin.com/in/floyed-pinto");
    element.setInnerContent("Please connect through LinkedIn!");
  }
}

