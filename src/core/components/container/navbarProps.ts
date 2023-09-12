import Constants from '../../constants';
import { NavbarDropdown, NavbarItem, NavbarProps } from 'core/components/navbar/index';
import { TFunction } from 'i18next';

export const getNavbarProps = (token: string | undefined, t: TFunction<string, string>): NavbarProps => {
  const navbarProps: NavbarProps = {
    location: {
      pathname: '/'
    },
    brandText: 'Configuration UI'
  };

  navbarProps.items = [];

  const dropdowns: NavbarDropdown[] = [];
  const items: NavbarItem[] = [];

  token &&
  items.push({
    url: `${Constants.Routes.Configuration.MODULE}/${Constants.Routes.Configuration.ProgramConfiguration}`,
    icon: '',
    text: t('navbar.items.programConfiguration')
  },{
    url: `${Constants.Routes.Configuration.MODULE}/${Constants.Routes.Configuration.ComplexConfiguration}`,
    icon: '',
    text: t('navbar.items.complexConfiguration')
  },{
    url: `${Constants.Routes.Configuration.MODULE}/${Constants.Routes.Configuration.TemplatedConfiguration}`,
    icon: '',
    text: t('navbar.items.templatedConfiguration')
  },{
    url: `${Constants.Routes.Configuration.MODULE}/${Constants.Routes.Configuration.JsonSchemaConfiguration}`,
    icon: '',
    text: t('navbar.items.jsonSchemaConfiguration')
  });

  // dropdowns.push({
  //     icon: 'whatshot',
  //     text: t('navbar.dropdown.button'),
  //     items: [
  //         {
  //             url: `${Constants.Routes.}${Constants.Routes.}`,
  //             text: t('navbar.dropdown.someItem')
  //         }
  //     ]
  // });

  navbarProps.items = items;
  navbarProps.dropdowns = dropdowns;

  return navbarProps;
};