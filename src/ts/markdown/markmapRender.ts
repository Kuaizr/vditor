import {Constants} from "../constants";
import {addScript} from "../util/addScript";
import {markmapRenderAdapter} from "./adapterRender";

declare const markmap: any;
const enabled: Record<string, boolean> = {};

const transform = (transformer: any,content: string)=>{
    const result = transformer.transform(content);
    const keys = Object.keys(result.features).filter((key) => !enabled[key]);
    keys.forEach((key) => {
        enabled[key] = true;
    });
    const { styles, scripts } = transformer.getAssets(keys);
    if (styles) markmap.loadCSS(styles);
    if (scripts) markmap.loadJS(scripts);
    return result;
}

const init = (el: HTMLElement,code: string) => {
    const { Transformer, Markmap, deriveOptions} = markmap;
    const transformer = new Transformer();
    el.innerHTML = '<svg style="width:100%"></svg>';
    const svg = el.firstChild as SVGElement;
    const mm = Markmap.create(svg, null);
    const { root, frontmatter } = transform(transformer, code);
    const markmapOptions = frontmatter?.markmap;
    const frontmatterOptions = deriveOptions(markmapOptions);
    mm.setData(root, frontmatterOptions);
    mm.fit();
  }


export const markmapRender = (element: HTMLElement, cdn = Constants.CDN, theme: string) => {
    const markmapElements = markmapRenderAdapter.getElements(element);
    if (markmapElements.length === 0) {
        return;
    }
    addScript(`${cdn}/dist/js/markmap/markmap.min.js`, "vditorMarkmapScript").then(() => {
        markmapElements.forEach((item) => {
            const code = markmapRenderAdapter.getCode(item);
            if (code.trim() === "") {
                return;
            }
            init(item as HTMLElement,code)
        });
    });

};