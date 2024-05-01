import React from "react";
import { createRoot } from "react-dom/client";

function goToPage() {
  // take them back home! WEST VIRGINIA!
  location.href = "../"; 
}

async function handleDelete(filmId) {
  try {
    const deleteResponse = await fetch(`/api/v1/film/${filmId}`, {
      method: "DELETE",
    });
    if (deleteResponse.ok) {
      console.log('Film deleted successfully!');
      goToPage(); // Take me homeeeeeeeee To the placeeeeee I belong!!!!! West Virginia!!!!!
    } else {
      console.error("Error deleting film:", deleteResponse.statusText);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
async function main() {
 
  // get the ID:
  let url = window.location.pathname
  const urlParts = url.split("/");
  const id = urlParts[2];
  let film = null;

  // get the film
  try{
  const filmsResponse = await fetch('/api/v1/film/' + id);
  film = await filmsResponse.json();
  console.log(film);
  }
  catch(err){
    console.log(err);
    return
  }

  // create the film view
  const rootElt = document.getElementById("app");
  const root = createRoot(rootElt);
  root.render(
    <div>
      <h1>{film.title}</h1>
      <li>Description: {film.description}</li>
      <li>ID: {film.id}</li>
      <button id="return-button" onClick={goToPage}>Return to Films</button>
      <button id="delete-button" onClick={() => handleDelete(film.id)}>Delete Entry</button>
    </div>
  );
}

window.onload=main
