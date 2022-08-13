// This is called when the bot is finished starting up.
module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
        console.log("DnD bot is online!");
	},
};