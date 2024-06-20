import { csv } from "d3-fetch";

import { constants } from ".";

const { fileListUrl: url } = constants;

export const fileListPromise = csv(url);
