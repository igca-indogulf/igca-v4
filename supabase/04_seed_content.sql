-- =========================================================
-- IGCA PLATFORM — DEMO CONTENT SEED
-- Safe to run multiple times (idempotent via ON CONFLICT).
-- Run 05_seed_users.md steps FIRST if you also want demo profiles,
-- since profiles/connections/messages require real auth.users rows.
-- =========================================================

-- INDUSTRIES
insert into industries (name, slug) values
  ('Financial Services','financial-services'),
  ('Technology','technology'),
  ('Healthcare','healthcare'),
  ('Real Estate','real-estate'),
  ('Manufacturing','manufacturing'),
  ('Renewable Energy','renewable-energy'),
  ('Retail & Consumer','retail-consumer'),
  ('Logistics','logistics')
on conflict (name) do nothing;

-- COUNTRIES
insert into countries (name, code) values
  ('India','IN'),('United States','US'),('United Kingdom','GB'),
  ('United Arab Emirates','AE'),('Singapore','SG'),('Germany','DE'),
  ('Australia','AU'),('South Africa','ZA')
on conflict (name) do nothing;

-- TOPICS
insert into topics (name, slug) values
  ('Market Entry','market-entry'),('Capital Raising','capital-raising'),
  ('Digital Transformation','digital-transformation'),('ESG & Sustainability','esg-sustainability'),
  ('M&A','mergers-acquisitions'),('Regulatory Change','regulatory-change'),
  ('Consumer Behaviour','consumer-behaviour'),('Supply Chain','supply-chain')
on conflict (name) do nothing;

-- RESEARCH CATEGORIES
insert into research_categories (name, slug) values
  ('Market Report','market-report'),('Industry Outlook','industry-outlook'),
  ('Economic Brief','economic-brief'),('Deep Dive','deep-dive')
on conflict (name) do nothing;

-- ---------------------------------------------------------
-- RESEARCH ITEMS (8+)
-- ---------------------------------------------------------
do $$
declare
  cat_market uuid; cat_outlook uuid; cat_econ uuid; cat_deep uuid;
  ind_fin uuid; ind_tech uuid; ind_health uuid; ind_energy uuid; ind_retail uuid; ind_logistics uuid;
  c_in uuid; c_us uuid; c_ae uuid; c_sg uuid; c_gb uuid;
  t_capital uuid; t_digital uuid; t_esg uuid; t_ma uuid; t_supply uuid;
  r1 uuid; r2 uuid; r3 uuid; r4 uuid; r5 uuid; r6 uuid; r7 uuid; r8 uuid;
begin
  select id into cat_market from research_categories where slug='market-report';
  select id into cat_outlook from research_categories where slug='industry-outlook';
  select id into cat_econ from research_categories where slug='economic-brief';
  select id into cat_deep from research_categories where slug='deep-dive';

  select id into ind_fin from industries where slug='financial-services';
  select id into ind_tech from industries where slug='technology';
  select id into ind_health from industries where slug='healthcare';
  select id into ind_energy from industries where slug='renewable-energy';
  select id into ind_retail from industries where slug='retail-consumer';
  select id into ind_logistics from industries where slug='logistics';

  select id into c_in from countries where code='IN';
  select id into c_us from countries where code='US';
  select id into c_ae from countries where code='AE';
  select id into c_sg from countries where code='SG';
  select id into c_gb from countries where code='GB';

  select id into t_capital from topics where slug='capital-raising';
  select id into t_digital from topics where slug='digital-transformation';
  select id into t_esg from topics where slug='esg-sustainability';
  select id into t_ma from topics where slug='mergers-acquisitions';
  select id into t_supply from topics where slug='supply-chain';

  insert into research_items (title, slug, summary, executive_summary, conclusion, category_id, industry_id, country_id, topic_id, featured, reading_time, source)
  values
  ('India Fintech Capital Flows: 2026 Mid-Year Review','india-fintech-capital-flows-2026',
   'A concise read on where fintech investment is concentrating in India this year and what it signals for the next two quarters.',
   'Capital deployment into Indian fintech stabilized in H1 2026 after two volatile years, with a decisive shift toward embedded finance and SME lending infrastructure over consumer payments.',
   'Investors rewarding infrastructure plays over consumer apps is likely to persist through 2027; founders should position accordingly.',
   cat_market, ind_fin, c_in, t_capital, true, 6, 'IGCA Research Desk')
  returning id into r1;

  insert into research_items (title, slug, summary, executive_summary, conclusion, category_id, industry_id, country_id, topic_id, featured, reading_time, source)
  values
  ('UAE as a Regional Tech Hub: Outlook to 2028','uae-regional-tech-hub-outlook-2028',
   'Why global technology firms continue to anchor regional headquarters in the UAE, and what remains a friction point.',
   'The UAE''s combination of tax structure, visa reform and logistics access has made it the default Middle East base for scaling technology firms, though talent depth remains a constraint.',
   'Firms entering the region should plan for a hybrid talent model blending local hires with remote regional teams.',
   cat_outlook, ind_tech, c_ae, t_digital, true, 8, 'IGCA Research Desk')
  returning id into r2;

  insert into research_items (title, slug, summary, executive_summary, conclusion, category_id, industry_id, country_id, topic_id, featured, reading_time, source)
  values
  ('US Healthcare M&A: Consolidation Pressure Builds','us-healthcare-ma-consolidation-2026',
   'Mid-sized healthcare providers face renewed acquisition interest as margins tighten industry-wide.',
   'Reimbursement pressure and staffing costs are pushing mid-sized US healthcare providers toward consolidation, with private equity re-entering after an 18-month pause.',
   'Providers below scale should evaluate partnership options proactively rather than waiting for distressed terms.',
   cat_deep, ind_health, c_us, t_ma, false, 9, 'IGCA Research Desk')
  returning id into r3;

  insert into research_items (title, slug, summary, executive_summary, conclusion, category_id, industry_id, country_id, topic_id, featured, reading_time, source)
  values
  ('Singapore Renewable Energy: Grid Bottlenecks','singapore-renewable-energy-grid-2026',
   'Singapore''s clean energy import strategy is progressing but grid interconnection remains the binding constraint.',
   'Singapore is on track to meet its 2035 clean energy import targets on paper, but cross-border grid interconnection approvals are running roughly a year behind schedule.',
   'Developers should build interconnection risk explicitly into project timelines rather than treating it as a formality.',
   cat_econ, ind_energy, c_sg, t_esg, false, 5, 'IGCA Research Desk')
  returning id into r4;

  insert into research_items (title, slug, summary, executive_summary, conclusion, category_id, industry_id, country_id, topic_id, featured, reading_time, source)
  values
  ('UK Retail: Consumer Spending Signals for Q3','uk-retail-consumer-spending-q3-2026',
   'Early signals on discretionary spending patterns among UK consumers heading into Q3.',
   'UK discretionary spending is bifurcating sharply by income bracket, with mid-market retail bearing the brunt of pullback while value and premium segments hold steady.',
   'Mid-market retailers should reassess positioning now rather than waiting for holiday-season data.',
   cat_market, ind_retail, c_gb, t_digital, true, 4, 'IGCA Research Desk')
  returning id into r5;

  insert into research_items (title, slug, summary, executive_summary, conclusion, category_id, industry_id, country_id, topic_id, featured, reading_time, source)
  values
  ('Global Logistics: Red Sea Route Normalization','global-logistics-red-sea-normalization-2026',
   'Shipping patterns are gradually normalizing, but insurance and routing costs remain structurally higher.',
   'Container volumes through Red Sea routes are recovering, yet elevated insurance premiums suggest carriers expect continued intermittent disruption rather than full normalization.',
   'Shippers should maintain dual-routing contracts through at least mid-2027.',
   cat_outlook, ind_logistics, c_in, t_supply, false, 7, 'IGCA Research Desk')
  returning id into r6;

  insert into research_items (title, slug, summary, executive_summary, conclusion, category_id, industry_id, country_id, topic_id, featured, reading_time, source)
  values
  ('India Manufacturing PLI: Two-Year Scorecard','india-manufacturing-pli-scorecard-2026',
   'An evaluation of which sectors under India''s production-linked incentive scheme are outperforming targets.',
   'Electronics and specialty chemicals are outperforming PLI disbursement targets, while auto components and textiles are lagging on execution rather than demand.',
   'Investors evaluating PLI-linked capacity should weight execution track record over headline sector allocations.',
   cat_deep, ind_tech, c_in, t_capital, true, 10, 'IGCA Research Desk')
  returning id into r7;

  insert into research_items (title, slug, summary, executive_summary, conclusion, category_id, industry_id, country_id, topic_id, featured, reading_time, source)
  values
  ('US Interest Rate Path: Implications for Private Credit','us-rates-private-credit-2026',
   'What a slower rate-cut path means for private credit yields and deal structuring.',
   'A slower-than-expected US rate-cut path is sustaining attractive private credit yields, but is also compressing the pool of sponsors willing to transact at current valuations.',
   'Private credit allocators should prioritize structuring flexibility over yield chasing in the next two quarters.',
   cat_econ, ind_fin, c_us, t_capital, false, 6, 'IGCA Research Desk')
  returning id into r8;

  -- HIGHLIGHTS
  insert into research_highlights (research_id, title, description, metric_value, sort_order) values
  (r1, 'SME lending infra funding up', 'Share of fintech capital going to SME lending infrastructure vs. consumer apps', '+38% YoY', 1),
  (r1, 'Consumer payments funding cools', 'Consumer payment startups saw funding pull back sharply', '-22% YoY', 2),
  (r1, 'Embedded finance deals', 'Number of embedded finance deals closed in H1 2026', '46 deals', 3),
  (r2, 'HQ relocations', 'Technology firms establishing a regional HQ in the UAE in the past 18 months', '61 firms', 1),
  (r2, 'Talent gap', 'Share of firms citing senior engineering talent as their top constraint', '54%', 2),
  (r5, 'Mid-market pullback', 'YoY change in mid-market discretionary spend', '-6.4%', 1),
  (r7, 'Electronics disbursement', 'PLI disbursement vs. target in electronics manufacturing', '112% of target', 1),
  (r7, 'Auto components lag', 'PLI disbursement vs. target in auto components', '68% of target', 2);

  -- SNAPSHOTS (one per research item)
  insert into research_snapshots (research_id, headline, executive_summary, key_findings, key_opportunity, key_risk, conclusion) values
  (r1, 'India Fintech: Capital Is Rotating Toward Infrastructure',
   'Fintech capital in India shifted decisively toward SME lending and embedded finance infrastructure in H1 2026.',
   array['SME lending infra funding up 38% YoY','Consumer payments funding down 22% YoY','46 embedded finance deals closed in H1'],
   'Infrastructure and embedded-finance plays are attracting premium valuations.',
   'Consumer-facing fintechs without a B2B pivot face a harder fundraising environment.',
   'Position toward infrastructure and embedded finance for the next fundraising cycle.'),
  (r2, 'UAE Cements Its Position as the Region''s Tech HQ',
   'The UAE remains the default Middle East base for scaling technology firms, though senior talent is the binding constraint.',
   array['61 firms opened a regional HQ in the UAE in 18 months','54% cite senior engineering talent as top constraint','Visa reform continues to ease relocation friction'],
   'First-mover firms can lock in scarce senior talent before competition intensifies.',
   'Talent costs are rising faster than headline hiring numbers suggest.',
   'Plan a hybrid local-plus-remote talent model from day one.'),
  (r3, 'US Healthcare Consolidation Is Back',
   'Private equity is re-entering mid-sized healthcare provider consolidation after an 18-month pause.',
   array['Reimbursement pressure is squeezing provider margins','PE re-entered the market after 18 months on the sidelines','Staffing costs remain the top margin pressure'],
   'Providers who move early can negotiate from strength rather than distress.',
   'Waiting risks negotiating from a weaker position as PE interest concentrates on fewer targets.',
   'Evaluate partnership options proactively over the next two quarters.'),
  (r4, 'Singapore''s Clean Energy Import Plan Hits Grid Delays',
   'Singapore is on track on paper for 2035 clean energy targets, but interconnection approvals are a year behind.',
   array['Interconnection approvals running ~12 months behind schedule','Import targets remain unchanged on paper','Developers underweighting regulatory timeline risk'],
   'Developers who model interconnection risk accurately can price projects more competitively.',
   'Timeline slippage could cascade into financing covenant breaches for leveraged projects.',
   'Build interconnection risk explicitly into every project timeline.'),
  (r5, 'UK Consumer Spending Is Splitting by Income',
   'UK discretionary spending is bifurcating sharply, with mid-market retail bearing the brunt.',
   array['Mid-market discretionary spend down 6.4% YoY','Value and premium segments holding steady','Pattern visible ahead of typical holiday-season signals'],
   'Retailers repositioning toward value or premium now can get ahead of the holiday season.',
   'Mid-market retailers delaying repositioning risk a difficult Q4.',
   'Reassess category and price positioning before the holiday season.'),
  (r6, 'Red Sea Shipping Routes Are Recovering, Not Normalizing',
   'Container volumes are recovering but elevated insurance costs signal continued disruption risk.',
   array['Container volumes recovering toward pre-disruption levels','Insurance premiums remain structurally elevated','Carriers pricing in continued intermittent disruption'],
   'Shippers with flexible dual-routing contracts can capture rate advantages.',
   'Single-route dependency remains a material exposure through 2027.',
   'Maintain dual-routing contracts through at least mid-2027.'),
  (r7, 'India''s PLI Scheme: Electronics Wins, Auto Components Lag',
   'Electronics and specialty chemicals are outperforming PLI targets while auto components lag on execution.',
   array['Electronics disbursement at 112% of target','Auto components disbursement at 68% of target','Lag is execution-driven, not demand-driven'],
   'Electronics-linked capacity offers the strongest near-term PLI-backed returns.',
   'Auto component allocations carry execution risk that headline scheme numbers obscure.',
   'Weight execution track record over headline sector allocation.'),
  (r8, 'Private Credit Yields Stay Attractive as Rate Cuts Slow',
   'A slower US rate-cut path is sustaining private credit yields but compressing the pool of willing sponsors.',
   array['Rate-cut path slower than consensus expected in early 2026','Private credit yields remain attractive on a relative basis','Sponsor pool willing to transact at current valuations is shrinking'],
   'Allocators with structuring flexibility can still find attractive risk-adjusted deals.',
   'Yield-chasing without structuring discipline risks poor downside protection.',
   'Prioritize structuring flexibility over yield chasing this cycle.');
end $$;

-- ---------------------------------------------------------
-- LEARNING VIDEOS (8 industry + 8 country + 8 network = 24)
-- ---------------------------------------------------------
do $$
declare ind_fin uuid; ind_tech uuid; ind_health uuid; c_in uuid; c_us uuid; c_ae uuid; i int;
begin
  select id into ind_fin from industries where slug='financial-services';
  select id into ind_tech from industries where slug='technology';
  select id into ind_health from industries where slug='healthcare';
  select id into c_in from countries where code='IN';
  select id into c_us from countries where code='US';
  select id into c_ae from countries where code='AE';

  for i in 1..8 loop
    insert into learning_videos (title, description, video_url, duration_seconds, category, industry_id, thumbnail_url)
    values (
      'Industry Insight Series: Episode ' || i,
      'A short expert walkthrough of a current dynamic shaping industry strategy this quarter.',
      'https://example.com/video/industry-' || i,
      300 + i * 30,
      'industry',
      case when i % 3 = 0 then ind_health when i % 2 = 0 then ind_tech else ind_fin end,
      null
    );
  end loop;

  for i in 1..8 loop
    insert into learning_videos (title, description, video_url, duration_seconds, category, country_id, thumbnail_url)
    values (
      'Country Market Update: Episode ' || i,
      'A concise briefing on the macro and regulatory shifts relevant to operating in this market.',
      'https://example.com/video/country-' || i,
      280 + i * 25,
      'country',
      case when i % 3 = 0 then c_ae when i % 2 = 0 then c_us else c_in end,
      null
    );
  end loop;

  for i in 1..8 loop
    insert into learning_videos (title, description, video_url, duration_seconds, category, thumbnail_url)
    values (
      'Network Perspectives: Episode ' || i,
      'Practitioners from the IGCA network share what they are seeing in their own deal flow.',
      'https://example.com/video/network-' || i,
      260 + i * 20,
      'network',
      null
    );
  end loop;
end $$;

-- ---------------------------------------------------------
-- COURSES + MODULES (8 courses)
-- ---------------------------------------------------------
do $$
declare c_id uuid; titles text[] := array[
  'Fundamentals of Cross-Border Capital Raising',
  'ESG Reporting for Emerging Market Businesses',
  'M&A Deal Structuring Essentials',
  'Digital Transformation for Financial Institutions',
  'Supply Chain Risk Management',
  'Consumer Insights & Market Entry Strategy',
  'Regulatory Navigation for Fintech',
  'Advanced Valuation Techniques'
  ]; i int;
begin
  for i in 1..array_length(titles,1) loop
    insert into courses (title, description, instructor, level, total_modules, offers_certification)
    values (
      titles[i],
      'A practitioner-led course covering the core frameworks professionals need to act with confidence in this area.',
      'IGCA Faculty',
      case when i % 3 = 0 then 'advanced' when i % 2 = 0 then 'intermediate' else 'beginner' end,
      5,
      i % 2 = 0
    ) returning id into c_id;

    insert into course_modules (course_id, title, sort_order, duration_minutes) values
    (c_id, 'Foundations & Context', 1, 15),
    (c_id, 'Core Frameworks', 2, 20),
    (c_id, 'Applied Case Study', 3, 25),
    (c_id, 'Common Pitfalls', 4, 15),
    (c_id, 'Putting It Into Practice', 5, 20);
  end loop;
end $$;
