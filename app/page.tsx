export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="container">
      <section className="section">
        <h1>Pranav</h1>
        <p>Developer and maker of open-source tools.</p>
      </section>
      <section id="work" className="section section-rule">
        <h2>Selected work</h2>
        <p>Python automation, a Rust desktop vault, and web experiments.</p>
        <a className="text-link" href="https://github.com/pranav256">Explore the repositories</a>
      </section>
      <section id="about" className="section section-rule">
        <h2>Learning by building.</h2>
        <p>Small tools, familiar problems, and a growing collection of experiments.</p>
      </section>
      <section id="writing" className="section section-rule">
        <h2>Writing along the way.</h2>
        <p>Notes on building tools and making software easier to understand.</p>
      </section>
    </main>
  );
}
