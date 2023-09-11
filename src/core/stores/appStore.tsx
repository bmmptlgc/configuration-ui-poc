/* eslint-disable  @typescript-eslint/no-explicit-any */
import createStore from './createStore';
import { AppStore, AppStoreApi, DrawerPropsWithStore, User } from '../types/appStore';
import { DrawerStoreProvider } from './drawerStore';
import { StateApi } from '../types/state';
import { ModalProps } from '../components/modal';
import { setStateData } from '../helpers/state';
import { DrawerProps } from 'core/components/drawer';
import { CustomValidationMessages } from 'shared/components/schema-form';

const {
  StoreProvider: AppStoreProvider,
  useStore: useAppStore
} = createStore<AppStore<any, any>, AppStoreApi<any, any>>(
  ({state, setState}): AppStoreApi<any, any> => {

    const setUser = (user: User): void => setStateData('user', user, setState);

    const setLocale = (locale: string): void => setStateData('locale', locale, setState);

    const showModal = ({...props}: ModalProps): void => {
      setState(
        (prevState) => ({
          ...prevState,
          modal: {
            ...props,
            show: true,
            onClose: props.onClose || dismissModal
          }
        })
      );
    };

    const dismissModal = (): void => {
      setState(
        (prevState) => ({
          ...prevState,
          modal: {
            show: false
          }
        })
      );
    };

    // const setDrawer = (props: DrawerExtendedProps<any, any>): void => {
    //   setState(
    //     (prevState) => ({
    //       ...prevState,
    //       drawer: props
    //     })
    //   )
    // };

    const toggleDrawer =
      <S, A>(props: DrawerProps & { storeApiFactory?: StateApi<S, A> }): void => {
        const {storeApiFactory, ...drawer} = props;

        setState(
          (prevState) => {
            const nextState = {...prevState};

            if (!drawer.contentId && nextState.drawer?.cachedProps) {
              nextState.drawer = {
                ...prevState.drawer,
                ...nextState.drawer.cachedProps,
                cachedProps: undefined
              };
            } else if (drawer.contentId && prevState.drawer.beforeChange &&
              !prevState.drawer.beforeChange()) {
              nextState.drawer.cachedProps = drawer;
            } else {
              nextState.drawer = {
                ...drawer,
                body: storeApiFactory
                  ? (
                    <DrawerStoreProvider storeApi={storeApiFactory}>
                      {drawer.body}
                    </DrawerStoreProvider>
                  )
                  : drawer.body,
                toggleBit: !prevState.drawer.toggleBit,
                cachedProps: undefined
              };
            }

            return nextState;
          }
        )
      };

    const toggleDrawerWithStore = <S, A>(props: DrawerPropsWithStore<S, A>): void => toggleDrawer(props);

    const setSchemaFormValidationMessages = (validationMessages: CustomValidationMessages): void =>
      setStateData('schemaFormValidationMessages', validationMessages, setState);

    const setWindowDimensions = (dimensions: {
      width: number;
      height: number;
    }): void => {
      setState(
        prevState => {
          return {
            ...prevState,
            window: {
              ...prevState.window,
              dimensions: dimensions
            }
          }
        }
      );
    };

    const setModuleStore = (
      route: string,
      moduleStoreApi: StateApi<any, any>
    ): void => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setState(prevState => ({
        ...prevState,
        moduleRoute: route,
        moduleStore: moduleStoreApi,
        subModuleRoute: undefined,
        subModuleStore: () => ({}),
        domainRoute: undefined,
        domainStore: () => ({})
      }));
    };

    const setSubModuleStore = (
      route: string,
      subModuleStoreApi: StateApi<any, any>
    ): void => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setState(prevState => ({
        ...prevState,
        subModuleRoute: route,
        subModuleStore: subModuleStoreApi,
        domainRoute: undefined,
        domainStore: () => ({})
      }));
    };

    const setDomainStore = (
      route: string,
      domainStoreApi: StateApi<any, any>
    ): void => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setState(prevState => ({
        ...prevState,
        domainRoute: route,
        domainStore: domainStoreApi
      }));
    };

    const locale = state.locale;
    const user = state.user;
    const modal = state.modal;
    const drawer = state.drawer;
    const schemaFormValidationMessages = state.schemaFormValidationMessages;
    const window = state.window;
    const moduleRoute = state.moduleRoute;
    const subModuleRoute = state.subModuleRoute;
    const domainRoute = state.domainRoute;
    const moduleStore = state.moduleStore;
    const subModuleStore = state.subModuleStore;
    const domainStore = state.domainStore;

    return {
      locale,
      user,
      modal,
      drawer,
      schemaFormValidationMessages,
      window,
      moduleRoute,
      subModuleRoute,
      domainRoute,
      moduleStore,
      subModuleStore,
      domainStore,
      setUser,
      setLocale,
      showModal,
      dismissModal,
      toggleDrawer,
      toggleDrawerWithStore,
      setSchemaFormValidationMessages,
      setWindowDimensions,
      setModuleStore,
      setSubModuleStore,
      setDomainStore
    };
  },
  {
    user: {},
    modal: {
      show: false
    },
    drawer: {
      contentId: undefined
    },
    window: {
      dimensions: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  },
  (store: AppStoreApi<any, any>): (() => void) => {
    const handleResize = (): void => {
      store.setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return (): void => {
      window.removeEventListener('resize', handleResize);
    }
  }
);

export { AppStoreProvider, useAppStore };
