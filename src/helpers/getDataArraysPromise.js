import { csv } from "d3-fetch";

export const getDataArraysPromise = (dataFiles) => {
  return Promise.all(dataFiles.map(({ web_path }) => csv(web_path)));
};
