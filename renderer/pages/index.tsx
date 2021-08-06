import React from "react";

import Head from "next/head";
import styles from "../styles/home.module.css";

import TitleBar from "../modules/titlebar";
import Menu from "../modules/menu";
import Primary from "../modules/primary";

type WindowFn = "minimize" | "maximize" | "close" | "unmaximize";

export default function Home() {
  const [maximized, setMaximized] = React.useState(false);
  const [sidebarSelection, setSidebarSelection] = React.useState("game");

  const message = (fn: WindowFn) => {
    if (fn === "maximize") {
      if (maximized === true) {
        fn = "unmaximize";
      }
      setMaximized(!maximized);
    }
    global.ipcRenderer.send("message", fn);
  };

  React.useEffect(() => {
    global.ipcRenderer.addListener("message", (_event, message) => {
      if (message === "maximize") {
        setMaximized(true);
      } else if (message === "unmaximize") {
        setMaximized(false);
      }
    });
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Stratepig Launcher</title>
      </Head>
      <TitleBar
        maximized={maximized}
        onMinimize={() => message("minimize")}
        onMaximize={() => message("maximize")}
        onClose={() => message("close")}
      />
      <main className={styles.main}>
        <Menu selection={sidebarSelection} onClicked={setSidebarSelection}/>
        <Primary />
      </main>
    </div>
  );
}
