import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await apiFetch("/departments");
        if (active) {
          setDepartments(Array.isArray(data) ? data : []);
        }
      } catch {
        if (active) {
          setDepartments([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return { departments, loading };
}
