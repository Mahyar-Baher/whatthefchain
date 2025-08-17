/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from "react";
import { ScratchToReveal } from "./ScratchToReveal";
import { Dialog, Button } from "@mui/material";

const tokenIcons = ["₿", "BNB", "USDT", "ETH", "XRP"];

export default function ScratchGame({ onComplete }) {
  const rows = 3;
  const cols = 4;
  const totalCards = rows * cols;

  const generateCards = useCallback(() => {
    const cards = [];
    const iconCounts = {};
    for (let i = 0; i < totalCards; i++) {
      let randomIcon;
      let tries = 0;
      do {
        randomIcon = tokenIcons[Math.floor(Math.random() * tokenIcons.length)];
        tries++;
      } while ((iconCounts[randomIcon] || 0) >= 2 && tries < 20);
      iconCounts[randomIcon] = (iconCounts[randomIcon] || 0) + 1;
      cards.push({ id: i, icon: randomIcon, revealed: false });
    }
    return cards;
  }, [totalCards]);

  const [cards, setCards] = useState(generateCards());
  const [selectedCards, setSelectedCards] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  const handleReveal = (id) => {
    if (selectedCards.includes(id) || gameOver) return;

    const card = cards.find(c => c.id === id);
    setSelectedCards(prev => {
      const newSelected = [...prev, id];
      if (newSelected.length === 3) {
        const icons = newSelected.map(i => cards.find(c => c.id === i).icon);
        const allSame = icons.every(icon => icon === icons[0]);
        setMessage(allSame ? "🎉 Congregation,You did it! 🎉" : "😕 Sorry You Lose!");
        setGameOver(true);
      }
      return newSelected;
    });

    setCards(prev =>
      prev.map(c => (c.id === id ? { ...c, revealed: true } : c))
    );
  };

  const handleCloseDialog = () => {
    onComplete();
  };

  return (
    <>
    <h2 style={{textAlign:'center', color: 'seashell'}}>Choose 3 cards, scratch them, and win a token!</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridGap: 20,
          padding: 40,
          justifyItems: "center",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            style={{
              cursor: card.revealed || gameOver ? "not-allowed" : "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\"><text x=\"0\" y=\"20\" font-size=\"20\">👆</text></svg>') 12 12, pointer",
            }}
          >
            <ScratchToReveal
              width={120}
              height={120}
              minScratchPercentage={50}
              onComplete={() => handleReveal(card.id)}
              gradientColors={["#F38CB8", "#7000E0", "#000"]}
              disabled={card.revealed || gameOver}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: "bold",
                  color: "#FFD700",
                }}
              >
                {card.icon}
              </div>
            </ScratchToReveal>
          </div>
        ))}
      </div>

      <Dialog open={gameOver} onClose={handleCloseDialog}>
        <div style={{ padding: 30, textAlign: "center" }}>
          <h2>{message}</h2>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseDialog}
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </div>
      </Dialog>
    </>
  );
}