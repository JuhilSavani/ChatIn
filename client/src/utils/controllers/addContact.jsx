import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../apis/axios";

const addContact = () => {
  const queryClient = useQueryClient();

  const addFn = async (connectionData) => await axios.post(`/connections/create`, connectionData);

  const addMutation = useMutation({
    mutationFn: addFn,
    onSuccess: () => {
      queryClient.invalidateQueries(["connections"]);
      console.log("contact added successfully!");
    },
    onError: (err) => {
      console.log(err?.response?.data?.stack || err.stack);
      alert(err?.response?.data?.message || err.message);
    },
  });

  return addMutation;
};

export default addContact;