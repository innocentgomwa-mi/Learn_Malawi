export const PAGE_WRAP =
  "w-full max-w-full overflow-x-hidden box-border px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 md:pb-40";

export const LEVEL_INFO = {
  PSLC: { color: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
  JCE: { color: "bg-blue-100 text-blue-800 border border-blue-200" },
  MSCE: { color: "bg-blue-900/10 text-blue-900 border border-blue-300" },
  primary: { color: "bg-blue-100 text-blue-800 border border-blue-200" },
  secondary: { color: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
};

export const FILTER_ACTIVE =
  "border border-yellow-300 bg-yellow-400 text-blue-950 shadow-sm";

export const FILTER_INACTIVE =
  "bg-white border border-blue-200 text-blue-900 hover:border-yellow-300 hover:bg-yellow-50";

export const SEARCH_INPUT_CLASS =
  "w-full min-w-0 pl-9 pr-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm text-blue-950 outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-300";

export const YELLOW_BUTTON_CLASS =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-yellow-300 bg-yellow-400 font-semibold text-blue-950 transition-colors hover:bg-yellow-300";

export const YELLOW_BUTTON_SM = `${YELLOW_BUTTON_CLASS} px-3 py-1.5 text-xs`;

export const YELLOW_BUTTON_MD = `${YELLOW_BUTTON_CLASS} px-4 py-2 text-sm`;

export const OUTLINE_BUTTON_CLASS =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-900 transition-colors hover:border-yellow-300 hover:bg-yellow-50";

export const CARD_CLASS =
  "overflow-hidden rounded-[1.75rem] border border-blue-200/80 bg-white shadow-[0_12px_30px_-20px_rgba(30,58,138,0.25)] transition-shadow duration-300 hover:border-yellow-300/80 hover:shadow-[0_18px_45px_-25px_rgba(30,58,138,0.35)]";

export const SPINNER_CLASS =
  "w-8 h-8 border-4 border-blue-200 border-t-yellow-500 rounded-full animate-spin";

/**
 * @param {boolean} active
 * @param {{ fullWidth?: boolean }} [opts]
 */
export const SETTINGS_SECTION_CLASS =
  "overflow-hidden rounded-2xl border border-blue-200/80 bg-white p-5 mb-4 shadow-sm";

export const SETTINGS_INPUT_CLASS =
  "mt-2 block w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-blue-950 shadow-sm outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400";

export const SETTINGS_CHIP_ACTIVE =
  "rounded-xl border border-yellow-300 bg-yellow-400 px-3 py-2 text-sm font-semibold text-blue-950";

export const SETTINGS_CHIP_INACTIVE =
  "rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-900 hover:border-yellow-300 hover:bg-yellow-50";

export const SETTINGS_NAV_ACTIVE =
  "bg-yellow-50 text-blue-950 border-l-2 border-l-yellow-400";

export const SETTINGS_NAV_INACTIVE =
  "text-blue-800/70 hover:bg-blue-50/80 hover:text-blue-950";

export function filterButtonClass(active, opts = {}) {
  const layout = opts.fullWidth
    ? "flex w-full min-w-0 items-center justify-center py-2.5 rounded-xl text-sm font-semibold transition-colors"
    : "shrink-0 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors";
  return `${layout} ${active ? FILTER_ACTIVE : FILTER_INACTIVE}`;
}
