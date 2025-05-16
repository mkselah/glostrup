// app.js
// Fetch & display players and handle logic

let playersData = [];

async function loadPlayers() {
  const response = await fetch('PlayerList.json');
  playersData = await response.json();

  renderPlayers(playersData);
}

function renderPlayers(players) {
  const container = document.getElementById('players');
  container.innerHTML = "";

  players.forEach(player => {
    const id = "player_" + player.id;

    // NEW: Wrap everything in one <label> for robustness
    const label = document.createElement("label");
    label.htmlFor = id; // explicit (optional if input inside label)

    // Make label a block to avoid weird touch events
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.marginBottom = "0.6em";
    label.style.fontSize = "1em";
    label.style.cursor = "pointer";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.value = player.id;

    // Append the checkbox and the text, in one label
    label.appendChild(checkbox);

    // No leading space needed, use unicode nbsp for consistency
    label.appendChild(document.createTextNode('\u00A0' + player.name + ' (niveau: ' + player.skill + ')'));

    // APPEND to players container
    container.appendChild(label);
  });
}

// Fair team assignment: evenly distribute skill
function assignPlayersToTeams(selectedPlayers, numTeams) {
  // Sort by skill (descending)
  selectedPlayers.sort((a, b) => b.skill - a.skill);

  // Initialize empty teams
  let teams = Array.from({ length: numTeams }, () => []);

  // Distribute in round-robin
  selectedPlayers.forEach((player, idx) => {
    teams[idx % numTeams].push(player);
  });

  // Shuffle inside each team for randomness
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  teams = teams.map(shuffle);

  return teams;
}

document.addEventListener('DOMContentLoaded', () => {
  loadPlayers();

  document.getElementById('trainingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Find selected players
    const checked = Array.from(document.querySelectorAll("#players input[type=checkbox]:checked"));
    const selectedIds = checked.map(c => Number(c.value));

    // Only use ID lookup to get selected player objects
    const selectedPlayers = playersData.filter(p => selectedIds.includes(p.id));

    const numTeamsField = document.getElementById('numTeams');
    let numTeams = parseInt(numTeamsField.value, 10);
    // Clamp value to safe boundaries
    if (isNaN(numTeams) || numTeams < 2) numTeams = 2;
    if (numTeams > 6) numTeams = 6;

    if (selectedPlayers.length < numTeams) {
      document.getElementById('teamsResult').innerHTML = "<p>For få spillere til antallet af hold.</p>";
      return;
    }

    // Assign & show teams
    const teams = assignPlayersToTeams(selectedPlayers, numTeams);

    let html = "";
    teams.forEach((team, idx) => {
      html += `<div class="team-block"><h3>Hold ${idx + 1}</h3><ul>`;
      team.forEach(player => {
        html += `<li>${player.name} (niveau: ${player.skill})</li>`;
      });
      html += "</ul></div>";
    });

    document.getElementById('teamsResult').innerHTML = html;
  });
});