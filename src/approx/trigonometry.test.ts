import { RoundingMode } from '../types';
import { ExactNumber } from '../ExactNumber';
import { cos, PI, sin, tan } from './trigonometry';

describe('trigonometry', () => {
  it('PI', () => {
    const PI_VAL =
      '3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196442881097566593344612847564823378678316527120190914564856692346034861045432664821339360726024914127372458700660631558817488152092096282925409171536436789259036001133053054882046652138414695194151160943305727036575959195309218611738193261179310511854807446237996274956735188575272489122793818301194912983367336244065664308602139494639522473719070217986094370277053921717629317675238467481846766940513200056812714526356082778577134275778960917363717872146844090122495343014654958537105079227968925892354201995611212902196086403441815981362977477130996051870721134999999837297804995105973173281609631859502445945534690830264252230825334468503526193118817101000313783875288658753320838142061717766914730359825349042875546873115956286388235378759375195778185778053217122680661300192787661119590921642019894';

    for (let i = 1; i < 1000; i++) {
      expect(PI(i).toFixed(i)).toBe(PI_VAL.slice(0, i + 2));
    }
  });

  it('sin', () => {
    const range = [Math.floor(Math.PI * -4), Math.ceil(Math.PI * 4)];
    for (let i = range[0]; i <= range[1]; i += 0.01) {
      const jsResult = Math.sin(i).toString();
      const jsRounded = ExactNumber(jsResult).toFixed(11);
      const exactResult = sin(i.toString(), 11).toFixed(11);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('sin many digits', () => {
    const ref = sin('7/12', 200).toString();

    for (let i = 1; i < 200; i++) {
      expect(sin('7/12', i).toFixed(i)).toBe(ref.slice(0, i + 2));
    }
  });

  it('cos reduce to half pi', () => {
    const pi = ExactNumber(PI(100));
    const piOverTwo = pi.div(2);

    expect(cos(pi.div(3), 6).toFixed(6)).toBe('0.500000');

    for (let multiplier = -3; multiplier <= 3; multiplier++) {
      const base = pi.mul(2 * multiplier);
      expect(cos(base.add(pi.div(3)), 6).toFixed(6)).toBe('0.500000');
      expect(cos(base.add(pi.div(6).add(piOverTwo)), 6).toFixed(6)).toBe('-0.500000');
      expect(cos(base.add(pi.div(3).add(pi)), 6).toFixed(6)).toBe('-0.500000');
      expect(cos(base.add(pi.div(6).add(pi)).add(piOverTwo), 6).toFixed(6)).toBe('0.500000');
    }
  });

  it('cos', () => {
    const range = [Math.floor(Math.PI * -4), Math.ceil(Math.PI * 4)];
    for (let i = range[0]; i <= range[1]; i += 0.01) {
      const jsResult = Math.cos(i).toString();
      const jsRounded = ExactNumber(jsResult).toFixed(11);
      const exactResult = cos(i.toString(), 11).toFixed(11);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('cos many digits', () => {
    const ref = cos('7/12', 200).toString();

    for (let i = 1; i < 200; i++) {
      expect(cos('7/12', i).toFixed(i)).toBe(ref.slice(0, i + 2));
    }
  });

  it('tan', () => {
    const range = [Math.floor(Math.PI * -4), Math.ceil(Math.PI * 4)];
    for (let i = range[0]; i <= range[1]; i += 0.03) {
      const jsResult = Math.tan(i);
      if (Math.abs(jsResult) > 10) continue; // TODO
      const jsRounded = ExactNumber(jsResult.toString()).round(11, RoundingMode.TO_ZERO).toFixed(11);
      const exactResult = tan(i.toString(), 11).toFixed(11);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('tan many digits', () => {
    const ref = tan('7/12', 150).toString();

    for (let i = 1; i < 150; i++) {
      expect(tan('7/12', i).toFixed(i)).toBe(ref.slice(0, i + 2));
    }
  });
});
