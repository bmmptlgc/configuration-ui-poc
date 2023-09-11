import { ReactNode, useContext } from 'react';

import { useAppStore } from '../stores/appStore';
import { AppConfig } from '../types/appConfig';
import { AppConfiguration } from '../components/app/App';

export const useResponsiveLayout = (): {
  renderContent: (
    largeContent: ReactNode,
    smallContent?: ReactNode,
    mediumContent?: ReactNode
  ) => ReactNode;
  renderWithProps: <P>(
    largeContentProps: P,
    smallContentProps?: P,
    mediumContentProps?: P
  ) => P;
} => {
  const appConfiguration = useContext<AppConfig>(AppConfiguration);

  const {
    window: {
      dimensions: {
        width
      }
    }
  } = useAppStore();

  const renderContent = (
    largeContent: ReactNode,
    smallContent?: ReactNode,
    mediumContent?: ReactNode
  ): ReactNode => {
    if (width <= appConfiguration.config.ui.responsive.breakpoints.small) {
      return smallContent || mediumContent || largeContent;
    } else if (width > appConfiguration.config.ui.responsive.breakpoints.large) {
      return largeContent;
    }

    return mediumContent || largeContent;
  };

  const renderWithProps = <P>(
    largeContentProps: P,
    smallContentProps?: P,
    mediumContentProps?: P
  ): P => {
    if (width <= appConfiguration.config.ui.responsive.breakpoints.small) {
      return smallContentProps || mediumContentProps || largeContentProps;
    } else if (width > appConfiguration.config.ui.responsive.breakpoints.large) {
      return largeContentProps;
    }

    return mediumContentProps || largeContentProps;
  };

  return {
    renderContent,
    renderWithProps
  };
};