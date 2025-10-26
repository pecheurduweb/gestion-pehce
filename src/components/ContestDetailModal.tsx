import { FaCalendarAlt, FaFish, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import type { ContestEntry } from '../types';

type Props = {
  contest: ContestEntry & { id?: string };
  onClose: () => void;
};

export default function ContestDetailModal({ contest, onClose }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-content">
        <button className="close-button" aria-label="Fermer" onClick={onClose}>
          <FaTimes />
        </button>
        <h2>
          <FaCalendarAlt /> Concours du {new Date(contest.date).toLocaleDateString()}
        </h2>
        <div className="grid-two" style={{ marginBottom: 16 }}>
          <div className="badge">
            <FaMapMarkerAlt /> {contest.location}
          </div>
          <div className="badge">Poids total : {contest.totalWeight.toLocaleString()} g</div>
          <div className="badge">Classement : {contest.ranking || 'Non renseigné'}</div>
          <div className="badge">Eau : {contest.waterCharacteristic}</div>
        </div>

        {contest.temperature !== undefined && contest.temperature !== null && (
          <p>Température mesurée : {contest.temperature} °C</p>
        )}

        {contest.weatherConditions.length > 0 && (
          <p>Conditions météo : {contest.weatherConditions.join(', ')}</p>
        )}

        <div className="section-divider" />

        <h3>Amorce & stratégie</h3>
        <p>
          <strong>Amorce :</strong>
          <br />
          {contest.groundbaitRecipe || '—'}
        </p>
        <p>
          <strong>Stratégie d&apos;amorçage :</strong>
          <br />
          {contest.feedingStrategy || '—'}
        </p>

        <div className="section-divider" />

        <h3>
          <FaFish /> Esches & prises
        </h3>
        <p>
          <strong>Esches utilisées :</strong> {contest.hookBaits.length ? contest.hookBaits.join(', ') : '—'}
        </p>
        <p>
          <strong>Types de prises :</strong> {contest.catches.length ? contest.catches.join(', ') : '—'}
        </p>

        <div className="section-divider" />

        <h3>Détails des lignes</h3>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Flotteur</th>
              <th>Corps de ligne</th>
              <th>Longueur (m)</th>
              <th>Hameçon</th>
              <th>Plombée</th>
              <th>Remarques</th>
            </tr>
          </thead>
          <tbody>
            {contest.lines.map((line, index) => (
              <tr key={line.id ?? index}>
                <td>{index + 1}</td>
                <td>{line.floatSize ?? '—'}</td>
                <td>{line.mainLine ?? '—'}</td>
                <td>{line.lengthMeters ?? '—'}</td>
                <td>{line.hook ?? '—'}</td>
                <td>{line.rigNotes ?? '—'}</td>
                <td>{line.remarks ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
