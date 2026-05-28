const express = require('express');
const helmet = require('helmet');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.join(__dirname, 'data');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function readJson(file) {
  const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
  return JSON.parse(raw);
}

function isHtmx(req) {
  return req.get('HX-Request') === 'true';
}

app.get('/', async (req, res, next) => {
  try {
    const [profile, projects, skills, services, contracts, testimonials, faqs, siteMeta, pricing, process, trust] = await Promise.all([
      readJson('profile.json'),
      readJson('projects.json'),
      readJson('skills.json'),
      readJson('services.json'),
      readJson('contracts.json'),
      readJson('testimonials.json'),
      readJson('faqs.json'),
      readJson('site-meta.json'),
      readJson('pricing.json'),
      readJson('process.json'),
      readJson('trust.json')
    ]);
    res.render('index', { profile, projects, skills, services, contracts, testimonials, faqs, siteMeta, pricing, process, trust });
  } catch (error) { next(error); }
});

app.get('/partials/projects', async (req, res, next) => {
  try {
    let projects = await readJson('projects.json');
    const category = (req.query.category || 'All').toString();
    if (category !== 'All') projects = projects.filter(p => p.category === category);
    res.render('partials/projects', { projects, activeCategory: category });
  } catch (error) { next(error); }
});

app.get('/partials/project/:slug', async (req, res, next) => {
  try {
    const projects = await readJson('projects.json');
    const project = projects.find(p => p.slug === req.params.slug);
    if (!project) return res.status(404).send('<div class="alert error">Project not found.</div>');
    res.render('partials/project-detail', { project });
  } catch (error) { next(error); }
});

app.get('/partials/skills', async (req, res, next) => {
  try { res.render('partials/skills', { skills: await readJson('skills.json') }); }
  catch (error) { next(error); }
});

app.get('/partials/services', async (req, res, next) => {
  try { res.render('partials/services', { services: await readJson('services.json') }); }
  catch (error) { next(error); }
});

app.get('/partials/contracts', async (req, res, next) => {
  try { res.render('partials/contracts', { contracts: await readJson('contracts.json') }); }
  catch (error) { next(error); }
});

app.get('/partials/testimonials', async (req, res, next) => {
  try { res.render('partials/testimonials', { testimonials: await readJson('testimonials.json') }); }
  catch (error) { next(error); }
});

app.get('/partials/faqs', async (req, res, next) => {
  try { res.render('partials/faqs', { faqs: await readJson('faqs.json') }); }
  catch (error) { next(error); }
});


app.get('/partials/pricing', async (req, res, next) => {
  try { res.render('partials/pricing', { pricing: await readJson('pricing.json') }); }
  catch (error) { next(error); }
});

app.get('/partials/process', async (req, res, next) => {
  try { res.render('partials/process', { process: await readJson('process.json') }); }
  catch (error) { next(error); }
});

app.get('/partials/trust', async (req, res, next) => {
  try { res.render('partials/trust', { trust: await readJson('trust.json') }); }
  catch (error) { next(error); }
});

app.get('/partials/contact', (req, res) => {
  res.render('partials/contact-form', { values: {}, error: null, success: null });
});

app.get('/api/projects', async (req, res, next) => {
  try { res.json(await readJson('projects.json')); }
  catch (error) { next(error); }
});
app.get('/api/skills', async (req, res, next) => {
  try { res.json(await readJson('skills.json')); }
  catch (error) { next(error); }
});
app.get('/api/services', async (req, res, next) => {
  try { res.json(await readJson('services.json')); }
  catch (error) { next(error); }
});
app.get('/api/contracts', async (req, res, next) => {
  try { res.json(await readJson('contracts.json')); }
  catch (error) { next(error); }
});
app.get('/api/testimonials', async (req, res, next) => {
  try { res.json(await readJson('testimonials.json')); }
  catch (error) { next(error); }
});
app.get('/api/faqs', async (req, res, next) => {
  try { res.json(await readJson('faqs.json')); }
  catch (error) { next(error); }
});


app.get('/api/pricing', async (req, res, next) => {
  try { res.json(await readJson('pricing.json')); }
  catch (error) { next(error); }
});
app.get('/api/process', async (req, res, next) => {
  try { res.json(await readJson('process.json')); }
  catch (error) { next(error); }
});
app.get('/api/trust', async (req, res, next) => {
  try { res.json(await readJson('trust.json')); }
  catch (error) { next(error); }
});

app.post('/api/contact', async (req, res, next) => {
  try {
    const values = {
      name: String(req.body.name || '').trim(),
      email: String(req.body.email || '').trim(),
      company: String(req.body.company || '').trim(),
      deadline: String(req.body.deadline || '').trim(),
      projectType: String(req.body.projectType || '').trim(),
      budget: String(req.body.budget || '').trim(),
      style: String(req.body.style || '').trim(),
      pages: String(req.body.pages || '').trim(),
      message: String(req.body.message || '').trim()
    };

    if (String(req.body.website || '').trim()) {
      const success = 'Message received. I will respond with a Web3 project plan soon.';
      if (isHtmx(req)) return res.render('partials/contact-form', { values: {}, error: null, success });
      return res.json({ success });
    }

    if (!values.name || !values.email || !values.message) {
      const error = 'Please provide your name, email, and message.';
      if (isHtmx(req)) return res.status(422).render('partials/contact-form', { values, error, success: null });
      return res.status(422).json({ error });
    }
    if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      const error = 'Please enter a valid email address.';
      if (isHtmx(req)) return res.status(422).render('partials/contact-form', { values, error, success: null });
      return res.status(422).json({ error });
    }
    if (values.message.length > 1200) {
      const error = 'Please keep your message under 1200 characters.';
      if (isHtmx(req)) return res.status(422).render('partials/contact-form', { values, error, success: null });
      return res.status(422).json({ error });
    }

    const file = path.join(DATA_DIR, 'contact-submissions.json');
    const submissions = JSON.parse(await fs.readFile(file, 'utf8'));
    submissions.push({ ...values, status: 'new', priority: 'normal', createdAt: new Date().toISOString() });
    await fs.writeFile(file, JSON.stringify(submissions, null, 2));

    const success = 'Message received. I will respond with a Web3 project plan soon.';
    if (isHtmx(req)) return res.render('partials/contact-form', { values: {}, error: null, success });
    res.json({ success });
  } catch (error) { next(error); }
});

app.use((req, res) => {
  res.status(404).send('<section class="panel"><h1>404</h1><p>Lost beyond the event horizon.</p><a href="/">Return to Orbit</a></section>');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('<section class="panel"><h1>Server error</h1><p>Something went wrong. Check the terminal logs.</p></section>');
});

app.listen(PORT, HOST, () => {
  console.log(`Web3 portfolio running locally at http://localhost:${PORT}`);
  console.log(`Network access enabled on http://${HOST}:${PORT}`);
});
