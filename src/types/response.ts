import { LocalizationMap, Snowflake } from "discord.js"
import { LabelNames, Prefs } from "./model"

export type DeployCommandsResponse = Array<{
  id: Snowflake
  application_id: Snowflake
  version: Snowflake
  default_permission?: boolean
  default_member_permissions?: Permissions
  type: number
  nsfw?: boolean
  name: string
  name_localizations?: LocalizationMap
  description: string
  description_localizations?: LocalizationMap
  guild_id: Snowflake
}>
export type DiscordjsClientLoginError = {
  code: string
}

export type GetTrelloBoardResponse = {
  id: string,
  name: string,
  desc: string,
  descData: string | null,
  closed: boolean,
  idOrganization: string,
  idEnterprise: string | null,
  pinned: boolean,
  url: string,
  shortUrl: string,
  prefs: Prefs,
  labelNames: LabelNames, 
}

export type CreateTrelloBoardResponse = {
  id: string,
  name: string,
  desc: string,
  descData: string | null,
  closed: boolean,
  idOrganization: string,
  idEnterprise: string | null,
  pinned: boolean,
  url: string,
  shortUrl: string,
  prefs: Prefs,
  labelNames: LabelNames,
}
