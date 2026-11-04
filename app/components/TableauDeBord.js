"use client";

import { useEffect, useState } from "react";
import FormulaireLogin from "./FormulaireLogin";
import InventairePnj from "./InventairePnj";

const CLE_TOKEN = "token_taverne";

export default function TableauDeBord() {
  const [token, setToken] = useState(null);
  const [initialise, setInitialise] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem(CLE_TOKEN));
    setInitialise(true);
  }, []);

  function connexionReussie(nouveauToken) {
    setToken(nouveauToken);
  }

  function deconnexion() {
    localStorage.removeItem(CLE_TOKEN);
    setToken(null);
  }

  return (
    <main className="container">
      <header className="entete">
        <div>
          <p className="surTitre">LE REGISTRE DE LA TAVERNE</p>
          <h1>Tableau de bord du Maître du Jeu</h1>
          <p className="muted">Gestion des personnages non joueurs</p>
        </div>
        {token && (
          <button className="secondaire" type="button" onClick={deconnexion}>
            Se déconnecter
          </button>
        )}
      </header>

      {!initialise ? (
        <p role="status">Chargement de la Taverne…</p>
      ) : token ? (
        <InventairePnj token={token} onSessionExpiree={deconnexion} />
      ) : (
        <FormulaireLogin onLoginSuccess={connexionReussie} />
      )}
    </main>
  );
}
