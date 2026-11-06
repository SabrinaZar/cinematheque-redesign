
import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const COULEURS = ["#ef536c", "#f5b76e", "#54c6a0"];

export default function AdminCharts({ statistiques }) {
  const [graphiques, setGraphiques] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function chargerGraphiques() {
      try {
        const response = await fetch(
          `${API}/admin/graphiques`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Impossible de charger les graphiques.");
        }

        const data = await response.json();
        setGraphiques(data);
      } catch (error) {
        setErreur(error.message);
      }
    }

    chargerGraphiques();
  }, []);

  const statuts = [
    {
      name: "Acceptés",
      nombre: statistiques?.acceptes || 0
    },
    {
      name: "En attente",
      nombre: statistiques?.enAttente || 0
    },
    {
      name: "Refusés",
      nombre: statistiques?.refuses || 0
    }
  ];

  const inscriptions = graphiques?.inscriptionsParMois || [];
  const genres = (graphiques?.filmsParGenre || []).slice(0, 8);

  return (
    <section className="admin-charts-section">

      <div className="admin-charts-heading">
        <p>✦ ANALYSE & STATISTIQUES</p>
      </div>

      {erreur && (
        <p className="admin-alert admin-error">{erreur}</p>
      )}

      <div className="admin-charts-grid">

        {/* GRAPHIQUE 1 : COURBE */}
        <div className="admin-chart-card wide">
          <h3>Évolution des inscriptions</h3>
          <p>Nouveaux utilisateurs sur les 6 derniers mois</p>

          <div className="admin-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inscriptions}>
                <CartesianGrid
                  stroke="#303442"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="mois"
                  tick={{ fill: "#a5a8b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#a5a8b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "#202433",
                    border: "1px solid #444859",
                    borderRadius: 10,
                    color: "white"
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="nombre"
                  name="Inscriptions"
                  stroke="#ef536c"
                  strokeWidth={3}
                  dot={{ fill: "#ef536c", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPHIQUE 2 : BARRES */}
        <div className="admin-chart-card">
          <h3>Films par genre</h3>
          <p>Les 8 genres les plus représentés</p>

          <div className="admin-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={genres}
                layout="vertical"
                margin={{ left: 10, right: 15 }}
              >
                <CartesianGrid
                  stroke="#303442"
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "#a5a8b8" }}
                />

                <YAxis
                  type="category"
                  dataKey="genre"
                  width={100}
                  tick={{ fill: "#a5a8b8", fontSize: 11 }}
                />

                <Tooltip
                  contentStyle={{
                    background: "#202433",
                    border: "1px solid #444859",
                    borderRadius: 10,
                    color: "white"
                  }}
                />

                <Bar
                  dataKey="nombre"
                  name="Films"
                  fill="#ef536c"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPHIQUE 3 : CIRCULAIRE */}
        <div className="admin-chart-card">
          <h3>Statut des comptes</h3>
          <p>Répartition des utilisateurs inscrits</p>

          <div className="admin-chart-box">
            {statuts.some((item) => item.nombre > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statuts}
                    dataKey="nombre"
                    nameKey="name"
                    cx="50%"
                    cy="43%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statuts.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={COULEURS[index]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="admin-chart-empty">
                Aucune donnée disponible.
              </p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
