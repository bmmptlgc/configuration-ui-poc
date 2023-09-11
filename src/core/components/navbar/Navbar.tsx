import React, { Component, SyntheticEvent } from 'react';
// import classNames from 'classnames';
import { Navbar as N, NavbarBrand, NavItem, NavItemProps, NavLink } from 'reactstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { NavbarProps, NavbarState } from 'core/components/navbar/index';

export default class Navbar extends Component<NavbarProps, NavbarState> {

  static defaultProps = {
    isLight: false,
    fixed: false
  };

  constructor(props: NavbarProps) {
    super(props);

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.activeNavItem = this.activeNavItem.bind(this);

    let dropdowns: Array<{ Open: boolean }> = [];

    this.props.dropdowns && this.props.dropdowns.forEach(() => dropdowns.push({Open: false}));

    this.state = {
      dropdowns: dropdowns
    };
  }

  toggleDropdown(index: number) {
    let dropdowns: Array<{ Open: boolean }> = this.state.dropdowns;

    dropdowns[index].Open = !dropdowns[index].Open;

    this.setState({
      dropdowns: dropdowns
    });
  }

  activeNavItem(item: NavItemProps) {

    let cls = 'nav-item';

    if (this.props.location && item.pathname === this.props.location.pathname) {
      cls += ' active';
    }

    return (
      <li className={cls}>
        {item.children}
      </li>
    );
  }

  render() {
    let items = this.props.items || [];
    // let dropdowns = this.props.dropdowns || [];

    let navItems: Array<React.ReactNode> = [];

    items.forEach((item, index) => {
      navItems.push(
        <NavItem pathname={item.url || '/'} tag={this.activeNavItem} key={`${index}-` + (item.url || '/')}>
          <LinkContainer to={item.url || '/'} key={`link-${index}-` + (item.url || '/')}>
            <NavLink id={`${item.text.replace(/\s/g, '-')}-item`}>
              {/*<Icon className="material-icons" iconName={item.icon || 'description'} />*/}
              <span className="icon-text">{item.text}</span>
            </NavLink>
          </LinkContainer>
        </NavItem>
      );
    });

    // let dropdownMenus: Array<React.ReactNode> = [];

    // dropdowns.forEach((dropdown, index) => {
    //     let dropdownItems: Array<DropdownItemProps> = [];
    //     let toggleClasses = classNames(dropdown.icon === 'person' ? 'hidden' : 'icon-text');
    //
    //     let toggleProps = {
    //         nav: true,
    //         className: 'dropdown-toggle',
    //         children: (
    //             <>
    //                 <Icon className="material-icons" iconName={dropdown.icon || 'description'} />
    //                 {
    //                     dropdown.text &&
    //                     <span className={toggleClasses}>
    //                         {dropdown.text}
    //                     </span>
    //                 }
    //             </>
    //         )
    //     };
    //
    //     dropdown.items.forEach((item, itemIndex) => {
    //         dropdownItems.push({
    //             to: `${(item.url || '/')}`,
    //             key: `${(item.url || '/')}`,
    //             text: item.text,
    //             children: <span>hey!!</span>
    //         });
    //     });
    //
    //     let dropdownClasses = classNames('nav-item', dropdown.icon === 'person' ? 'user-menu' : '');
    //
    //     if (dropdownItems.length > 0) {
    //         dropdownMenus.push(
    //             <Dropdown
    //                 isOpen={this.state.dropdowns[index].Open}
    //                 toggle={this.toggleDropdown.bind(this, index)}
    //                 tag="li"
    //                 className={dropdownClasses}
    //                 key={index}
    //                 id={`${dropdown.text ? dropdown.text.replace(/\s/g, '-') : index}-dropdown`}
    //                 toggleProps={toggleProps}
    //                 items={dropdownItems}
    //                 menuProps={{ right: index === dropdowns.length - 1 }}
    //             />
    //         );
    //     }
    // });

    const className = 'navbar-expand' + (
      this.props.light === false
        ? ' navbar-dark bg-dark'
        : ' navbar-light bg-light') + (
      this.props.fixed
        ? ' fixed-top'
        : '');

    const navbarBodyStyle = this.props.body
      ? {flex: 1}
      : {};

    return (
      <N tag="header" id="header" className={className}>
        <NavbarBrand href="/">
          <img
            className="logo"
            src={this.props.logoUrl || '/favicon.png'}
            onError={(event: SyntheticEvent<HTMLImageElement, Event>) => {
              let imageEvent: HTMLImageElement = event.target as HTMLImageElement;

              imageEvent.src = !this.props.logoUrl ? `${window.origin}/favicon.png` : '';
            }}
            alt="Configuration UI"
            width="30"
            height="30"
          />
          {
            this.props.brandText &&
              <span style={{paddingLeft: '10px'}}>{this.props.brandText}</span>
          }
        </NavbarBrand>
        {this.props.body &&
            <div className="mr-3" style={navbarBodyStyle}>
              {this.props.body}
            </div>
        }
        <nav className="navbar-content">
          <ul className="navbar-nav">
            {navItems}
            {/*{dropdownMenus}*/}
          </ul>
        </nav>
      </N>
    );
  }
}