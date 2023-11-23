const core = require('@actions/core')
const axios = require('axios')

async function getRandomJoke() {
  try {
    const response = await axios.get(
      'https://official-joke-api.appspot.com/random_joke'
    )
    // Extract only the necessary information from the response
    const jokeData = {
      setup: response.data.setup,
      punchline: response.data.punchline
    }

    core.debug(JSON.stringify(jokeData))
    return response.data
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function sendJokeToTelegram(joke, botToken, chatId) {
  try {
    const customJoke = `${joke.setup}\n||${joke.punchline}||`
    const encodedJoke = encodeURIComponent(customJoke)
    const url = `https://api.telegram.org/${botToken}/sendMessage?chat_id=${chatId}&parse_mode=MarkdownV2&text=${encodedJoke}`

    await axios.get(url)
    core.info('Joke sent to Telegram successfully.')
  } catch (error) {
    core.setFailed(error.message)
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
    const joke = await getRandomJoke()

    core.setOutput('joke', joke)

    await sendJokeToTelegram(joke, token, chatID)
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
