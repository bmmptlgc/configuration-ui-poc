import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import Constants from 'core/constants';
import { useCancelableEffect } from 'core/hooks/utils';
import { useAppStore } from 'core/stores/appStore';

const Authentication = (): ReactElement => {
  const appStore = useAppStore();

  const {t} = useTranslation(Constants.Localization.Namespaces.CORE);

  useCancelableEffect(
    (cleanup: { didCancel: boolean }): void => {
      // eslint-disable-next-line max-len
      const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      !cleanup.didCancel && appStore.setUser({
        token: jwt
      });
    },
    []
  );

  return (
    <>
      {
        !appStore.user.token &&
          <div>
            {t('authentication.unauthorized')}
          </div>
      }
    </>
  );
};

export default Authentication;