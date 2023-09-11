import { FC, ReactElement } from 'react';

export interface ModalProps {
  /**
   * Whether to show the modal window or hide it
   */
  show?: boolean;
  /**
   * Heading for the modal window, if not defined the header won't be rendered
   */
  title?: ReactElement | string;
  /**
   * Content body for the modal window (can be JSX)
   */
  body?: ReactElement | string;
  /**
   * JSX for the buttons in the modal window footer
   */
  buttons?: ReactElement;
  /**
   * Size ('sm', 'md', 'lg', 'xl') of the modal window (default: 'md')
   */
  size?: string;
  /**
   * Whether to render the footer or not
   */
  showFooter?: boolean;
  /**
   * CSS classes to apply to the footer
   */
  footerClassName?: string;
  /**
   * Callback for when the modal window is closed
   */
  onClose?: () => void;
}

declare const Modal: FC<ModalProps>;

export default Modal;