import {
    column,
    BaseModel,
} from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export enum ActivityLevel {
    Closed,
    Low,
    Medium,
    High,
}

export type HexColor = string
export type ImageSrc = string

export default class Nation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // Full student nation name, e.g. Västmanlands-Dala nation
  @column()
  public name: string

  // Short student nation name, e.g. V-dala
  @column()
  public shortName: string

  @column()
  public description: string

  @column()
  public address: string

  // Max people capacity of their restaurant, club, etc.
  // TODO: Should we allow multiple locations?
  @column()
  public maxCapacity: number

  @column()
  public estimatedPeopleCount: number

  @column()
  public activityLevel: ActivityLevel

  @column()
  public iconImgSrc: ImageSrc

  @column()
  public coverImgSrc: ImageSrc

  @column()
  public accentColor: HexColor

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
