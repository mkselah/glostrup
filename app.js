// Fetch & display players and handle logic

let playersData = [];

async function loadPlayers() {
  const response = await fetch('PlayerList.json');
  playersData = await response.json();

  // Danish names can be shown correctly
  renderPlayers(playersData);
}

function renderPlayers(players) {
  const container = document.getElementById('players');
  container.innerHTML = "";

  players.forEach(player => {
    const id = "player_" + player.id;
    const label = document.createElement("label");
    label.htmlFor = id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.value = player.id;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${player.name} (niveau: ${player.skill})`));
    container.appendChild(label);
  });
}

// Group assignment helper
// ==========================
// CHANGES HERE for fairer team splits!
function assignPlayersToTeams(selectedPlayers, numTeams) {
  // Sort by skill (descending) to balance by skill across teams
  selectedPlayers.sort((a, b) => b.skill - a.skill);

  // Initialize teams
  let teams = Array.from({length: numTeams}, () => []);

  // Distribute in round-robin order (avoids snake draft problem)
  selectedPlayers.forEach((player, idx) => {
    teams[idx % numTeams].push(player);
  });

  // Shuffle each team internally for randomness
  const shuffle = arr => arr.sort(() => Math.random() - 0.5);
  teams = teams.map(shuffle);

  return teams;
}
// ==========================

document.addEventListener('DOMContentLoaded', () => {
  loadPlayers();

  document.getElementById('trainingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Find selected players
    const checked = Array.from(document.querySelectorAll("#players input[type=checkbox]:checked"));
    const selectedIds = checked.map(c => Number(c.value));
    const selectedPlayers = playersData.filter(p => selectedIds.includes(p.id));

    const numTeams = Math.max(2, Math.min(6, parseInt(document.getElementById('numTeams').value, 10)));

    if (selectedPlayers.length < numTeams) {
      document.getElementById('teamsResult').innerHTML = "<p>For fÃ¥ spillere til antallet af hold.</p>";
      return;
    }

    // Assign & show teams
    const teams = assignPlayersToTeams(selectedPlayers, numTeams);

    let html = "";
    teams.forEach((team, idx) => {
      html += `<div class="team-block"><h3>Hold ${idx+1}</h3><ul>`;
      team.forEach(player => {
        html += `<li>${player.name} (niveau: ${player.skill})</li>`;
      });
      html += "</ul></div>";
    });

    document.getElementById('teamsResult').innerHTML = html;
  });
});