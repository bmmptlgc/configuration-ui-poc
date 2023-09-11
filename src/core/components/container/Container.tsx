import { lazy, ReactElement } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Constants from 'core/constants';
import { useAppStore } from 'core/stores/appStore';

import { getNavbarProps } from './navbarProps';

const Navbar = lazy(() => import('../navbar/Navbar'));

type Props = {
  children: ReactElement
}

const Container = (props: Props): ReactElement => {
  const {children} = props;

  // const location = useLocation();

  const appStore = useAppStore();

  const {t} = useTranslation(Constants.Localization.Namespaces.NAVIGATION);

  return (
    <div className="component-wrapper">
      {
        // !location.pathname.includes(Constants.Routes.Configuration.MODULE) &&
        <Navbar {...getNavbarProps(appStore.user.token, t)} />
      }
      <div id="content-wrapper">
        {children}
      </div>
    </div>
  )
};

export default Container;