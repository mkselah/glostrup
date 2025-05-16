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

    // Wrap everything in one <label> for robustness
    const label = document.createElement("label");
    label.htmlFor = id;

    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.marginBottom = "0.6em";
    label.style.fontSize = "1em";
    label.style.cursor = "pointer";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.value = player.id;

    label.appendChild(checkbox);

    label.appendChild(
      document.createTextNode('\u00A0' + player.name + ' (niveau: ' + player.skill + ')')
    );

    container.appendChild(label);
  });
}

// Fisher-Yates shuffle for randomness
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fair team assignment with randomness (every click splits differently!)
function assignPlayersToTeams(selectedPlayers, numTeams) {
  // --- KEY CHANGE: shuffle before sort (to randomize tie-breaks) ---
  const shuffled = shuffle(selectedPlayers);

  // Sort players descending by skill, but random within tie
  shuffled.sort((a, b) => b.skill - a.skill);

  // Calculate base team size & max team size for uneven splits
  const minTeamSize = Math.floor(shuffled.length / numTeams);
  const extra = shuffled.length % numTeams; // number of teams that get one extra player

  // Prepare teams array
  let teams = Array.from({ length: numTeams }, (_, i) => ({
    players: [],
    skillSum: 0,
    maxSize: minTeamSize + (i < extra ? 1 : 0)
  }));

  shuffled.forEach(player => {
    // For teams not yet full, pick one with lowest skill sum
    let eligibleTeams = teams.filter(team => team.players.length < team.maxSize);
    let lowestTeam = eligibleTeams.reduce((minTeam, team) => {
      return (team.skillSum < minTeam.skillSum) ? team : minTeam;
    }, eligibleTeams[0]);

    lowestTeam.players.push(player);
    lowestTeam.skillSum += player.skill;
  });

  // Shuffle each team for internal randomness
  return teams.map(team => shuffle(team.players));
}

document.addEventListener('DOMContentLoaded', () => {
  loadPlayers();
  document.getElementById('trainingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const checked = Array.from(document.querySelectorAll("#players input[type=checkbox]:checked"));
    const selectedIds = checked.map(c => Number(c.value));
    const selectedPlayers = playersData.filter(p => selectedIds.includes(p.id));

    const numTeamsField = document.getElementById('numTeams');
    let numTeams = parseInt(numTeamsField.value, 10);
    if (isNaN(numTeams) || numTeams < 2) numTeams = 2;
    if (numTeams > 6) numTeams = 6;

    if (selectedPlayers.length < numTeams) {
      document.getElementById('teamsResult').innerHTML = "<p>For få spillere til antallet af hold.</p>";
      return;
    }

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