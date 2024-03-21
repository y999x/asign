export * from 'zod'
import { compile } from 'json-schema-to-typescript'
import { pascalCase } from 'scule'
import { type ZodType } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { generateMarkdown, type Schema } from './json2md.js'

export function generateSchemas(schemas: Record<string, ZodType<any>>) {
  return Object.fromEntries(
    Object.entries(schemas).map(([key, schema]) => {
      return [key, zodToJsonSchema(schema)]
    }),
  )
}

export function generateMarkdowns(schemas: Record<string, Schema>) {
  return Object.values(schemas).map((schema) => generateMarkdown(schema))
}

export async function generateTypescripts(schemas: Record<string, ZodType<any>>) {
  return (await Promise.all(
    Object.entries(generateSchemas(schemas))
      .map(([key, schema]) =>
        compile(schema as any, pascalCase(key), {
          bannerComment: '',
        })
      ),
  ))
    .join('\n\n')
}
