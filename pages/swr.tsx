import axios from "axios";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then(d => d.data);
const SwrPage = () => {
  const [id, setId] = useState(1);
  const { mutate, data } = useSWR(`https://swapi.dev/api/people/${id}`, fetcher);

  return <div>
    <button onClick={() => {
      setId(id => id + 1);
      mutate("null", {
        revalidate: false,
        optimisticData: "hello its me, luke skywalker!"
      })
    }}>
      revalidate!
    </button>
    {JSON.stringify(data, null, 2)}</div>;
};

export default SwrPage;
