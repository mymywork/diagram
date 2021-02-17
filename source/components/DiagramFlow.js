import React from 'react'
import { connect } from 'react-redux'
import * as selectors from '../selectors'
import { types } from '../reducers/entities'
import * as joint from 'jointjs'
import $ from 'jquery'
//import lodash from 'lodash'
import ui from 'jquery-ui'
import uicontextmenu from 'ui-contextmenu'
import htmlMyElementConstructor from './jointComponent/html.MyElement'
import { Navbar, Nav } from 'react-bootstrap'
import ModalProperties from './modal/ModalProperties'
import withModal from '../hoc/withModal'


// Нужно для jointjs чтобы т.к он использует jquery.
global.jQuery = $
global.$ = $
// Нужно для самого jointjs чтобы он видел себя глобально.
global.joint = joint

const g = joint.g
const V = joint.V

class DiagramFlow extends React.Component {

  componentDidMount() {

    const { modal } = this.props

    var graph = new joint.dia.Graph

    /*
      Класс линка есть joint.shapes.standard.Link
      joint.shapes.devs.Link - используется с портами, но можно и так вроде
      joint.dia.Link - основной коренной от него все наследуются.
     */

    var linkDef = new joint.dia.Link({
      attrs: {
        line: {
        }
      },
      typeOfConnection: 'out',
      connector: { name: 'rounded' },
      //router: { name: 'manhattan' }
    })

    // алгоритм огибания блоков
    linkDef.router('metro', {
      excludeTypes: ['my.SelectRectangle']
    })

    // marker-source - это точка подсоединения к блоку исходная описывается в svg
    linkDef.attr({
      //'.marker-source': { d: 'M 0 10 m 0 -5  a 5 5 0 1 0 0 1', 'stroke-width': 0, fill: '#232E78' },
      '.marker-target': { d: 'M 10 -5 10 5 0 0 z', 'stroke-width': 0, fill: '#232E78' }

    })

    let menu = document.getElementById('menu')
    let paperBlock = document.getElementById('paper')
    let root = document.getElementById('root')
    console.log('Paper ', root,'width = ', root.clientWidth, ' height = ', root.clientHeight)

    var paper = new joint.dia.Paper({
      el: paperBlock,
      model: graph,
      width: root.clientWidth,
      height: root.clientHeight-menu.clientHeight,
      linkPinning: false,
      defaultLink: linkDef,
      drawGrid: { name: 'mesh', args: { color: 'grey' }},
      gridSize: 20,

      interactive: function(cellView) {
        if (cellView.model.isLink()) {
          return {
            remove: true,
            vertexAdd: true,
            vertexRemove: true,
            arrowheadMove: false,
          }
        }
        return {  elementMove: false };
      },

      validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
        console.log('cellViewS = ', cellViewS)
        console.log('magnetS = ', magnetS)
        console.log('cellViewT = ', cellViewT)
        console.log(magnetT)
        console.log('end = ', end)
        console.log('linkView = ', linkView)
        console.log('------------------------------')

        // Prevent linking from output ports to input ports within one element.
        if (cellViewS === cellViewT) return false

        delete linkView.model.attributes.source.selector
        delete linkView.model.attributes.target.selector
        // Prevent linking to input ports.
        return true
      }
    })
    this.paper = paper

    // это хак нужно чтобы на блоке срабатывало событие правой мышки, контекстного меню.
    paper.options.guard = function(evt) {
      return (evt.type === 'mousedown' && evt.buttons === 2);
    };

    $(document).contextmenu({
      autoTrigger: false,
      delegate: ".joint-cell, .joint-paper",
      menu: [],

      beforeOpen: function(event, ui) {
        var $menu = ui.menu,
          target = ui.target,
          extraData = ui.extraData; // optionally passed when menu was opened by call to open()

        console.log('Target menu = ',target)
        let x = target.parent('.joint-cell')

        if ( target.parent().hasClass('joint-cell') || target.parent().parent().hasClass('joint-cell')) {
          // Redefine the whole menu
          $(document).contextmenu("replaceMenu", [
            { title: "Magnet", cmd: "magnet", uiIcon: "ui-icon-copy" },
            { title: "Remove", cmd: "remove", uiIcon: "ui-icon-delete" },
          ]);
        } else if ( target[0].tagName == 'svg' ) {
          $(document).contextmenu("replaceMenu", [
            { title: "Add", cmd: "add", uiIcon: "ui-icon-create" },
          ]);
        }
      },
      select: function(event, ui) {
        console.log('Args = ', arguments)
        console.log('Event = ', event, ' UI = ', ui)

        if ( ui.cmd == 'magnet' ) {

          let x = ui.target[0].tagName != 'rect' ? ui.target.parents('.joint-cell') : ui.target
          let r
          if ( x.attr('data-type') == 'standard.Rectangle' ) {
            r = x.find('rect[joint-selector="body"]')
          } else if ( x.attr('data-type') == 'standard.BorderedImage' ) {
            r = x.find('image[joint-selector="image"]')
          } else if ( x.attr('data-type') == 'standard.HeaderedRectangle' ) {
            r = x.find('image[joint-selector="bodyImage"]')
          } else {
            r = x
          }
          r.attr("magnet", true)

        } else if ( ui.cmd == 'remove') {
          ui.extraData.model.remove()
        } else if ( ui.cmd == 'add' ) {

          var el = joint.shapes.html.MyElement.create({
            header: "Operation",
            position: { x: event.clientX, y: event.clientY },
          });
          el.addTo(graph)

        }
      }
    });



    // debug

    var rectangle = null
    var selectMoveList = []

    // описываем блок который будем рисовать при выделении - т.е с прерывистым бордюром и прозрачный
    joint.shapes.standard.Rectangle.define('my.SelectRectangle', {
      attrs: {
        body: {
          'fill': 'none',
          'stroke-width': '0.5',
          'stroke-dasharray': '1%'
        }
      }
    },{},{})

    // EVENTS

    paper.on({
      'link:connect': function (linkView, evt, elementViewConnected, magnet, arrowhead) {
        console.log('LINK CONNECTED')
        console.log('linkView = ', linkView)
        console.log('evt = ', evt)
        console.log('elementViewConnected = ', elementViewConnected)
        console.log('magnet = ', magnet)
        console.log('arrowhead = ', arrowhead)
        // only one link from source
        //if ( linkView.sourceMagnet.getAttribute('multiOut') != true ) linkView.sourceMagnet.setAttribute('magnet',false);
        //if ( linkView.targetMagnet.getAttribute('multiIn') != true ) linkView.targetMagnet.setAttribute('magnet',false);
        linkView.sourceMagnet.removeAttribute('magnet')
        delete linkView.model.attributes.source.selector
        delete linkView.model.attributes.target.selector

        paper.updateView(linkView)

      },
      'cell:pointerdblclick': function (cellView, evt, x, y) {
        console.log('cellView', cellView)
        console.log(cellView)
        modal.show(cellView)

      },
      'blank:contextmenu': function (evt, x, y) {
        console.log('blank:contextmenu cellView = ')
        console.log('event = ', evt)
        //evt.cell = cellView
        $(document).contextmenu('open', evt)
      },
      'cell:contextmenu': function (cellView, evt, x, y) {
        console.log('cell:contextmenu cellView = ', cellView)
        console.log('event = ', evt)
        evt.cell = cellView
        $(document).contextmenu('open', evt, cellView)
      },
      'element:contextmenu': function (cellView, evt, x, y) {
        console.log('element:contextmenu cellView = ', cellView)
        console.log('event = ', evt)
        evt.cell = cellView
        $(document).contextmenu('open', evt, cellView)
      },

      'element:mouseenter': function (elementView) {
        var model = elementView.model
        var bbox = model.getBBox()
        var ellipseRadius = (1 - Math.cos(g.toRad(45)))
        var offset = model.attr(['pointers', 'pointerShape']) === 'ellipse'
          ? { x: -ellipseRadius * bbox.width / 2, y: ellipseRadius * bbox.height / 2 }
          : { x: -3, y: 3 }

        /* elementView.addTools(new joint.dia.ToolsView({
           tools: [
             new joint.elementTools.Remove({
               useModelGeometry: true,
               y: '0%',
               x: '100%',
               offset: offset
             })
           ]
         }));
         */
      },
      'cell:mouseleave': function (cellView) {
        // это чтобы тулсы (vertex, move) пропадали когда убираеш мышь с линка.
        cellView.removeTools()
      },
      'blank:pointerdown': function (evt, x, y) {
        var data = evt.data = {}
        var cell
        data.x = x
        data.y = y
        rectangle = new joint.shapes.my.SelectRectangle()
        rectangle.resize(1, 1)
        rectangle.position(x, y)
        rectangle.attr('body/fill', 'none')
        rectangle.attr('body/stroke-width', '0.5')
        rectangle.attr('body/stroke-dasharray', '1%')

        rectangle.addTo(graph)
        data.cell = rectangle
      },
      'blank:pointermove': function (evt, x, y) {
        var data = evt.data
        var cell = data.cell
        if (cell.isLink()) {
          //cell.target({ x: x, y: y });
        } else {
          console.log('resize = ', x - data.x, y - data.y)
          let diffWidth = x - data.x
          let diffHeight = y - data.y

          let newX = data.x
          let newY = data.y

          if (diffWidth < 0) newX = x
          if (diffHeight < 0) newY = y
          if (diffWidth < 0 || diffHeight < 0) data.cell.position(newX, newY)
          data.cell.resize(Math.abs(diffWidth), Math.abs(diffHeight))

        }
      },
      'blank:pointerup': function (evt) {
        var cell = evt.data.cell
        if (cell.isLink()) return
        let list = graph.findModelsUnderElement(cell).map(x => {
          if (x.attributes.type == 'standard.Rectangle') {
            x.attr('body/stroke', 'red')
          }
          if (x.attributes.type == 'standard.BorderedImage') {
            x.attr('border/stroke', 'red')
          }
          if (x.attributes.type == 'standard.HeaderedImage') {
            x.attr('border/stroke', 'red')
          }
          if (x.attributes.type == 'html.MyElement') {
            console.log('Selected my = ',x)
            $(x.attributes.objHtml).css('border','2px solid red')
          }
          console.log(x)
          return x
        })

        console.log('Cell = ', cell)

        let myX = cell.attributes.position.x
        let myY = cell.attributes.position.y
        let myWidth = cell.attributes.size.width
        let myHeight = cell.attributes.size.height

        // Алгоритм для перемещения точек линка(vertex)

        let links = graph.getLinks()
        console.log('All links', links)
        for (let il in links) {
          let link = links[il]
          if (link.attributes.vertices == undefined) continue
          for (let iv in link.attributes.vertices) {
            let v = link.attributes.vertices[iv]

            let vx = v.x
            let vy = v.y

            if (vx > myX && vx < myX + myWidth && vy > myY && vy < myY + myHeight) {
              if (list.indexOf(link) == -1) {
                list.push(link)
                let view = link.findView(paper)
                console.log('LinkView', view)
              }
              if (link.attributes.selectedVertices == undefined) link.attributes.selectedVertices = []
              link.attributes.selectedVertices.push(iv)
            }
          }
        }

        if (list.length != 0) {
          selectMoveList = list
        }

        console.log('Result list = ', list)

        cell.remove()

      },

      // move selected

      'element:pointerdown': function (item, evt, x, y) {
        console.log('element:pointerdown')
        var data = item.data = {}
        console.log('event:', item)
        item.data.moveMode = true
        item.data.shiftX = x - item.model.attributes.position.x
        item.data.shiftY = y - item.model.attributes.position.y

        console.log('shift ', item.data.shiftX, item.data.shiftY)

        if (selectMoveList.length != 0 && selectMoveList.indexOf(item.model) == -1) {
          // reset borders select
          selectMoveList.map(x => {
            if (x.attributes.type == 'standard.Rectangle') {
              x.attr('body/stroke', 'black')
            }
            if (x.attributes.type == 'standard.BorderedImage') {
              x.attr('border/stroke', 'black')
            }
            if (x.attributes.type == 'standard.HeaderedImage') {
              x.attr('border/stroke', 'black')
            }
            if (x.attributes.type == 'html.MyElement') {
              console.log('Selected my = ',x)
              $(x.attributes.objHtml).css('border','2px solid black')
            }
          })
          selectMoveList = [item.model]
        } else if (selectMoveList.length == 0) {
          selectMoveList = [item.model]
        }
      },
      'element:pointermove': function (item, evt, x, y) {
        console.log('element:pointermove ', item, 'x=', x, ' y=', y)
        var data = item.data
        if (item.data.moveMode) {
          if (selectMoveList.length != 0) {
            let newX = x - item.data.shiftX
            let newY = y - item.data.shiftY
            let diffNewX = newX - item.model.attributes.position.x
            let diffNewY = newY - item.model.attributes.position.y
            console.log('diff x = ', diffNewX, 'diff y = ', diffNewY)
            selectMoveList.map(x => {
              if (x.attributes.type == 'link' || x.attributes.type == 'devs.Link') {
                for (let i in x.attributes.selectedVertices) {
                  let iv = x.attributes.selectedVertices[i]
                  console.log(x)
                  x.attributes.vertices[iv].x = x.attributes.vertices[iv].x + diffNewX
                  x.attributes.vertices[iv].y = x.attributes.vertices[iv].y + diffNewY
                }
                //x.vertices(x.attributes.vertices)
              } else {
                console.log(x.cid, x.attributes.position.x + diffNewX, x.attributes.position.y + diffNewY)
                x.position(x.attributes.position.x + diffNewX, x.attributes.position.y + diffNewY)
              }
            })
          }
        }
      },

      'element:pointerup': function (item) {
        item.data.moveMode = false
        selectMoveList.map(x => {
          if (x.attributes.type == 'standard.Rectangle') {
            x.attr('body/stroke', 'black')
          }
          if (x.attributes.type == 'standard.BorderedImage') {
            x.attr('border/stroke', 'black')
          }
          if (x.attributes.type == 'standard.HeaderedImage') {
            x.attr('border/stroke', 'black')
          }
          if (x.attributes.type == 'html.MyElement') {
            console.log('Selected my = ',x)
            $(x.attributes.objHtml).css('border','2px solid black')
          }
          if (x.attributes.type == 'link' || x.attributes.type == 'devs.Link') {
            x.attributes.selectedVertices = []
            let view = x.findView(paper)
            console.log('element:pointerup LinkView = ', view)
            view.renderVertexMarkers()
          }

        })
        selectMoveList = []
      }

    })

    // Создаем контейнер для htmlView элеменетов которые накладываются поверх rect.

    var htmlContainer = document.createElement('div');
    htmlContainer.style.pointerEvents = 'none';
    htmlContainer.style.position = 'absolute';
    htmlContainer.style.inset = '0';
    paper.el.appendChild(htmlContainer);
    paper.htmlContainer = htmlContainer;

    $('#create').click(function () {

      var el1 = joint.shapes.html.MyElement.create({
        header: "Operation",
        position: { x: 20, y: 20 },
      });
      el1.addTo(graph)

    })

    $('#save').click(function () {
      console.log('Json = ',graph.toJSON())
      localStorage.setItem('graph',JSON.stringify(graph.toJSON()))
    })

    $('#load').click(function () {
      console.log('Json = ',graph.toJSON())
      graph.fromJSON(JSON.parse(localStorage.getItem('graph')))
    })

    $('#tree').click(function () {
      console.log('Json = ',graph.toJSON())
      let list = graph.toJSON()

      let roots = []

      // Находим вершины
      for (let i in list.cells) {
        if ( list.cells[i].type == 'html.MyElement' ) {
          let root = true
          // Перечисляем линки
          for (let n in list.cells) {
            // Если в линках находим в таргете
            if ( list.cells[n].type == 'link' && list.cells[n].target.id == list.cells[i].id ) root = false
          }
          // Если флаг остался поднят то сохраняем в рутс.
          if ( root ) roots.push (list.cells[i])
        }
      }

      function findChilds(node) {
        let childs = []
        for (let i in list.cells) {
          if ( list.cells[i].type == 'link' && list.cells[i].source.id == node.id ) {
            for (let n in list.cells) {
              if (list.cells[n].id == list.cells[i].target.id) {
                childs.push(list.cells[n])
                list.cells[n].childs = findChilds(list.cells[n])
              }
            }
          }
        }
        return childs
      }

      let tree = []
      for (let i in roots) {
        roots[i].childs = findChilds(roots[i])
      }
      console.log(roots)

    })

    // определяем свой блок с html
    htmlMyElementConstructor(joint,joint.util,joint.V)
  }

  render () {
    const { modal } = this.props

    return (
      <React.Fragment>
        <div id='menu'>
          <Navbar bg="light" expand="lg">
            <Navbar.Brand href="#home">DiagramFlow</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <Nav.Link id="create" href="#home">Create element</Nav.Link>
                <Nav.Link id="save" href="#link">Save json</Nav.Link>
                <Nav.Link id="load" href="#link">Load json</Nav.Link>
                <Nav.Link id="tree" href="#link">Generate tree</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>

        <div id="paper"></div>

        <ModalProperties modal={modal} updatePaper={()=> { this.paper.updateViews()}} />
      </React.Fragment>
    )
  }
}
const mapStateToProps = (state, props) => ({
//  chats: selectors.chatsSelector(state, props),
})

const mapDispatchToProps = dispatch => ({
/*  merge: (result) => {
    dispatch({ type: types.ENTITIES_MERGE, entities: result.entities })
  }*/
})

export default connect(mapStateToProps, mapDispatchToProps)(withModal('modal')(DiagramFlow))
