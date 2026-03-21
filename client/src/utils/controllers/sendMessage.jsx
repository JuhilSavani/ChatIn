import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import axios from "../apis/axios";

const sendMessage = () => {
  const queryClient = useQueryClient();

  const sendFn = async (messageData) => {
    const { data } = await axios.post(`/messages/send`, messageData);
    return data;
  };

  return useMutation({
    mutationFn: sendFn,
    onSuccess: (newMessage, { connectionId }) => {
      queryClient.setQueryData(["messages", connectionId], (currentMessages = []) => {
        if (!Array.isArray(currentMessages)) return [newMessage];
        if (currentMessages.some((message) => message.id === newMessage.id)) return currentMessages;

        return [...currentMessages, newMessage];
      });
    },
    onError: (err) => {
      console.error(err?.response?.data?.stack || err.stack);
      toast.error(err?.response?.data?.message || err.message);
    },
  });
};

export default sendMessage;
