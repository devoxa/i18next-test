import colors from 'colors/safe'

export interface TestLocaleFileOptions {
  fileContent: string
  locale: string
  defaultLocale: string
  namespace: string
  defaultNamespace: string
}

export function testLocaleFile(options: TestLocaleFileOptions) {
  let localeMap: Record<string, string>
  try {
    localeMap = JSON.parse(options.fileContent)
  } catch (err) {
    return ['File content could not be parsed as locale JSON']
  }

  if (!localeMap || localeMap.constructor !== Object) {
    return ['File content could not be parsed as locale JSON']
  }

  const errors: Array<string> = []

  for (const key in localeMap) {
    if (options.namespace === options.defaultNamespace) {
      errors.push(colors.cyan(`"${key}"`) + ` is missing an explicit namespace`)
    }

    if (options.namespace.endsWith('_old')) {
      errors.push(colors.cyan(`"${key}"`) + ` is tagged as removed from source code`)
    }

    if (localeMap[key] === '') {
      errors.push(colors.cyan(`"${key}"`) + ` does not have a translation`)
    }

    if (options.locale !== options.defaultLocale && localeMap[key] === key) {
      errors.push(colors.cyan(`"${key}"`) + ` has a translation equal to the source language`)
    }

    // We expect the count and name of the component markers to be exactly the same,
    // but the position does not matter since it might change in translated languages.
    const componentMarkersKey = JSON.stringify(parseComponentMarkers(key))
    const componentMarkersTranslation = JSON.stringify(parseComponentMarkers(localeMap[key]))

    if (componentMarkersKey !== componentMarkersTranslation) {
      const message = [
        colors.cyan(`"${key}"`) + ` has mismatching component markers in the translation`,
        colors.green('Expected: ') + componentMarkersKey,
        colors.red('Received: ') + componentMarkersTranslation,
      ].join('\n')

      errors.push(message)
    }

    // We expect the names of the interpolation markers to be exactly the same, but the position
    // does not matter, and they are allowed to be omitted (e.g. to replace `{{count}}` with `one`).
    const interpolationMarkersKey = parseInterpolationMarkers(key)
    const interpolationMarkersTranslation = parseInterpolationMarkers(localeMap[key])
    const hasUnknownMarker = interpolationMarkersTranslation.some(
      (marker) => !interpolationMarkersKey.includes(marker)
    )

    if (hasUnknownMarker) {
      const message = [
        colors.cyan(`"${key}"`) + ` has mismatching interpolation markers in the translation`,
        colors.green('Expected: ') + JSON.stringify(interpolationMarkersKey),
        colors.red('Received: ') + JSON.stringify(interpolationMarkersTranslation),
      ].join('\n')

      errors.push(message)
    }
  }

  return errors
}

function parseComponentMarkers(string: string) {
  const matches = Array.from(string.matchAll(/<.*?>/g)).map((x) => x[0])
  matches.sort()
  return matches
}

function parseInterpolationMarkers(string: string) {
  const matches = Array.from(string.matchAll(/\{\{.*?\}\}/g)).map((x) => x[0])
  matches.sort()
  return matches
}
