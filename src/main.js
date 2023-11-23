const core = require('@actions/core')
const axios = require('axios');

async function getRandomJoke() {
  try {
    const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
    core.debug(response)
    return response.data;
  } catch (error) {
    console.error('Error fetching joke:', error.message);
    throw error;
  }
}

async function sendJokeToTelegram(joke, botToken, chatId) {
  try {
    console.log(JSON.stringify(joke))
    const customJoke = `
      CUSTOM: ${joke.setup}
      ${joke.delivery}
    `;
    const encodedJoke = encodeURIComponent(customJoke);
    const url = `https://api.telegram.org/${botToken}/sendMessage?chat_id=${chatId}&parse_mode=MarkdownV2&text=${encodedJoke}`;
    
    await axios.get(url);
    console.log('Joke sent to Telegram successfully.');
  } catch (error) {
    console.error('Error sending joke to Telegram:', error.message);
    throw error;
  }
}

async function run() {
  try {
    const chatID = core.getInput('chat_id', { required: true })
    const token = core.getInput('token', { required: true })
    const joke = await getRandomJoke();

    core.setOutput('joke', joke)

    await sendJokeToTelegram(joke, token, chatID);
  } catch (error) {
    console.error('Workflow failed:', error.message);
    process.exit(1);
  }
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const chatID = core.getInput('chat_id', { required: true })
    const token = core.getInput('token', { required: true })
    const joke = await getRandomJoke();

    core.setOutput('joke', joke)

    await sendJokeToTelegram(joke, token, chatID);
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
