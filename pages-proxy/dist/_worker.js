// leftrighthand.pages.dev: hands every request to the `leftrighthand` Worker.
const proxy = {
  fetch(request, env) {
    return env.SITE.fetch(request);
  },
};

export default proxy;
