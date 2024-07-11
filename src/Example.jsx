import { csv } from "d3-fetch";

import { usePromise } from "./hooks/usePromise";

const url = "Data/_fileList.csv";

const promise = csv(url);

export function Example() {
  const data = usePromise(promise);

  console.log(data);

  return <>{data.length === 0 ? "Loading..." : JSON.stringify(data)}</>;
}
