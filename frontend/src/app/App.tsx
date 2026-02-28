import type { HealthStatusDto } from '@zdravstvo/contracts';

const previewHealthState: HealthStatusDto = {
  ok: true,
};

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">zdravstvo</p>
        <h1>Frontend skeleton is ready.</h1>
        <p>Contracts package is linked and the Vite app is wired for the monorepo.</p>
        <p className="status-pill">Health preview: {String(previewHealthState.ok)}</p>
      </section>
    </main>
  );
}
