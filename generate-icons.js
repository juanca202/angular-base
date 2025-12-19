const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const { optimize } = require('svgo');
const dom = require('cheerio');

const sourcePath = 'src/theme/icons';
const outputFile = 'public/images/icons.svg';

const svgoConfig = {
  plugins: [
    {
      name: 'removeViewBox',
      active: false
    },
    'removeDimensions',
    {
      name: 'removeAttrs',
      params: {
        attrs: '(color|font-family|font-weight|overflow|style)'
      }
    }
  ]
};

const ensureDir = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// limpiar output previo
ensureDir(outputFile);
fsExtra.removeSync(outputFile);

// SVG contenedor
const $symbols = dom.load(`
<svg xmlns="http://www.w3.org/2000/svg" style="display:none"></svg>
`);

// leer solo SVGs del directorio (sin recursividad)
const files = fs.readdirSync(sourcePath)
  .filter(f => f.endsWith('.svg'))
  .map(f => path.join(sourcePath, f));

console.log(`Processing ${files.length} SVG icons`);

files.forEach(filePath => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const result = optimize(raw, svgoConfig);

  const $svg = dom.load(result.data);
  const viewBox = $svg('svg').attr('viewBox');
  const name = path.basename(filePath, '.svg');

  const $symbol = dom.load('<symbol></symbol>')('symbol');
  $symbol.attr('id', name);
  if (viewBox) $symbol.attr('viewBox', viewBox);

  $symbol.append($svg('svg').contents());

  // normalizar colores
  $symbol.find('[fill]').each((_, el) => {
    if (el.attribs.fill !== 'none') {
      el.attribs.fill = 'currentColor';
    }
  });

  $symbol.find('[stroke]').each((_, el) => {
    if (el.attribs.stroke !== 'none') {
      el.attribs.stroke = 'currentColor';
    }
  });

  $symbols('svg').append($symbol);
});

// sobrescribe icons.svg
fs.writeFileSync(outputFile, $symbols('svg').toString(), 'utf8');

console.log(`✔ icons.svg generado en ${outputFile}`);
