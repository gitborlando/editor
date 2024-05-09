import SvgPathParser from 'svg-path-parser'

const { parseSVG, makeAbsolute } = SvgPathParser

const r = parseSVG(
  'M54 0.5H205C234.547 0.5 258.5 24.4528 258.5 54V76C258.5 131.505 213.505 176.5 158 176.5H54C24.4528 176.5 0.5 152.547 0.5 123V54C0.5 24.4528 24.4528 0.5 54 0.5Z'
)

console.log(makeAbsolute(r))
