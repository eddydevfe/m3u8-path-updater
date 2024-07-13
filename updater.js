const fs = require('fs').promises
const path = require('path')

const targetDirectory = ''
const outputDirectory = ''
const newPath = ''

async function main() {
  try {
    await ensureDirectoriesExist()
    await findAndProcessM3U8Files(targetDirectory)
  } catch (error) {
    console.error('An error occurred in the main process:', error.message)
  }
}

async function ensureDirectoriesExist() {
  try {
    await fs.access(targetDirectory)
  } catch (error) {
    throw new Error(`The target directory does not exist: ${targetDirectory}`)
  }

  try {
    await fs.access(outputDirectory)
  } catch (error) {
    await fs.mkdir(outputDirectory, { recursive: true })
    console.log(`Output directory created: ${outputDirectory}`)
  }
}

async function findAndProcessM3U8Files(directory) {
  try {
    const files = await fs.readdir(directory)

    if (!files.length) {
      throw new Error('No files found.')
    }

    for (const file of files) {
      if (path.extname(file) !== '.m3u8') {
        console.error(`Invalid file type: ${file}`)
        continue
      }

      const filePath = path.join(directory, file)
      await processM3U8File(filePath)
    }
  } catch (error) {
    console.error('Error finding or processing .m3u8 files:', error.message)
  }
}

async function processM3U8File(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8')
    const convertedPaths = convertPaths(extractPaths(data))
    const newFilePath = path.join(outputDirectory, path.basename(filePath))

    await exportPathsToM3U8(newFilePath, convertedPaths)
    console.log(`Updated .m3u8 file saved: ${path.basename(filePath)}`)
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message)
  }
}

function extractPaths(contents) {
  const lines = contents.split('\n')
  const filteredPaths = lines.filter(
    (line) => !line.startsWith('#') && line.trim() !== ''
  )
  return filteredPaths
}

function convertPaths(filteredPaths) {
  return filteredPaths.map((path) => {
    const trimmedPath = path.trim()
    const parts = trimmedPath.split('/')
    const fileName = parts.pop()
    return `${newPath}\\${fileName}`
  })
}

async function exportPathsToM3U8(filePath, convertedPaths) {
  try {
    const lines = convertedPaths
      .map((path) => `#EXTINF:,-1\n${path}`)
      .join('\n')
    await fs.writeFile(filePath, lines, 'utf8')
    console.log(`Updated .m3u8 file saved: ${path.basename(filePath)}`)
  } catch (error) {
    console.error(`Error writing .m3u8 file for ${filePath}:`, error.message)
  }
}

main()
