import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import axios from "../apis/axios";

const addContact = () => {
  const queryClient = useQueryClient();

  const addFn = async (connectionData) => await axios.post(`/connections/create`, connectionData);

  return useMutation({
    mutationFn: addFn,
    onSuccess: () => {
      queryClient.invalidateQueries(["connections"]);
      toast.success("Contact added successfully!");
    },
    onError: (err) => {
      console.error(err?.response?.data?.stack || err.stack);
      toast.error(err?.response?.data?.message || err.message);
    },
  });
};

export default addContact;