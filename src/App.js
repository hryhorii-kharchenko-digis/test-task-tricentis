import { useCallback, useEffect, useState } from "react";
import { debounce } from "./utils/general";

import "./App.css";

const defaultAlbums = ["A", "B", "C", "D", "E"];

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const [{ albums, displayList }, setAlbumsState] = useState({
    albums: [...defaultAlbums],
    displayList: [...defaultAlbums],
    albumIndex: 0,
  });

  function updateAlbums(newSearchTerm) {
    fetch(`https://itunes.apple.com/search?term=${newSearchTerm}`)
      .then(function handleResponse(response) {
        if (!response.ok) throw Error("Request not successful");

        return response.json();
      })
      .then(function handleData(data) {
        if (data && data.results && data.results.length > 0) {
          return data.results
            .map(function getAlbumNames(result) {
              return result.collectionName;
            })
            .filter(function isUniqueAndNotEmpty(albumName, index, self) {
              return Boolean(albumName) && self.indexOf(albumName) === index;
            })
            .sort(function isAlphabeticallyBigger(albumNameA, albumNameB) {
              return albumNameA.localeCompare(albumNameB);
            })
            .slice(0, 5);
        }
      })
      .then(function changeAlbums(newAlbums) {
        console.log(newAlbums);

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
              albumIndex:
                uniqueNewAlbums.length === 0 ? prevState.albumIndex : 0,
            };
          });
        }
      })
      .catch(console.log);
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

  const listJsx = displayList.map((elem) => (
    <li className="item" key={elem}>
      {elem}
    </li>
  ));

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
