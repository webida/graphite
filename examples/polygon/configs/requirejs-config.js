require.config({
	paths : {
		app : '.',
		graphite : '../../src',
		external : '../../external'
	},
	urlArgs : "i="+(new Date()).getTime().toString().substr(10)+'B'
});