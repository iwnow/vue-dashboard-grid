export default {
	data: function() {
		return {
			name: 'test component'
		}
	},
	template: `
		<span>hello {{ name }}</span>
	`
}