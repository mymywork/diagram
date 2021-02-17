import React from 'react'
import { Modal, Button, InputGroup, FormControl } from 'react-bootstrap'

class ModalProperties extends React.Component {

    componentDidMount () {
      this.input = React.createRef()
    }

  /*  componentWillUpdate () {
      const { modal } = this.props

      let attr = modal.param ? modal.param.model.attributes : {}
      this.state = {
        header: attr.header
      }
    }*/

  render () {
    const { modal, updatePaper } = this.props
    let attr = modal.param ? modal.param.model.attributes : {}
    return (
      <React.Fragment>
        <Modal
          {...this.props}
          show={modal.isOpen}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton onHide={() => {
            modal.param.updateModel()
            modal.hide()
          }}>
            <Modal.Title id="contained-modal-title-vcenter">
              {attr.header}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <InputGroup className="mb-3">
              <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">Header</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                aria-label="Default"
                value={attr.header}
                ref={this.input}
                onChange={(e)=> {
                  console.log('X=',this.input.current.value)
                  attr.header = this.input.current.value
                  modal.update()
                }}
                aria-describedby="inputGroup-sizing-default"
              />
            </InputGroup>

          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => {
              modal.param.updateModel()
              modal.hide()
            }}>Close</Button>
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    )
  }

}
export default ModalProperties