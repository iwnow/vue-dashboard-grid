import component from './component';

/**
 * Return VueConstructor component of dashboard grid
 * @param {Vue} vue 
 * @param {string} name 
 * @returns {import('vue').VueConstructor}
 */
export function dashboardGridComponentFactory(vue, name) {
	return vue.component(name || 'dashboard-grid', component);
}