import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { FaChartPie, FaFilter, FaListUl } from 'react-icons/fa';
import { db } from '../firebase';
import type { ContestEntry } from '../types';
import ContestDetailModal from './ContestDetailModal';

type ContestDoc = ContestEntry & { id: string; createdAt?: { toDate: () => Date } | null };

const PAGE_SIZE = 6;

export default function ContestDashboard() {
  const [contests, setContests] = useState<ContestDoc[]>([]);
  const [selectedContest, setSelectedContest] = useState<ContestDoc | null>(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [catchFilter, setCatchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const contestQuery = query(collection(db, 'contests'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(contestQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const raw = doc.data();
        const entry: ContestDoc = {
          id: doc.id,
          date: raw.date,
          location: raw.location ?? '',
          totalWeight: Number(raw.totalWeight ?? 0),
          ranking: raw.ranking ?? '',
          waterCharacteristic: raw.waterCharacteristic ?? '',
          temperature: raw.temperature ?? null,
          weatherConditions: Array.isArray(raw.weatherConditions) ? raw.weatherConditions : [],
          lines: Array.isArray(raw.lines) ? raw.lines : [],
          groundbaitRecipe: raw.groundbaitRecipe ?? '',
          feedingStrategy: raw.feedingStrategy ?? '',
          hookBaits: Array.isArray(raw.hookBaits) ? raw.hookBaits : [],
          catches: Array.isArray(raw.catches) ? raw.catches : [],
          createdAt: raw.createdAt ?? null,
        };
        return entry;
      });
      setContests(data);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [locationFilter, catchFilter]);

  const uniqueLocations = useMemo(() => Array.from(new Set(contests.map((contest) => contest.location))).sort(), [
    contests,
  ]);
  const uniqueCatches = useMemo(
    () => Array.from(new Set(contests.flatMap((contest) => contest.catches))).sort(),
    [contests]
  );

  const filteredContests = useMemo(() => {
    return contests.filter((contest) => {
      const matchLocation = locationFilter ? contest.location === locationFilter : true;
      const matchCatch = catchFilter ? contest.catches.includes(catchFilter) : true;
      return matchLocation && matchCatch;
    });
  }, [contests, locationFilter, catchFilter]);

  const paginatedContests = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredContests.slice(start, start + PAGE_SIZE);
  }, [filteredContests, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredContests.length / PAGE_SIZE));

  const stats = useMemo(() => {
    if (contests.length === 0) {
      return null;
    }
    const totalWeight = contests.reduce((sum, contest) => sum + contest.totalWeight, 0);
    const averageWeight = totalWeight / contests.length;

    const locationCounts = contests.reduce<Record<string, number>>((acc, contest) => {
      if (!contest.location) return acc;
      acc[contest.location] = (acc[contest.location] ?? 0) + 1;
      return acc;
    }, {});

    const favoriteLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

    const wins = contests.filter((contest) => contest.ranking.toLowerCase().includes('gagn')).length;
    const winRate = contests.length ? Math.round((wins / contests.length) * 100) : 0;

    return {
      averageWeight,
      favoriteLocation,
      winRate,
    };
  }, [contests]);

  return (
    <div className="card">
      <h2>
        <FaListUl /> Tableau de bord
      </h2>

      <div className="grid-two" style={{ marginBottom: 16 }}>
        <label>
          <FaFilter /> Filtrer par lieu
          <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
            <option value="">Tous</option>
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>
        <label>
          <FaFilter /> Filtrer par type de prise
          <select value={catchFilter} onChange={(event) => setCatchFilter(event.target.value)}>
            <option value="">Toutes</option>
            {uniqueCatches.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="card" style={{ marginTop: 0, background: 'rgba(17, 45, 78, 0.4)' }}>
        <h3>
          <FaChartPie /> Synthèse
        </h3>
        {stats ? (
          <div className="grid-two">
            <div className="badge">Poids moyen : {stats.averageWeight.toFixed(1)} g</div>
            <div className="badge">Lieu le plus fréquenté : {stats.favoriteLocation}</div>
            <div className="badge">% victoires secteur : {stats.winRate} %</div>
          </div>
        ) : (
          <p>Encodez un premier concours pour voir les statistiques.</p>
        )}
      </div>

      <table className="table" style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Lieu</th>
            <th>Poids total (g)</th>
            <th>Classement</th>
          </tr>
        </thead>
        <tbody>
          {paginatedContests.map((contest) => (
            <tr key={contest.id} onClick={() => setSelectedContest(contest)} style={{ cursor: 'pointer' }}>
              <td>{new Date(contest.date).toLocaleDateString()}</td>
              <td>{contest.location}</td>
              <td>{contest.totalWeight.toLocaleString()}</td>
              <td>{contest.ranking || '—'}</td>
            </tr>
          ))}
          {paginatedContests.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: 24 }}>
                Aucun concours correspondant.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="form-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          Page {currentPage} / {totalPages}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </div>
      </div>

      {selectedContest && (
        <ContestDetailModal contest={selectedContest} onClose={() => setSelectedContest(null)} />
      )}
    </div>
  );
}
