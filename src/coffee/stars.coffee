defOptions =
  corners: 5
  height: 100
  width: 300

genCanvasWithOptions = (pureOptions) ->
  canvas = document.createElement('canvas')
  canvas.height = pureOptions.height
  canvas.width = pureOptions.width
  context = canvas.getContext('2d')

  if context != null
    starsCount = pureOptions.items.length
    sepsCount = starsCount + 1
    sepPerc = 0.02
    sepSize = canvas.width * sepPerc
    placeForStars = canvas.width - (sepSize * sepsCount)
    starDiameter = placeForStars / starsCount
    needDiffPerc = canvas.height / starDiameter

    if needDiffPerc < 1
      sepSize *= needDiffPerc
      starDiameter *= needDiffPerc

    starXPos = canvas.width - (sepSize * sepsCount + starDiameter * starsCount)
    starYPos = canvas.height / 2
    starXPos /= 2
    starRadius = starDiameter / 2
    starRadiusHalf = starRadius / 2
    storeOfItems = []

    i = 0
    while i < starsCount
      points = []
      dirtyItem = pureOptions.items[i]

      item =
        corners: pureOptions.corners
        color: 'rgba(0, 0, 0, 0)'

      if typeof dirtyItem == 'string'
        item.color = dirtyItem
      else if typeof dirtyItem == 'object' and dirtyItem != null
        Object.assign item, dirtyItem

      rotationStep = Math.PI / item.corners
      starXPos += sepSize + starRadius
      pathX = starXPos
      pathY = starYPos
      startedYPos = starYPos - starRadius
      context.beginPath()
      context.moveTo starXPos, startedYPos

      # eslint-disable-next-line coffee/no-mixed-operators
      rotation = Math.PI / 2 * 3
      iC = item.corners
      rotation += rotationStep

      while iC > 0
        pathX = starXPos + Math.cos(rotation) * starRadiusHalf
        pathY = starYPos + Math.sin(rotation) * starRadiusHalf
        context.lineTo pathX, pathY
        points.push [
          pathX
          pathY
        ]

        rotation += rotationStep
        pathX = starXPos + Math.cos(rotation) * starRadius
        pathY = starYPos + Math.sin(rotation) * starRadius
        context.lineTo pathX, pathY
        points.push [
          pathX
          pathY
        ]

        rotation += rotationStep
        iC -= 1

      context.lineTo starXPos, startedYPos
      context.closePath()
      context.fillStyle = item.color
      context.fill()

      storeOfItems[i] = { item, points }

      starXPos += starRadius
      i += 1

    if typeof pureOptions.onClick == 'function'
      canvas.addEventListener 'click', (event) ->
        frame = @getBoundingClientRect()
        x = event.clientX - (frame.left)
        y = event.clientY - (frame.top)
        i = 0

        while i < starsCount
          itemOfStore = storeOfItems[i]
          pointsLength = itemOfStore.points.length
          pI = 0
          ribsCount = 0

          while pI < pointsLength
            point = itemOfStore.points[pI]
            nextPoint = itemOfStore.points[(pI + 1) % pointsLength]
            currX = point[0]
            nextX = nextPoint[0]

            if currX != nextX
              currY = point[1]
              nextY = nextPoint[1]
              delta = (x - currX) / (nextX - currX)

              if delta >= 0 and delta < 1 and y > delta * nextY + (1 - delta) * currY
                ribsCount += 1
            pI += 1

          if ribsCount % 2 == 1
            pureOptions.onClick { ...itemOfStore.item }
            return
          i += 1

        pureOptions.onClick()
  canvas

Stars = (element, options) ->
  pureOptions = { ...defOptions, ...options }
  canvas = genCanvasWithOptions(pureOptions)
  element.appendChild canvas

  {
    element
    update: (newOptions) ->
      element.removeChild canvas
      pureOptions = { ...pureOptions, ...newOptions }
      canvas = genCanvasWithOptions(pureOptions)
      element.appendChild canvas
  }

HTMLElement::stars = (options) -> Stars this, options

HTMLCollection::stars = (options) ->
  retCollection = []
  retCollectionIndex = 0
  collectionLength = @length
  i = 0

  while i < collectionLength
    collectionItem = @[i]

    if collectionItem instanceof HTMLElement
      retCollection[retCollectionIndex] = Stars(collectionItem, options)
      retCollectionIndex += 1

    i += 1
  retCollection

export default Stars
