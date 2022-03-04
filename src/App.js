import { useCallback, useEffect, useMemo, useState } from "react";

import { debounce } from "./utils/general";
import { fetchAlbums } from "./api/itunes";
import { defaultAlbums } from "./constants/itunes";

import "./App.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const [{ albums, displayList }, setAlbumsState] = useState({
    albums: [...defaultAlbums],
    displayList: [...defaultAlbums],
    albumIndex: 0,
  });

  function changeAlbums(newAlbums) {
    if (newAlbums) {
      setAlbumsState((prevState) => {
        const uniqueNewAlbums = newAlbums.filter(function isNotInPrevAlbums(
          album
        ) {
          return !prevState.albums.includes(album);
        });

        return {
          ...prevState,
          albums: [
            ...uniqueNewAlbums,
            ...prevState.albums.slice(uniqueNewAlbums.length),
          ],
          albumIndex: uniqueNewAlbums.length === 0 ? prevState.albumIndex : 0,
        };
      });
    }
  }

  function updateAlbums(newSearchTerm) {
    fetchAlbums(newSearchTerm).then(changeAlbums).catch(console.log);
  }

  const debouncedUpdateAlbums = useCallback(debounce(updateAlbums, 500), []);

  function onSearchTermChange(event) {
    if (event.target.value !== searchTerm) {
      debouncedUpdateAlbums(event.target.value);
      setSearchTerm(event.target.value);
    }
  }

  useEffect(function setupInterval() {
    const intervalId = setInterval(function shiftListElements() {
      setAlbumsState((prevState) => ({
        ...prevState,
        displayList: [
          ...prevState.displayList.slice(1),
          prevState.albums[prevState.albumIndex],
        ],
        albumIndex:
          prevState.albumIndex !== albums.length - 1
            ? prevState.albumIndex + 1
            : 0,
      }));
    }, 1000);

    return function cleanUpInterval() {
      clearInterval(intervalId);
    };
  }, []);

  const listJsx = useMemo(
    () =>
      displayList.map((elem) => (
        <li className="item" key={elem}>
          {elem}
        </li>
      )),
    [displayList]
  );

  return (
    <main className="App">
      <input
        value={searchTerm}
        onChange={onSearchTermChange}
        placeholder="Search band"
        className="input"
      />
      <ul className="list">{listJsx}</ul>
    </main>
  );
}

export default App;
