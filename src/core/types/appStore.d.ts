import { StateApi } from './state';
import { ModalProps } from '../components/modal';
import { DrawerProps } from '../components/drawer';
import { CustomValidationMessages } from 'shared/components/schema-form';

export interface User {
  token?: string;
}

export interface DrawerPropsWithStore<S, A> extends DrawerProps {
  storeApiFactory?: StateApi<S, A>;
}

export interface DrawerExtendedProps<S, A> extends DrawerProps {
  cachedProps?: DrawerPropsWithStore<S, A>;
  beforeChange?: () => boolean;
}

export interface AppStore<S, A> {
  locale?: string;
  user: User;
  modal: ModalProps;
  drawer: DrawerExtendedProps<S, A>;
  schemaFormValidationMessages?: CustomValidationMessages;
  window: {
    dimensions: {
      width: number;
      height: number;
    };
  };
  moduleRoute?: string;
  subModuleRoute?: string;
  domainRoute?: string;
  moduleStore?: StateApi<S, A>;
  subModuleStore?: StateApi<S, A>;
  domainStore?: StateApi<S, A>;
}

export interface AppStoreApi<S, A> extends AppStore<S, A> {
  setUser: (user: User) => void;
  setLocale: (locale: string) => void;
  showModal: ({...props}: ModalProps) => void;
  dismissModal: () => void;
  toggleDrawer: <S, A>(props: DrawerProps & { storeApiFactory?: StateApi<S, A> }) => void;
  toggleDrawerWithStore: (props: DrawerPropsWithStore<S, A>) => void;
  setSchemaFormValidationMessages: (validationMessages: CustomValidationMessages) => void;
  setWindowDimensions: (dimensions: {
    width: number;
    height: number;
  }) => void;
  // key can be a module or submodule
  setModuleStore: (
    route: string,
    moduleStoreApi: StateApi<S, A>
  ) => void;
  setSubModuleStore: (
    route: string,
    subModuleStoreApi: StateApi<S, A>
  ) => void;
  setDomainStore: (
    route: string,
    domainStoreApi: StateApi<S, A>
  ) => void;
}