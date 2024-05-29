import { Cartesian3 } from "cesium";
import { useCallback, useEffect } from "react";
import { useCesium } from "resium";

type Props = {
  url: string;
};

export const Imagery: React.FC<Props> = ({ url }) => {
  const { viewer } = useCesium();
  const fetchData = useCallback(async () => {
    const res = await fetch(url, {
      method: "GET",
    });
    if (res.status !== 200) {
      return;
    }
    const text = await res.text();
    console.log(res);
    console.log(text);
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return null;
};
