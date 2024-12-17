import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import axios from "../apis/axios";

const sendMessage = () => {
  const queryClient = useQueryClient();

  const sendFn = async (messageData) => await axios.post(`/messages/send`, messageData);

  return useMutation({
    mutationFn: sendFn,
    onSuccess: (newMessage, { connectionId }) => {
      queryClient.invalidateQueries(["messages", connectionId]);
      console.log("Message sent successfully! ", newMessage);
    },
    onError: (err) => {
      console.error(err?.response?.data?.stack || err.stack);
      toast.error(err?.response?.data?.message || err.message);
    },
  });
};

export default sendMessage;
