"use client";

import { EmojiPicker as EmojiPickerPrimitive } from "frimousse";
import { LoaderIcon, SearchIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";

function EmojiPicker({
  className,
  ...props
}) {
  return (
    <EmojiPickerPrimitive.Root
      className={cn(
        "bg-primary-black text-primary-white isolate flex h-full w-fit flex-col overflow-hidden rounded-md",
        className
      )}
      data-slot="emoji-picker"
      {...props}
    />
  );
}

function EmojiPickerSearch({
  className,
  ...props
}) {
  return (
    <div
      className={cn("px-3 pt-3 pb-2 border-b border-primary-white/10", className)}
      data-slot="emoji-picker-search-wrapper"
    >
      <div className="flex items-center gap-2 rounded-md bg-white/5 px-2.5 transition-colors focus-within:bg-white/5">
        <SearchIcon className="size-4 shrink-0 opacity-50 text-primary-white" />
        <EmojiPickerPrimitive.Search
          className="outline-none placeholder:text-primary-white/50 flex h-9 w-full bg-transparent py-2 text-[0.85rem] disabled:cursor-not-allowed disabled:opacity-50 text-primary-white border-none"
          data-slot="emoji-picker-search"
          {...props}
        />
      </div>
    </div>
  );
}

function EmojiPickerRow({ children, ...props }) {
  return (
    <div {...props} className="scroll-my-1 px-1 flex gap-0.5" data-slot="emoji-picker-row">
      {children}
    </div>
  );
}

function EmojiPickerEmoji({
  emoji,
  className,
  ...props
}) {
  return (
    <button
      {...props}
      className={cn(
        "data-[active]:bg-white/10 flex size-8 hover:bg-white/10 items-center justify-center rounded-sm text-base transition-colors",
        className
      )}
      data-slot="emoji-picker-emoji"
    >
      {emoji.emoji}
    </button>
  );
}

function EmojiPickerCategoryHeader({
  category,
  ...props
}) {
  return (
    <div
      {...props}
      className="bg-primary-black/95 backdrop-blur text-primary-white/80 font-bold uppercase z-10 px-3 pb-2 pt-3.5 text-[0.7rem] leading-none sticky top-0"
      data-slot="emoji-picker-category-header"
    >
      {category.label}
    </div>
  );
}

function EmojiPickerContent({
  className,
  ...props
}) {
  return (
    <EmojiPickerPrimitive.Viewport
      className={cn("outline-hidden relative flex-1 custom-scrollbar overflow-y-auto", className)}
      data-slot="emoji-picker-viewport"
      {...props}
    >
      <EmojiPickerPrimitive.Loading
        className="absolute inset-0 flex items-center justify-center text-primary-white/50"
        data-slot="emoji-picker-loading"
      >
        <LoaderIcon className="size-4 animate-spin" />
      </EmojiPickerPrimitive.Loading>
      <EmojiPickerPrimitive.Empty
        className="absolute inset-0 flex items-center justify-center text-primary-white/50 text-sm"
        data-slot="emoji-picker-empty"
      >
        No emoji found.
      </EmojiPickerPrimitive.Empty>
      <EmojiPickerPrimitive.List
        className="select-none pb-1"
        components={{
          Row: EmojiPickerRow,
          Emoji: EmojiPickerEmoji,
          CategoryHeader: EmojiPickerCategoryHeader,
        }}
        data-slot="emoji-picker-list"
      />
    </EmojiPickerPrimitive.Viewport>
  );
}

function EmojiPickerFooter({
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "max-w-[var(--frimousse-viewport-width)] flex w-full min-w-0 items-center gap-1 border-t border-primary-white/10 p-2",
        className
      )}
      data-slot="emoji-picker-footer"
      {...props}
    >
      <EmojiPickerPrimitive.ActiveEmoji>
        {({ emoji }) =>
          emoji ? (
            <>
              <div className="flex size-7 flex-none items-center justify-center text-[1.2rem]">
                {emoji.emoji}
              </div>
              <span className="text-primary-white truncate text-[0.7rem]">
                {emoji.label}
              </span>
            </>
          ) : (
            <span className="text-primary-white/50 ml-1.5 flex h-7 items-center truncate text-[0.7rem]">
              Select an emoji...
            </span>
          )
        }
      </EmojiPickerPrimitive.ActiveEmoji>
    </div>
  );
}

export {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
  EmojiPickerFooter,
};
