import { useState } from "react";
import Simulator from "./components/Simulator";
import Solution from "./components/Solution.jsx";

function App() {
  // Držimo stanje koji ekran je aktivan: "stari" ili "novi"
  const [trenutniEkran, setTrenutniEkran] = useState("stari");

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "#000",
      }}
    >
      {/* INDUSTRIJSKI TOGGLE BUTTONS - FIKSIRANI NA SREDINI VRHA EKRENA */}
      <div
        style={{
          position: "fixed",
          top: "15px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999, // Osigurava da je iznad apsolutno svega (slika, modala, grešaka)
          display: "flex",
          background: "rgba(30, 41, 59, 0.95)", // Tamna skada nijansa
          padding: "4px",
          borderRadius: "6px",
          border: "2px solid #475569",
          boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
        }}
      >
        <button
          onClick={() => setTrenutniEkran("stari")}
          style={{
            padding: "6px 14px",
            fontSize: "1.1vh",
            fontFamily: "monospace",
            fontWeight: "bold",
            cursor: "pointer",
            border: "none",
            borderRadius: "4px",
            backgroundColor:
              trenutniEkran === "stari" ? "#dc2626" : "transparent", // Crveno za stari sistem
            color: "#fff",
            transition: "background-color 0.2s",
          }}
        >
          TRENUTNO STANJE
        </button>

        <button
          onClick={() => setTrenutniEkran("novi")}
          style={{
            padding: "6px 14px",
            fontSize: "1.1vh",
            fontFamily: "monospace",
            fontWeight: "bold",
            cursor: "pointer",
            border: "none",
            borderRadius: "4px",
            backgroundColor:
              trenutniEkran === "novi" ? "#2563eb" : "transparent", // Plavo za novo rješenje
            color: "#fff",
            transition: "background-color 0.2s",
          }}
        >
          PRIJEDLOG RJEŠENJA
        </button>
      </div>

      {/* RENDER KOMPONENTE NA OSNOVU STATE-A */}
      {trenutniEkran === "stari" ? <Simulator /> : <Solution />}
    </div>
  );
}

export default App;
