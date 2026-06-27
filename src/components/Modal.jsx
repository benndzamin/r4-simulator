import { useState } from "react";

export default function InvisibleHotspotModal({
  top,
  left,
  width,
  height,
  altText = "Modal prikaz",
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 1. NEVIDLJIVI KLIKABILNI BOX PREKO SLIKE */}
      <div
        onClick={() => setIsOpen(true)}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          cursor: "pointer",
          border: "2px dashed rgba(255, 255, 255, 0.3)",
          background: "transparent",
          zIndex: 15,
        }}
        title="Klikni za detaljan prikaz"
      />

      {/* 2. MODAL PROZOR */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setIsOpen(false)}
        >
          {/* Sadržaj modala */}
          <div
            style={{
              position: "relative",
              background: "#1e293b",
              padding: "16px", // Malo veći padding radi ljepšeg razmaka
              borderRadius: "8px",
              border: "2px solid #475569",
              maxWidth: "90vw", // Povećano da dvije slike imaju više mjesta
              maxHeight: "85vh",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* DUGME X ZA ZATVARANJE */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                top: "-15px",
                right: "-15px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#ef4444",
                color: "#ffffff",
                border: "2px solid #ffffff",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                zIndex: 110,
              }}
            >
              ✕
            </button>

            {/* FLEX KONTEJNER KOJI STAVLJA SLIKE JEDNU PORED DRUGE */}
            <div
              style={{
                display: "flex",
                gap: "16px", // Razmak između Silosa 1 i Silosa 2
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* SLIKA SILOS 1 */}
              <img
                src="/silo2.jpg"
                alt="Silos 1"
                style={{
                  width: "calc(50% - 8px)", // Uzima tačno pola širine minus pola gap-a
                  maxHeight: "70vh",
                  display: "block",
                  borderRadius: "4px",
                  objectFit: "contain",
                }}
              />

              {/* SLIKA SILOS 2 */}
              <img
                src="/silo1.jpg"
                alt="Silos 2"
                style={{
                  width: "calc(50% - 8px)",
                  maxHeight: "70vh",
                  display: "block",
                  borderRadius: "4px",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
