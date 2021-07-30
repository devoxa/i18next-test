import colors from 'colors/safe'

type KeysOfType<O, T> = { [K in keyof O]: O[K] extends T ? K : never }[keyof O]
type ColorsOption = KeysOfType<typeof colors, (string: string) => string>

export interface TestLocaleFileOptions {
  fileContent: string
  locale: string
  defaultLocale: string
  namespace: string
  defaultNamespace: string
  prohibitedText?: Array<RegExp>
}

export function testLocaleFile(pOptions: TestLocaleFileOptions) {
  const options = { prohibitedText: [], ...pOptions }

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
    const componentMarkersKey = parseComponentMarkers(key)
    const componentMarkersTranslation = parseComponentMarkers(localeMap[key])

    if (
      JSON.stringify(sort(componentMarkersKey)) !==
      JSON.stringify(sort(componentMarkersTranslation))
    ) {
      const message = [
        colors.cyan(`"${key}"`) + ` has mismatching component markers in the translation`,
        colors.green('Expected: ') + JSON.stringify(sort(componentMarkersKey)),
        colors.red('Received: ') + JSON.stringify(sort(componentMarkersTranslation)),
      ].join('\n')

      errors.push(message)
    }

    // Check that opened component markers are closed in the correct order.
    if (!validComponentMarkerStructure(componentMarkersTranslation)) {
      const message = [
        colors.cyan(`"${key}"`) + ` has invalid component marker structure in the translation`,
        colors.red('Received: ') + JSON.stringify(componentMarkersTranslation),
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
        colors.green('Expected: ') + JSON.stringify(sort(interpolationMarkersKey)),
        colors.red('Received: ') + JSON.stringify(sort(interpolationMarkersTranslation)),
      ].join('\n')

      errors.push(message)
    }

    // We expect prohibited text not to be in the key or in the translation. This can be used for
    // making sure that the overall voice of the translations is consistent (e.g. that we always
    // use "sign in" instead of "login")
    for (const prohibitedTextRegex of options.prohibitedText) {
      const keyMatch = key.match(prohibitedTextRegex)
      if (keyMatch) {
        const message = [
          colors.cyan(`"${key}"`) + ` has prohibited text in the key`,
          colors.red('Prohibited: ') + colorByMatch('red', key, keyMatch),
        ].join('\n')

        errors.push(message)
      }

      const translationMatch = localeMap[key].match(prohibitedTextRegex)
      if (translationMatch) {
        const message = [
          colors.cyan(`"${key}"`) + ` has prohibited text in the translation`,
          colors.red('Prohibited: ') + colorByMatch('red', localeMap[key], translationMatch),
        ].join('\n')

        errors.push(message)
      }
    }
  }

  return errors
}

function parseComponentMarkers(string: string) {
  return Array.from(string.matchAll(/<.*?>/g)).map((x) => x[0])
}

function parseInterpolationMarkers(string: string) {
  return Array.from(string.matchAll(/\{\{.*?\}\}/g)).map((x) => x[0])
}

function sort<T>(array: Array<T>): Array<T> {
  return [...array].sort()
}

function validComponentMarkerStructure(componentMarkers: Array<string>) {
  // Filter out self-closing tags since they don't require any structure
  componentMarkers = componentMarkers.filter((x) => !x.match(/<.*\/>/))

  const expectedClosingNames = []

  for (const marker of componentMarkers) {
    const matches = marker.match(/<(\/)?(.*)>/) as RegExpMatchArray
    const isClosing = matches[1] === '/'
    const name = matches[2]

    if (!isClosing) {
      expectedClosingNames.push(name)
      continue
    }

    const expectedClosingName = expectedClosingNames.pop()
    if (name !== expectedClosingName) {
      return false
    }
  }

  return true
}

function colorByMatch(color: ColorsOption, string: string, match: RegExpMatchArray) {
  const startIndex = match.index || 0
  const endIndex = startIndex + match[0].length

  return [
    string.slice(0, startIndex),
    colors[color](string.slice(startIndex, endIndex)),
    string.slice(endIndex),
  ].join('')
}
