import IconTS from "./assets/Typescript_logo_2020.svg.png";
import IconJS from "./assets/JavaScript-logo.png";
import IcomHtml from "./assets/HTML5_logo_and_wordmark.svg.png";

export const LANGUAGE_VERSIONS = {
    javascript: "18.15.0",
    typescript: "5.0.3",
    python: "3.10.0",
    java: "15.0.2",
    csharp: "6.12.0",
    php: "8.2.3",
};
export const language = {
    ts: "typescript",
    js: "javascript",
    jsx: "python",
    java: "java",
    csharp: "csharp",
    php: "php",
    html: "html",
}
const iamgeLanguage = {
    ts: IconTS,
    js: IconJS,
    html: IcomHtml
}
export const RenderImage = (name: any) => {
    if (name in iamgeLanguage) {
        return iamgeLanguage[name as keyof typeof iamgeLanguage];
    }
    return undefined; // Hoặc giá trị mặc định khác
};