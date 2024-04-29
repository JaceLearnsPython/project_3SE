import React from "react";
import { createRoot } from "react-dom/client";

async function main() {
  const filmsResponse = await fetch("/api/v1/films");
  const films = await filmsResponse.json();

  const rootElt = document.getElementById("app");
  const root = createRoot(rootElt);
  root.render(
    films.map((film) => (
      <ul>
        <li>
          <FilmEntry
            id={film.id}
            title={film.title}
            description={film.description}
          />
        </li>
      </ul>
    )),
  );
}
function FilmEntry({ id, title, description }) {
  return (
    <p>
      <a href={`/film/${id}`}>{title}</a>: {description}
    </p>
  );
}


window.onload=main
