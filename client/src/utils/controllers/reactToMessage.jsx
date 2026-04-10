import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import axios from "../apis/axios";

const reactToMessage = () => {
  const queryClient = useQueryClient();

  const reactFn = async ({ messageId, reaction, userId, receiverId }) => {
    const { data } = await axios.put(`/messages/${messageId}/reaction`, { reaction, userId, receiverId });
    return data;
  };

  return useMutation({
    mutationFn: reactFn,
    onMutate: async ({ messageId, reaction, userId, connectionId }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", connectionId] });

      const previousMessages = queryClient.getQueryData(["messages", connectionId]);

      queryClient.setQueryData(["messages", connectionId], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((msg) => {
          if (msg.id === messageId) {
            const newReactions = { ...(msg.reactions || {}) };
            // Toggle logic
            if (newReactions[userId] === reaction) {
              delete newReactions[userId];
            } else {
              newReactions[userId] = reaction;
            }
            return { ...msg, reactions: newReactions };
          }
          return msg;
        });
      });

      return { previousMessages, connectionId };
    },
    onError: (err, newVariables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", context.connectionId], context.previousMessages);
      }
      console.error(err?.response?.data?.stack || err.stack);
      toast.error(err?.response?.data?.message || "Failed to add reaction.");
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["messages", context.connectionId] });
    },
  });
};

export default reactToMessage;
