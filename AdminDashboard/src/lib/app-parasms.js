const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `admindashboard_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl && searchParam) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ``}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue !== undefined && defaultValue !== null) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	return storage.getItem(storageKey) || null;
};

const getAppParams = () => {
	if (getAppParamValue('clear_access_token') === 'true') {
		storage.removeItem('admindashboard_access_token');
		storage.removeItem('admindashboard_refresh_token');
	}
	return {
		apiUrl: getAppParamValue('api_url', { defaultValue: import.meta.env.VITE_API_URL }),
		token: getAppParamValue('access_token', { removeFromUrl: true }),
		refreshToken: getAppParamValue('refresh_token', { removeFromUrl: true }),
	};
};

export const appParams = {
	...getAppParams(),
};
