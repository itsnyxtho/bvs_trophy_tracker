// @ts-nocheck
const counter = document.getElementById("counter");
const list = document.getElementById("trophyList");
const owned = JSON.parse(localStorage.getItem("ownedTrophies") || "[]");

const render = () => {
  list.innerHTML = "";
  let ownedPoints = 0;
  let totalPoints = 0;

  trophies.forEach((t, i) => {
    totalPoints += t.points;
    if (owned.includes(i)) {
      ownedPoints += t.points;
    }

    const li = document.createElement("li");
    li.className = "trophy " + (owned.includes(i) ? "owned" : "");
    li.title = t.howToGet;

    const container = document.createElement("div");
    container.className = "trophy-container";

    const img = document.createElement("img");
    img.src = t.image || "placeholder.jpg";
    img.width = 32;
    img.height = 32;

    const overlayPoints = document.createElement("div");
    overlayPoints.className = "points";
    overlayPoints.textContent = t.points + " pts";
    if (t.points < 0) overlayPoints.classList.add("negative");

    const overlaySecret = document.createElement("div");
    overlaySecret.className = "secret";
    if (t.secret) overlaySecret.textContent = "S";

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = t.name;

    container.appendChild(img);
    container.appendChild(overlayPoints);
    if (t.secret) container.appendChild(overlaySecret);
    li.appendChild(container);
    li.appendChild(label);

    li.onclick = () => {
      const idx = owned.indexOf(i);
      if (idx >= 0) owned.splice(idx, 1);
      else owned.push(i);
      localStorage.setItem("ownedTrophies", JSON.stringify(owned));
      render();
    };

    list.appendChild(li);
  });

  const trophyPercent = (owned.length / trophies.length) * 100;
  let trophyProgressBar = document.getElementById("trophyProgressBar");
  if (trophyProgressBar) {
    trophyProgressBar.style.width = trophyPercent + "%";
    trophyProgressBar.innerText = `${owned.length} / ${trophies.length} Trophies`;
  }
  let pointsLabel = document.getElementById("pointsLabel");
  if (pointsLabel) pointsLabel.innerHTML = `<b>Awesome Points</b>: ${ownedPoints} / ${totalPoints}`;
};

render();

const resetProgress = () => { 
  if (confirm("Are you sure you want to reset your progress?")) {
    localStorage.removeItem("ownedTrophies");
    owned.length = 0;
    render();
  }
}

const selectAllTrophies = () => {
  for (let i = 0; i < trophies.length; i++) {
    if (!owned.includes(i)) owned.push(i);
  }
  localStorage.setItem("ownedTrophies", JSON.stringify(owned));
  render();
}
