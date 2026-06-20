import { i as importShared } from './_virtual___federation_fn_import-Btk8q8lZ.js';
import { j as jsxRuntimeExports } from './jsx-runtime-CsM3lTE3.js';

await importShared('react');

function FuelTab() {
  const src = "https://fuel-aos.web.app";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", display: "flex", flexDirection: "column" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "iframe",
    {
      src,
      style: {
        flex: 1,
        border: "none",
        width: "100%",
        height: "100%",
        background: "var(--bg)"
      },
      title: "Fuel"
    }
  ) });
}

export { FuelTab as default };
