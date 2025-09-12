"use client";
import { Chip } from "@mui/material";
import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useAppContext } from "@/contexts/AppContext";
import debounce from "lodash/debounce";

export default function TopSectionCategories({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const data = [{ id: "", name: "All" }, ...categories];

  const { setCategory } = useAppContext();

  const [value, setValue] = React.useState(0);

  const deboundUpdate = React.useRef(
    debounce((val: number) => {
      console.log("debounced value",data[val]?.id)
      setCategory(val === 0 ? null : data[val]?.id);
    }, 1000)
  ).current;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    event.preventDefault();
    event.stopPropagation();
    setValue(newValue);
    deboundUpdate(newValue);
    console.log(newValue);
  };

  if (categories.length === 0) return null;

  return (
    <Box sx={{ width: "100wv", mt: -2 }}>
      <Tabs
        value={value}
        onChange={(event: React.SyntheticEvent, value: any) =>
          handleChange(event, value)
        }
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
        allowScrollButtonsMobile
      >
        {data.map((item) => (
          <Tab
            sx={{ padding: 0, minWidth: 0, px: 1 }}
            key={item.id}
            label={<Chip label={item.name} sx={{ borderRadius: 2 }} />}
          />
        ))}
      </Tabs>
    </Box>
  );
}
