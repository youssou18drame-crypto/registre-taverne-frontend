"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function InventairePnj({ token, onSessionExpiree }) {
  const [pnjs, setPnjs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [nom, setNom] = useState("");
  const [classe, setClasse] = useState("");
  const [niveau, setNiveau] = useState("1");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    const controleur = new AbortController();

    async function chargerPnjs() {
      setErreur("");
      try {
        const reponse = await fetch(`${API_URL}/api/pnj`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controleur.signal,
          cache: "no-store"
        });
        if (reponse.status === 401 || reponse.status === 403) {
          onSessionExpiree();
          return;
        }
        if (!reponse.ok) {
          throw new Error(`Erreur HTTP ${reponse.status} lors du chargement.`);
        }
        const donnees = await reponse.json();
        if (!Array.isArray(donnees)) {
          throw new Error("Format des PNJ incorrect.");
        }
        setPnjs(donnees);
      } catch (err) {
        if (err.name !== "AbortError") {
          setErreur(err.message || "Impossible de charger les PNJ.");
        }
      } finally {
        if (!controleur.signal.aborted) setChargement(false);
      }
    }

    chargerPnjs();
    return () => controleur.abort();
  }, [token, onSessionExpiree]);

  async function ajouterPnj(e) {
    e.preventDefault();
    setErreur("");
    setMessage("");

    const niveauNombre = Number(niveau);
    if (!nom.trim() || !classe.trim() || !Number.isInteger(niveauNombre) ||
        niveauNombre < 1 || niveauNombre > 2147483647) {
      setErreur("Indique un nom, une classe et un niveau entier positif.");
      return;
    }

    setEnvoi(true);
    try {
      // Lire la valeur actuelle permet de détecter un token supprimé dans F12.
      const tokenActuel = localStorage.getItem("token_taverne");
      if (!tokenActuel || tokenActuel !== token) {
        onSessionExpiree();
        throw new Error("Session absente : reconnecte-toi.");
      }

      const reponse = await fetch(`${API_URL}/api/pnj`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenActuel}`
        },
        body: JSON.stringify({
          nom: nom.trim(),
          classe: classe.trim(),
          niveau: niveauNombre
        })
      });

      if (reponse.status === 401 || reponse.status === 403) {
        onSessionExpiree();
        throw new Error("Session expirée ou refusée. Reconnecte-toi.");
      }
      const donnees = await reponse.json();
      if (!reponse.ok) {
        throw new Error(donnees.erreur || `Erreur HTTP ${reponse.status}`);
      }
      if (!donnees.personnage) {
        throw new Error("Réponse de création inattendue.");
      }

      setPnjs((anciens) => [...anciens, donnees.personnage]);
      setNom("");
      setClasse("");
      setNiveau("1");
      setMessage("Le PNJ a rejoint la Taverne !");
    } catch (err) {
      setErreur(err.message || "Impossible d'ajouter le personnage.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="colonnes">
      <section className="panneau">
        <div className="ligneTitre">
          <h2>Inventaire des PNJ</h2>
          <span className="compteur">{pnjs.length} personnage(s)</span>
        </div>
        {chargement ? (
          <p role="status">Le tavernier consulte son registre…</p>
        ) : pnjs.length === 0 ? (
          <p>Aucun personnage pour le moment.</p>
        ) : (
          <div className="grille">
            {pnjs.map((pnj) => (
              <article className="carte" key={pnj.id}>
                <h3>{pnj.nom}</h3>
                <p>Classe : {pnj.classe}</p>
                <p>Niveau : {pnj.niveau}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panneau">
        <h2>Enrôler un nouveau PNJ</h2>
        <p className="muted">L'ajout est envoyé au backend avec le token JWT.</p>
        <form className="formulaire" onSubmit={ajouterPnj}>
          <label htmlFor="nom">Nom</label>
          <input id="nom" maxLength={100} required value={nom}
            onChange={(e) => setNom(e.target.value)} placeholder="Ex. Aragorn" />
          <label htmlFor="classe">Classe</label>
          <input id="classe" maxLength={100} required value={classe}
            onChange={(e) => setClasse(e.target.value)} placeholder="Ex. Guerrier" />
          <label htmlFor="niveau">Niveau</label>
          <input id="niveau" type="number" min="1" max="2147483647" required value={niveau}
            onChange={(e) => setNiveau(e.target.value)} />
          <button type="submit" disabled={envoi}>
            {envoi ? "Enregistrement…" : "Ajouter le PNJ"}
          </button>
        </form>
        {message && <p className="succes" role="status">{message}</p>}
        {erreur && <p className="erreur" role="alert">{erreur}</p>}
      </section>
    </div>
  );
}
