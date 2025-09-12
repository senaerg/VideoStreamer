"use client";

import { playerCookieKey } from "@/config";
import { AppSettings } from "@/types";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import useCookie from 'react-use-cookie';



type IAppContext = {
  cat: string | null;
  setCategory: React.Dispatch<React.SetStateAction<any>>;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
};

const defaultSettings: AppSettings = {
  autoplay: true,
  loop: false,
  muted: false,
  preload: true,
};

const AppContext = createContext<IAppContext>({
  setCategory: () => {},
  cat: null,
  settings: defaultSettings,
  updateSettings: () => {},
});

const AppContextProvider = (props: { children: React.ReactNode, settings?:AppSettings }) => {
  const [value, setCookie] = useCookie(playerCookieKey, props.settings ? JSON.stringify(props.settings) : JSON.stringify(defaultSettings) );

  const [cat, setCat] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<AppSettings>(JSON.parse(value));

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
      setSettings((prevSettings) => {
        const updatedSettings = { ...prevSettings, ...newSettings };
        setCookie(JSON.stringify(updatedSettings));
        return updatedSettings;
      });
    },
    []
  );

  return (
    <React.Fragment>
      <AppContext.Provider
        value={{ cat, settings, updateSettings, setCategory: setCat }}
      >
        {props.children}
      </AppContext.Provider>
    </React.Fragment>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppContextProvider;
