import React, { useEffect, useState } from "react";
import playersData from "./PlayerList.json"; // modern dev server supports json imports

function shuffleArray(array) {
  // Fisher-Yates shuffle
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Attempts to split players into x skill-balanced teams:
function splitTeams(selectedPlayers, numTeams) {
  // Sort by skill descending (highest to lowest)
  const sorted = selectedPlayers.slice().sort((a, b) => b.skill - a.skill);
  // Assign players to teams via snake draft for skill balance
  let teams = Array.from({ length: numTeams }, () => []);
  let direction = 1; // 1: forward, -1: backward
  let t = 0;
  sorted.forEach((player, idx) => {
    teams[t].push(player);
    t += direction;
    if (t === numTeams) {
      direction = -1;
      t = numTeams - 1;
    } else if (t < 0) {
      direction = 1;
      t = 0;
    }
  });
  // Shuffle within teams for more randomness
  teams = teams.map(shuffleArray);
  return teams;
}

function App() {
  const [selected, setSelected] = useState(() =>
    playersData.reduce((acc, p) => ({ ...acc, [p.id]: false }), {})
  );
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState([]);

  // Select/unselect players
  function handleSelect(id) {
    setSelected((sel) => ({ ...sel, [id]: !sel[id] }));
  }

  function handleGenerateTeams() {
    const selectedPlayers = playersData.filter((p) => selected[p.id]);
    if (selectedPlayers.length < numTeams) {
      alert("Not enough players for that many teams.");
      return;
    }
    setTeams(splitTeams(selectedPlayers, numTeams));
  }

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 16, fontFamily: "sans-serif" }}>
      <h2>Træning: Hvem er mødt?</h2>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {playersData.map((player) => (
          <li key={player.id}>
            <label>
              <input
                type="checkbox"
                checked={!!selected[player.id]}
                onChange={() => handleSelect(player.id)}
              />
              <span style={{ marginLeft: 8 }}>{player.name} (Niveau: {player.skill})</span>
            </label>
          </li>
        ))}
      </ul>

      <div style={{ margin: "16px 0" }}>
        Antal hold:
        <input
          type="number"
          min="2"
          max={playersData.length}
          value={numTeams}
          onChange={(e) => setNumTeams(Number(e.target.value))}
          style={{ width: 50, marginLeft: 8 }}
        />
        <button onClick={handleGenerateTeams} style={{ marginLeft: 16 }}>
          Del op i hold
        </button>
      </div>

      {teams.length > 0 && (
        <div>
          <h3>Hold</h3>
          <div style={{ display: "flex", gap: 16 }}>
            {teams.map((team, idx) => (
              <div key={idx} style={{ border: "1px solid #aaa", padding: 8, flex: 1 }}>
                <h4>Hold {idx + 1}</h4>
                <ul style={{ paddingLeft: 16 }}>
                  {team.map((player) => (
                    <li key={player.id}>
                      {player.name} (Niveau: {player.skill})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;