import './home.css'

function Home() {

  return (
    <>
      <div className="content">
        <div 
          className="title-container"
          style={{
            textAlign: 'center',
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '32px',
            padding: '5rem 4rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            transition: 'all 0.3s ease',
            maxWidth: '900px',
            width: '90%',
            position: 'relative',
            overflow: 'hidden',
            margin: '0 auto'
          }}
        >
          <p 
            className="subtitle"
            style={{
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              margin: '0 0 2rem 0',
              fontWeight: '500',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
            }}
          >
            Portfolio
          </p>
          <h1 
            className="title" 
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: '700',
              textAlign: 'center',
              margin: '0 0 2rem 0',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: '0.9',
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            4016506
          </h1>
          <p 
            className="description"
            style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.85)',
              textAlign: 'center',
              margin: '0 auto',
              fontWeight: '400',
              lineHeight: '1.5',
              maxWidth: '480px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
            }}
          >
            Welcome to my digital space. Currently crafting something amazing — check back soon for the full experience.
          </p>
        </div>
      </div>
    </>
  )
}

export default Home