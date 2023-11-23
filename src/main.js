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
    core.setOutput('joke', jokeData)
    return jokeData
  } catch (error) {
    core.setFailed(`Error fetching joke: ${error.message}`)
  }
}

async function sendJokeToTelegram(joke, botToken, chatId) {
  try {
    const escapeChars = str => {
      return str.replace(/([-.,'`*+?^=!:${}()/\\])/g, '\\$1')
    }

    const encodedJokeSetup = encodeURIComponent(escapeChars(joke.setup))
    const encodedJokePunchline = encodeURIComponent(escapeChars(joke.punchline))

    const customJoke = `${encodedJokeSetup}%0A||${encodedJokePunchline}||`
    const url = `https://api.telegram.org/${botToken}/sendMessage?chat_id=${chatId}&parse_mode=MarkdownV2&text=${customJoke}`

    await axios.get(url)
    core.info('Joke sent to Telegram successfully.')
  } catch (error) {
    core.setFailed(`Error sending joke to Telegram: ${error.message}`)
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

    await sendJokeToTelegram(joke, token, chatID)
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(`Workflow failed: ${error.message}`)
  }
}

module.exports = {
  run
}
