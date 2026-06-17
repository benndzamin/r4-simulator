import { useState, useEffect, useRef } from "react";

export default function Simulator() {
  const [silo5, setSilo5] = useState(75.8);
  const [silo6, setSilo6] = useState(39.8);
  const [v5Open, setV5Open] = useState(false);
  const [v5POpen, setV5POpen] = useState(false);
  const [v6Open, setV6Open] = useState(false);
  const [blower, setBlower] = useState(88.0);
  const [flow, setFlow] = useState(false);
  const [blowerTripped, setBlowerTripped] = useState(false);

  useEffect(() => {
    // 1. RAČUNANJE BAZNOG OPTEREĆENJA (Količina cementa)
    let baseLoad = 40.0 + silo5 * 0.36 + silo6 * 0.36;

    // Brojimo aktivne ventile
    let otvoreniOtvori = 0;
    if (v5Open) otvoreniOtvori++;
    if (v5POpen) otvoreniOtvori++;
    if (v6Open) otvoreniOtvori++;

    // 2. LOGIKA RASTERECENJA NA OSNOVU VENTILA
    let calculatedBlower = baseLoad;

    if (otvoreniOtvori > 0) {
      if (baseLoad >= 105.0) {
        calculatedBlower -= otvoreniOtvori * 25.0;
      } else if (baseLoad >= 90.0) {
        calculatedBlower -= otvoreniOtvori * 15.0;
      } else {
        calculatedBlower -= otvoreniOtvori * 8.0;
      }
    }

    // Apsolutni minimum fizike praznog hoda
    if (calculatedBlower < 45.0) {
      calculatedBlower = 45.0;
    }

    // Zaokružujemo na jednu decimalu
    calculatedBlower = parseFloat(calculatedBlower.toFixed(1));

    // 3. SEKVENCALNI TRIP (ZABRANA RADA PREKO 102%)
    if (blowerTripped) {
      setBlower(0.0);
      setFlow(false);
      return;
    }

    if (calculatedBlower > 102.0) {
      setBlowerTripped(true);
      setBlower(0.0);
      setFlow(false);
      return;
    }

    // Upisujemo pritisak duvaljke ako je sve u redu
    setBlower(calculatedBlower);

    // 4. LOGIKA PROTOKA (SEMAFORI S URAČUNATIM KOLIČINAMA I ZONAMA OD 10%)
    const isSilo5Active = v5Open || v5POpen;
    const isSilo6Active = v6Open;

    // Evaluacija da li Silos 5 uopšte može davati protok na osnovu količine i pritiska
    let silo5CanFlow = false;
    if (isSilo5Active) {
      if (silo5 > 0) {
        if (silo5 <= 10.0) {
          // Ako je u silosu 10% i manje, mora biti pritisak veći od 65%
          if (calculatedBlower > 65.0) silo5CanFlow = true;
        } else {
          // Ako ima više od 10% materijala, količina je OK
          silo5CanFlow = true;
        }
      }
    }

    // Evaluacija da li Silos 6 uopšte može davati protok na osnovu količine i pritiska
    let silo6CanFlow = false;
    if (isSilo6Active) {
      if (silo6 > 0) {
        if (silo6 <= 10.0) {
          // Ako je u silosu 10% i manje, mora biti pritisak veći od 65%
          if (calculatedBlower > 65.0) silo6CanFlow = true;
        } else {
          // Ako ima više od 10% materijala, količina je OK
          silo6CanFlow = true;
        }
      }
    }

    let isFlowGood = false;

    // Kombinovanje sa osnovnim pravilima pritiska (60% za jedan silos, 75% za oba)
    if (isSilo5Active && isSilo6Active) {
      // Oba silosa otvorena -> oba moraju proći količinsku provjeru + pritisak preko 75%
      if (silo5CanFlow && silo6CanFlow && calculatedBlower > 65.0) {
        isFlowGood = true;
      }
    } else if (isSilo5Active) {
      // Samo Silos 5 otvoren -> mora proći svoju količinsku provjeru + pritisak preko 60%
      if (silo5CanFlow && calculatedBlower > 60.0) {
        isFlowGood = true;
      }
    } else if (isSilo6Active) {
      // Samo Silos 6 otvoren -> mora proći svoju količinsku provjeru + pritisak preko 60%
      if (silo6CanFlow && calculatedBlower > 60.0) {
        isFlowGood = true;
      }
    }

    setFlow(isFlowGood);
  }, [silo5, silo6, v5Open, v5POpen, v6Open, blowerTripped]);

  const blowerColor = blowerTripped
    ? "#cc0000"
    : blower > 102.0
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
      <img
        src="/scada-bg.jpg"
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
            left: "42%",
            width: "4.5%",
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
            background: v5Open
              ? "rgba(16, 115, 52, 0.25)"
              : "rgba(157, 28, 28, 0.2)",
            border: `2px solid ${v5Open ? "#16a34a" : "#dc2626"}`,
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
              color: v5Open ? "#16a34a" : "#dc2626",
            }}
          >
            V5 RINFUZA: {v5Open ? "OTVOREN" : "ZATVOREN"}
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
            V5 PAKOVANJE: {v5POpen ? "OTVOREN" : "ZATVOREN"}
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
            V6 ISTOVAR: {v6Open ? "OTVOREN" : "ZATVOREN"}
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
            ❌ RELEJ PREOPTEREĆENJA OKINUO!
            <br />
            <span style={{ fontSize: "1.6vh", color: "#fbbf24" }}>
              Silosi prešli kritičnu granicu opterećenja linije (&gt;102%)
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
