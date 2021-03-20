import './stars';
import '../style.scss'

appNode = document.getElementById('app')

if appNode
  commonSize = 600
  defColor = 'white'
  colors = [
    'red'
    'blue'
    'green'
    'yellow'
    'black'
  ]

  randomizeButton = do ->
    button = document.createElement('button')
    button.type = 'button'
    button.innerText = 'Randomize it'
    button.style.width = '600px'
    button

  resultCanvas = do ->
    canvas = document.createElement('canvas')
    canvas.height = 50
    canvas.style.backgroundColor = defColor
    canvas.width = commonSize
    canvas

  starsWrapper = document.createElement('div')
  starsController = starsWrapper.stars(
    corners: 5
    height: commonSize
    onClick: (item) ->
      newBackgroundColor = if item then item.color else defColor
      # eslint-disable-next-line
      resultCanvas.style.backgroundColor = newBackgroundColor

    width: commonSize
    items: colors
  )

  randomizeButton.addEventListener 'click', do ->
    genRandomFromTo = (from, to) ->
      min = Math.ceil(from)
      max = Math.floor(to) + 1
      Math.floor(Math.random() * (max - min)) + min

    ->
      colorsLength = colors.length
      items = []
      itemsLength = genRandomFromTo(1, 10)
      i = 0

      while i < itemsLength
        colorIndex = genRandomFromTo(0, colorsLength - 1)
        corners = genRandomFromTo(4, 9)

        items[i] = {
          corners
          color: colors[colorIndex]
        }

        i += 1

      resultCanvas.style.backgroundColor = defColor

      starsController.update {
        items
        height: genRandomFromTo(100, commonSize)
        width: genRandomFromTo(100, commonSize)
      }

  appNode.appendChild randomizeButton
  appNode.appendChild starsWrapper
  appNode.appendChild resultCanvas
