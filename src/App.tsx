import ContestDashboard from './components/ContestDashboard';
import ContestForm from './components/ContestForm';

export default function App() {
  return (
    <div className="container">
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 0 }}>
          🎣 Journal de Concours de Pêche
        </h1>
        <p style={{ color: 'rgba(240, 246, 255, 0.7)' }}>
          Encodez vos concours, visualisez vos performances et conservez vos stratégies gagnantes.
        </p>
      </header>
      <ContestForm />
      <ContestDashboard />
    </div>
  );
}
