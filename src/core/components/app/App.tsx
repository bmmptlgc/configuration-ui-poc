import { createContext, ReactElement } from 'react';
import i18next from 'i18next';

import Config from 'core/helpers/config';
import { useAppStore } from 'core/stores/appStore';
import useI18n from 'core/hooks/localization';
import { ModuleStoreProvider } from 'core/stores/moduleStore';
import { SubModuleStoreProvider } from 'core/stores/subModuleStore';
import { DomainStoreProvider } from 'core/stores/domainStore';
import AppRoutes from 'core/routes/AppRoutes';
import { AppConfig } from 'core/types/appConfig';

import Container from '../container/Container';
import Authentication from '../authentication/Authentication';
import Modal from '../modal/Modal';
import Drawer from '../drawer/Drawer';

export const AppConfiguration = createContext<AppConfig>({
  config: {
    ...(Config.get()),
  }
});

const App = (): ReactElement => {
  const appStore = useAppStore();

  useI18n();

  return (
    <>
      {
        i18next.isInitialized &&
          <Container>
            {
              !appStore.user.token
                ? <Authentication/>
                : <ModuleStoreProvider storeApi={appStore.moduleStore}>
                  <SubModuleStoreProvider storeApi={appStore.subModuleStore}>
                    <DomainStoreProvider storeApi={appStore.domainStore}>
                      <Modal {...appStore.modal} />
                      {
                        (
                          <AppRoutes/>
                        )
                      }
                      {
                        appStore.drawer && appStore.drawer.contentId &&
                          <Drawer {...appStore.drawer} />
                      }
                    </DomainStoreProvider>
                  </SubModuleStoreProvider>
                </ModuleStoreProvider>
            }
          </Container>
      }
    </>
  );
};

export default App;