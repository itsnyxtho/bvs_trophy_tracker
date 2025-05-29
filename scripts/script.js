// @ts-nocheck
const bvsTrophies = {};

bvsTrophies.trophies = trophies || [];
bvsTrophies.elements = {
  counter: document.getElementById("counter"),
  list: document.getElementById("trophyList"),
  dropArea: document.getElementById("drop-area"),
};
bvsTrophies.owned = JSON.parse(localStorage.getItem("ownedTrophies") || "[]");

/**
 * Render the trophy tracker UI
 */
const render = () => {
  const counter = bvsTrophies.elements.counter;
  const list = bvsTrophies.elements.list;
  const owned = bvsTrophies.owned;
  const tlen = bvsTrophies.trophies.length;
  const olen = owned.length;
  list.innerHTML = "";
  let ownedPoints = 0;
  let totalPoints = 0;

  // Set the display the trophies
  bvsTrophies.trophies.forEach((t, i) => {
    // Update point totals; owned and total
    totalPoints += t.points;
    if (owned.includes(i)) {
      ownedPoints += t.points;
    }

    // Create the trophy list item
    const li = document.createElement("li");
    li.className = "trophy " + (owned.includes(i) ? "owned" : "");
    li.title = t.howToGet;

    // Create the trophy container
    const container = document.createElement("div");
    container.className = "trophy-container";

    // Create and set the trophy image
    const img = document.createElement("img");
    img.src = t.image || "images/placeholder.jpg";
    img.width = 32;
    img.height = 32;

    // Create the secret overlay if applicable
    const overlaySecret = document.createElement("div");
    overlaySecret.className = "secret";
    overlaySecret.title = "Secret Trophy";
    if (t.secret) overlaySecret.textContent = "S";

    // Create the points overlay
    const overlayPoints = document.createElement("div");
    overlayPoints.className = "points";
    overlayPoints.textContent = t.points + " pts";
    overlayPoints.title = "This trophy is worth " + t.points + " points.";
    if (t.points < 0) overlayPoints.classList.add("negative");

    // Create the label for the trophy
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = t.name;

    // Append elements to the list item
    container.appendChild(img);
    if (t.secret) li.appendChild(overlaySecret);
    li.appendChild(container);
    li.appendChild(overlayPoints);
    li.appendChild(label);

    // Add click event to toggle ownership
    li.onclick = () => {
      const idx = bvsTrophies.owned.indexOf(i);
      if (idx >= 0) bvsTrophies.owned.splice(idx, 1);
      else bvsTrophies.owned.push(i);
      localStorage.setItem("ownedTrophies", JSON.stringify(bvsTrophies.owned));
      render();
    };

    list.appendChild(li);
  });

  const trophyPercent = (olen / tlen) * 100;
  let trophyProgressBar = document.getElementById("trophyProgressBar");
  if (trophyProgressBar) {
    trophyProgressBar.style.width = trophyPercent + "%";
    trophyProgressBar.innerHTML = `<div style="width: 100%; min-width: max-content;">${olen} / ${tlen} Trophies</div>`;
  }
  let pointsLabel = document.getElementById("pointsLabel");
  if (pointsLabel) pointsLabel.innerHTML = `<b>Awesome Points</b>: ${ownedPoints} / ${totalPoints}`;
};

render();

/**
 * Reset the progress of the trophy tracker
 */
const resetProgress = () => {
  const owned = bvsTrophies.owned;

  if (confirm("Are you sure you want to reset your progress?")) {
    localStorage.removeItem("ownedTrophies");
    owned.length = 0;
    render();
  }
};

/**
 * Select all trophies
 */
const selectAllTrophies = () => {
  // Get the owned trophies
  const owned = bvsTrophies.owned;
  const tlen = bvsTrophies.trophies.length;

  // Add all trophies to the owned array
  for (let i = 0; i < tlen; i++) {
    if (!owned.includes(i)) owned.push(i);
  }

  // Update localStorage with the new owned trophies
  localStorage.setItem("ownedTrophies", JSON.stringify(owned));

  render();
};

/**
 * Export the owned trophies to a JSON file
 */
const exportTrophies = () => {
  const owned = bvsTrophies.owned;
  const data = JSON.stringify(owned);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "owned_trophies.json";
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Import the owned trophies from a JSON file
 */
bvsTrophies.elements.dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  bvsTrophies.elements.dropArea.style.backgroundColor = "#6272a490";
});

bvsTrophies.elements.dropArea.addEventListener("dragleave", () => {
  bvsTrophies.elements.dropArea.style.backgroundColor = "#6272a420";
});

bvsTrophies.elements.dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  bvsTrophies.elements.dropArea.style.backgroundColor = "#6272a420";

  const file = e.dataTransfer.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    const content = event.target.result;

    if (file.name.endsWith(".json")) {
      try {
        const json = JSON.parse(content);
        // Check if the JSON is a valid trophy list. It should be an array of indices.
        if (
          Array.isArray(json) &&
          json.every((index) => typeof index === "number" && index >= 0 && index < bvsTrophies.trophies.length)
        ) {
          // Update the owned trophy array and store it in localStorage
          bvsTrophies.owned = json;
          localStorage.setItem("ownedTrophies", JSON.stringify(bvsTrophies.owned));
          console.info("Imported JSON:", json);
          render();
          console.info("Trophy content updated successfully.");
        } else {
          console.error("Invalid trophy list.");
        }
      } catch (err) {
        console.error("Invalid JSON file.");
      }
    } else {
      console.error("Unsupported file type.");
    }
  };

  reader.readAsText(file);
});

bvsTrophies.elements.dropArea.title = "Drop a JSON file here to import your trophies.\nPlease note that this will overwrite the currently saved trophy progress.";
