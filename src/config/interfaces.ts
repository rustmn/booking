export interface ConfigOptions {
  db: DbConnectionOptions
  folder: string
}

export interface EnvConfig {
  [key: string]: string
}

export interface DbConnectionOptions {
  host: string
  port: number
  user: string
  password: string
}