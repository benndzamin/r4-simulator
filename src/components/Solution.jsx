import { useState, useEffect } from "react";
import InvisibleHotspotModal from "./Modal.jsx";

export default function Solution() {
  const [silo5, setSilo5] = useState(75.8);
  const [silo6, setSilo6] = useState(39.8);
  const [v5Open, setV5Open] = useState(false);
  const [v5POpen, setV5POpen] = useState(false);
  const [v6Open, setV6Open] = useState(false);

  // DVA ODVOJENA SISTEMA DUVALJKI
  const [blower5, setBlower5] = useState(88.0);
  const [blower6, setBlower6] = useState(40.0);

  const [flow5, setFlow5] = useState(false);
  const [flow6, setFlow6] = useState(false);

  const [blower5Tripped, setBlower5Tripped] = useState(false);
  const [blower6Tripped, setBlower6Tripped] = useState(false);

  useEffect(() => {
    // =========================================================================
    // 1. LINIJA 5 LOGIKA (Silos 5 -> V5 i V5P -> Duvaljka 5)
    // =========================================================================
    let baseLoad5 = 40.0 + silo5 * 0.7; // Zavisi isključivo od Silosa 5

    let otvoreniOtvori5 = 0;
    if (v5Open) otvoreniOtvori5++;
    if (v5POpen) otvoreniOtvori5++;

    let calculatedBlower5 = baseLoad5;
    if (otvoreniOtvori5 > 0) {
      let faktorRasterecenja5 = 0.15; // Glatko rasterećenje po ventilu
      calculatedBlower5 =
        baseLoad5 * (1 - otvoreniOtvori5 * faktorRasterecenja5);
    }

    if (calculatedBlower5 < 40.0) calculatedBlower5 = 40.0; // Minimum praznog hoda
    calculatedBlower5 = parseFloat(calculatedBlower5.toFixed(1));

    // Trip logika za Duvaljku 5
    if (blower5Tripped || calculatedBlower5 > 105.0) {
      if (calculatedBlower5 > 105.0) setBlower5Tripped(true);
      setBlower5(0.0);
      setFlow5(false);
    } else {
      setBlower5(calculatedBlower5);

      // Protok za Silos 5 (Tačno 1 ili više otvora -> prag 55% ako ima materijala)
      const isSilo5HasMaterial = silo5 > 0;
      if (
        otvoreniOtvori5 > 0 &&
        calculatedBlower5 > 55.0 &&
        isSilo5HasMaterial
      ) {
        setFlow5(true);
      } else {
        setFlow5(false);
      }
    }

    // =========================================================================
    // 2. LINIJA 6 LOGIKA (Silos 6 -> V6 -> Duvaljka 6)
    // =========================================================================
    let baseLoad6 = 50.0 + silo6 * 0.7; // Zavisi isključivo od Silosa 6

    let otvoreniOtvori6 = v6Open ? 1 : 0;

    let calculatedBlower6 = baseLoad6;
    if (otvoreniOtvori6 > 0) {
      let faktorRasterecenja6 = 0.18; // Rasterećenje za V6 ventil
      calculatedBlower6 =
        baseLoad6 * (1 - otvoreniOtvori6 * faktorRasterecenja6);
    }

    if (calculatedBlower6 < 40.0) calculatedBlower6 = 40.0;
    calculatedBlower6 = parseFloat(calculatedBlower6.toFixed(1));

    // Trip logika za Duvaljku 6
    if (blower6Tripped || calculatedBlower6 > 105.0) {
      if (calculatedBlower6 > 105.0) setBlower6Tripped(true);
      setBlower6(0.0);
      setFlow6(false);
    } else {
      setBlower6(calculatedBlower6);

      // Protok za Silos 6 (Prag 55% pritiska i da ima materijala)
      const isSilo6HasMaterial = silo6 > 0;
      if (
        otvoreniOtvori6 > 0 &&
        calculatedBlower6 > 55.0 &&
        isSilo6HasMaterial
      ) {
        setFlow6(true);
      } else {
        setFlow6(false);
      }
    }
  }, [silo5, silo6, v5Open, v5POpen, v6Open, blower5Tripped, blower6Tripped]);

  // Boje za displeje duvaljki
  const getBlowerColor = (tripped, val) => {
    if (tripped || val > 105.0) return "#cc0000";
    if (val < 60.0) return "#b45309";
    return "#006600";
  };

  // Statusna poruka semafora kombinuje oba sistema
  const isAnyBlowerTripped = blower5Tripped || blower6Tripped;
  const isAnyValveOpen = v5Open || v5POpen || v6Open;
  const globalFlow = flow5 || flow6;

  const statusMsg = isAnyBlowerTripped
    ? "ALARM — PREOPTEREĆENJE DUVALJKE U SISTEMU!"
    : !isAnyValveOpen
      ? "SVI VENTILI ZATVORENI — LINIJE U MIROVANJU"
      : globalFlow
        ? "🚀 R4 PROTOK OPTIMIZOVAN I RAZDVOJEN (OK)"
        : "NEDOVOLJAN PRITISAK / NEMA MATERIJALA";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* HOTSPOTI ZA DETALJNE SHEME */}
      <InvisibleHotspotModal
        top="36.8%"
        left="53.8%"
        width="8%"
        height="3%"
        modalImgSrc="/detaljno-duvaljka.jpg"
        altText="Shema Duvaljke 5"
      />
      <InvisibleHotspotModal
        top="36.8%"
        left="71.3%"
        width="8%"
        height="3%"
        modalImgSrc="/detaljno-duvaljka.jpg"
        altText="Shema Duvaljke 6"
      />

      {/* NOVA SCADA POZADINA */}
      <img
        src="/R4Solution.jpg"
        alt="R4 Novo Rjesenje"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          pointerEvents: "none",
        }}
        draggable={false}
      />

      <div style={{ position: "absolute", inset: 0 }}>
        {/* ===== SILO 5 PRIKAZ I SLIDER ===== */}
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

        {/* ===== SILO 6 PRIKAZ I SLIDER ===== */}
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

        {/* ===== DISPLEJ DUVALJKE 5 (Pozicioniran na starom mjestu) ===== */}
        <div
          style={{
            position: "absolute",
            top: "22.85%",
            left: "41.95%",
            width: "4.5%",
            height: "2%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: "1.3vh",
            color: getBlowerColor(blower5Tripped, blower5),
            border: blower5Tripped ? "2px solid #cc0000" : "1px solid #000",
          }}
        >
          {blower5.toFixed(1)}%
        </div>

        {/* ===== DISPLEJ DUVALJKE 6 (Dodan pored za novu liniju) ===== */}
        <div
          style={{
            position: "absolute",
            top: "16.6%",
            left: "63.35%",
            width: "4.5%",
            height: "2%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: "1.3vh",
            color: getBlowerColor(blower6Tripped, blower6),
            border: blower6Tripped ? "2px solid #cc0000" : "1px solid #000",
          }}
        >
          {blower6.toFixed(1)}%
        </div>

        {/* ===== VENTILI ===== */}
        {/* V5 Rinfuza */}
        <div
          onClick={() => !blower5Tripped && setV5Open(!v5Open)}
          style={{
            position: "absolute",
            top: "40%",
            left: "53%",
            width: "10%",
            height: "10%",
            cursor: blower5Tripped ? "not-allowed" : "pointer",
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
              background: "white",
              padding: "2px 6px",
              color: v5Open ? "#16a34a" : "#dc2626",
            }}
          >
            {v5Open ? "OTVOREN" : "ZATVOREN"}
          </span>
        </div>

        {/* V5P Pakovanje */}
        <div
          onClick={() => !blower5Tripped && setV5POpen(!v5POpen)}
          style={{
            position: "absolute",
            top: "42%",
            left: "30.5%",
            width: "10%",
            height: "10%",
            cursor: blower5Tripped ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: v5POpen
              ? "rgba(22,163,74,0.25)"
              : "rgba(220,38,38,0.2)",
            border: `2px solid ${v5POpen ? "#16a34a" : "#dc2626"}`,
            borderRadius: "3px",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: "bold",
              fontSize: "1.8vh",
              background: "white",
              padding: "2px 6px",
              color: v5POpen ? "#16a34a" : "#dc2626",
            }}
          >
            {v5POpen ? "OTVOREN" : "ZATVOREN"}
          </span>
        </div>

        {/* V6 Istovar */}
        <div
          onClick={() => !blower6Tripped && setV6Open(!v6Open)}
          style={{
            position: "absolute",
            top: "40%",
            left: "70.5%",
            width: "10%",
            height: "10%",
            cursor: blower6Tripped ? "not-allowed" : "pointer",
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
              background: "white",
              padding: "2px 6px",
              color: v6Open ? "#16a34a" : "#dc2626",
            }}
          >
            {v6Open ? "OTVOREN" : "ZATVOREN"}
          </span>
        </div>

        {/* ===== ALARMI ZA PREOPTEREĆENJA ===== */}
        {blower5Tripped && (
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "20%",
              width: "28%",
              background: "rgba(127,29,29,0.98)",
              border: "3px solid #ef4444",
              borderRadius: "6px",
              padding: "16px",
              fontFamily: "monospace",
              fontWeight: "bold",
              fontSize: "1.8vh",
              color: "#fca5a5",
              textAlign: "center",
              zIndex: 30,
            }}
          >
            ❌ D5 PREOPTEREĆENJE!
            <br />
            <span style={{ fontSize: "1.4vh", color: "#fbbf24" }}>
              Linija Silosa 5 prešla kritičnu granicu (&gt;105%)
            </span>
            <br />
            <button
              onClick={() => setBlower5Tripped(false)}
              style={{
                marginTop: "12px",
                padding: "6px 12px",
                cursor: "pointer",
                background: "#7f1d1d",
                border: "1px solid #f87171",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              RESET D5
            </button>
          </div>
        )}

        {blower6Tripped && (
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "52%",
              width: "28%",
              background: "rgba(127,29,29,0.98)",
              border: "3px solid #ef4444",
              borderRadius: "6px",
              padding: "16px",
              fontFamily: "monospace",
              fontWeight: "bold",
              fontSize: "1.8vh",
              color: "#fca5a5",
              textAlign: "center",
              zIndex: 30,
            }}
          >
            ❌ D6 PREOPTEREĆENJE!
            <br />
            <span style={{ fontSize: "1.4vh", color: "#fbbf24" }}>
              Linija Silosa 6 prešla kritičnu granicu (&gt;105%)
            </span>
            <br />
            <button
              onClick={() => setBlower6Tripped(false)}
              style={{
                marginTop: "12px",
                padding: "6px 12px",
                cursor: "pointer",
                background: "#7f1d1d",
                border: "1px solid #f87171",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              RESET D6
            </button>
          </div>
        )}

        {/* ===== KONTROLNI SEMAFOR PROTOKA ===== */}
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: "25%",
            width: "32%",
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
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: !globalFlow ? "#ef4444" : "#1f2937",
              boxShadow: !globalFlow ? "0 0 8px #ef4444" : "none",
            }}
          />
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: globalFlow ? "#22c55e" : "#1f2937",
              boxShadow: globalFlow ? "0 0 8px #22c55e" : "none",
            }}
          />
          <div>
            <div
              style={{
                fontSize: "0.9vh",
                color: "#6b7280",
                fontFamily: "monospace",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              R4 RAZDVOJENI SISTEM PROTOKA
            </div>
            <div
              style={{
                fontSize: "1.2vh",
                fontFamily: "monospace",
                fontWeight: "bold",
                color: globalFlow ? "#4ade80" : "#f87171",
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
