'use strict'

const React = require('react')
const DraggableRect = require('../components/draggable-rect')
const LayoutEditorContext = require('../layout-editor-context')

const { normalizeChildren } = require('../utils')

const DRAGGER_WIDTH = 50
const DRAGGER_HEIGHT = 50

class SpacedRayController extends React.Component {
  constructor (props) {
    super(props)

    const initial = (x, y) => ({
      mouseDown: false,
      previousMousePosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      dragDelta: { x: 0, y: 0 },
      shapePosition: { x, y }
    })

    const { start, end } = props

    this.state = {
      rects: {
        start: initial(
          start[0],
          start[1]
        ),
        end: initial(
          end[0],
          end[1]
        )
      }
    }

    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
  }

  handleMouseDown (previousMousePosition, name) {
    const nextState = Object.assign({}, this.state.rects[name], {
      mouseDown: true,
      previousMousePosition
    })
    this.setState({ rects: Object.assign({}, this.state.rects, { [name]: nextState }) })
  }

  handleMouseUp (shapePosition, dragDelta, name) {
    const nextState = Object.assign({}, this.state.rects[name], {
      mouseDown: false,
      shapePosition,
      dragDelta
    })
    this.setState({ rects: Object.assign({}, this.state.rects, { [name]: nextState }) })
  }

  handleMouseMove (dragDelta, currentPosition, name) {
    const nextState = Object.assign({}, this.state.rects[name], {
      currentPosition,
      dragDelta
    })
    this.setState({ rects: Object.assign({}, this.state.rects, { [name]: nextState }) })
  }

  componentDidUpdate (prevProps) {
    const { props } = this

    if (
      prevProps.start[0] !== props.start[0] ||
      prevProps.start[1] !== props.start[1] ||
      prevProps.end[0] !== props.end[0] ||
      prevProps.end[1] !== props.end[1]
    ) {
      this.state.rects.start.shapePosition.x = props.start[0]
      this.state.rects.start.shapePosition.y = props.start[1]
      this.state.rects.end.shapePosition.x = props.end[0]
      this.state.rects.end.shapePosition.y = props.end[1]
      this.forceUpdate()
    }
  }

  render () {
    const { children, spaceBetween, showLayout, spaceEvenly, packLeft, mode } = this.props
    const { rects } = this.state
    return (
      <LayoutEditorContext.Consumer>
        {({ updated, setUpdate }) => {
          return (
            <React.Fragment>
              <SpacedRay
                start={[
                  rects.start.shapePosition.x + rects.start.dragDelta.x,
                  rects.start.shapePosition.y + rects.start.dragDelta.y
                ]}
                end={[
                  rects.end.shapePosition.x + rects.end.dragDelta.x,
                  rects.end.shapePosition.y + rects.end.dragDelta.y
                ]}
                children={children}
                spaceBetween={spaceBetween}
                showLayout={showLayout}
                spaceEvenly={spaceEvenly}
                packLeft={packLeft}
                mode={mode}
              />
              <DraggableRect
                width={DRAGGER_WIDTH}
                height={DRAGGER_HEIGHT}
                fill={'rgba(29,82,255,0.6)'}
                name={'start'}
                shapePosition={rects.start.shapePosition}
                previousMousePosition={rects.start.previousMousePosition}
                dragDelta={rects.start.dragDelta}
                mouseDown={rects.start.mouseDown}
                onMouseDown={(previousMousePosition, name) => { this.handleMouseDown(previousMousePosition, name); setUpdate() }}
                onMouseUp={(shapePosition, dragDelta, name) => { this.handleMouseUp(shapePosition, dragDelta, name); setUpdate() }}
                onMouseMove={(dragDelta, currentPosition, name) => { this.handleMouseMove(dragDelta, currentPosition, name); setUpdate() }}
              />
              <DraggableRect
                width={DRAGGER_WIDTH}
                height={DRAGGER_HEIGHT}
                fill={'rgba(29,82,255,0.6)'}
                name={'end'}
                shapePosition={rects.end.shapePosition}
                previousMousePosition={rects.end.previousMousePosition}
                dragDelta={rects.end.dragDelta}
                mouseDown={rects.end.mouseDown}
                onMouseDown={(previousMousePosition, name) => { this.handleMouseDown(previousMousePosition, name); setUpdate() }}
                onMouseUp={(shapePosition, dragDelta, name) => { this.handleMouseUp(shapePosition, dragDelta, name); setUpdate() }}
                onMouseMove={(dragDelta, currentPosition, name) => { this.handleMouseMove(dragDelta, currentPosition, name); setUpdate() }}
              />
            </React.Fragment>
          )
        }}
      </LayoutEditorContext.Consumer>
    )
  }
}

const SpacedRay = (props) => {
  const { start, end, children, spaceBetween, showLayout, spaceEvenly, packLeft, mode } = props

  const [x1, y1] = start
  const [x2, y2] = end

  const a = x2 - x1
  const b = y2 - y1

  const slope = b / a
  const angle = Math.atan(slope)
  const flippy = x1 > x2 ? -1 : 1

  const length = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
  const slice = length / (children.length - 1)

  const spaceBetweenArrayMode = Array.isArray(spaceBetween)

  let scratchX = 0
  let scratchY = 0

  return (
    <React.Fragment>
      {
        showLayout && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={'green'} strokeDasharray={'5,5'} />
      }
      <g transform={`translate(${x1}, ${y1})`}>
        {
          normalizeChildren(children).map((child, index) => {
            let deltaX = 0
            let deltaY = 0
            if (spaceBetweenArrayMode) {
              const nextIndex = index > 0 ? index - 1 : index
              deltaX = spaceBetween[nextIndex] * Math.cos(angle)
              deltaY = spaceBetween[nextIndex] * Math.sin(angle)
            } else if (spaceEvenly) {
              deltaX = slice * Math.cos(angle)
              deltaY = slice * Math.sin(angle)
            } else {
              deltaX = spaceBetween * Math.cos(angle)
              deltaY = spaceBetween * Math.sin(angle)
            }

            let result

            if (packLeft) {
              result = (
                <g transform={`translate(${scratchX * flippy}, ${scratchY * flippy})`} key={index}>
                  {child}
                  <circle cx={0} cy={0} r={2} stroke={'red'} />
                </g>
              )

              const selfSize = mode === 'vertical' ? child.props.height : child.props.width

              scratchX += (selfSize + deltaX) * Math.cos(angle)
              scratchY += (selfSize + deltaX) * Math.sin(angle)
            } else {
              result = (
                <g transform={`translate(${deltaX * index * flippy}, ${deltaY * index * flippy})`} key={index}>
                  {child}
                  <circle cx={0} cy={0} r={2} stroke={'red'} />
                </g>
              )
            }

            return result
          })
        }
      </g>
    </React.Fragment>
  )
}

module.exports = SpacedRayController
