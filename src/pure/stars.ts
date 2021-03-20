namespace Stars {
  export type ItemOptions = {
    color: string,
    corners?: number,
    data?: any,
  };

  export type Item = ItemOptions & {
    corners: number,
  };

  export type Options = {
    corners?: number,
    items: (ItemOptions | string)[],
    onClick?: (item?: Stars.Item) => void | null,
    width?: number,
    height?: number,
  };

  export type Controller = {
    element: HTMLElement,
    update(newOprions: Options),
  };
}

declare global {
  interface HTMLElement {
    stars(options: Stars.Options): Stars.Controller;
  }

  interface HTMLCollection {
    stars(options: Stars.Options): Stars.Controller[];
  }
}

type StoreOfItems = ({
  item: Stars.Item,
  points: (number[])[],
})[];

const defOptions = {
  corners: 5,
  height: 100,
  width: 300,
};

const genCanvasWithOptions = (pureOptions: Stars.Options) => {
  const canvas = document.createElement('canvas');
  canvas.height = pureOptions.height;
  canvas.width = pureOptions.width;

  const context = canvas.getContext('2d');

  if (context !== null) {
    const starsCount = pureOptions.items.length;
    const sepsCount = starsCount + 1;
    const sepPerc = 0.02;
    let sepSize = canvas.width * sepPerc;
    const placeForStars = canvas.width - (sepSize * sepsCount);
    let starDiameter = placeForStars / starsCount;
    const needDiffPerc = canvas.height / starDiameter;

    if (needDiffPerc < 1) {
      sepSize *= needDiffPerc;
      starDiameter *= needDiffPerc;
    }

    let starXPos = canvas.width - (sepSize * sepsCount + starDiameter * starsCount);
    const starYPos = canvas.height / 2;
    starXPos /= 2;

    const starRadius = starDiameter / 2;
    const starRadiusHalf = starRadius / 2;

    const storeOfItems: StoreOfItems = [];
    let i = 0;

    for (; i < starsCount; i += 1) {
      const points = [];
      const dirtyItem = pureOptions.items[i];

      const item: Stars.Item = {
        corners: pureOptions.corners,
        color: 'rgba(0, 0, 0, 0)',
      };

      if (typeof dirtyItem === 'string') {
        item.color = dirtyItem;
      } else if (typeof dirtyItem === 'object' && dirtyItem !== null) {
        Object.assign(item, dirtyItem);
      }

      const rotationStep = Math.PI / item.corners;
      starXPos += sepSize + starRadius;

      let pathX = starXPos;
      let pathY = starYPos;

      const startedYPos = starYPos - starRadius;
      context.beginPath();
      context.moveTo(starXPos, startedYPos);

      // eslint-disable-next-line no-mixed-operators
      let rotation = Math.PI / 2 * 3;
      let iC = item.corners;
      rotation += rotationStep;

      while (iC > 0) {
        pathX = starXPos + Math.cos(rotation) * starRadiusHalf;
        pathY = starYPos + Math.sin(rotation) * starRadiusHalf;
        context.lineTo(pathX, pathY);
        points.push([
          pathX,
          pathY,
        ]);

        rotation += rotationStep;

        pathX = starXPos + Math.cos(rotation) * starRadius;
        pathY = starYPos + Math.sin(rotation) * starRadius;
        context.lineTo(pathX, pathY);
        points.push([
          pathX,
          pathY,
        ]);

        rotation += rotationStep;
        iC -= 1;
      }

      context.lineTo(starXPos, startedYPos);
      context.closePath();
      context.fillStyle = item.color;
      context.fill();

      storeOfItems[i] = {
        item,
        points,
      };

      starXPos += starRadius;
    }

    if (typeof pureOptions.onClick === 'function') {
      canvas.addEventListener('click', function clickYourSelf(event) {
        const frame = this.getBoundingClientRect();
        const x = event.clientX - frame.left;
        const y = event.clientY - frame.top;
        i = 0;

        for (; i < starsCount; i += 1) {
          const itemOfStore = storeOfItems[i];
          const pointsLength = itemOfStore.points.length;

          let pI = 0;
          let ribsCount = 0;

          for (; pI < pointsLength; pI += 1) {
            const point = itemOfStore.points[pI];
            const nextPoint = itemOfStore.points[(pI + 1) % pointsLength];
            const currX = point[0];
            const nextX = nextPoint[0];

            if (currX !== nextX) {
              const currY = point[1];
              const nextY = nextPoint[1];
              const delta = (x - currX) / (nextX - currX);

              if ((delta >= 0) && (delta < 1) && (y > delta * nextY + (1 - delta) * currY)) {
                ribsCount += 1;
              }
            }
          }

          if (ribsCount % 2 === 1) {
            pureOptions.onClick({
              ...itemOfStore.item,
            });
            return;
          }
        }

        pureOptions.onClick();
      });
    }
  }

  return canvas;
};

function Stars(element: HTMLElement, options: Stars.Options): Stars.Controller {
  let pureOptions = {
    ...defOptions,
    ...options,
  };

  let canvas = genCanvasWithOptions(pureOptions);
  element.appendChild(canvas);

  return {
    element,
    update(newOptions: Stars.Options) {
      element.removeChild(canvas);
      pureOptions = {
        ...pureOptions,
        ...newOptions,
      };

      canvas = genCanvasWithOptions(pureOptions);
      element.appendChild(canvas);
    },
  };
}

HTMLElement.prototype.stars = function HTMLElementMakeStars(options: Stars.Options) {
  return Stars(this, options);
};

HTMLCollection.prototype.stars = function HTMLCollectionMakeStars(options: Stars.Options) {
  const retCollection = [];
  let retCollectionIndex = 0;

  const collectionLength = this.length;
  let i = 0;

  for (; i < collectionLength; i += 1) {
    const collectionItem = this[i];

    if (collectionItem instanceof HTMLElement) {
      retCollection[retCollectionIndex] = Stars(collectionItem, options);
      retCollectionIndex += 1;
    }
  }

  return retCollection;
};

export default Stars;
