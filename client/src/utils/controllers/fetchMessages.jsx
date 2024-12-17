import { useQuery } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import axios from "../apis/axios";

const fetchMessages = (connectionId) =>{
  const fetchFn = async () => {
    const { data } = await axios.get(`/messages/${connectionId}`);
    return data;
  };

  const fetchQuery = useQuery({
    queryKey: ["messages", connectionId],
    queryFn: fetchFn,
    enabled: Boolean(connectionId),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30,
    cacheTime: 1000 * 60 * 60,
    onError: (err) => {
      console.error(err?.response?.data?.stack || err.stack);
      toast.error(err?.response?.data?.message || err.message);
    },
  });

  return fetchQuery;
}

export default fetchMessages;