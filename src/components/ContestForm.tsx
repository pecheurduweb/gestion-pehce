import { useEffect, useMemo, useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { FaAnchor, FaCalendarAlt, FaFish, FaMapMarkerAlt, FaThermometerHalf } from 'react-icons/fa';
import { db } from '../firebase';
import type { ContestEntry, LineSetup } from '../types';
import { fetchHistoricalWeather } from '../services/weatherService';

const WATER_CHARACTERISTICS = ['Boueuse', 'Claire', 'Teintée', 'Courante', 'Calme'];
const WEATHER_CONDITIONS = ['Pluie', 'Vent', 'Soleil', 'Couvert', 'Orage', 'Brouillard'];
const HOOK_BAITS = ['Vaseux', 'Terreaux', 'Asticots morts', 'Pâte', 'Pellets 2mm', 'Maïs'];
const CATCH_TYPES = ['Tanches', 'Carassins', 'Carpes', 'Gardons', 'Brèmes', 'Perches'];

const createLineId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const emptyLine = (): LineSetup => ({
  id: createLineId(),
  floatSize: '',
  mainLine: '',
  lengthMeters: '',
  hook: '',
  rigNotes: '',
  remarks: '',
});

const initialState: ContestEntry = {
  date: new Date().toISOString().split('T')[0],
  location: '',
  totalWeight: 0,
  ranking: '',
  waterCharacteristic: WATER_CHARACTERISTICS[0],
  temperature: undefined,
  weatherConditions: [],
  lines: [emptyLine()],
  groundbaitRecipe: '',
  feedingStrategy: '',
  hookBaits: [],
  catches: [],
};

type Props = {
  onSaved?: () => void;
};

export default function ContestForm({ onSaved }: Props) {
  const [form, setForm] = useState<ContestEntry>(initialState);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<{ icon: string; temperature: number; condition: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!form.date || !form.location.trim()) {
      setWeatherInfo(null);
      return;
    }
    let active = true;
    setLoadingWeather(true);
    setWeatherError(null);
    fetchHistoricalWeather(form.location.trim(), form.date)
      .then((snapshot) => {
        if (!active) return;
        setWeatherInfo(snapshot);
      })
      .catch((error) => {
        if (!active) return;
        console.error('Échec de récupération de la météo simulée', error);
        setWeatherError("Impossible de récupérer la météo simulée");
        setWeatherInfo(null);
      })
      .finally(() => {
        if (!active) return;
        setLoadingWeather(false);
      });
    return () => {
      active = false;
    };
  }, [form.date, form.location]);

  const lines = useMemo(() => form.lines, [form.lines]);

  const updateField = <K extends keyof ContestEntry>(key: K, value: ContestEntry[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleLineChange = (lineId: string, key: keyof LineSetup, value: LineSetup[keyof LineSetup]) => {
    updateField(
      'lines',
      lines.map((line) => (line.id === lineId ? { ...line, [key]: value } : line))
    );
  };

  const addLine = () => {
    updateField('lines', [...lines, emptyLine()]);
  };

  const removeLine = (lineId: string) => {
    if (lines.length === 1) return;
    updateField(
      'lines',
      lines.filter((line) => line.id !== lineId)
    );
  };

  const resetForm = () => {
    setForm({ ...initialState, lines: [emptyLine()] });
    setWeatherInfo(null);
    setWeatherError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const contest: ContestEntry = {
        ...form,
        totalWeight: Number(form.totalWeight) || 0,
        temperature: form.temperature === undefined || form.temperature === null || form.temperature === ('' as never)
          ? null
          : Number(form.temperature),
        lines: form.lines.map((line) => ({
          ...line,
          floatSize: line.floatSize === '' ? undefined : Number(line.floatSize),
          mainLine: line.mainLine === '' ? undefined : Number(line.mainLine),
          lengthMeters: line.lengthMeters === '' ? undefined : Number(line.lengthMeters),
        })),
      };

      await addDoc(collection(db, 'contests'), {
        ...contest,
        createdAt: Timestamp.now(),
      });
      resetForm();
      onSaved?.();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du concours', error);
      alert('Une erreur est survenue lors de la sauvegarde. Vérifiez votre connexion Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>
        <FaCalendarAlt /> Encoder un concours
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid-two">
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
              required
            />
          </label>
          <label>
            <span className="badge">
              <FaMapMarkerAlt /> Lieu
            </span>
            <input
              type="text"
              value={form.location}
              onChange={(event) => updateField('location', event.target.value)}
              placeholder="ex: Messancy, place 9"
              required
            />
          </label>
          <label>
            Poids total (g)
            <input
              type="number"
              min={0}
              value={form.totalWeight}
              onChange={(event) => updateField('totalWeight', Number(event.target.value))}
              required
            />
          </label>
          <label>
            Classement
            <input
              type="text"
              value={form.ranking}
              onChange={(event) => updateField('ranking', event.target.value)}
              placeholder="ex: Gagné de secteur"
            />
          </label>
          <label>
            Caractéristique de l'eau
            <select
              value={form.waterCharacteristic}
              onChange={(event) => updateField('waterCharacteristic', event.target.value)}
            >
              {WATER_CHARACTERISTICS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="badge">
              <FaThermometerHalf /> Température (°C)
            </span>
            <input
              type="number"
              value={form.temperature ?? ''}
              onChange={(event) =>
                updateField('temperature', event.target.value === '' ? null : Number(event.target.value))
              }
              placeholder="ex: 18"
            />
          </label>
          <label>
            Conditions météo
            <select
              multiple
              value={form.weatherConditions}
              onChange={(event) =>
                updateField(
                  'weatherConditions',
                  Array.from(event.target.selectedOptions).map((option) => option.value)
                )
              }
            >
              {WEATHER_CONDITIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginTop: 16 }}>
          <label>
            Amorce (composition)
            <textarea
              value={form.groundbaitRecipe}
              onChange={(event) => updateField('groundbaitRecipe', event.target.value)}
              placeholder="500g biomix, 5kg terre de somme..."
            />
          </label>
        </div>

        <div className="grid-two" style={{ marginTop: 16 }}>
          <label>
            Stratégie d'amorçage
            <textarea
              value={form.feedingStrategy}
              onChange={(event) => updateField('feedingStrategy', event.target.value)}
              placeholder="6 boules à la coupelle au départ..."
            />
          </label>
          <label>
            Esches utilisées à l'hameçon
            <select
              multiple
              value={form.hookBaits}
              onChange={(event) =>
                updateField('hookBaits', Array.from(event.target.selectedOptions).map((option) => option.value))
              }
            >
              {HOOK_BAITS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Types de prises
            <select
              multiple
              value={form.catches}
              onChange={(event) =>
                updateField('catches', Array.from(event.target.selectedOptions).map((option) => option.value))
              }
            >
              {CATCH_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="section-divider" />

        <h3>
          <FaFish /> Lignes utilisées
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lines.map((line, index) => (
            <div
              key={line.id}
              style={{
                border: '1px solid rgba(119, 141, 169, 0.2)',
                borderRadius: 12,
                padding: 16,
                background: 'rgba(13, 27, 42, 0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Ligne {index + 1}</strong>
                {lines.length > 1 && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => removeLine(line.id)}
                  >
                    Supprimer
                  </button>
                )}
              </div>
              <div className="grid-two" style={{ marginTop: 12 }}>
                <label>
                  Flotteur (g)
                  <input
                    type="number"
                    value={line.floatSize ?? ''}
                    onChange={(event) =>
                      handleLineChange(line.id, 'floatSize',
                        event.target.value === '' ? '' : Number(event.target.value))
                    }
                  />
                </label>
                <label>
                  Corps de ligne (°/°)
                  <input
                    type="number"
                    step="0.01"
                    value={line.mainLine ?? ''}
                    onChange={(event) =>
                      handleLineChange(line.id, 'mainLine',
                        event.target.value === '' ? '' : Number(event.target.value))
                    }
                  />
                </label>
                <label>
                  Longueur (m)
                  <input
                    type="number"
                    step="0.1"
                    value={line.lengthMeters ?? ''}
                    onChange={(event) =>
                      handleLineChange(line.id, 'lengthMeters',
                        event.target.value === '' ? '' : Number(event.target.value))
                    }
                  />
                </label>
                <label>
                  Hameçon
                  <input
                    type="text"
                    value={line.hook ?? ''}
                    onChange={(event) => handleLineChange(line.id, 'hook', event.target.value)}
                  />
                </label>
                <label>
                  Plombée
                  <input
                    type="text"
                    value={line.rigNotes ?? ''}
                    onChange={(event) => handleLineChange(line.id, 'rigNotes', event.target.value)}
                  />
                </label>
                <label>
                  Remarques
                  <input
                    type="text"
                    value={line.remarks ?? ''}
                    onChange={(event) => handleLineChange(line.id, 'remarks', event.target.value)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        <div className="form-actions" style={{ marginTop: 16 }}>
          <button type="button" className="secondary-button" onClick={addLine}>
            Ajouter une ligne
          </button>
        </div>

        {form.date && form.location && (
          <div style={{ marginTop: 24 }}>
            <h3>
              <FaAnchor /> Météo historique simulée
            </h3>
            <div className="weather-widget">
              {loadingWeather ? (
                <span>Chargement...</span>
              ) : weatherError ? (
                <span>{weatherError}</span>
              ) : weatherInfo ? (
                <>
                  <span className="icon">{weatherInfo.icon}</span>
                  <div>
                    <div>
                      {weatherInfo.condition} — {weatherInfo.temperature.toFixed(1)} °C
                    </div>
                    <small>Basé sur {form.location} le {new Date(form.date).toLocaleDateString()}</small>
                  </div>
                </>
              ) : (
                <span>Aucune information météo disponible</span>
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={resetForm}>
            Réinitialiser
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le concours'}
          </button>
        </div>
      </form>
    </div>
  );
}
