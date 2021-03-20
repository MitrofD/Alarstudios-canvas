import Stars from './stars';
import '../style.scss';

const appNode = document.getElementById('app');

if (appNode) {
  const commonSize = 600;
  const defColor = 'white';
  const colors = [
    'red',
    'blue',
    'green',
    'yellow',
    'black',
  ];

  const randomizeButton = (function genRandomizeButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = 'Randomize it';
    button.style.width = `${commonSize}px`;

    return button;
  }());

  const resultCanvas = (function genCanvasSettings() {
    const canvas = document.createElement('canvas');
    canvas.height = 50;
    canvas.style.backgroundColor = defColor;
    canvas.width = commonSize;

    return canvas;
  }());

  const starsWrapper = document.createElement('div');
  const starsController = starsWrapper.stars({
    corners: 5,
    height: commonSize,
    onClick(item: Stars.Item) {
      resultCanvas.style.backgroundColor = item ? item.color : defColor;
    },

    width: commonSize,
    items: colors,
  });

  randomizeButton.addEventListener('click', (function randomizeButtonClick() {
    const genRandomFromTo = (from: number, to: number) => {
      const min = Math.ceil(from);
      const max = Math.floor(to) + 1;

      return Math.floor(Math.random() * (max - min)) + min;
    };

    return () => {
      const colorsLength = colors.length;
      const items = [];
      const itemsLength = genRandomFromTo(1, 10);
      let i = 0;

      for (; i < itemsLength; i += 1) {
        const colorIndex = genRandomFromTo(0, colorsLength - 1);
        const corners = genRandomFromTo(4, 9);

        items[i] = {
          corners,
          color: colors[colorIndex],
        };
      }

      resultCanvas.style.backgroundColor = defColor;

      starsController.update({
        items,
        height: genRandomFromTo(100, commonSize),
        width: genRandomFromTo(100, commonSize),
      });
    };
  }()));

  appNode.appendChild(randomizeButton);
  appNode.appendChild(starsWrapper);
  appNode.appendChild(resultCanvas);
}
