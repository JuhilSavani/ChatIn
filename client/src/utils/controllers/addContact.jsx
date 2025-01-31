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
    },
  });
};

export default addContact;