import React from 'react'

const withModal = (modalName) => WrappedComponent => {
  class WithModalOpenTrigger extends React.Component {

    state = { isOpen: false, isBusy: false }
    show = (param) => {
      this.param = param
      this.setState({ isOpen: true })
    }
    update = () => { this.forceUpdate() }
    hide = () => this.setState({ isOpen: false })
    busy = value => [true, false].indexOf(value) !== -1 ? this.setState({ isBusy: value }) : null


    render () {
      const props = {
        ...this.props,
        [modalName]: {
          isOpen: this.state.isOpen,
          isBusy: this.state.isBusy,
          show: this.show,
          hide: this.hide,
          update: this.update,
          busy: this.busy,
          param: this.param
        }
      }
      return <WrappedComponent {...props} />
    }
  }

  return WithModalOpenTrigger
}

export default withModal
