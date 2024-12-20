import { testLocaleFile } from '../src/index'

jest.mock('colors/safe', () => ({
  cyan: (x: string): string => x,
  green: (x: string): string => x,
  red: (x: string): string => x,
}))

describe('i18next-test', () => {
  test('passes for a valid locale file in the default language', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({ 'Sign in': 'Sign in' }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual([])
  })

  test('passes for a valid locale file in the translated language', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({ 'Sign in': 'Anmelden' }),
      locale: 'de',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual([])
  })

  test('errors when the locale file could not be parsed as JSON (1)', () => {
    const errors = testLocaleFile({
      fileContent: '{',
      locale: 'de',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual(['File content could not be parsed as locale JSON'])
  })

  test('errors when the locale file could not be parsed as JSON (2)', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify(['Foo']),
      locale: 'de',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual(['File content could not be parsed as locale JSON'])
  })

  test('errors for keys that do not have a translation', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({ 'Sign in': '' }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual(['"Sign in" does not have a translation'])
  })

  test('errors for keys that have a translation equal to the source language', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({ 'Sign in': 'Sign in' }),
      locale: 'de',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual(['"Sign in" has a translation equal to the source language'])
  })

  test('passes for keys that have a translation equal to the source language in the default language', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({ 'Sign in': 'Sign in' }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual([])
  })

  test('passes for keys that have a translation equal to the source language but are the same word in both', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({ Name: 'Name' }),
      locale: 'de',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual([])
  })

  test('errors for keys that have mismatching component markers in the translation (1)', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({
        'Sign in <0>here</0>': 'Sign in <0>here</0>', // OK
        'Sign in <1>here</1>': 'Sign in <2>here</2>', // FAIL (wrong name)
        'Sign in <2>here</2>': 'Sign in here', // FAIL (missing)
        'Sign <1>Foo</1> in <2>Bar</2>': 'Sign <2>Foo</2> in <1>Bar</1>', // OK (other order)
      }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual([
      `"Sign in <1>here</1>" has mismatching component markers in the translation
Expected: ["</1>","<1>"]
Received: ["</2>","<2>"]`,
      `"Sign in <2>here</2>" has mismatching component markers in the translation
Expected: ["</2>","<2>"]
Received: []`,
    ])
  })

  test('errors for keys that have mismatching component markers in the translation (2)', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({
        'Sign in <0/>': 'Sign in <0/>', // OK
        'Sign in <1/>': 'Sign in <2/>', // FAIL (wrong name)
        'Sign in <2/>': 'Sign in', // FAIL (missing)
        'Sign <1/> in <2/>': 'Sign <2/> in <1/>', // OK (other order)
      }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual([
      `"Sign in <1/>" has mismatching component markers in the translation
Expected: ["<1/>"]
Received: ["<2/>"]`,
      `"Sign in <2/>" has mismatching component markers in the translation
Expected: ["<2/>"]
Received: []`,
    ])
  })

  test('errors for keys that have invalid component marker structure in the translation', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({
        '1 A <0/> B <1>C</1> DE <2>F</2>': '1 AB <2>C</2> D <0/> E <1>F</1>', // OK
        '2 A <0/> B <1>C</1> DE <2>F</2>': '2 AB <2>C</1> D <0/> E <1>F</2>', // FAIL (closing markers in wrong order)
        '3 A <0/> B <1>C</1> DE <2>F</2>': '3 AB <2><1>C</1></2> D <0/> EF', // OK
        '4 A <0/> B <1>C</1> DE <2>F</2>': '4 AB <2><1>C</2></1> D <0/> EF', // FAIL (closing markers in wrong order)
        '5 A <0/> B <1>C</1> DE <2>F</2>': '5 AB </2><1>C</1><2> D <0/> EF', // FAIL (starting with closing marker)
        '6 A <0/> B <1>C</1> DE <2>F</2>': '6 AB <1><2>C</2></1> D <0/> EF', // OK
      }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual([
      `"2 A <0/> B <1>C</1> DE <2>F</2>" has invalid component marker structure in the translation
Received: ["<2>","</1>","<0/>","<1>","</2>"]`,
      `"4 A <0/> B <1>C</1> DE <2>F</2>" has invalid component marker structure in the translation
Received: ["<2>","<1>","</2>","</1>","<0/>"]`,
      `"5 A <0/> B <1>C</1> DE <2>F</2>" has invalid component marker structure in the translation
Received: ["</2>","<1>","</1>","<2>","<0/>"]`,
    ])
  })

  test('errors for keys that have mismatching interpolation markers in the translation', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({
        'Sign in {{count1}}': 'Sign in {{count1}}', // OK
        'Sign in {{count2}}': 'Sign in {{countt2}}', // FAIL (wrong name)
        'Sign in {{count3}}': 'Sign in', // OK (missing)
        'Sign {{foo}} in {{bar}}': 'Sign {{bar}} in {{foo}}', // OK (other order)
      }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual([
      `"Sign in {{count2}}" has mismatching interpolation markers in the translation
Expected: ["{{count2}}"]
Received: ["{{countt2}}"]`,
    ])
  })

  test('errors for keys that have prohibited text in the translation', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({
        'Sign in': 'Sign in', // OK
        Login: 'Sign in', // OK, in the key
        'Sign in to the page': 'Log in to the page', // FAIL
      }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
      prohibitedText: [/\blog.?in\b/i],
    })

    expect(errors).toEqual([
      `"Sign in to the page" has prohibited text in the translation
Prohibited: Log in to the page`,
    ])
  })

  // We use i18next-parser, which extracts unused keys into namespaces suffixed with `_old`
  test('errors for keys that are tagged as removed from source code', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({
        'Sign in': 'Anmelden',
      }),
      locale: 'de',
      defaultLocale: 'en',
      namespace: 'sign-in_old',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual(['"Sign in" is tagged as removed from source code'])
  })

  test('errors for keys that are missing an explicit namespace', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({
        'Sign in': 'Sign in',
      }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'undefined',
      defaultNamespace: 'undefined',
      prohibitedText: [],
    })

    expect(errors).toEqual(['"Sign in" is missing an explicit namespace'])
  })
})
