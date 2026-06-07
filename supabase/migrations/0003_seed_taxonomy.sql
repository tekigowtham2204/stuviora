-- ============================================================================
-- Stuviora — taxonomy seed (P1)
-- Seed data for skill_tags, job_categories, colleges, and college_domains.
-- Idempotent: safe to re-run; uses ON CONFLICT DO NOTHING on natural keys.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Job categories (mirrors SERVICE_CATEGORIES in lib/constants.ts)
-- ----------------------------------------------------------------------------
insert into job_categories (slug, name, description) values
  ('content-copywriting', 'Content and copywriting', 'Blog posts, web copy, scripts, captions, SEO writing.'),
  ('tech-development',    'Tech and development',    'Web apps, mobile apps, scripts, automations, APIs, integrations.'),
  ('design-creative',     'Design and creative',     'Logos, brand kits, social design, illustrations, UI mockups, decks.'),
  ('business-research',   'Business and research',   'Market research, decks, financial models, business writing.'),
  ('social-marketing',    'Social media and marketing', 'Content calendars, reels scripts, community, paid ads.'),
  ('data-ai',             'Data and AI services',    'Dashboards, data cleaning, analysis, lightweight ML.')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Skill tags. Category column maps to a category slug; loose link so we
-- can add cross-category skills without a hard FK constraint.
-- ----------------------------------------------------------------------------
insert into skill_tags (slug, name, category) values
  -- content
  ('copywriting',  'Copywriting',  'content-copywriting'),
  ('blogs',        'Blogs',        'content-copywriting'),
  ('seo',          'SEO',          'content-copywriting'),
  ('editing',      'Editing',      'content-copywriting'),
  ('ghostwriting', 'Ghostwriting', 'content-copywriting'),
  -- tech
  ('react',        'React',        'tech-development'),
  ('nextjs',       'Next.js',      'tech-development'),
  ('python',       'Python',       'tech-development'),
  ('automation',   'Automation',   'tech-development'),
  ('apis',         'APIs',         'tech-development'),
  ('nodejs',       'Node.js',      'tech-development'),
  ('typescript',   'TypeScript',   'tech-development'),
  ('django',       'Django',       'tech-development'),
  ('postgres',     'PostgreSQL',   'tech-development'),
  -- design
  ('figma',        'Figma',        'design-creative'),
  ('branding',     'Branding',     'design-creative'),
  ('social-design','Social design','design-creative'),
  ('illustration', 'Illustration', 'design-creative'),
  ('ui-design',    'UI design',    'design-creative'),
  ('decks',        'Decks',        'design-creative'),
  -- business / research
  ('research',     'Research',     'business-research'),
  ('market-research','Market research','business-research'),
  ('financial-model','Financial modeling','business-research'),
  ('excel',        'Excel',        'business-research'),
  -- social / marketing
  ('social-media', 'Social media', 'social-marketing'),
  ('reels',        'Reels',        'social-marketing'),
  ('canva',        'Canva',        'social-marketing'),
  ('copy',         'Copy',         'social-marketing'),
  -- data / ai
  ('data-viz',     'Data viz',     'data-ai'),
  ('pandas',       'Pandas',       'data-ai'),
  ('jupyter',      'Jupyter',      'data-ai'),
  ('sql',          'SQL',          'data-ai')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Colleges and their email domains (allowlist).
-- Curated starting set covering the beachhead colleges plus the
-- biggest universities/IITs/IIMs/NIDs/NLUs across India. Expand via
-- subsequent migrations as we onboard new partners. The point of this
-- seed is to make student signup possible for the v1 beachhead
-- (IIT Bombay, NID Ahmedabad, LSR Delhi, Christ U Bengaluru, Symbiosis
-- Pune) without manual data entry.
-- ----------------------------------------------------------------------------

-- IITs
insert into colleges (name, city, state, type) values
  ('IIT Bombay',          'Mumbai',      'Maharashtra',  'institute'),
  ('IIT Delhi',           'New Delhi',   'Delhi',        'institute'),
  ('IIT Madras',          'Chennai',     'Tamil Nadu',   'institute'),
  ('IIT Kanpur',          'Kanpur',      'Uttar Pradesh','institute'),
  ('IIT Kharagpur',       'Kharagpur',   'West Bengal',  'institute'),
  ('IIT Roorkee',         'Roorkee',     'Uttarakhand',  'institute'),
  ('IIT Guwahati',        'Guwahati',    'Assam',        'institute'),
  ('IIT Hyderabad',       'Hyderabad',   'Telangana',    'institute'),
  ('IIT BHU Varanasi',    'Varanasi',    'Uttar Pradesh','institute')
on conflict do nothing;

-- IIMs
insert into colleges (name, city, state, type) values
  ('IIM Ahmedabad',       'Ahmedabad',   'Gujarat',      'business school'),
  ('IIM Bangalore',       'Bengaluru',   'Karnataka',    'business school'),
  ('IIM Calcutta',        'Kolkata',     'West Bengal',  'business school'),
  ('IIM Lucknow',         'Lucknow',     'Uttar Pradesh','business school'),
  ('IIM Kozhikode',       'Kozhikode',   'Kerala',       'business school'),
  ('IIM Indore',          'Indore',      'Madhya Pradesh','business school')
on conflict do nothing;

-- Design / Creative
insert into colleges (name, city, state, type) values
  ('NID Ahmedabad',       'Ahmedabad',   'Gujarat',      'design'),
  ('Srishti Institute',   'Bengaluru',   'Karnataka',    'design'),
  ('Pearl Academy',       'New Delhi',   'Delhi',        'design')
on conflict do nothing;

-- Law
insert into colleges (name, city, state, type) values
  ('NLSIU Bangalore',     'Bengaluru',   'Karnataka',    'law'),
  ('NALSAR Hyderabad',    'Hyderabad',   'Telangana',    'law'),
  ('NLU Delhi',           'New Delhi',   'Delhi',        'law')
on conflict do nothing;

-- Universities / liberal arts / commerce
insert into colleges (name, city, state, type) values
  ('Lady Shri Ram College',     'New Delhi',   'Delhi',        'autonomous'),
  ('St Stephen''s College',     'New Delhi',   'Delhi',        'autonomous'),
  ('Hindu College',             'New Delhi',   'Delhi',        'autonomous'),
  ('Hansraj College',           'New Delhi',   'Delhi',        'autonomous'),
  ('Miranda House',             'New Delhi',   'Delhi',        'autonomous'),
  ('Sri Ram College of Commerce','New Delhi',  'Delhi',        'autonomous'),
  ('St Xavier''s College Mumbai','Mumbai',     'Maharashtra',  'autonomous'),
  ('Christ University',         'Bengaluru',   'Karnataka',    'university'),
  ('Symbiosis International University','Pune','Maharashtra',  'university'),
  ('Manipal Institute of Technology','Manipal','Karnataka',    'institute'),
  ('VIT Vellore',               'Vellore',     'Tamil Nadu',   'institute'),
  ('BITS Pilani',               'Pilani',      'Rajasthan',    'institute'),
  ('Ashoka University',         'Sonipat',     'Haryana',      'university'),
  ('Plaksha University',        'Mohali',      'Punjab',       'university'),
  ('Krea University',           'Sri City',    'Andhra Pradesh','university'),
  ('SP Jain Institute',         'Mumbai',      'Maharashtra',  'business school'),
  ('FMS Delhi',                 'New Delhi',   'Delhi',        'business school'),
  ('XLRI Jamshedpur',           'Jamshedpur',  'Jharkhand',    'business school'),
  ('NIT Trichy',                'Tiruchirappalli','Tamil Nadu','institute'),
  ('NIT Surathkal',             'Surathkal',   'Karnataka',    'institute'),
  ('NIT Warangal',              'Warangal',    'Telangana',    'institute')
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Domain allowlist. citext makes these case-insensitive.
-- ----------------------------------------------------------------------------
insert into college_domains (domain, college_id) values
  -- IITs
  ('iitb.ac.in',          (select id from colleges where name = 'IIT Bombay'         limit 1)),
  ('iitd.ac.in',          (select id from colleges where name = 'IIT Delhi'          limit 1)),
  ('iitm.ac.in',          (select id from colleges where name = 'IIT Madras'         limit 1)),
  ('iitk.ac.in',          (select id from colleges where name = 'IIT Kanpur'         limit 1)),
  ('iitkgp.ac.in',        (select id from colleges where name = 'IIT Kharagpur'      limit 1)),
  ('iitr.ac.in',          (select id from colleges where name = 'IIT Roorkee'        limit 1)),
  ('iitg.ac.in',          (select id from colleges where name = 'IIT Guwahati'       limit 1)),
  ('iith.ac.in',          (select id from colleges where name = 'IIT Hyderabad'      limit 1)),
  ('iitbhu.ac.in',        (select id from colleges where name = 'IIT BHU Varanasi'   limit 1)),
  -- IIMs
  ('iima.ac.in',          (select id from colleges where name = 'IIM Ahmedabad'      limit 1)),
  ('iimb.ac.in',          (select id from colleges where name = 'IIM Bangalore'      limit 1)),
  ('iimcal.ac.in',        (select id from colleges where name = 'IIM Calcutta'       limit 1)),
  ('iiml.ac.in',          (select id from colleges where name = 'IIM Lucknow'        limit 1)),
  ('iimk.ac.in',          (select id from colleges where name = 'IIM Kozhikode'      limit 1)),
  ('iimidr.ac.in',        (select id from colleges where name = 'IIM Indore'         limit 1)),
  -- Design
  ('nid.edu',             (select id from colleges where name = 'NID Ahmedabad'      limit 1)),
  ('srishti.ac.in',       (select id from colleges where name = 'Srishti Institute'  limit 1)),
  ('pearlacademy.com',    (select id from colleges where name = 'Pearl Academy'      limit 1)),
  -- Law
  ('nls.ac.in',           (select id from colleges where name = 'NLSIU Bangalore'    limit 1)),
  ('nalsar.ac.in',        (select id from colleges where name = 'NALSAR Hyderabad'   limit 1)),
  ('nludelhi.ac.in',      (select id from colleges where name = 'NLU Delhi'          limit 1)),
  -- Universities / colleges
  ('lsr.du.ac.in',        (select id from colleges where name = 'Lady Shri Ram College'     limit 1)),
  ('ststephens.edu',      (select id from colleges where name = 'St Stephen''s College'     limit 1)),
  ('hinducollege.ac.in',  (select id from colleges where name = 'Hindu College'             limit 1)),
  ('hansrajcollege.ac.in',(select id from colleges where name = 'Hansraj College'           limit 1)),
  ('mirandahouse.ac.in',  (select id from colleges where name = 'Miranda House'             limit 1)),
  ('srcc.edu',            (select id from colleges where name = 'Sri Ram College of Commerce' limit 1)),
  ('xaviers.edu',         (select id from colleges where name = 'St Xavier''s College Mumbai' limit 1)),
  ('christuniversity.in', (select id from colleges where name = 'Christ University'         limit 1)),
  ('symbiosis.ac.in',     (select id from colleges where name = 'Symbiosis International University' limit 1)),
  ('manipal.edu',         (select id from colleges where name = 'Manipal Institute of Technology' limit 1)),
  ('vit.ac.in',           (select id from colleges where name = 'VIT Vellore'               limit 1)),
  ('pilani.bits-pilani.ac.in',(select id from colleges where name = 'BITS Pilani'           limit 1)),
  ('ashoka.edu.in',       (select id from colleges where name = 'Ashoka University'         limit 1)),
  ('plaksha.edu.in',      (select id from colleges where name = 'Plaksha University'        limit 1)),
  ('krea.edu.in',         (select id from colleges where name = 'Krea University'           limit 1)),
  ('spjimr.org',          (select id from colleges where name = 'SP Jain Institute'         limit 1)),
  ('fms.edu',             (select id from colleges where name = 'FMS Delhi'                 limit 1)),
  ('xlri.ac.in',           (select id from colleges where name = 'XLRI Jamshedpur'          limit 1)),
  ('nitt.edu',            (select id from colleges where name = 'NIT Trichy'                limit 1)),
  ('nitk.edu.in',         (select id from colleges where name = 'NIT Surathkal'             limit 1)),
  ('nitw.ac.in',          (select id from colleges where name = 'NIT Warangal'              limit 1))
on conflict (domain) do nothing;
