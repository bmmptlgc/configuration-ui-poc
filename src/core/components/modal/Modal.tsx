import { FC, useEffect } from 'react';
import { Modal as M, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import classNames from 'classnames';

import { ModalProps } from 'core/components/modal/index';
import Button from 'shared/components/buttons/Button';

const Modal: FC<ModalProps> = (props: ModalProps) => {
  const {
    size,
    show,
    title,
    body,
    buttons,
    showFooter,
    footerClassName,
    onClose
  } = props;

  useEffect(
    (): (() => void) => {
      const handleKeyUp = (event: KeyboardEvent) => {
        if ((event.key === 'escape' || event.keyCode === 27) && show && onClose) {
          onClose();
        }
      };

      window.addEventListener('keyup', handleKeyUp, false);

      return (): void => {
        window.removeEventListener('keyup', handleKeyUp, false);
      };
    },
    []);

  const footerClasses = classNames(
    'modal-footer',
    footerClassName,
  );

  return show
    ? (
      <div>
        <M isOpen={show} className={'modal-' + size}>
          {
            title &&
              <ModalHeader>{title}</ModalHeader>
          }
          <ModalBody>{body}</ModalBody>
          {
            showFooter &&
              <ModalFooter className={footerClasses}>
                {!buttons && <Button onClick={onClose}>Ok</Button>}
                {buttons}
              </ModalFooter>
          }
        </M>
      </div>
    )
    : null;
};

Modal.defaultProps = {
  size: 'md',
  showFooter: true
};

export default Modal;