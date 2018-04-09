class ColorHSL {

    constructor(h, s, l) {
        this.h = h;
        this.s = s;
        this.l = l;
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 1].
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Color3}          The RGB representation
     */
    toColor3() {
        let r, g, b;

        if (this.s == 0) {
            r = g = b = this.l; // achromatic
        }
        else {
            let hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            let q = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
            let p = 2 * this.l - q;
            r = hue2rgb(p, q, this.h + 1 / 3);
            g = hue2rgb(p, q, this.h);
            b = hue2rgb(p, q, this.h - 1 / 3);
        }
        return new BABYLON.Color3(r, g, b);
    }

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 1] and
     * returns h, s, and l in the set [0, 1].
     *
     * @param   {number}  r       The red color value
     * @param   {number}  g       The green color value
     * @param   {number}  b       The blue color value
     */
    fromColor3(r, g, b) {
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        this.h = (max + min) / 2;
        this.s = (max + min) / 2;
        this.l = (max + min) / 2;

        if (max == min) {
            this.h = this.s = 0; // achromatic
        }
        else {
            let d = max - min;
            this.s = this.l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: this.h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: this.h = (b - r) / d + 2; break;
                case b: this.h = (r - g) / d + 4; break;
            }
            this.h /= 6;
        }
    }

    toRGBString() {
        let color3 = this.toColor3();
        let r = Math.floor(color3.r * 255);
        let g = Math.floor(color3.g * 255);
        let b = Math.floor(color3.b * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    toColor4(a = 1) {
        let color3 = this.toColor3();
        return new BABYLON.Color4(color3.r, color3.g, color3.b, a);
    }
}

module.exports = ColorHSL;