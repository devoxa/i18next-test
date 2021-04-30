import { testLocaleFile } from '../src/index'

jest.mock('colors/safe', () => ({
  cyan: (x: string) => x,
  green: (x: string) => x,
  red: (x: string) => x,
}))

describe('i18next-test', () => {
  it('passes for a valid locale file in the default language', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({ 'Sign in': 'Sign in' }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
    })

    expect(errors).toEqual([])
  })

  it('passes for a valid locale file in the translated language', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({ 'Sign in': 'Anmelden' }),
      locale: 'de',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
    })

    expect(errors).toEqual([])
  })

  it('errors when the locale file could not be parsed as JSON (1)', () => {
    const errors = testLocaleFile({
      fileContent: `{`,
      locale: 'de',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
    })

    expect(errors).toEqual(['File content could not be parsed as locale JSON'])
  })

  it('errors when the locale file could not be parsed as JSON (2)', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify(['Foo']),
      locale: 'de',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
    })

    expect(errors).toEqual(['File content could not be parsed as locale JSON'])
  })

  it('errors for keys that do not have a translation', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({ 'Sign in': '' }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
    })

    expect(errors).toEqual(['"Sign in" does not have a translation'])
  })

  it('errors for keys that have a translation equal to the source language', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({ 'Sign in': 'Sign in' }),
      locale: 'de',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
    })

    expect(errors).toEqual(['"Sign in" has a translation equal to the source language'])
  })

  it('passes for keys that have a translation equal to the source language in the default language', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({ 'Sign in': 'Sign in' }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'sign-in',
      defaultNamespace: 'undefined',
    })

    expect(errors).toEqual([])
  })

  it('errors for keys that have mismatching component markers in the translation (1)', () => {
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

  it('errors for keys that have mismatching component markers in the translation (2)', () => {
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

  it('errors for keys that have mismatching interpolation markers in the translation', () => {
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
    })

    expect(errors).toEqual([
      `"Sign in {{count2}}" has mismatching interpolation markers in the translation
Expected: ["{{count2}}"]
Received: ["{{countt2}}"]`,
    ])
  })

  // We use i18next-parser, which extracts unused keys into namespaces suffixed with `_old`
  it('errors for keys that are tagged as removed from source code', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({
        'Sign in': 'Anmelden',
      }),
      locale: 'de',
      defaultLocale: 'en',
      namespace: 'sign-in_old',
      defaultNamespace: 'undefined',
    })

    expect(errors).toEqual([`"Sign in" is tagged as removed from source code`])
  })

  it('errors for keys that are missing an explicit namespace', () => {
    const errors = testLocaleFile({
      fileContent: JSON.stringify({
        'Sign in': 'Sign in',
      }),
      locale: 'en',
      defaultLocale: 'en',
      namespace: 'undefined',
      defaultNamespace: 'undefined',
    })

    expect(errors).toEqual([`"Sign in" is missing an explicit namespace`])
  })
})
