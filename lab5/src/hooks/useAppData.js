import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../api/client";
import { hackathons as localHackathons, participants as localParticipants } from "../data/appData";

export default function useAppData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        const apiData = await apiRequest("/api/public-data");
        setData(apiData);
      } catch {
        const base = process.env.PUBLIC_URL ?? '';
        const dataPaths = [
          `${base}/data/appData.json`,
          '/data/appData.json',
          './data/appData.json',
        ];

        let loaded = false;
        for (const path of dataPaths) {
          try {
            const res = await fetch(path);
            if (!res.ok) continue;
            const json = await res.json();
            setData(json);
            loaded = true;
            break;
          } catch {
            // Try next fallback path
          }
        }

        if (!loaded) {
          setData({
            hackathons: localHackathons,
            participants: localParticipants,
          });
        }
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, reload: fetchData };
}
