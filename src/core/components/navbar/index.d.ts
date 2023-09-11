import { Component, ReactNode } from 'react';

export interface NavbarItem {
  url: string;                        // target url for the menu item
  icon: string;                       // icon for the menu item
  text: string;                       // text for the menu item
}

export interface NavbarDropdownItem {
  url: string;                        // target url for the menu item
  text: string;                       // text for the menu item
}

export interface NavbarDropdown {
  icon: string;                       // icon for the dropdown menu item
  text: string;                       // text for the dropdown menu item
  items: Array<NavbarDropdownItem>;   // items inside the dropdown menu
}

export interface NavbarLocation {
  pathname: string;
}

export interface NavbarProps {
  location?: NavbarLocation;
  body?: ReactNode;
  items?: Array<NavbarItem>;
  dropdowns?: Array<NavbarDropdown>;
  light?: boolean;
  fixed?: boolean;
  logoUrl?: string;
  brandText?: string
}

export interface NavbarState {
  dropdowns: Array<{ Open: boolean }>;
}

declare class Navbar extends Component<NavbarProps, NavbarState> {
}

export default Navbar;