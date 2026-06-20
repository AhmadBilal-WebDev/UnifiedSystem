import { useState, useEffect } from "react";

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("userInfo");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return { user, setUser };
};
