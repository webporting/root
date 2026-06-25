async function loadData() {
  const response = await fetch("data.json");
  if (!response.ok) {
    throw new Error("couldnt load data.json");
  }
  return response.json();
}
function projectPeople(project, peopleById) {
  return project.people
    .map((id) => {
      const person = peopleById.get(id);
      if (!person) {
        return "";
      }
      return `<a href="#${person.id}" data-person-id="${person.id}">${person.name}</a>`;
    })
    .filter(Boolean)
    .join(", ");
}
function personProjects(personId, projects) {
  return projects.filter((project) => project.people.includes(personId));
}
function renderPersonDetail(detail, person, projects, options = {}) {
  if (!person) {
    detail.hidden = true;
    return;
  }
  const games = personProjects(person.id, projects);
  const links = [
    person.github ? `<a href="${person.github}">github</a>` : "",
    person.site ? `<a href="${person.site}">site</a>` : ""
  ].filter(Boolean);
  const image = person.image
    ? `<img src="${person.image}" alt="${person.name}">`
    : `<div class="person-initial">${person.name.slice(0, 1)}</div>`;
  detail.hidden = false;
  detail.innerHTML = `
    ${options.showBack ? `<button type="button" data-close-profile>close</button>` : ""}
    <div class="person-top">
      ${image}
      <div>
        <h3>${person.name}</h3>
        <p class="muted">${games.length} ports</p>
      </div>
    </div>
    ${person.bio ? `<p class="muted">${person.bio}</p>` : ""}
    ${links.length ? `<p class="person-links">${links.join(" ")}</p>` : "<p class=\"muted\">no links added yet.</p>"}
    <div>
      <h4>ports:</h4>
      <ul>
        ${games.map((game) => `<li>${game.title}</li>`).join("") || "<li>none listed yet.</li>"}
      </ul>
    </div>
  `;
}
function renderPeople(data) {
  const grid = document.querySelector("[data-people]");
  if (!grid) {
    return;
  }
  const visiblePeople = data.people.filter((person) => person.image);
  grid.innerHTML = visiblePeople
    .map((person) => `
      <a class="team-link" href="projects.html#${person.id}">
        <img src="${person.image}" alt="${person.name}">
        <span>${person.name}</span>
      </a>
    `)
    .join("");
}
function renderPersonPage(container, person, projects) {
  if (!container || !person) {
    return;
  }
  const games = personProjects(person.id, projects);
  const links = [
    person.github ? `<a href="${person.github}">github</a>` : "",
    person.site ? `<a href="${person.site}">site</a>` : ""
  ].filter(Boolean);
  const image = person.image
    ? `<img src="${person.image}" alt="${person.name}">`
    : `<div class="person-initial">${person.name.slice(0, 1)}</div>`;
  container.hidden = false;
  container.innerHTML = `
    <a class="back-link" href="projects.html">all projects</a>
    <div class="person-top">
      ${image}
      <div>
        <h2>${person.name}</h2>
        <p class="muted">${games.length} ports</p>
      </div>
    </div>
    ${person.bio ? `<p class="muted">${person.bio}</p>` : ""}
    ${links.length ? `<p class="person-links">${links.join("")}</p>` : ""}
    <h3 class="section-title">ports:</h3>
    <div class="person-port-list">
      ${games.map((game) => {
        const title = game.url
          ? `<a class="project-name" href="${game.url}">${game.title}</a>`
          : `<span class="project-name">${game.title}</span>`;
        return `<article class="person-port-row">${title}</article>`;
      }).join("") || "<p class=\"muted\">none listed yet.</p>"}
    </div>
  `;
}
function renderProjects(data) {
  const list = document.querySelector("[data-projects]");
  if (!list) {
    return;
  }
  const peopleById = new Map(data.people.map((person) => [person.id, person]));
  list.innerHTML = data.projects
    .map((project) => {
      const title = project.url
        ? `<a href="${project.url}" class="project-name">${project.title}</a>`
        : `<span class="project-name">${project.title}</span>`;
      return `
        <article class="project-row">
          ${title}
          <p>${projectPeople(project, peopleById)}</p>
        </article>
      `;
    })
    .join("");
  const layout = document.querySelector(".projects-layout");
  const personPage = document.querySelector("[data-person-page]");
  const hero = document.querySelector("[data-projects-hero]");
  function showProjects() {
    if (hero) {
      hero.hidden = false;
    }
    if (personPage) {
      personPage.hidden = true;
      personPage.innerHTML = "";
    }
    if (layout) {
      layout.hidden = false;
    }
  }
  function showHashPerson() {
    const id = decodeURIComponent(window.location.hash.replace("#", "")).toLowerCase();
    const person = data.people.find((item) => item.id === id);
    if (!id || !person || !personPage) {
      showProjects();
      return;
    }
    if (hero) {
      hero.hidden = true;
    }
    if (layout) {
      layout.hidden = true;
    }
    renderPersonPage(personPage, person, data.projects);
  }
  window.addEventListener("hashchange", showHashPerson);
  showHashPerson();
}
loadData()
  .then((data) => {
    renderPeople(data);
    renderProjects(data);
  })
  .catch((error) => {
    console.error(error);
  });
