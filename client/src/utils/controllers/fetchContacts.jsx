import { useQuery } from "@tanstack/react-query";
import axios from "../apis/axios";
import useAuth from "../hooks/useAuth";

const fetchContacts = () => {
  const { user } = useAuth();

  const fetchFn = async () => {
    const { data } = await axios.get(`/connections/${user.id}`);
    return data;
  }

  const fetchQuery = useQuery({
    queryKey: ["connections", user?.id],
    queryFn: fetchFn,
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 30,
    cacheTime: 1000 * 60 * 60,
    onError: (err) => {
      console.error(err?.response?.data?.stack || err.stack);
      alert(err?.response?.data?.message || err.message);
    },
  });

  return fetchQuery;
};

export default fetchContacts;
