'use client'
import React, { useState, KeyboardEvent } from "react";
import { TextField, Chip, Box, Paper, Typography } from "@mui/material";


interface TagsInputProps {
  limit?: number;
  onTagsChange: (tags: string[]) => void;
  onDeleteTag: (tag: string) => void;
  tags: string[]
}

const TagsInput: React.FC<TagsInputProps> = ({ onTagsChange, onDeleteTag, tags,  limit = 20 }) => {
  const [inputValue, setInputValue] = useState<string>("");

  // Handle Enter key press to add tag
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if(event.key === "Enter" && tags.length >= limit ){
        event.preventDefault();
    }
    if (event.key === "Enter" && inputValue.trim() && tags.length < limit) {
      event.preventDefault();
      const trimmedValue = inputValue.trim();
      if (!tags.includes(trimmedValue)) {
        const _tags = [...tags, trimmedValue]
        onTagsChange(_tags)
      }
      setInputValue("");
    }
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Handle tag deletion
  const handleDelete = (tag: string) => () => {
    onDeleteTag(tag)
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        component="form"
        sx={{
          p: 1,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
          minHeight: 56,
          border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          borderRadius: 1,
        }}
      >
        {/* Render existing tags */}
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={handleDelete(tag)}
            sx={{ m: 0.5 }}
          />
        ))}

        {/* Input field for new tags */}
        <TextField
          fullWidth
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            tags.length === 0 ? "Type a tag and press Enter" : "Add another tag"
          }
          variant="standard"
          focused
          autoFocus
          slotProps={{
            input: {
              disableUnderline: true,
            },
          }}
          sx={{
            flex: 1,
            minWidth: 120,
            "& .MuiInputBase-input": {
              p: 1,
            },
          }}
        />
      </Box>
      {/* Tag counter */}
      <Typography
        variant="caption"
        color={tags.length >= limit ? "error" : "text.secondary"}
        sx={{ mt: 1, display: "block", position: "absolute", right: 0 }}
      >
        {tags.length}/{limit}
      </Typography>
    </Box>
  );
};

export default TagsInput;
