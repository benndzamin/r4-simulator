import { useState, useEffect, useRef } from "react";
import InvisibleHotspotModal from "./Modal.jsx";

export default function Simulator() {
  const [silo5, setSilo5] = useState(75.8);
  const [silo6, setSilo6] = useState(35.8);
  const [v5Open, setV5Open] = useState(false);
  const [v5POpen, setV5POpen] = useState(false);
  const [v6Open, setV6Open] = useState(false);
  const [blower, setBlower] = useState(88.0);
  const [flow, setFlow] = useState(false);
  const [blowerTripped, setBlowerTripped] = useState(false);

  useEffect(() => {
    // 1. RAČUNANJE BAZNOG OPTEREĆENJA (Količina cementa u sistemu)
    let baseLoad = 35.0 + silo5 * 0.5 + silo6 * 0.5;

    // Brojimo aktivne ventile
    let otvoreniOtvori = 0;
    if (v5Open) otvoreniOtvori++;
    if (v5POpen) otvoreniOtvori++;
    if (v6Open) otvoreniOtvori++;

    // 2. LINEARNO RASTERECENJE (Fizika fluida bez skokova)
    let calculatedBlower = baseLoad;

    if (otvoreniOtvori > 0) {
      // Svaki otvoreni ventil glatko smanjuje pritisak za procenat trenutne snage sistema
      // Na ovaj način nema skokova unazad, nego kriva raste glatko i paralelno sa slajderima
      let faktorRasterecenja = 0.18; // 18% slabljenja po ventilu (prilagodi po želji)
      calculatedBlower = baseLoad * (1 - otvoreniOtvori * faktorRasterecenja);
    }

    // Apsolutni minimum fizike praznog hoda duvaljke (kad duva u prazno)
    if (calculatedBlower < 40.0) {
      calculatedBlower = 40.0;
    }

    // Zaokružujemo na jednu decimalu
    calculatedBlower = parseFloat(calculatedBlower.toFixed(1));

    // 3. SEKVENCALNI TRIP (ZABRANA RADA PREKO 105%)
    if (blowerTripped) {
      setBlower(0.0);
      setFlow(false);
      return;
    }

    if (calculatedBlower > 105.0) {
      setBlowerTripped(true);
      setBlower(0.0);
      setFlow(false);
      return;
    }

    // Upisujemo pritisak duvaljke ako je sve u redu
    setBlower(calculatedBlower);

    // 4. NOVA, PROČIŠĆENA LOGIKA PROTOKA (ČISTI USLOVI)
    const isSilo5HasMaterial = silo5 > 0;
    const isSilo6HasMaterial = silo6 > 0;

    // Provjera da li uopšte imamo materijala u otvorenim linijama
    let imaMaterijalaUOtvorima = false;
    if (v5Open && isSilo5HasMaterial) imaMaterijalaUOtvorima = true;
    if (v5POpen && isSilo5HasMaterial) imaMaterijalaUOtvorima = true;
    if (v6Open && isSilo6HasMaterial) imaMaterijalaUOtvorima = true;

    let isFlowGood = false;

    if (otvoreniOtvori >= 2) {
      // 2 ili više otvora otvorena -> duvaljka mora biti veća od 60%
      if (calculatedBlower > 60.0 && imaMaterijalaUOtvorima) {
        isFlowGood = true;
      }
    } else if (otvoreniOtvori === 1) {
      // Tačno 1 otvor otvoren -> duvaljka mora biti veća od 55%
      if (calculatedBlower > 50.0 && imaMaterijalaUOtvorima) {
        isFlowGood = true;
      }
    }

    setFlow(isFlowGood);
  }, [silo5, silo6, v5Open, v5POpen, v6Open, blowerTripped]);

  const blowerColor = blowerTripped
    ? "#cc0000"
    : blower > 105.0
      ? "#cc0000"
      : blower < 60.0
        ? "#b45309"
        : "#006600";

  const statusMsg = blowerTripped
    ? "DUVALJKA PRESTALA SA RADOM — GREŠKA PREOPTEREĆENJA!"
    : !v5Open && !v5POpen && !v6Open
      ? "SVI VENTILI ZATVORENI — NEMA PROTOKA"
      : flow
        ? "PROTOK CEMENTA DOBAR"
        : "NEDOVOLJAN PRITISAK / NEMA MATERIJALA U SILOSU";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#000",
      }}
    >
      <InvisibleHotspotModal
        top="36.8%"
        left="53.8%"
        width="8%"
        height="3%"
        modalImgSrc="/detaljno-duvaljka.jpg"
        altText="Detaljna shema kompresora"
      />
      <InvisibleHotspotModal
        top="36.8%"
        left="71.3%"
        width="8%"
        height="3%"
        modalImgSrc="/detaljno-duvaljka.jpg"
        altText="Detaljna shema kompresora"
      />
      <img
        src="/scada-bg1.jpg"
        alt="SCADA"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          userSelect: "none",
          pointerEvents: "none",
        }}
        draggable={false}
      />

      <div style={{ position: "absolute", inset: 0 }}>
        {/* ===== SILO 5: digitalni prikaz ===== */}
        <div
          style={{
            position: "absolute",
            top: "27%",
            left: "55%",
            width: "6%",
            height: "2.5%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: "1.2vh",
            color: "#000",
            border: "1px solid #000",
          }}
        >
          {silo5.toFixed(1)}%
        </div>

        {/* ===== SILO 5: zelena vertikalna traka ===== */}
        <div
          style={{
            position: "absolute",
            top: "25.2%",
            left: "61.3%",
            width: "0.7%",
            height: "11.5%",
            background: "#1a3a1a",
            overflow: "hidden",
            border: "1px solid #000",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: `${silo5}%`,
              background:
                silo5 > 70 ? "#16a34a" : silo5 > 40 ? "#22c55e" : "#4ade80",
              transition: "height 0.3s",
            }}
          />
        </div>

        {/* ===== SILO 5: vertikalni slider ===== */}
        <div
          style={{
            position: "absolute",
            top: "25.2%",
            left: "61.3%",
            width: "0.7%",
            height: "11.5%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
          }}
        >
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={silo5}
            onChange={(e) => setSilo5(parseFloat(e.target.value))}
            style={{
              writingMode: "vertical-lr",
              direction: "rtl",
              WebkitAppearance: "slider-vertical",
              width: "100%",
              height: "100%",
              cursor: "pointer",
            }}
          />
        </div>

        {/* ===== SILO 6: digitalni prikaz ===== */}
        <div
          style={{
            position: "absolute",
            top: "27%",
            left: "73.5%",
            width: "6%",
            height: "2.5%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: "1.2vh",
            color: "#000",
            border: "1px solid #000",
          }}
        >
          {silo6.toFixed(1)}%
        </div>

        {/* ===== SILO 6: zelena vertikalna traka ===== */}
        <div
          style={{
            position: "absolute",
            top: "25.1%",
            left: "72.4%",
            width: "0.7%",
            height: "11.5%",
            background: "#1a3a1a",
            border: "1px solid black",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: `${silo6}%`,
              background:
                silo6 > 70 ? "#16a34a" : silo6 > 40 ? "#22c55e" : "#4ade80",
              transition: "height 0.3s",
            }}
          />
        </div>

        {/* ===== SILO 6: slider ===== */}
        <div
          style={{
            position: "absolute",
            top: "25.1%",
            left: "72.4%",
            width: "0.7%",
            height: "11.5%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
          }}
        >
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={silo6}
            onChange={(e) => setSilo6(parseFloat(e.target.value))}
            style={{
              writingMode: "vertical-lr",
              direction: "rtl",
              WebkitAppearance: "slider-vertical",
              width: "100%",
              height: "100%",
              cursor: "pointer",
            }}
          />
        </div>

        {/* ===== DISPLEJ DUVALJKE ===== */}
        <div
          style={{
            position: "absolute",
            top: "22.9%",
            left: "41.9%",
            width: "4.6%",
            height: "2%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: "1.5vh",
            color: blowerColor,
            border: blowerTripped ? "2px solid #cc0000" : "1px solid #000",
          }}
        >
          {blower.toFixed(1)}%
        </div>

        {/* ===== DOZIRNI VENTIL 5 (RINFUZA) ===== */}
        <div
          onClick={() => !blowerTripped && setV5Open(!v5Open)}
          style={{
            position: "absolute",
            top: "40%",
            left: "53%",
            width: "10%",
            height: "10%",
            cursor: blowerTripped ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: v5Open ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.2)",
            border: `2px solid ${v5Open ? "#16a34a" : "#dc2626"}`,
            borderRadius: "3px",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: "bold",
              fontSize: "1.8vh",
              textAlign: "center",
              padding: "2px 6px",
              background: "white",
              color: v5Open ? "#16a34a" : "#dc2626",
            }}
          >
            {v5Open ? "OTVOREN" : "ZATVOREN"}
          </span>
        </div>

        {/* ===== DOZIRNI VENTIL 5 P (PAKOVANJE) ===== */}
        <div
          onClick={() => !blowerTripped && setV5POpen(!v5POpen)}
          style={{
            position: "absolute",
            top: "42%",
            left: "30.5%",
            width: "10%",
            height: "10%",
            cursor: blowerTripped ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: v5POpen
              ? "rgba(16, 115, 52, 0.25)"
              : "rgba(157, 28, 28, 0.2)",
            border: `2px solid ${v5POpen ? "#16a34a" : "#dc2626"}`,
            borderRadius: "3px",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: "bold",
              fontSize: "1.8vh",
              padding: "2px 6px",
              background: "white",
              color: v5POpen ? "#16a34a" : "#dc2626",
            }}
          >
            {v5POpen ? "OTVOREN" : "ZATVOREN"}
          </span>
        </div>

        {/* ===== DOZIRNI VENTIL 6 (ISTOVAR) ===== */}
        <div
          onClick={() => !blowerTripped && setV6Open(!v6Open)}
          style={{
            position: "absolute",
            top: "40%",
            left: "70.5%",
            width: "10%",
            height: "10%",
            cursor: blowerTripped ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: v6Open ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.2)",
            border: `2px solid ${v6Open ? "#16a34a" : "#dc2626"}`,
            borderRadius: "3px",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: "bold",
              fontSize: "1.8vh",
              padding: "2px 6px",
              background: "white",
              color: v6Open ? "#16a34a" : "#dc2626",
            }}
          >
            {v6Open ? "OTVOREN" : "ZATVOREN"}
          </span>
        </div>

        {/* ===== PROZOR GREŠKE / PREOPTEREĆENJA ===== */}
        {blowerTripped && (
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "35%",
              width: "30%",
              background: "rgba(127,29,29,0.98)",
              border: "3px solid #ef4444",
              borderRadius: "6px",
              padding: "16px",
              fontFamily: "monospace",
              fontWeight: "bold",
              fontSize: "2vh",
              color: "#fca5a5",
              textAlign: "center",
              zIndex: 30,
              boxShadow: "0 0 20px rgba(239,68,68,0.5)",
            }}
          >
            ❌ GREŠKA PREOPTEREĆENJA!
            <br />
            <span style={{ fontSize: "1.6vh", color: "#fbbf24" }}>
              Duvaljka prešla kritičnu granicu opterećenja linije (&gt;105%)
            </span>
            <br />
            <button
              onClick={() => setBlowerTripped(false)}
              style={{
                marginTop: "12px",
                fontSize: "1.8vh",
                padding: "6px 16px",
                cursor: "pointer",
                background: "#7f1d1d",
                border: "2px solid #f87171",
                color: "#fff",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              PRITISNI ZA RESET
            </button>
          </div>
        )}

        {/* ===== KONTROLNI SEMAFOR PROTOKA ===== */}
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: "25%",
            width: "30%",
            background: "rgba(0,0,0,0.88)",
            border: "1px solid #374151",
            borderRadius: "6px",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              flexShrink: 0,
              background: !flow ? "#ef4444" : "#1f2937",
              boxShadow: !flow ? "0 0 8px #ef4444" : "none",
            }}
          />
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              flexShrink: 0,
              background: flow ? "#22c55e" : "#1f2937",
              boxShadow: flow ? "0 0 8px #22c55e" : "none",
            }}
          />
          <div>
            <div
              style={{
                fontSize: "1vh",
                color: "#6b7280",
                fontFamily: "monospace",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              R4 SISTEM PROTOKA
            </div>
            <div
              style={{
                fontSize: "1.3vh",
                fontFamily: "monospace",
                fontWeight: "bold",
                color: flow ? "#4ade80" : "#f87171",
              }}
            >
              {statusMsg}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
