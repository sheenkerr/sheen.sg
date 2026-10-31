// Shared logo lookup for skill tiles and story details.
window.LOGOS = (() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Devicon 2.16.0's marks, copied into images/devicon so the page needs no CDN
  const DI = 'images/devicon/';
  const ICON = {
    Python: 'python-original', Django: 'django-plain', FastAPI: 'fastapi-original', PostgreSQL: 'postgresql-original',
    Redis: 'redis-original', 'SQL Server': 'microsoftsqlserver-original', Docker: 'docker-original',
    'GitHub Actions': 'githubactions-original', TypeScript: 'typescript-original', JavaScript: 'javascript-original',
    React: 'react-original', 'Material UI': 'materialui-original', Vitest: 'vitest-original', Figma: 'figma-original',
    Java: 'java-original', R: 'r-original', PyTorch: 'pytorch-original',
    TensorFlow: 'tensorflow-original', 'ASP.NET Core': 'dotnetcore-original', JUnit: 'junit-original',
    Jest: 'jest-plain', Playwright: 'playwright-original', k6: 'k6-original', MongoDB: 'mongodb-original',
  };
  // AWS's own service icons, from the Architecture Icons package (Jul 2026 release) at aws.amazon.com/architecture/icons.
  // Parameter Store is part of Systems Manager and has no icon of its own, so it wears Systems Manager's.
  // DynamoDB's is the same set's, by way of the aws-icons package.
  const AWS = { DynamoDB: 'dynamodb', 'AWS ECS': 'ecs', EC2: 'ec2', S3: 's3', CloudFront: 'cloudfront', 'Route 53': 'route53', 'Parameter Store': 'systems-manager' };
  // Google's own icons (Cloud Run from the core set, Pub/Sub and Artifact Registry from the legacy set at cloud.google.com/icons),
  // and logos from each brand's own site: Firebase's brand kit, Tableau's "+" mark cropped from its wordmark,
  // Celery's stalk from docs.celeryq.dev, Stripe's "S" on its blurple app square, and React Native's app icon from reactnative.dev
  // (the React atom on dark, which is how it tells itself apart from React)
  const LOCAL = {
    'Cloud Run': 'images/gcp/cloud-run.svg', 'Pub/Sub': 'images/gcp/pubsub.svg', 'Artifact Registry': 'images/gcp/artifact-registry.svg',
    Firebase: 'images/brands/firebase.svg', Tableau: 'images/brands/tableau.svg', Celery: 'images/brands/celery.webp', Stripe: 'images/brands/stripe.svg',
    'React Native': 'images/brands/react-native.webp',
  };
  function src(skill) {
    if (AWS[skill]) return `images/aws/${AWS[skill]}.svg`;
    if (LOCAL[skill]) return LOCAL[skill];
    if (ICON[skill]) return `${DI}${ICON[skill]}.svg`;
    return '';
  }
  // no logo in either set for these: a lettered tile in the brand's own colours
  const MONO = {
    SQL: ['SQL', '#336791', '#fff'],
    UiPath: ['Ui', '#fa4616', '#101418'], Mockito: ['Mo', '#78a641', '#fff'],
    // JavaFX has no official logo: openjfx.io writes its name in plain text, so the tile does too
    JavaFX: ['JavaFX', 'transparent', '#101418'],
  };
  // practices rather than products have no brand to show, so they get a line drawing in white on a tile of their own colour,
  // like an app icon beside the brand logos (the APIs one wears OpenAI's green)
  const GLYPH = {
    Pitching: ['M3 10v4h3l7 5V5l-7 5zM16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10', '#ea580c'],
    'Product demos': ['M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM10.5 7.5l4 2.5-4 2.5zM9 20h6M12 16v4', '#2563eb'],
    Documentation: ['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4', '#0d9488'],
    'Code review': ['M7 7l-4 5 4 5M17 7l4 5-4 5M9 12l2 2 4-4', '#7c3aed'],
    Serializers: ['M7 4C5 4 4.5 5 4.5 7v2.5C4.5 11 3.5 12 3 12c.5 0 1.5 1 1.5 2.5V17c0 2 .5 3 2.5 3M10 12h5M13 10l2 2-2 2M18 7h3M18 12h3M18 17h3', '#db2777'],
    TOTP: ['M12 21a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM12 10.5V14l2.5 1.5M10 3h4M12 3v4', '#dc2626'],
    'OpenAI-compatible APIs': ['M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5', '#10a37f'],
  };
  // stories reuse the same logos; a few stack names differ from the Skills list
  const SAME = { 'Google Cloud Run': 'Cloud Run', 'Django Admin': 'Django' };
  // single-colour marks in dark ink; a page with a dark theme turns these white (class "ink"), as their brands' reverse logos do
  const INK = ['Django'];
  // the small mark that sits beside a name
  function logo(s) {
    s = SAME[s] || s;
    const image = src(s);
    if (image) return `<img${INK.includes(s) ? ' class="ink"' : ''} src="${image}" alt="">`;
    if (GLYPH[s]) return `<svg class="glyph" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="${GLYPH[s][1]}"/><path d="${GLYPH[s][0]}" transform="translate(4.5 4.5) scale(.625)" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    // a written-out name would only repeat the label beside it, so it gets no mark here
    if (MONO[s] && MONO[s][0].length <= 3) return `<span class="mono" style="--b:${MONO[s][1]};--f:${MONO[s][2]}" aria-hidden="true">${esc(MONO[s][0])}</span>`;
    return '';
  }
  return { DI, MONO, SAME, src, logo };
})();
