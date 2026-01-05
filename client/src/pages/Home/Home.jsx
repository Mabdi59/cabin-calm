import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const featureCards = [
  {
    title: 'Track Your Flights & Anxiety Levels',
    description:
      'Log sensations, note turbulence, and see which routes help you feel steadier before takeoff.',
    icon: '🧭',
    id: 'flights',
  },
  {
    title: 'Learn What Turbulence and Sounds Really Mean',
    description:
      'Understand the normal hums, clicks, and bumps that come with every safe flight.',
    icon: '🛫',
    id: 'education',
  },
  {
    title: 'See Your Progress Over Time',
    description:
      'Spot calming trends, revisit confident flights, and celebrate growing comfort in the air.',
    icon: '📈',
    id: 'trends',
  },
];

const reassuranceNotes = [
  'Small movements and rattles are normal — the aircraft is designed for them.',
  'Your feelings are valid. CabinCalm helps you understand them, not ignore them.',
  'Breathing, posture, and expectation cues can reset your nervous system mid-flight.',
];

const testimonials = [
  {
    quote:
      'CabinCalm reminds me that the sensations I feel are expected. I breathe easier even before boarding.',
    role: 'Mindful flyer',
  },
  {
    quote:
      'The gentle explanations help me name what I hear and feel. It turns worry into awareness.',
    role: 'First-time solo traveler',
  },
  {
    quote:
      'Tracking my calm moments showed me I already handle turbulence. Now I trust myself more every trip.',
    role: 'Frequent commuter',
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.hero} id="hero">
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Gentle guidance for anxious flyers</p>
          <h1 className={styles.headline}>
            Reduce flight anxiety with calm, clear reassurance.
          </h1>
          <p className={styles.subtext}>
            CabinCalm helps you understand sensations in the cabin, build confidence with every
            takeoff, and stay grounded in what's normal while you&apos;re in the air.
          </p>
          <div className={styles.ctas}>
            <Link className={styles.primaryButton} to="/register">
              Start Tracking Your Flights
            </Link>
            <a className={styles.secondaryButton} href="#guide">
              Learn How It Works
            </a>
          </div>

          <div className={styles.badges}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>💜</span>
              <span>Built for comfort, not alerts</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>📶</span>
              <span>Offline-friendly guidance</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>🎧</span>
              <span>In-flight grounding tips</span>
            </div>
          </div>
        </div>

        <div className={styles.heroArt} aria-hidden="true">
          <div className={styles.glow} />
          <div className={styles.aurora} />
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.pill}>Calm Flight</div>
              <div className={styles.signal}>Smooth</div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Heart steadiness</span>
                <div className={styles.progress}>
                  <span style={{ width: '72%' }} />
                </div>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Comfort score</span>
                <div className={`${styles.progress} ${styles.secondary}`}>
                  <span style={{ width: '86%' }} />
                </div>
              </div>
              <div className={styles.metricFooter}>Gentle reminders queued ✈️</div>
            </div>
          </div>
          <div className={styles.floatingClouds}>
            <span>☁️</span>
            <span>☁️</span>
            <span>☁️</span>
          </div>
        </div>
      </div>

      <section className={styles.features} aria-labelledby="features-title">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Calming tools</p>
          <h2 id="features-title">Everything you need to fly with more ease</h2>
          <p className={styles.sectionSubtext}>
            Friendly explanations, gentle tracking, and trends that show your growing confidence.
          </p>
        </div>
        <div className={styles.cardGrid}>
          {featureCards.map((card) => (
            <article
              key={card.title}
              className={styles.featureCard}
              id={card.id}
              aria-label={card.title}
            >
              <div className={styles.cardIcon}>{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.reassurance} id="guide" aria-labelledby="reassurance-title">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Designed for nervous flyers</p>
          <h2 id="reassurance-title">Guidance that meets you where you are</h2>
          <p className={styles.sectionSubtext}>
            CabinCalm explains what&apos;s happening, offers grounding cues, and celebrates each calm
            moment you notice.
          </p>
        </div>

        <div className={styles.reassuranceList}>
          {reassuranceNotes.map((note) => (
            <div key={note} className={styles.reassuranceItem}>
              <span className={styles.sparkle}>✨</span>
              <p>{note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.testimonials} id="trends" aria-labelledby="voices-title">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Gentle voices</p>
          <h2 id="voices-title">Reassurance from travelers like you</h2>
          <p className={styles.sectionSubtext}>
            Soft encouragement and real reminders that calm grows with practice.
          </p>
        </div>

        <div className={styles.testimonialGrid}>
          {testimonials.map((item) => (
            <figure key={item.quote} className={styles.testimonialCard}>
              <blockquote>"{item.quote}"</blockquote>
              <figcaption>{item.role}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="cta-title">
        <div className={styles.finalCard}>
          <div>
            <p className={styles.sectionKicker}>Ready for calmer flights?</p>
            <h2 id="cta-title">Create your CabinCalm account</h2>
            <p className={styles.sectionSubtext}>
              Start tracking, learn what the sounds mean, and feel supported from boarding to landing.
            </p>
          </div>
          <div className={styles.finalActions}>
            <Link className={styles.primaryButton} to="/register">
              Get Started
            </Link>
            <Link className={styles.secondaryButton} to="/login">
              I already have an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
