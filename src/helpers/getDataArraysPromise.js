import { csv } from "d3-fetch";

import { base } from "../constants";

export const getDataArraysPromise = (dataFiles) => {
  return Promise.all(dataFiles.map(({ web_path }) => csv(base + web_path)));
};
