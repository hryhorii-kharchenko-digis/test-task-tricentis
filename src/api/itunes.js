import { itunesEndpointUrl } from "../constants/endpoints";

export function fetchAlbums(searchTerm = "") {
  return fetch(`${itunesEndpointUrl}${searchTerm}`)
    .then(function handleResponse(response) {
      if (!response.ok) throw Error("Request not successful");

      return response.json();
    })
    .then(function handleData(data) {
      if (data?.results?.length > 0) {
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
    });
}
