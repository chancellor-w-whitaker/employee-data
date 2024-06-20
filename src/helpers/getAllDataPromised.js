import { csv } from "d3-fetch";

import { constants } from "../constants";

const { urlKey } = constants;

export const getAllDataPromised = (dataFiles) =>
  Promise.all(dataFiles.map(({ [urlKey]: url }) => csv(url)));
