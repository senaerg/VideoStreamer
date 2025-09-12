"use client";
import {
  TextField,
} from "@mui/material";
import React, {  } from "react";
import { useNotifications } from "@toolpad/core";

import Checkbox from "@mui/material/Checkbox";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { AppCategory } from "@/types";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;


export default function CategoriesInput({
  categories,
  selectedItems,
  onChange,
}: {
  categories: AppCategory[];
  selectedItems: AppCategory[],
  onChange: (val: AppCategory[]) => void;
}) {
  const notif = useNotifications();

  const handleChange = (val: AppCategory[]) => {
    if (val.length > 3) {
      notif.show("You can select max of 3 categories", {
        severity: "warning",
        autoHideDuration: 3000,
      });
    } else {
      onChange(val);
    }
  };

  return (
    <Autocomplete
      multiple
      id="select-categories"
      fullWidth
      options={categories}
      disableCloseOnSelect
      getOptionLabel={(option) => option.name}
      value={selectedItems}
      onChange={(event, newValue) => handleChange(newValue)}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.name}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Categories"
          placeholder="Select category(s)"
        />
      )}
    />
  );
}
