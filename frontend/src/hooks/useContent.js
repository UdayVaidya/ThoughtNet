import { useState, useEffect, useCallback } from "react";
import { contentAPI } from "../services/api.service.js";
import toast from "react-hot-toast";

export function useContent(params = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contentAPI.getAll(params);
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { 
    fetch(); 
    window.addEventListener('refresh-content', fetch);
    return () => window.removeEventListener('refresh-content', fetch);
  }, [fetch]);
  return { data, setData, loading, total, refetch: fetch };
}

export function useStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const fetch = () => contentAPI.getStats().then(res => setStats(res.data)).catch(() => {});
    fetch();
    window.addEventListener('refresh-content', fetch);
    return () => window.removeEventListener('refresh-content', fetch);
  }, []);
  return stats;
}
