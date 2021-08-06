import React from "react";
import styles from "./menu.module.css";
import CasinoRoundedIcon from "@material-ui/icons/CasinoRounded";
import LibraryBooksRoundedIcon from "@material-ui/icons/LibraryBooksRounded";
import AnnouncementRoundedIcon from "@material-ui/icons/AnnouncementRounded";

export interface MenuProps {
  selection: string;
  onClicked: (item: string) => void;
}

const selectedStyles: React.CSSProperties = {
  transform: "translateX(-10px)",
  transition: "transform 0.1s ease-out",
};
const notSelectedStyles: React.CSSProperties = {
  transition: "transform 0.1s ease-out",
};

const Menu: React.FC<MenuProps> = ({ selection, onClicked }) => {
  return (
    <aside className={styles.aside}>
      <MenuTab
        text="Game"
        icon={
          <CasinoRoundedIcon
            className={styles.menuIcon}
            style={selection === "game" ? selectedStyles : notSelectedStyles}
          />
        }
        selected={selection === "game"}
        onClick={() => onClicked("game")}
      />
      <MenuTab
        text="Rules"
        icon={
          <LibraryBooksRoundedIcon
            className={styles.menuIcon}
            style={selection === "rules" ? selectedStyles : notSelectedStyles}
          />
        }
        selected={selection === "rules"}
        onClick={() => onClicked("rules")}
      />
      <MenuTab
        text="News"
        icon={
          <AnnouncementRoundedIcon
            className={styles.menuIcon}
            style={selection === "news" ? selectedStyles : notSelectedStyles}
          />
        }
        selected={selection === "news"}
        onClick={() => onClicked("news")}
      />
    </aside>
  );
};

interface MenuTabProps {
  text: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

const MenuTab = ({ text, icon, selected, onClick }: MenuTabProps) => {
  return (
    <div
      className={!selected ? styles.menuItem : styles.menuItemSelected}
      onClick={onClick}
    >
      {icon}
      {!selected ? (
        <p>{text}</p>
      ) : (
        <p>
          <b>{text.toUpperCase()}</b>
        </p>
      )}
    </div>
  );
};

export default Menu;
