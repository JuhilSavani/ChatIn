import React, { useEffect, useRef, useState, useCallback } from "react";
import useAuth from "../utils/hooks/useAuth";
import fetchMessages from "../utils/controllers/fetchMessages";
import sendMessage from "../utils/controllers/sendMessage";
import reactToMessage from "../utils/controllers/reactToMessage";
import { uploadChatMedia } from "../utils/actions/upload.actions";
import { toast } from "react-toastify";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { EmojiPicker, EmojiPickerSearch, EmojiPickerContent, EmojiPickerFooter } from "./ui/emoji-picker";

const ChatPanel = ({ contact, onBack }) => {
  const { connectionId, connectedUser } = contact;
  const { user } = useAuth();

  const [pendingMessages, setPendingMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const messageRef = useRef(null);
  const chatAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data, isLoading, isError, error } = fetchMessages(connectionId);
  const { mutateAsync: sendMsgAsync } = sendMessage();
  const { mutate: reactToMessageMutate } = reactToMessage();

  const [activeEmojiPickerId, setActiveEmojiPickerId] = useState(null);

  const handleReactToMessage = useCallback((messageId, reaction) => {
    reactToMessageMutate({
      messageId,
      reaction,
      userId: user.id,
      connectionId,
      receiverId: connectedUser.id,
    });
    setActiveEmojiPickerId(null);
  }, [reactToMessageMutate, user.id, connectionId, connectedUser.id]);

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Helper to compare dates
  const isToday = (date) => {
    const today = new Date();
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      yesterday.getDate() === date.getDate() &&
      yesterday.getMonth() === date.getMonth() &&
      yesterday.getFullYear() === date.getFullYear()
    );
  };

  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    return (
      isToday(messageDate) ? "Today" :
      (isYesterday(messageDate) ? "Yesterday" :  
      dateFormatter.format(messageDate))
    );
  };

  const buildMessageGroups = (messagesList) => messagesList.reduce((groupedMessages, msg) => {
    const date = formatTimestamp(msg.timestamp);
    if (!groupedMessages[date]) groupedMessages[date] = [];
    groupedMessages[date].push(msg);
    return groupedMessages;
  }, {});

  const createPendingMessage = (content, attachments = []) => ({
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    content,
    timestamp: new Date().toISOString(),
    sender: { id: user.id },
    isPending: true,
    attachments,
  });

  const displayedMessages = [...(Array.isArray(data) ? data : []), ...pendingMessages]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const groupedMessages = buildMessageGroups(displayedMessages);

  useEffect(() => {
    setPendingMessages([]);
    setInputText("");
    setSelectedFiles([]);

    if (messageRef.current) {
      messageRef.current.style.height = "auto";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [connectionId]);


  const processFiles = useCallback((files) => {
    if (!files.length) return;

    const newFiles = files.map((file) => ({
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));

    setSelectedFiles((current) => [...current, ...newFiles]);
  }, []);

  const handleFileSelect = useCallback((e) => {
    processFiles(Array.from(e.target.files));
    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [processFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the actual container (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [processFiles]);

  const removeFile = useCallback((fileId) => {
    setSelectedFiles((current) => {
      const fileToRemove = current.find((f) => f.id === fileId);
      if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);
      return current.filter((f) => f.id !== fileId);
    });
  }, []);

  const clearAllFiles = useCallback(() => {
    setSelectedFiles((current) => {
      current.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return "bx bx-image";
    if (type.startsWith("video/")) return "bx bx-video";
    if (type.startsWith("audio/")) return "bx bx-music";
    if (type.includes("pdf")) return "bx bx-file";
    if (type.includes("zip") || type.includes("rar") || type.includes("tar")) return "bx bx-archive";
    return "bx bx-file-blank";
  };

  const previousDataLengthRef = useRef(0);
  const previousConnectionIdRef = useRef(connectionId);

  // Auto-scroll when switching contacts, receiving new messages, or sending pending ones
  useEffect(() => {
    if (chatAreaRef.current) {
      const currentDataLength = Array.isArray(data) ? data.length : 0;
      const isNewConnection = previousConnectionIdRef.current !== connectionId;
      const hasAddedNewMessage = currentDataLength > previousDataLengthRef.current;
      
      if (isNewConnection || hasAddedNewMessage || pendingMessages.length > 0) {
         chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
      }
      
      previousDataLengthRef.current = currentDataLength;
      previousConnectionIdRef.current = connectionId;
    }
  }, [data, pendingMessages, connectionId]);

  const handleSendMessage = () => {
    const messageContent = inputText.trim();
    if (!messageContent && !selectedFiles.length) return;

    const newPendingMessages = [];
    const hasFiles = selectedFiles.length > 0;
    
    // Snap files for upload so we can clear UI immediately
    const filesToUpload = [...selectedFiles];

    if (hasFiles) {
      // Create a separate message bubble for each file sent
      filesToUpload.forEach((f, idx) => {
        const attachment = [{
          id: f.id,
          name: f.name,
          resourceType: f.type.startsWith("image/") ? "image" : "raw",
          secureUrl: f.preview || null,
        }];
        // Only attach text caption to the first file's bubble
        const text = idx === 0 ? (messageContent || null) : null;
        newPendingMessages.push(createPendingMessage(text, attachment));
      });
    } else {
      newPendingMessages.push(createPendingMessage(messageContent, []));
    }

    setPendingMessages((currentMessages) => [...currentMessages, ...newPendingMessages]);
    setInputText("");
    
    if (hasFiles) {
      // We don't call clearAllFiles() here because it revokes 
      // the object URLs that our optimistic UI preview needs.
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

    if (messageRef.current) {
      messageRef.current.style.height = "auto";
    }

    const processBackendCalls = async () => {
      try {
        if (!hasFiles) {
          const messageData = {
            connectionId,
            senderId: user.id,
            recieverId: connectedUser.id,
            content: messageContent || null,
            attachments: null,
          };
          await sendMsgAsync(messageData);
          setPendingMessages((currentMessages) =>
            currentMessages.filter((message) => message.id !== newPendingMessages[0].id)
          );
          return;
        }

        // We have files. Process each independently.
        for (let i = 0; i < filesToUpload.length; i++) {
          const f = filesToUpload[i];
          const pendingMsg = newPendingMessages[i];
          
          try {
            const uploadResult = await uploadChatMedia(f.file);
            const attachments = [{
              publicId: uploadResult.public_id,
              secureUrl: uploadResult.secure_url,
              resourceType: uploadResult.resource_type,
              name: f.name, // Use original browser filename to preserve the exact extension
            }];

            const text = i === 0 ? (messageContent || null) : null;
            const messageData = {
              connectionId,
              senderId: user.id,
              recieverId: connectedUser.id,
              content: text,
              attachments: attachments,
            };

            await sendMsgAsync(messageData);
            
            // Clean up preview object URL since upload completed
            if (f.preview) URL.revokeObjectURL(f.preview);

            setPendingMessages((currentMessages) =>
              currentMessages.filter((message) => message.id !== pendingMsg.id)
            );
          } catch (err) {
            console.error("Failed to upload/send file message:", err);
            toast.error(`Failed to send file: ${f.name}`);
            setPendingMessages((currentMessages) =>
              currentMessages.filter((message) => message.id !== pendingMsg.id)
            );
            // Optionally could restore input text if it's the first message that failed
            if (i === 0 && messageContent) {
              setInputText((currentInput) => currentInput.trim() ? currentInput : messageContent);
            }
          }
        }
      } catch (err) {
        console.error("Failed to send message:", err);
        setPendingMessages((currentMessages) =>
          currentMessages.filter((message) => !newPendingMessages.find(pm => pm.id === message.id))
        );
        setInputText((currentInput) => currentInput.trim() ? currentInput : messageContent);
      }
    };

    void processBackendCalls();
  };

  const handleKeyDown = (e) => {
    // Check if the user is on a mobile device
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    // On desktop, Enter sends the message (without shift).
    // On mobile, Enter creates a new line since shift is not typically used.
    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`relative flex flex-col flex-1 h-full min-h-0 w-full bg-primary-white rounded-md border-2 border-[#101010]/75 border-b-[5px] transition-colors duration-200 ${isDragging ? "bg-bisque/20" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Full-panel drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-20 flex items-center justify-center border-2 border-dashed border-primary-black/50 bg-bisque/30 pointer-events-none">
          <span className="flex items-center gap-2 text-[0.95rem] font-semibold text-primary-black/70">
            <i className="bx bx-cloud-upload text-[1.5rem]"></i>
            Drop files here
          </span>
        </div>
      )}
      <section className="flex-shrink-0 w-full bg-secondary-white p-3 sm:p-4 flex items-center gap-3 sm:gap-4 rounded-t-[4px] border-b border-primary-black/25">
        <div className="flex items-center gap-0.5 sm:gap-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to contacts"
              className="inline-flex items-center justify-center p-0 text-primary-black/70 transition-all duration-200 hover:-translate-x-0.5 hover:text-primary-black focus:outline-none active:-translate-x-1 lg:hidden"
            >
              <i className="bx bxs-chevron-left text-[1.875rem]"></i>
            </button>
          )}
          {onBack && <span aria-hidden="true" className="h-10 w-[3px] bg-primary-black ml-1 mr-2 lg:hidden"></span>}
          {connectedUser.profilePicUrl ? (
            <img
              className="h-11 w-11 rounded-full object-cover border-2 border-primary-black sm:h-[49px] sm:w-[49px]"
              src={connectedUser.profilePicUrl}
              alt={connectedUser.name}
            />
          ) : (
            <i className="bx bx-user-circle text-[2.75rem] sm:text-[3.125rem]"></i>
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-[6px]">
          <h2 className="m-0 truncate p-0 text-[1rem] font-bold leading-none sm:text-[1.15rem]">{connectedUser.name}</h2>
          <span className="m-0 truncate p-0 text-[0.8rem] leading-none sm:text-[0.85rem]">{connectedUser.email}</span>
        </div>
      </section>
      <section className="flex-1 w-full min-h-0 overflow-y-auto px-2 sm:px-3" ref={chatAreaRef}>
        {isLoading && <p className="block border-2 border-dashed border-primary-black p-4 text-center my-4 mx-auto w-[92%] sm:w-[80%]"><strong>Loading messages...</strong></p>}
        {isError && <p className="block border-2 border-dashed border-primary-black p-4 text-center my-4 mx-auto w-[92%] sm:w-[80%]"><strong>Error: </strong>{error.message}</p>}
        {!isLoading && !isError && !Boolean(displayedMessages.length) && <p className="block border-2 border-dashed border-primary-black p-4 text-center my-4 mx-auto w-[92%] sm:w-[80%]"><strong>No messages yet!</strong></p>}
        {!isLoading && !isError && Boolean(displayedMessages.length) &&
          Object.entries(groupedMessages).map(([date, groupedDateMessages], index, groupedEntries) => (
            <div key={date} className={index !== groupedEntries.length - 1 ? "pb-2 border-b border-primary-black" : ""}>
              <span className="bg-bisque border-2 border-[#101010]/75 p-2 rounded block my-4 mx-auto text-center w-fit min-w-[120px] sm:min-w-[150px]">{date}</span>
              {groupedDateMessages.map((msg) => (
                <div key={msg.id} className={`group flex flex-col my-2 w-full ${msg.sender.id === user.id ? "items-end" : "items-start"}`}>
                  <div className={`relative flex ${msg.sender.id === user.id ? "flex-row-reverse" : "flex-row"} max-w-[85%] sm:max-w-[72%] lg:max-w-[45%]`}>
                    <div className={`flex flex-col border-2 border-[#101010]/75 px-2 pt-2 pb-[2px] w-full ${msg.sender.id === user.id ? "bg-green items-end rounded-[6px_0_6px_6px]" : "bg-beige items-start rounded-[0_6px_6px_6px]"}`}>
                      {msg.attachments?.length > 0 && (
                      <div className="flex flex-col gap-1.5 mb-1 mt-0.5 w-full">
                        {msg.attachments.map((att, idx) =>
                          att.resourceType === "image" ? (
                            <div key={idx} className="relative w-full bg-black/5 rounded-[4px] overflow-hidden border border-[#101010]/20">
                              <img
                                src={att.secureUrl}
                                alt={att.name}
                                className="w-full object-cover cursor-pointer max-h-[260px]"
                                onClick={() => att.secureUrl && window.open(att.secureUrl, "_blank")}
                              />
                            </div>
                          ) : (
                            <a
                              key={idx}
                              href={att.secureUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center w-full min-w-[200px] max-w-full gap-2.5 p-2 bg-primary-white border border-[#101010]/25 rounded hover:bg-bisque transition-colors"
                            >
                              <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 border border-[#101010]/15 rounded bg-black/5 text-primary-black/70">
                                <i className="bx bxs-file-blank text-[1.4rem]"></i>
                              </div>
                              <div className="flex flex-col min-w-0 pr-1">
                                <span className="truncate text-[0.85rem] font-[550] text-primary-black leading-tight">{att.name}</span>
                                <span className="text-[0.65rem] text-primary-black/60 uppercase mt-[2px] font-medium">{att.name.lastIndexOf('.') !== -1 ? att.name.split('.').pop() : 'FILE'} • Document</span>
                              </div>
                            </a>
                          )
                        )}
                      </div>
                    )}
                    {msg.content && <span className={`break-words min-w-0 w-full block text-[0.95rem] leading-relaxed mx-0.5 mt-0.5 ${msg.sender.id === user.id ? "text-right" : "text-left"}`}>{msg.content}</span>}
                    {msg.isPending ? (
                      <span className="chatin-loading-badge">
                        <i className="bx bx-loader-alt chatin-loading-spinner text-[0.9rem]"></i>
                        Sending...
                      </span>
                    ) : (
                      <div className={`flex items-center gap-1 mt-1 ${msg.sender.id === user.id ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="flex-shrink-0 bg-primary-white text-[0.65rem] p-[2px] rounded-[3px] border border-primary-black/25 leading-none opacity-90">{timeFormatter.format(new Date(msg.timestamp))}</span>
                        
                        {/* Reactions Display Inline */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className={`flex items-center gap-1 leading-none ${msg.sender.id === user.id ? "flex-row-reverse" : "flex-row"}`}>
                            {Object.values(msg.reactions).map((emoji, index) => (
                              <button
                                key={`${emoji}-${index}`}
                                onClick={() => {
                                  if (msg.sender.id !== user.id) handleReactToMessage(msg.id, emoji);
                                }}
                                disabled={msg.sender.id === user.id}
                                className={`text-[1.15rem] leading-none transition-transform ${
                                  msg.sender.id !== user.id ? "cursor-pointer" : "cursor-default drop-shadow-sm"
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Emoji Picker Trigger & Menu */}
                        <div className={`flex-shrink-0 relative transition-opacity duration-200 ${msg.sender.id !== user.id ? `opacity-0 group-hover:opacity-100 ${activeEmojiPickerId === msg.id ? "opacity-100" : ""}` : "invisible"}`}>
                          <Popover
                            open={activeEmojiPickerId === msg.id}
                            onOpenChange={(open) => msg.sender.id !== user.id && setActiveEmojiPickerId(open ? msg.id : null)}
                          >
                            <PopoverTrigger asChild>
                              <button
                                disabled={msg.sender.id === user.id}
                                className="text-primary-black/60 hover:text-primary-black text-[1.1rem] transition-colors cursor-pointer flex items-center justify-center p-0.5 rounded-full hover:bg-black/5"
                              >
                                <i className="bx bx-smile"></i>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent 
                              className="w-[300px] p-0 shadow-lg border-none bg-primary-black" 
                              align={msg.sender.id === user.id ? "end" : "start"} 
                              sideOffset={8}
                            >
                              <EmojiPicker 
                                className="h-[312px] w-full border-none outline-none" 
                                onEmojiSelect={({ emoji }) => {
                                  handleReactToMessage(msg.id, emoji);
                                  setActiveEmojiPickerId(null);
                                }}
                              >
                                <EmojiPickerSearch />
                                <EmojiPickerContent />
                                <EmojiPickerFooter />
                              </EmojiPicker>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
        ))}
      </section>
      <section
        className="flex-shrink-0 w-full bg-secondary-white p-3 sm:p-4 flex flex-col border-t border-primary-black/25 rounded-b-[min(1rem,2vw)]"
      >
        {selectedFiles.length > 0 && (
          <div className="mb-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-[0.8rem] font-[450] opacity-70">
                <i className="bx bx-paperclip text-sm"></i>
                {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={clearAllFiles}
                className="bg-transparent border-none font-inherit text-[0.75rem] font-[450] text-primary-black opacity-50 cursor-pointer py-0.5 px-1.5 rounded transition-all duration-150 hover:opacity-100 hover:bg-[#F75A5A]/20 hover:text-[#F75A5A]"
                aria-label="Clear all files"
              >
                Clear all
              </button>
            </div>
            <div className="file-preview-scrollable flex gap-2 overflow-x-auto pt-2 pr-2 -mt-2 -mr-2 pb-1">
              {selectedFiles.map((f) => (
                <div key={f.id} className="group relative shrink-0 flex flex-col items-center w-[90px] p-1.5 bg-primary-white border-2 border-[#101010]/75 rounded-lg animate-[file-slide-in_0.2s_ease-out] transition-[border-color] duration-150 hover:border-primary-black">
                  <button
                    type="button"
                    onClick={() => removeFile(f.id)}
                    className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-5 h-5 p-0 bg-primary-black text-primary-white border-2 border-primary-white rounded-full text-[0.9rem] cursor-pointer opacity-0 scale-[0.8] transition-all duration-150 z-[2] group-hover:opacity-100 group-hover:scale-100 hover:!bg-[#c44]"
                    aria-label={`Remove ${f.name}`}
                  >
                    <i className="bx bx-x"></i>
                  </button>
                  {f.preview ? (
                    <img src={f.preview} alt={f.name} className="w-full h-[52px] object-cover rounded border border-[#101010]/15" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-[52px] bg-secondary-white rounded text-[1.5rem] text-primary-black opacity-60">
                      <i className={getFileIcon(f.type)}></i>
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-px w-full mt-1 overflow-hidden">
                    <span className="max-w-full text-[0.6rem] font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis" title={f.name}>{f.name}</span>
                    <span className="text-[0.55rem] opacity-50 leading-none">{formatFileSize(f.size)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Input Row */}
        <div className="flex items-end gap-2 sm:gap-3">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            className="hidden"
            id="chat-file-input"
          />
          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-px flex-shrink-0 inline-flex h-[50px] w-[50px] items-center justify-center text-[1.5rem] rounded-md border-2 transition-all duration-200 sm:h-[51.6px] sm:w-[51.6px] bg-primary-white border-[#101010]/75 text-primary-black/70 hover:bg-bisque hover:text-primary-black active:scale-[0.95] cursor-pointer"
            aria-label="Attach files"
          >
            <i className="bx bx-paperclip"></i>
          </button>
          <div className="flex-1 bg-primary-white border-2 border-[#101010]/75 rounded-md focus-within:ring-[3px] focus-within:ring-[#101010]/75 transition-all duration-300 overflow-hidden">
            <textarea
              rows={1}
              value={inputText}
              placeholder="Type a message..."
              ref={messageRef}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              className="block px-4 py-[0.7rem] text-inherit bg-transparent outline-none border-none text-[0.95rem] placeholder:opacity-80 w-full resize-none min-h-[46px] max-h-[140px] leading-relaxed"
            />
          </div>
          <button onClick={handleSendMessage} disabled={!inputText.trim() && !selectedFiles.length} className={`mb-px flex-shrink-0 inline-flex h-[50px] w-[50px] items-center justify-center text-[1.5rem] rounded-md border-2 transition-all duration-200 sm:h-[51.6px] sm:w-[51.6px] ${(inputText.trim() || selectedFiles.length) ? "bg-primary-black border-primary-black text-primary-white hover:bg-secondary-black active:scale-[0.95] cursor-pointer" : "bg-primary-black/10 border-transparent text-primary-black/50 cursor-not-allowed"}`} >
            <i className="bx bx-up-arrow-alt"></i>
          </button>
        </div>
      </section>
    </div>
  );
};

export default ChatPanel;
