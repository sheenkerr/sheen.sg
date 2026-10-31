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
  // stories reuse the same logos; a few stack names differ from the Skills list
  const SAME = { 'Google Cloud Run': 'Cloud Run', 'Django Admin': 'Django' };
  // single-colour marks in dark ink; a page with a dark theme turns these white (class "ink"), as their brands' reverse logos do
  const INK = ['Django'];
  // the small mark that sits beside a name
  function logo(s) {
    s = SAME[s] || s;
    const image = src(s);
    if (image) return `<img${INK.includes(s) ? ' class="ink"' : ''} src="${image}" alt="">`;
    // a written-out name would only repeat the label beside it, so it gets no mark here
    if (MONO[s] && MONO[s][0].length <= 3) return `<span class="mono" style="--b:${MONO[s][1]};--f:${MONO[s][2]}" aria-hidden="true">${esc(MONO[s][0])}</span>`;
    return '';
  }
  return { DI, MONO, SAME, src, logo };
})();
