// Fetch & display players and handle logic

let playersData = [];

async function loadPlayers() {
  const response = await fetch('PlayerList.json');
  playersData = await response.json();

  // Danish names will be shown correctly
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

// Fair team assignment: evenly distribute skill
function assignPlayersToTeams(selectedPlayers, numTeams) {
  // Sort by skill (descending)
  selectedPlayers.sort((a, b) => b.skill - a.skill);

  // Initialize empty teams
  let teams = Array.from({ length: numTeams }, () => []);

  // Distribute in round-robin (snake can be better, but round-robin is OK for now)
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

    // LOG: See which IDs are checked
    console.log("Checked IDs:", selectedIds);

    // Only use ID lookup to get selected player objects
    const selectedPlayers = playersData.filter(p => selectedIds.includes(p.id));
    console.log("Selected players:", selectedPlayers.map(x => x.name));

    const numTeamsField = document.getElementById('numTeams');
    let numTeams = parseInt(numTeamsField.value, 10);
    // Clamp value to safe boundaries
    if (isNaN(numTeams) || numTeams < 2) numTeams = 2;
    if (numTeams > 6) numTeams = 6;

    // If not enough players for number of teams
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