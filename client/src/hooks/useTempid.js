import { useEffect, useState, useCallback } from "react";
import { generateTempId } from "@/services/tempid.services";
import { useAuth } from "@/hooks/useAuth";

export const useTempid = () => {
  const [tempId, setTempId] = useState(null);
  const [tempIdToken, setTempIdToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  /*
    * Fetch a new temporary ID from the server
  */
  const fetchTempId = useCallback(async () => {
    setLoading(true);
    try {
      const data = await generateTempId(token);
      setTempId(data.tempId);
      setTempIdToken(data.token);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* 
  * Automatically fetch a temp ID when the hook is used and token is available
  */
  useEffect(() => {
    if (token) {
      fetchTempId();
    } else {
      console.warn("No admin token available to fetch temp ID.");
    }
  }, [fetchTempId,token]);

  return { tempId, tempIdToken, loading, error, fetchTempId };
}