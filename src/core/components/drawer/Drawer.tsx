import { Component, CSSProperties } from 'react';
import ScrollBars from 'react-custom-scrollbars-2';
import classNames from 'classnames';
import { DrawerProps, DrawerState } from './index';

export default class Drawer extends Component<DrawerProps, DrawerState> {
  static defaultProps = {
    isLarge: true,
    pageHasNavbar: true
  };

  intervalId: NodeJS.Timeout | undefined;

  constructor(props: DrawerProps) {
    super(props);

    this.state = {
      contentId: props.contentId,
      isActive: props.contentId !== undefined,
      header: props.header,
      body: props.body,
      isLarge: props.isLarge,
      hideScrollBar: false
    };
    this.showDrawer = this.showDrawer.bind(this);
    this.hideDrawer = this.hideDrawer.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    this.intervalId = this.toggleScrollBar();
  }

  toggleScrollBar() {
    return setTimeout(
      () => {
        !this.state.hideScrollBar && this.setState({
          hideScrollBar: true
        });
      },
      5000);
  }

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeyUp, false);
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp, false);
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = undefined;
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: DrawerProps) {
    if (nextProps.contentId === undefined ||
      (nextProps.contentId === this.state.contentId &&
        this.shouldHide(nextProps.toggleBit))) {
      this.hideDrawer(nextProps.onClose);
    } else {
      this.showDrawer(nextProps);
    }
  }

  showDrawer(props: DrawerProps) {
    this.setState({
      contentId: props.contentId,
      isActive: true,
      toggleBit: props.toggleBit,
      header: props.header,
      body: props.body,
      isLarge: props.isLarge,
      hideScrollBar: false
    });

    this.intervalId = this.toggleScrollBar();
  }

  hideDrawer(onClose: (() => boolean) | undefined) {
    if (!onClose || onClose()) {
      if (this.intervalId) {
        clearTimeout(this.intervalId);
        this.intervalId = undefined;
      }

      this.setState({
        contentId: undefined,
        isActive: false,
        toggleBit: undefined,
        header: undefined,
        body: undefined
      });
    }
  }

  shouldHide(toggleBit: boolean | undefined): boolean {
    if (toggleBit === undefined) {
      return true;
    }
    return toggleBit !== this.state.toggleBit;
  }

  handleKeyUp(event: KeyboardEvent) {
    if ((event.key === 'escape' || event.keyCode === 27) && this.state.isActive) {
      this.hideDrawer(this.props.onClose);
    }
  }

  render() {
    const slimScrollDivStyle: CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      height: '100%'
    };

    let className = classNames(
      'sidebar sidebar-right position-fixed bg-white',
      this.props.className,
      this.state.isActive ? 'sidebar-active' : '',
      this.state.isLarge ? 'sidebar-lg' : '',
      !this.props.pageHasNavbar ? 'drawer-without-navbar' : ''
    );

    return (
      <div className={className} id="slideout-panel">
        {
          this.state.isActive &&
            <div className="sidebar-header d-flex align-items-center px-4">
              {this.state.header || <span/>}
                <button
                    type="button"
                    id="close-panel-button"
                    className="close ml-auto"
                    aria-label="Close"
                    onClick={
                      () => {
                        this.hideDrawer(this.props.onClose);
                      }
                    }
                >
                    <span aria-hidden="true" className="material-icons">clear</span>
                </button>
            </div>
        }
        {
          this.state.isActive &&
            <div className="sidebar-header-content">
                <div className="slimScrollDiv" style={slimScrollDivStyle}>
                    <ScrollBars autoHide={this.state.hideScrollBar}>
                        <div className="scrollable p-4">
                          {this.state.body}
                        </div>
                    </ScrollBars>
                </div>
            </div>
        }
      </div>
    );
  }
}