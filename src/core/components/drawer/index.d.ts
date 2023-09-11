import { Component, ReactNode } from 'react';

export interface DrawerProps {
  /**
   * unique id to identify the content (decides whether to refresh the content or close the drawer;
   * pass undefined to force-close the drawer)
   */
  contentId?: string;
  /**
   * Compared with previous toggle bit to see if incoming props are from a drawer panel specific state change;
   * Should only be set by whatever state manages the drawer, and otherwise left undefined
   */
  toggleBit?: boolean | undefined;
  /** whether the drawer should be large (sidebar-lg) */
  isLarge?: boolean;
  /** Whether or not space should be left at the top of the page for a navbar */
  pageHasNavbar?: boolean;
  /** header for the panel */
  header?: ReactNode | string;
  /** content for the panel */
  body?: ReactNode | string;
  /** apply a classname on the drawer */
  className?: string;

  /** callback for when the panel is closed */
  onClose?: () => boolean;
}

export interface DrawerState {
  contentId?: string;
  toggleBit?: boolean | undefined;
  isActive?: boolean;
  header?: ReactNode | string;
  body?: ReactNode | string;
  isLarge?: boolean;
  hideScrollBar?: boolean;
}

declare class Drawer extends Component<DrawerProps, DrawerState> {
}

export default Drawer;