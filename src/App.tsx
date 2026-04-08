import './App.css'
import { NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { scooterBrands, scooters, categories } from './data'
import { IntroExperience } from './intro/IntroExperience'

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-animate="fade-up"]', {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
      })
    }, ref)

    return () => ctx.revert()
  }, [])

  return ref
}

function RouteTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const location = useLocation()

  useLayoutEffect(() => {
    if (!ref.current) return
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
    )
  }, [location.pathname])

  return <div ref={ref}>{children}</div>
}

function IntroGate() {
  const [done, setDone] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('motocity-intro-three-seen') === '1'
  })

  if (done) return null

  return <IntroExperience onComplete={() => setDone(true)} />
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IntroGate />
      <main className="page-shell app-layout">
        <header className="mobile-topbar">
          <div className="brand-block">
            <div className="brand-mark interactive-mark">MC</div>
            <div>
              <p className="eyebrow">MotoCity</p>
              <h2 className="sidebar-title">Showroom</h2>
            </div>
          </div>
          <nav className="mobile-quicknav">
            <NavLink to="/" end className="mobile-nav-pill">Accueil</NavLink>
            <NavLink to="/scooters" className="mobile-nav-pill">Scooters</NavLink>
            <NavLink to="/comparaison" className="mobile-nav-pill">Comparer</NavLink>
          </nav>
        </header>

        <aside className="sidebar-card" data-animate="fade-up">
          <div className="brand-block brand-block-sidebar">
            <div className="brand-mark interactive-mark">MC</div>
            <div>
              <p className="eyebrow">MotoCity</p>
              <h2 className="sidebar-title">Showroom navigation</h2>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div>
              <p className="nav-group-title">Pages</p>
              <NavLink to="/" end className="nav-item">Accueil</NavLink>
              <NavLink to="/scooters" className="nav-item">Tous les scooters</NavLink>
              <NavLink to="/comparaison" className="nav-item">Comparaison</NavLink>
              <NavLink to="/articles" className="nav-item">Autres articles</NavLink>
            </div>

            <div>
              <p className="nav-group-title">Marques</p>
              {scooterBrands.map((brand) => (
                <NavLink key={brand.id} to={`/marques/${brand.id}`} className="nav-item">
                  {brand.name}
                </NavLink>
              ))}
            </div>

            <div>
              <p className="nav-group-title">Catégories</p>
              {categories.map((category) => (
                <span key={category} className="nav-chip">{category}</span>
              ))}
            </div>
          </nav>
        </aside>

        <section className="content-area">
          <RouteTransition>{children}</RouteTransition>
        </section>
      </main>
    </>
  )
}

function HomePage() {
  const ref = useReveal()

  return (
    <div ref={ref}>
      <section className="hero-card hero-animated" data-animate="fade-up">
        <div className="hero-grid hero-grid-single">
          <div className="hero-copy">
            <p className="eyebrow" data-animate="fade-up">MotoCity</p>
            <h1 data-animate="fade-up">Un showroom prêt pour 30 scooters et plus</h1>
            <p className="lead" data-animate="fade-up">
              Base scalable avec navigation réelle par page, marques, catégories et fiches produits.
              Idéal pour agrandir facilement ton catalogue.
            </p>
            <div className="cta-row" data-animate="fade-up">
              <NavLink className="primary-button animated-button" to="/scooters">Voir le catalogue</NavLink>
              <NavLink className="secondary-button" to="/comparaison">Comparer les scooters</NavLink>
            </div>
          </div>
          <div className="hero-loader" data-animate="fade-up">
            <div className="hero-static-orb" />
          </div>
        </div>
      </section>

      <section className="section-block" data-animate="fade-up">
        <div className="section-heading">
          <p className="eyebrow">Marques</p>
          <h2>Organise ton showroom par société ou marque</h2>
        </div>
        <div className="cards-grid brand-grid">
          {scooterBrands.map((brand) => (
            <NavLink key={brand.id} to={`/marques/${brand.id}`} className="brand-card-link" data-animate="fade-up">
              <article className="product-card hover-card">
                <span className="pill">{brand.company}</span>
                <h3>{brand.name}</h3>
                <p>{brand.description}</p>
              </article>
            </NavLink>
          ))}
        </div>
      </section>
    </div>
  )
}

function ProductCard({ scooter, detailLink }: { scooter: (typeof scooters)[number], detailLink: string }) {
  return (
    <article className="product-rich-card hover-card" data-animate="fade-up">
      {scooter.image ? <img src={scooter.image} alt={scooter.name} className="product-image" /> : null}
      <div className="product-body">
        <span className="pill pill-soft">{scooter.brand}</span>
        <h3>{scooter.name}</h3>
        <p>{scooter.description}</p>
        <div className="meta-row">
          {scooter.price ? <p className="price-tag">{scooter.price} DT</p> : <p className="price-tag price-muted">Prix à confirmer</p>}
          {scooter.confidence ? <span className={`confidence-badge confidence-${scooter.confidence}`}>{scooter.confidence}</span> : null}
        </div>
        <ul className="spec-list">
          {scooter.specs.map((spec) => (
            <li key={spec}>{spec}</li>
          ))}
        </ul>
        <NavLink className="product-link animated-button" to={detailLink}>Voir le détail</NavLink>
      </div>
    </article>
  )
}

function ScootersPage() {
  const ref = useReveal()
  return (
    <section className="section-block" ref={ref}>
      <div className="section-heading" data-animate="fade-up">
        <p className="eyebrow">Catalogue</p>
        <h2>Tous les scooters</h2>
      </div>
      <div className="cards-grid scooters-grid">
        {scooters.map((scooter) => (
          <ProductCard key={scooter.id} scooter={scooter} detailLink={`/scooters/${scooter.id}`} />
        ))}
      </div>
    </section>
  )
}

function BrandPage() {
  const ref = useReveal()
  const { brandId } = useParams()
  const brand = scooterBrands.find((item) => item.id === brandId)
  const items = scooters.filter((item) => item.brand.toLowerCase() === brand?.name.toLowerCase())

  if (!brand) return <div className="section-block"><h2>Marque introuvable</h2></div>

  return (
    <section className="section-block" ref={ref}>
      <div className="section-heading" data-animate="fade-up">
        <p className="eyebrow">Marque</p>
        <h2>{brand.name}</h2>
        <p className="lead">{brand.description}</p>
      </div>
      <div className="cards-grid scooters-grid">
        {items.map((scooter) => (
          <ProductCard key={scooter.id} scooter={scooter} detailLink={`/scooters/${scooter.id}`} />
        ))}
      </div>
    </section>
  )
}

function ScooterDetailPage() {
  const ref = useReveal()
  const { scooterId } = useParams()
  const scooter = scooters.find((item) => item.id === scooterId)

  if (!scooter) return <div className="section-block"><h2>Scooter introuvable</h2></div>

  return (
    <section className="section-block" ref={ref}>
      <article className="model-panel hover-card" data-animate="fade-up">
        {scooter.image ? <img src={scooter.image} alt={scooter.name} className="model-image" /> : null}
        <div className="model-copy">
          <span className="pill">{scooter.brand}</span>
          <h2>{scooter.name}</h2>
          <p>{scooter.description}</p>
          <div className="meta-row">
            {scooter.price ? <p className="price-tag detail-price">{scooter.price} DT</p> : <p className="price-tag detail-price price-muted">Prix à confirmer</p>}
            {scooter.confidence ? <span className={`confidence-badge confidence-${scooter.confidence}`}>{scooter.confidence}</span> : null}
          </div>
          <p className="eyebrow">Caractéristiques</p>
          <ul className="spec-list big-spec-list">
            {scooter.specs.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
          <p className="detail-meta">Catégorie: {scooter.category} • Société: {scooter.company}</p>
        </div>
      </article>
    </section>
  )
}

function ComparisonPage() {
  const ref = useReveal()
  const [leftId, setLeftId] = useState(scooters[0]?.id ?? '')
  const [rightId, setRightId] = useState(scooters[1]?.id ?? scooters[0]?.id ?? '')

  const leftScooter = useMemo(() => scooters.find((item) => item.id === leftId), [leftId])
  const rightScooter = useMemo(() => scooters.find((item) => item.id === rightId), [rightId])

  return (
    <section className="section-block" ref={ref}>
      <div className="section-heading" data-animate="fade-up">
        <p className="eyebrow">Comparaison</p>
        <h2>Sélection manuelle de 2 scooters</h2>
      </div>

      <div className="comparison-pickers" data-animate="fade-up">
        <label className="picker-field">
          <span>Scooter 1</span>
          <select value={leftId} onChange={(e) => setLeftId(e.target.value)}>
            {scooters.map((scooter) => (
              <option key={scooter.id} value={scooter.id}>{scooter.name}</option>
            ))}
          </select>
        </label>

        <label className="picker-field">
          <span>Scooter 2</span>
          <select value={rightId} onChange={(e) => setRightId(e.target.value)}>
            {scooters.map((scooter) => (
              <option key={scooter.id} value={scooter.id}>{scooter.name}</option>
            ))}
          </select>
        </label>
      </div>

      {leftScooter && rightScooter && (
        <div className="compare-duo">
          {[leftScooter, rightScooter].map((scooter) => (
            <article key={scooter.id} className="compare-card hover-card" data-animate="fade-up">
              {scooter.image ? <img src={scooter.image} alt={scooter.name} className="product-image compare-image" /> : null}
              <div className="product-body">
                <span className="pill">{scooter.brand}</span>
                <h3>{scooter.name}</h3>
                <div className="meta-row">
                  {scooter.price ? <p className="price-tag">{scooter.price} DT</p> : <p className="price-tag price-muted">Prix à confirmer</p>}
                </div>
                <ul className="compare-list">
                  <li><strong>Moteur:</strong> {scooter.engine ?? 'À confirmer'}</li>
                  <li><strong>Transmission:</strong> {scooter.transmission ?? 'À confirmer'}</li>
                  <li><strong>Freinage:</strong> {scooter.braking ?? 'À confirmer'}</li>
                  <li><strong>Réservoir:</strong> {scooter.tank ?? 'À confirmer'}</li>
                  <li><strong>Vitesse max:</strong> {scooter.topSpeed ?? 'À confirmer'}</li>
                  <li><strong>Usage:</strong> {scooter.usage ?? 'À confirmer'}</li>
                </ul>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function ArticlesPage() {
  const ref = useReveal()
  return (
    <section className="section-block" ref={ref}>
      <div className="section-heading" data-animate="fade-up">
        <p className="eyebrow">Autres articles</p>
        <h2>Zone prête pour équipements, accessoires et pièces</h2>
      </div>
      <div className="cards-grid brand-grid">
        {['Casques', 'Antivols', 'Gants', 'Top cases', 'Pièces entretien', 'Accessoires boutique'].map((item) => (
          <article key={item} className="product-card hover-card" data-animate="fade-up">
            <span className="pill pill-soft">Article</span>
            <h3>{item}</h3>
            <p>Cette section est prête pour accueillir d’autres produits de ton showroom.</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scooters" element={<ScootersPage />} />
        <Route path="/scooters/:scooterId" element={<ScooterDetailPage />} />
        <Route path="/marques/:brandId" element={<BrandPage />} />
        <Route path="/comparaison" element={<ComparisonPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
      </Routes>
    </Shell>
  )
}

export default App
