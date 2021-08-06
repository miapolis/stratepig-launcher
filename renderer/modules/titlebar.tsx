import React from "react";
import styles from "./titlebar.module.css";

import TitleBar from "frameless-titlebar";

export interface TitleBarProps {
  maximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

const TitleBarComp: React.FC<TitleBarProps> = ({
  maximized,
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div className={styles.titlebar}>
      <TitleBar
        title="Stratepig Launcher"
        platform={"win32"}
        disableMaximize={false}
        disableMinimize={false}
        maximized={maximized}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
        icon={
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="./icons/32.png"
              style={{
                borderRadius: "50%",
                height: "80%",
                margin: 0,
              }}
            />
          </div>
        }
      />
      <main className={styles.main}>

      </main>
    </div>
  );
};

export default TitleBarComp;
