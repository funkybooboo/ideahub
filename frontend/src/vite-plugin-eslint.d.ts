declare module "vite-plugin-eslint" {
    import type { Plugin } from "vite";

    /**
     * Minimal typing for vite-plugin-eslint.
     * `options` is left as `unknown`—you can tighten this if you know the shape.
     */
    export default function eslintPlugin(options?: unknown): Plugin;
}
