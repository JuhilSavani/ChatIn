import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import axios from "../apis/axios";
import { useEffect } from "react";

// Module-level queue for offline messages
const offlineQueue = [];

const sendMessage = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = async () => {
      if (offlineQueue.length === 0) return;
      toast.info("Internet restored. Sending queued messages...");
      
      const messagesToSend = [...offlineQueue];
      offlineQueue.length = 0; // Clear the queue immediately
      
      for (const msg of messagesToSend) {
        try {
          const { data: newMessage } = await axios.post(`/messages/send`, msg);
          
          // Update the cache with the real message from the server
          queryClient.setQueryData(["messages", msg.connectionId], (currentMessages = []) => {
            if (!Array.isArray(currentMessages)) return [newMessage];
            // Remove the temporary optimistic message
            const filtered = currentMessages.filter(m => m.id !== msg._tempId);
            if (filtered.some((message) => message.id === newMessage.id)) return filtered;
            return [...filtered, newMessage];
          });
        } catch (error) {
          console.error("Failed to send offline message", error);
        }
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [queryClient]);

  const sendFn = async (messageData) => {
    // Capture the exact time the user hits "Send"
    if (!messageData.timestamp) {
      messageData.timestamp = new Date().toISOString();
    }

    try {
      if (!navigator.onLine) {
        throw new Error("OFFLINE");
      }
      const { data } = await axios.post(`/messages/send`, messageData);
      return data;
    } catch (err) {
      if (!navigator.onLine || err.message === "OFFLINE" || err.code === "ERR_NETWORK") {
        // Generate a temporary ID for optimistic UI update
        messageData._tempId = `temp-${Date.now()}`;
        offlineQueue.push(messageData);
        throw new Error("OFFLINE_QUEUED");
      }
      throw err;
    }
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
    onError: (err, variables) => {
      if (err.message === "OFFLINE_QUEUED") {
        toast.info("You are offline. Message queued and will be sent when internet returns.");
        
        // Optimistically update the UI so the sender sees their message immediately
        const tempMessage = {
          id: variables._tempId,
          connectionId: variables.connectionId,
          content: variables.content,
          timestamp: variables.timestamp,
          attachments: variables.attachments || [],
          reactions: {},
          sender: { 
            id: variables.senderId,
            email: "Pending..." 
          },
          isPending: true // Optional flag if the UI wants to style it differently
        };

        queryClient.setQueryData(["messages", variables.connectionId], (currentMessages = []) => {
          if (!Array.isArray(currentMessages)) return [tempMessage];
          return [...currentMessages, tempMessage];
        });
        
        return;
      }
      console.error(err?.response?.data?.stack || err.stack);
      toast.error(err?.response?.data?.message || err.message);
    },
  });
};

export default sendMessage;
